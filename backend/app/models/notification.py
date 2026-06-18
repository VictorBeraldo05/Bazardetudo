from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class WhatsAppCampaign(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_campaigns"

    product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="draft")


class WhatsAppLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_logs"

    campaign_id: Mapped[str | None] = mapped_column(ForeignKey("whatsapp_campaigns.id"), nullable=True)
    target_phone: Mapped[str] = mapped_column(String(30), index=True)
    provider: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(30), default="queued")
    payload: Mapped[str | None] = mapped_column(Text, nullable=True)


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(160))
    body: Mapped[str] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(String(30), default="system")
    status: Mapped[str] = mapped_column(String(20), default="unread")


class ProductArrivalAlert(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "product_arrival_alerts"

    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    customer_email: Mapped[str] = mapped_column(String(120), index=True)
    desired_product: Mapped[str] = mapped_column(String(180), index=True)
    normalized_query: Mapped[str] = mapped_column(String(180), index=True)
    category_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    matched_product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class WhatsAppGroup(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_groups"

    name: Mapped[str] = mapped_column(String(120))
    whatsapp_group_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class WhatsAppDispatchJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_dispatch_jobs"
    __table_args__ = (
        UniqueConstraint("product_id", "job_type", name="uq_whatsapp_dispatch_jobs_product_type"),
    )

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    job_type: Mapped[str] = mapped_column(String(80), default="send-product-to-whatsapp-groups", index=True)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    attempts: Mapped[int] = mapped_column(default=0)
    max_attempts: Mapped[int] = mapped_column(default=3)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class WhatsAppProductSendLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_product_send_logs"
    __table_args__ = (
        UniqueConstraint("product_id", "whatsapp_group_id", name="uq_whatsapp_product_send_logs_product_group"),
    )

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    group_config_id: Mapped[str | None] = mapped_column(ForeignKey("whatsapp_groups.id"), nullable=True, index=True)
    whatsapp_group_id: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    provider_message_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
