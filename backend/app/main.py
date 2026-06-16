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
    if not inspector.has_table("customers"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("customers")}
    if "is_admin" in existing_columns:
        return

    alter_sql = "ALTER TABLE customers ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"
    with engine.begin() as connection:
        connection.execute(text(alter_sql))


app.include_router(api_router, prefix=settings.api_v1_str)
