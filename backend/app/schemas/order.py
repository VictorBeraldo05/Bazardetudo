from decimal import Decimal

from pydantic import BaseModel

from app.schemas.common import TimestampSchema


class ReserveRequest(BaseModel):
    product_id: str
    session_token: str
    quantity: int = 1


class CheckoutRequest(BaseModel):
    customer_id: str
    cart_id: str
    shipping_amount: Decimal = Decimal("0")
    discount_amount: Decimal = Decimal("0")
    notes: str | None = None


class OrderRead(TimestampSchema):
    customer_id: str
    order_number: str
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    notes: str | None = None

