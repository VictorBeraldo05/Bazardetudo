from __future__ import annotations

import logging
import threading
from datetime import UTC, datetime, timedelta

from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.catalog import Product
from app.models.notification import WhatsAppDispatchJob, WhatsAppGroup, WhatsAppProductSendLog
from app.services.whatsapp import WhatsAppNotificationService


logger = logging.getLogger("app.whatsapp_dispatch")

JOB_TYPE_SEND_PRODUCT = "send-product-to-whatsapp-groups"

_worker_thread: threading.Thread | None = None
_stop_event = threading.Event()
_service = WhatsAppNotificationService()


def enqueue_product_whatsapp_dispatch(db: Session, product_id: str) -> WhatsAppDispatchJob | None:
    if not settings.whatsapp_auto_send_products:
        logger.info("[whatsapp-dispatch] auto send disabled, skipping enqueue for product %s", product_id)
        return None

    existing = db.scalar(
        select(WhatsAppDispatchJob).where(
            WhatsAppDispatchJob.product_id == product_id,
            WhatsAppDispatchJob.job_type == JOB_TYPE_SEND_PRODUCT,
        )
    )
    if existing:
        if existing.status in {"failed", "completed"}:
            existing.status = "pending"
            existing.last_error = None
            existing.completed_at = None
            existing.started_at = None
            existing.scheduled_for = datetime.now(UTC)
            existing.max_attempts = settings.whatsapp_send_max_retries
        return existing

    job = WhatsAppDispatchJob(
        product_id=product_id,
        job_type=JOB_TYPE_SEND_PRODUCT,
        status="pending",
        attempts=0,
        max_attempts=settings.whatsapp_send_max_retries,
        scheduled_for=datetime.now(UTC),
    )
    db.add(job)
    return job


def start_whatsapp_dispatch_worker() -> None:
    global _worker_thread

    if not settings.whatsapp_auto_send_products:
        logger.info("[whatsapp-dispatch] worker disabled by configuration")
        return
    if _worker_thread and _worker_thread.is_alive():
        logger.info("[whatsapp-dispatch] worker already running")
        return

    _stop_event.clear()
    _worker_thread = threading.Thread(target=_worker_loop, name="whatsapp-dispatch-worker", daemon=True)
    _worker_thread.start()


def stop_whatsapp_dispatch_worker() -> None:
    _stop_event.set()
    if _worker_thread and _worker_thread.is_alive():
        _worker_thread.join(timeout=5)


def _worker_loop() -> None:
    logger.info("[whatsapp-dispatch] worker started")
    while not _stop_event.is_set():
        try:
            with SessionLocal() as db:
                job = _get_next_pending_job(db)
                if not job:
                    _stop_event.wait(settings.whatsapp_worker_poll_interval_seconds)
                    continue
                _process_job(db, job.id)
        except Exception as exc:  # noqa: BLE001
            logger.exception("[whatsapp-dispatch] worker loop error: %s", exc)
            _stop_event.wait(settings.whatsapp_worker_poll_interval_seconds)
    logger.info("[whatsapp-dispatch] worker stopped")


def _get_next_pending_job(db: Session) -> WhatsAppDispatchJob | None:
    now = datetime.now(UTC)
    stmt: Select[tuple[WhatsAppDispatchJob]] = (
        select(WhatsAppDispatchJob)
        .where(
            WhatsAppDispatchJob.job_type == JOB_TYPE_SEND_PRODUCT,
            WhatsAppDispatchJob.status == "pending",
            or_(WhatsAppDispatchJob.scheduled_for.is_(None), WhatsAppDispatchJob.scheduled_for <= now),
        )
        .order_by(WhatsAppDispatchJob.created_at.asc())
    )
    return db.scalar(stmt)


def _process_job(db: Session, job_id: str) -> None:
    job = db.get(WhatsAppDispatchJob, job_id)
    if not job or job.status != "pending":
        return

    product = db.get(Product, job.product_id)
    if not product:
        job.status = "failed"
        job.attempts += 1
        job.last_error = "Produto nao encontrado para disparo WhatsApp"
        job.completed_at = datetime.now(UTC)
        db.commit()
        return

    job.status = "processing"
    job.started_at = datetime.now(UTC)
    job.attempts += 1
    db.commit()

    groups = list(
        db.scalars(select(WhatsAppGroup).where(WhatsAppGroup.active.is_(True)).order_by(WhatsAppGroup.created_at.asc())).all()
    )
    if not groups:
        job.status = "completed"
        job.last_error = None
        job.completed_at = datetime.now(UTC)
        db.commit()
        logger.info("[whatsapp-dispatch] no active groups, completed job %s", job.id)
        return

    failures = 0
    for group in groups:
        log_entry = db.scalar(
            select(WhatsAppProductSendLog).where(
                WhatsAppProductSendLog.product_id == product.id,
                WhatsAppProductSendLog.whatsapp_group_id == group.whatsapp_group_id,
            )
        )
        if log_entry and log_entry.status == "sent":
            continue

        if not log_entry:
            log_entry = WhatsAppProductSendLog(
                product_id=product.id,
                group_config_id=group.id,
                whatsapp_group_id=group.whatsapp_group_id,
                status="pending",
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)

        try:
            result = _service.send_product_to_group(
                group.whatsapp_group_id,
                {
                    "name": product.name,
                    "price": _service.format_price(product.sale_price),
                    "product_url": _service.build_storefront_product_url(product.slug),
                    "image_url": product.images[0].image_url if product.images else None,
                },
            )
            log_entry.status = "sent"
            log_entry.error_message = None
            log_entry.provider = result.provider
            log_entry.provider_message_id = result.provider_message_id
            log_entry.sent_at = datetime.now(UTC)
            db.commit()
            logger.info("[whatsapp-dispatch] sent product %s to group %s", product.id, group.whatsapp_group_id)
        except Exception as exc:  # noqa: BLE001
            failures += 1
            log_entry.status = "failed"
            log_entry.error_message = str(exc)
            log_entry.provider = settings.whatsapp_provider
            db.commit()
            logger.exception(
                "[whatsapp-dispatch] failed sending product %s to group %s: %s",
                product.id,
                group.whatsapp_group_id,
                exc,
            )

        if settings.whatsapp_send_delay_ms > 0 and not _stop_event.is_set():
            _stop_event.wait(settings.whatsapp_send_delay_ms / 1000)

    db.refresh(job)
    if failures == 0:
        job.status = "completed"
        job.last_error = None
        job.completed_at = datetime.now(UTC)
        db.commit()
        return

    if job.attempts >= job.max_attempts:
        job.status = "failed"
        job.last_error = f"{failures} envio(s) falharam apos {job.attempts} tentativa(s)"
        job.completed_at = datetime.now(UTC)
        db.commit()
        return

    job.status = "pending"
    job.last_error = f"{failures} envio(s) falharam; nova tentativa agendada"
    job.scheduled_for = datetime.now(UTC) + timedelta(seconds=settings.whatsapp_worker_poll_interval_seconds * 3)
    db.commit()
