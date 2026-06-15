from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.catalog import Product
from app.schemas.catalog import ProductCreate, ProductRead


router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(db_session), category_id: str | None = None, status: str | None = None) -> list[Product]:
    stmt = select(Product).order_by(Product.created_at.desc())
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if status:
        stmt = stmt.where(Product.status == status)
    return list(db.scalars(stmt).unique().all())


@router.get("/slug/{slug}", response_model=ProductRead)
def get_product_by_slug(slug: str, db: Session = Depends(db_session)) -> Product:
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: str, db: Session = Depends(db_session)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return product


@router.post("", response_model=ProductRead, dependencies=[Depends(admin_guard)])
def create_product(payload: ProductCreate, db: Session = Depends(db_session)) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
