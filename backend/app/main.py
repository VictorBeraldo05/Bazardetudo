from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.catalog import Product
from app.models.inventory import InventoryMovement
import app.models  # noqa: F401


app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    openapi_url=f"{settings.api_v1_str}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_backward_compatible_columns()
    backfill_inventory_entries()


def ensure_backward_compatible_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as connection:
        if inspector.has_table("customers"):
            existing_columns = {column["name"] for column in inspector.get_columns("customers")}
            if "is_admin" not in existing_columns:
                connection.execute(text("ALTER TABLE customers ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"))

        if inspector.has_table("product_images") and engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT"))


def backfill_inventory_entries() -> None:
    db: Session = SessionLocal()
    try:
        products = list(db.scalars(select(Product)).all())
        if not products:
            return

        movement_product_ids = set(
            db.scalars(
                select(InventoryMovement.product_id).where(InventoryMovement.movement_type == "entry")
            ).all()
        )

        created = 0
        for product in products:
            if product.id in movement_product_ids:
                continue
            if product.quantity <= 0:
                continue

            db.add(
                InventoryMovement(
                    product_id=product.id,
                    movement_type="entry",
                    quantity=product.quantity,
                    reason="Backfill automatico para produtos cadastrados antes do modulo de estoque",
                    reference_id=product.id,
                )
            )
            created += 1

        if created > 0:
            db.commit()
    finally:
        db.close()


app.include_router(api_router, prefix=settings.api_v1_str)
