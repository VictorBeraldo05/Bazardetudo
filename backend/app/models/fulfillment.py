from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="new", index=True)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    shipping_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class OrderItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "order_items"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    product_name: Mapped[str] = mapped_column(String(180))
    quantity: Mapped[int] = mapped_column(default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))


class Delivery(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "deliveries"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    method: Mapped[str] = mapped_column(String(30), default="delivery")
    tracking_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    address_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)


class PickupOrder(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "pickup_orders"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    pickup_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="awaiting_pickup")

