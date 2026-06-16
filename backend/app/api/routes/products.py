from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.catalog import Product, ProductImage
from app.schemas.catalog import ProductCreate, ProductRead
from app.services.product_alerts import notify_matching_alerts


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
    product = Product(
        **payload.model_dump(exclude={"image_url", "image_alt_text"})
    )
    db.add(product)
    db.flush()

    if payload.image_url:
        db.add(
            ProductImage(
                product_id=product.id,
                image_url=payload.image_url,
                alt_text=payload.image_alt_text or product.name,
                position=0,
            )
        )

    notify_matching_alerts(db, product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", dependencies=[Depends(admin_guard)])
def delete_product(product_id: str, db: Session = Depends(db_session)) -> dict[str, str]:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    db.delete(product)
    db.commit()
    return {"status": "deleted"}
