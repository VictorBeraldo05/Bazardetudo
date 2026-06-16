from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import TimestampSchema


class ProductArrivalAlertCreate(BaseModel):
    customer_name: str | None = Field(default=None, min_length=2)
    customer_email: EmailStr
    desired_product: str = Field(min_length=2, max_length=180)
    category_name: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)


class ProductArrivalAlertRead(TimestampSchema):
    customer_name: str | None = None
    customer_email: EmailStr
    desired_product: str
    category_name: str | None = None
    notes: str | None = None
    status: str
    matched_product_id: str | None = None
    notified_at: datetime | None = None


class ProductArrivalAlertCreateResponse(BaseModel):
    id: str
    status: str
    message: str
    already_available: bool = False
    matched_product_id: str | None = None
