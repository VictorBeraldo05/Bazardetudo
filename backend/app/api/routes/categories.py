from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.models.catalog import Category
from app.schemas.catalog import CategoryRead


router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(db_session)) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)).all())

