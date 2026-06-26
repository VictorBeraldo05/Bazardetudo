from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.catalog import Category, Product, ProductImage, Subcategory
from app.models.inventory import InventoryMovement
from app.schemas.catalog import (
    ProductCreate,
    ProductDescriptionSuggestionRequest,
    ProductDescriptionSuggestionResponse,
    ProductRead,
    ProductUpdate,
)
from app.services.product_description_ai import create_fallback_product_description, generate_product_description
from app.services.product_alerts import notify_matching_alerts
from app.services.whatsapp_dispatch import enqueue_product_whatsapp_dispatch


router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(
    db: Session = Depends(db_session),
    category_id: str | None = None,
    subcategory_id: str | None = None,
    status: str | None = None,
) -> list[Product]:
    stmt = select(Product).order_by(Product.created_at.desc())
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if subcategory_id:
        stmt = stmt.where(Product.subcategory_id == subcategory_id)
    if status:
        stmt = stmt.where(Product.status == status)
    return list(db.scalars(stmt).unique().all())


@router.get("/slug/{slug}", response_model=ProductRead)
def get_product_by_slug(slug: str, db: Session = Depends(db_session)) -> Product:
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return product


@router.post(
    "/suggest-description",
    response_model=ProductDescriptionSuggestionResponse,
    dependencies=[Depends(admin_guard)],
)
def suggest_product_description(
    payload: ProductDescriptionSuggestionRequest,
    db: Session = Depends(db_session),
) -> ProductDescriptionSuggestionResponse:
    category_name: str | None = None
    subcategory_name: str | None = None

    if payload.category_id:
        category = db.get(Category, payload.category_id)
        category_name = category.name if category else None

    if payload.subcategory_id:
        subcategory = db.get(Subcategory, payload.subcategory_id)
        subcategory_name = subcategory.name if subcategory else None

    fallback = create_fallback_product_description(payload.name, category_name, subcategory_name)
    description = generate_product_description(payload.name, category_name, subcategory_name)
    source = "ai" if description != fallback else "fallback"
    return ProductDescriptionSuggestionResponse(description=description, source=source)


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

    if product.quantity > 0:
        db.add(
            InventoryMovement(
                product_id=product.id,
                movement_type="entry",
                quantity=product.quantity,
                reason="Cadastro inicial do produto",
                reference_id=product.id,
            )
        )

    notify_matching_alerts(db, product)
    enqueue_product_whatsapp_dispatch(db, product.id)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead, dependencies=[Depends(admin_guard)])
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(db_session)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    previous_quantity = product.quantity

    for field, value in payload.model_dump(exclude={"image_url", "image_alt_text"}).items():
        setattr(product, field, value)

    primary_image = min(product.images, key=lambda image: image.position, default=None)
    if payload.image_url:
        if primary_image:
            primary_image.image_url = payload.image_url
            primary_image.alt_text = payload.image_alt_text or product.name
        else:
            db.add(
                ProductImage(
                    product_id=product.id,
                    image_url=payload.image_url,
                    alt_text=payload.image_alt_text or product.name,
                    position=0,
                )
            )

    quantity_delta = product.quantity - previous_quantity
    if quantity_delta != 0:
        db.add(
            InventoryMovement(
                product_id=product.id,
                movement_type="entry" if quantity_delta > 0 else "sale",
                quantity=quantity_delta,
                reason="Ajuste manual no cadastro do produto",
                reference_id=product.id,
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
