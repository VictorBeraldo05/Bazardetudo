from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
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
