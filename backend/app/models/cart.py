from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Cart(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "carts"

    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    session_token: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="active")
    reserved_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CartItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),)

    cart_id: Mapped[str] = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

