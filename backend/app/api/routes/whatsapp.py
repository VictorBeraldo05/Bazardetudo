from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.core.config import settings
from app.models.notification import WhatsAppDispatchJob, WhatsAppGroup, WhatsAppProductSendLog
from app.schemas.whatsapp import (
    WhatsAppDispatchJobRead,
    WhatsAppGroupCreate,
    WhatsAppGroupRead,
    WhatsAppGroupUpdate,
    WhatsAppProductSendLogRead,
    WhatsAppQueueProductRequest,
)
from app.services.whatsapp import WhatsAppMessage, WhatsAppNotificationService
from app.services.whatsapp_dispatch import enqueue_product_whatsapp_dispatch


router = APIRouter(dependencies=[Depends(admin_guard)])
service = WhatsAppNotificationService()


@router.post("/broadcast-product")
def broadcast_product(payload: dict[str, str]) -> dict[str, str]:
    text = service.build_product_message(
        product_name=payload["product_name"],
        price=payload["price"],
        summary=payload["summary"],
        damage_notes=payload["damage_notes"],
        product_url=payload["product_url"],
        catalog_url=payload["catalog_url"],
    )
    return service.send_product_broadcast(
        WhatsAppMessage(phone=payload.get("phone", settings.store_whatsapp), text=text, image_url=payload.get("image_url"))
    )


@router.get("/groups", response_model=list[WhatsAppGroupRead])
def list_groups(db: Session = Depends(db_session)) -> list[WhatsAppGroup]:
    return list(db.scalars(select(WhatsAppGroup).order_by(WhatsAppGroup.created_at.desc())).all())


@router.post("/groups", response_model=WhatsAppGroupRead)
def create_group(payload: WhatsAppGroupCreate, db: Session = Depends(db_session)) -> WhatsAppGroup:
    existing = db.scalar(select(WhatsAppGroup).where(WhatsAppGroup.whatsapp_group_id == payload.whatsapp_group_id))
    if existing:
        raise HTTPException(status_code=409, detail="Ja existe um grupo cadastrado com esse ID")

    group = WhatsAppGroup(**payload.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/groups/{group_id}", response_model=WhatsAppGroupRead)
def update_group(group_id: str, payload: WhatsAppGroupUpdate, db: Session = Depends(db_session)) -> WhatsAppGroup:
    group = db.get(WhatsAppGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo nao encontrado")

    duplicate = db.scalar(
        select(WhatsAppGroup).where(
            WhatsAppGroup.whatsapp_group_id == payload.whatsapp_group_id,
            WhatsAppGroup.id != group_id,
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Ja existe outro grupo com esse ID")

    for field, value in payload.model_dump().items():
        setattr(group, field, value)

    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_id}")
def delete_group(group_id: str, db: Session = Depends(db_session)) -> dict[str, str]:
    group = db.get(WhatsAppGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo nao encontrado")
    db.delete(group)
    db.commit()
    return {"status": "deleted"}


@router.get("/jobs", response_model=list[WhatsAppDispatchJobRead])
def list_dispatch_jobs(db: Session = Depends(db_session)) -> list[WhatsAppDispatchJob]:
    return list(db.scalars(select(WhatsAppDispatchJob).order_by(WhatsAppDispatchJob.created_at.desc())).all())


@router.get("/logs", response_model=list[WhatsAppProductSendLogRead])
def list_send_logs(db: Session = Depends(db_session)) -> list[WhatsAppProductSendLog]:
    return list(db.scalars(select(WhatsAppProductSendLog).order_by(WhatsAppProductSendLog.created_at.desc())).all())


@router.post("/jobs/send-product", response_model=WhatsAppDispatchJobRead)
def queue_product_send(payload: WhatsAppQueueProductRequest, db: Session = Depends(db_session)) -> WhatsAppDispatchJob:
    job = enqueue_product_whatsapp_dispatch(db, payload.product_id)
    if not job:
        raise HTTPException(status_code=400, detail="Disparo automatico de produtos esta desativado")
    db.commit()
    db.refresh(job)
    return job
