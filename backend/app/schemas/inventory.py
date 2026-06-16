from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class InventoryEntryCreate(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)
    reason: str | None = Field(default=None, max_length=300)
    reference_id: str | None = Field(default=None, max_length=80)


class InventoryMovementRead(TimestampSchema):
    product_id: str
    movement_type: str
    quantity: int
    reason: str | None = None
    reference_id: str | None = None


class InventoryProductRow(BaseModel):
    id: str
    name: str
    sku: str
    category_name: str
    quantity: int
    status: str
    sale_price: Decimal
    cost_price: Decimal
    featured: bool
    is_offer: bool
    created_at: datetime
    updated_at: datetime


class InventoryOverviewStats(BaseModel):
    total_products: int
    total_units: int
    low_stock_products: int
    out_of_stock_products: int
    entries_count: int
    sales_count: int


class InventoryOverviewRead(BaseModel):
    stats: InventoryOverviewStats
    products: list[InventoryProductRow]
    movements: list[InventoryMovementRead]
