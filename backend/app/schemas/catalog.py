from decimal import Decimal

from pydantic import BaseModel

from app.schemas.common import TimestampSchema


class CategoryRead(TimestampSchema):
    name: str
    slug: str
    description: str | None = None


class ProductImageRead(TimestampSchema):
    image_url: str
    alt_text: str | None = None
    position: int


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    damage_notes: str
    condition: str
    status: str = "available"
    category_id: str
    sku: str
    cost_price: Decimal
    sale_price: Decimal
    compare_at_price: Decimal | None = None
    quantity: int = 1
    tags: str | None = None
    featured: bool = False
    is_offer: bool = False
    image_url: str | None = None
    image_alt_text: str | None = None


class ProductRead(TimestampSchema):
    name: str
    slug: str
    description: str
    damage_notes: str
    condition: str
    status: str
    category_id: str
    sku: str
    cost_price: Decimal
    sale_price: Decimal
    compare_at_price: Decimal | None = None
    quantity: int
    tags: str | None = None
    featured: bool
    is_offer: bool
    images: list[ProductImageRead] = []
