from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class InventoryMovement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "inventory_movements"

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    movement_type: Mapped[str] = mapped_column(String(30))
    quantity: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(80), nullable=True)

