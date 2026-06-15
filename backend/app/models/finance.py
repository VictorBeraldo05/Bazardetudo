from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Payment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "payments"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    provider: Mapped[str] = mapped_column(String(40), default="manual")
    status: Mapped[str] = mapped_column(String(30), default="pending")
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    transaction_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)


class Coupon(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    discount_type: Mapped[str] = mapped_column(String(20), default="percentage")
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="active")


class FinancialTransaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "financial_transactions"

    type: Mapped[str] = mapped_column(String(20))
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    description: Mapped[str] = mapped_column(Text)
    reference_id: Mapped[str | None] = mapped_column(String(80), nullable=True)

