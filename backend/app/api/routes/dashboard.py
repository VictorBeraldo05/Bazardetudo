from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.catalog import Product
from app.models.fulfillment import Order


router = APIRouter(dependencies=[Depends(admin_guard)])


@router.get("")
def get_dashboard_metrics(db: Session = Depends(db_session)) -> dict[str, int | str]:
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    total_products = db.scalar(select(func.count(Product.id))) or 0
    reserved_products = db.scalar(select(func.count(Product.id)).where(Product.status == "reserved")) or 0
    sold_products = db.scalar(select(func.count(Product.id)).where(Product.status == "sold")) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Order.total_amount), Decimal("0")))) or Decimal("0")
    return {
        "total_orders": int(total_orders),
        "total_products": int(total_products),
        "reserved_products": int(reserved_products),
        "sold_products": int(sold_products),
        "revenue": str(revenue),
    }

