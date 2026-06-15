from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.inventory import InventoryMovement
from app.schemas.catalog import InventoryMovementRead


router = APIRouter(dependencies=[Depends(admin_guard)])


@router.get("", response_model=list[InventoryMovementRead])
def list_inventory_movements(db: Session = Depends(db_session)) -> list[InventoryMovement]:
    return list(db.scalars(select(InventoryMovement).order_by(InventoryMovement.created_at.desc())).all())
