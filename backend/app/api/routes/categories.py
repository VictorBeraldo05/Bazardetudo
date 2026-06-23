from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import db_session
from app.models.catalog import Category
from app.schemas.catalog import CategoryWithSubcategoriesRead


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
