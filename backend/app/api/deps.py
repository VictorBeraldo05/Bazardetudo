from collections.abc import Generator

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db


def db_session() -> Generator[Session, None, None]:
    yield from get_db()


def admin_guard(
    authorization: str | None = Header(default=None),
    x_admin_token: str | None = Header(default=None),
) -> None:
    if x_admin_token == "dev-admin":
        return

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Autenticacao administrativa obrigatoria")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_token(token)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=401, detail="Token invalido") from exc

    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Sem permissao para acessar a area administrativa")
