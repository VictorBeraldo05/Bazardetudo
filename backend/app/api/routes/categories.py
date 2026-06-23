from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import admin_guard, db_session
from app.models.catalog import Category, Product, Subcategory
from app.schemas.catalog import (
    CategoryCreate,
    CategoryUpdate,
    CategoryWithSubcategoriesRead,
    SubcategoryCreate,
    SubcategoryRead,
    SubcategoryUpdate,
)


router = APIRouter()


@router.get("", response_model=list[CategoryWithSubcategoriesRead])
def list_categories(db: Session = Depends(db_session)) -> list[Category]:
    return list(
        db.scalars(
            select(Category)
            .options(selectinload(Category.subcategories))
            .order_by(Category.name)
        ).all()
    )


@router.post("", response_model=CategoryWithSubcategoriesRead, dependencies=[Depends(admin_guard)])
def create_category(payload: CategoryCreate, db: Session = Depends(db_session)) -> Category:
    existing = db.scalar(select(Category).where((Category.name == payload.name) | (Category.slug == payload.slug)))
    if existing:
        raise HTTPException(status_code=409, detail="Ja existe uma categoria com esse nome ou slug")

    category = Category(name=payload.name, slug=payload.slug, description=payload.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryWithSubcategoriesRead, dependencies=[Depends(admin_guard)])
def update_category(category_id: str, payload: CategoryUpdate, db: Session = Depends(db_session)) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria nao encontrada")

    duplicate = db.scalar(
        select(Category).where(
            Category.id != category_id,
            ((Category.name == payload.name) | (Category.slug == payload.slug)),
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Ja existe uma categoria com esse nome ou slug")

    category.name = payload.name
    category.slug = payload.slug
    category.description = payload.description
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", dependencies=[Depends(admin_guard)])
def delete_category(category_id: str, db: Session = Depends(db_session)) -> dict[str, str]:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria nao encontrada")

    product_count = db.scalar(select(func.count()).select_from(Product).where(Product.category_id == category_id))
    if product_count:
        raise HTTPException(status_code=409, detail="Remova ou mova os produtos dessa categoria antes de excluir")

    subcategory_count = db.scalar(select(func.count()).select_from(Subcategory).where(Subcategory.category_id == category_id))
    if subcategory_count:
        raise HTTPException(status_code=409, detail="Exclua as subcategorias da categoria antes de remover")

    db.delete(category)
    db.commit()
    return {"status": "deleted"}


@router.post("/{category_id}/subcategories", response_model=SubcategoryRead, dependencies=[Depends(admin_guard)])
def create_subcategory(category_id: str, payload: SubcategoryCreate, db: Session = Depends(db_session)) -> Subcategory:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria nao encontrada")

    duplicate = db.scalar(select(Subcategory).where((Subcategory.name == payload.name) | (Subcategory.slug == payload.slug)))
    if duplicate:
        raise HTTPException(status_code=409, detail="Ja existe uma subcategoria com esse nome ou slug")

    subcategory = Subcategory(
        category_id=category_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        image=getattr(payload, "image", None),
    )
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryRead, dependencies=[Depends(admin_guard)])
def update_subcategory(subcategory_id: str, payload: SubcategoryUpdate, db: Session = Depends(db_session)) -> Subcategory:
    subcategory = db.get(Subcategory, subcategory_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategoria nao encontrada")

    category = db.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria de destino nao encontrada")

    duplicate = db.scalar(
        select(Subcategory).where(
            Subcategory.id != subcategory_id,
            ((Subcategory.name == payload.name) | (Subcategory.slug == payload.slug)),
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Ja existe uma subcategoria com esse nome ou slug")

    subcategory.category_id = payload.category_id
    subcategory.name = payload.name
    subcategory.slug = payload.slug
    subcategory.description = payload.description
    subcategory.image = getattr(payload, "image", None)
    db.commit()
    db.refresh(subcategory)
    return subcategory


@router.delete("/subcategories/{subcategory_id}", dependencies=[Depends(admin_guard)])
def delete_subcategory(subcategory_id: str, db: Session = Depends(db_session)) -> dict[str, str]:
    subcategory = db.get(Subcategory, subcategory_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategoria nao encontrada")

    product_count = db.scalar(select(func.count()).select_from(Product).where(Product.subcategory_id == subcategory_id))
    if product_count:
        raise HTTPException(status_code=409, detail="Remova ou troque os produtos dessa subcategoria antes de excluir")

    db.delete(subcategory)
    db.commit()
    return {"status": "deleted"}
