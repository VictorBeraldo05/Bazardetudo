from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.catalog import Product
from app.models.inventory import InventoryMovement
from app.schemas.inventory import (
    InventoryEntryCreate,
    InventoryMovementRead,
    InventoryOverviewRead,
    InventoryOverviewStats,
    InventoryProductRow,
)
from app.services.stock import StockReservationService


router = APIRouter(dependencies=[Depends(admin_guard)])
stock_service = StockReservationService()


@router.get("", response_model=list[InventoryMovementRead])
def list_inventory_movements(db: Session = Depends(db_session)) -> list[InventoryMovement]:
    return list(db.scalars(select(InventoryMovement).order_by(InventoryMovement.created_at.desc())).all())


@router.get("/overview", response_model=InventoryOverviewRead)
def inventory_overview(db: Session = Depends(db_session)) -> InventoryOverviewRead:
    products = list(db.scalars(select(Product).order_by(Product.created_at.desc())).unique().all())
    movements = list(db.scalars(select(InventoryMovement).order_by(InventoryMovement.created_at.desc())).all())

    rows = [
        InventoryProductRow(
            id=product.id,
            name=product.name,
            sku=product.sku,
            category_name=product.category.name if product.category else "Sem categoria",
            quantity=product.quantity,
            status=product.status,
            sale_price=product.sale_price,
            cost_price=product.cost_price,
            featured=product.featured,
            is_offer=product.is_offer,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )
        for product in products
    ]

    stats = InventoryOverviewStats(
        total_products=len(products),
        total_units=sum(product.quantity for product in products),
        low_stock_products=sum(1 for product in products if 0 < product.quantity <= 2),
        out_of_stock_products=sum(1 for product in products if product.quantity <= 0),
        entries_count=sum(1 for movement in movements if movement.movement_type == "entry"),
        sales_count=sum(1 for movement in movements if movement.movement_type == "sale"),
    )

    return InventoryOverviewRead(stats=stats, products=rows, movements=movements[:20])


@router.post("/entry", response_model=InventoryProductRow)
def register_inventory_entry(payload: InventoryEntryCreate, db: Session = Depends(db_session)) -> InventoryProductRow:
    product = stock_service.add_stock(
        db=db,
        product_id=payload.product_id,
        quantity=payload.quantity,
        reason=payload.reason,
        reference_id=payload.reference_id,
        cost_price=payload.cost_price,
        sale_price=payload.sale_price,
    )
    return InventoryProductRow(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_name=product.category.name if product.category else "Sem categoria",
        quantity=product.quantity,
        status=product.status,
        sale_price=product.sale_price,
        cost_price=product.cost_price,
        featured=product.featured,
        is_offer=product.is_offer,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )
