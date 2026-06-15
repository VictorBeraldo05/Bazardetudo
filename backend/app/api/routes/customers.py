from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.core.security import get_password_hash
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerRead


router = APIRouter()


@router.get("", response_model=list[CustomerRead], dependencies=[Depends(admin_guard)])
def list_customers(db: Session = Depends(db_session)) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.created_at.desc())).all())


@router.post("", response_model=CustomerRead)
def create_or_update_customer(payload: CustomerCreate, db: Session = Depends(db_session)) -> Customer:
    customer = db.scalar(select(Customer).where(Customer.email == payload.email))
    if customer:
        customer.full_name = payload.full_name
        customer.phone = payload.phone
        customer.document = payload.document
    else:
        customer = Customer(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            document=payload.document,
            password_hash=get_password_hash(payload.password or "temporary123"),
            is_active=True,
            is_admin=False,
        )
        db.add(customer)

    db.commit()
    db.refresh(customer)
    return customer
