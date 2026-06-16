from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
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


def ensure_backward_compatible_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as connection:
        if inspector.has_table("customers"):
            existing_columns = {column["name"] for column in inspector.get_columns("customers")}
            if "is_admin" not in existing_columns:
                connection.execute(text("ALTER TABLE customers ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"))

        if inspector.has_table("product_images") and engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT"))


app.include_router(api_router, prefix=settings.api_v1_str)
