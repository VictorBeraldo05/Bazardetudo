from collections.abc import Generator

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db


def db_session() -> Generator[Session, None, None]:
    yield from get_db()


def admin_guard(x_admin_token: str | None = Header(default=None)) -> None:
    if x_admin_token != "dev-admin":
        raise HTTPException(status_code=401, detail="Admin token invalido")

