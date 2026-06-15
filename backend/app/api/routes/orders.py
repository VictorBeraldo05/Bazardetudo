from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.models.fulfillment import Order
from app.schemas.order import CheckoutRequest, OrderRead, ReserveRequest
from app.services.stock import StockReservationService


router = APIRouter()
stock_service = StockReservationService()


@router.post("/reserve")
def reserve_item(payload: ReserveRequest, db: Session = Depends(db_session)) -> dict[str, str]:
    cart = stock_service.reserve_product(db, payload.product_id, payload.session_token, payload.quantity)
    return {"cart_id": cart.id, "reserved_until": cart.reserved_until.isoformat() if cart.reserved_until else ""}


@router.post("/checkout", response_model=OrderRead)
def checkout(payload: CheckoutRequest, db: Session = Depends(db_session)) -> Order:
    return stock_service.checkout(
        db=db,
        customer_id=payload.customer_id,
        cart_id=payload.cart_id,
        shipping_amount=payload.shipping_amount,
        discount_amount=payload.discount_amount,
        notes=payload.notes,
    )


@router.post("/release-expired")
def release_expired(db: Session = Depends(db_session)) -> dict[str, int]:
    released = stock_service.release_expired_reservations(db)
    return {"released": released}


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(db_session)) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.created_at.desc())).all())

