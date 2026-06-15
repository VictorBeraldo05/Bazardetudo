from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.core.security import create_token, get_password_hash, verify_password
from app.models.customer import Admin, Customer
from app.schemas.auth import AuthUser, LoginRequest, TokenResponse


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(db_session)) -> TokenResponse:
    customer = db.scalar(select(Customer).where(Customer.email == payload.email))
    if customer and verify_password(payload.password, customer.password_hash):
        if not customer.is_active:
            raise HTTPException(status_code=403, detail="Conta inativa")
    else:
        admin = db.scalar(select(Admin).where(Admin.email == payload.email))
        if not admin or not verify_password(payload.password, admin.password_hash):
            raise HTTPException(status_code=401, detail="Credenciais invalidas")
        if not admin.is_active:
            raise HTTPException(status_code=403, detail="Conta administrativa inativa")

        # Backward-compatible bridge: mirror legacy admins into customers with is_admin=true.
        if not customer:
            customer = Customer(
                full_name=admin.full_name,
                email=admin.email,
                phone=None,
                password_hash=get_password_hash(payload.password),
                is_active=True,
                is_admin=True,
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        else:
            customer.is_admin = True
            customer.password_hash = get_password_hash(payload.password)
            db.commit()
            db.refresh(customer)

    claims = {"customer_id": customer.id, "is_admin": customer.is_admin, "name": customer.full_name}
    access = create_token(customer.email, "access", 30, extra_claims=claims)
    refresh = create_token(customer.email, "refresh", 60 * 24 * 7, extra_claims=claims)
    user = AuthUser(id=customer.id, full_name=customer.full_name, email=customer.email, is_admin=customer.is_admin)
    return TokenResponse(access_token=access, refresh_token=refresh, user=user)
