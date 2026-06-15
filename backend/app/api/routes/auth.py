from fastapi import APIRouter

from app.core.security import create_token
from app.schemas.auth import LoginRequest, TokenResponse


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    access = create_token(payload.email, "access", 30)
    refresh = create_token(payload.email, "refresh", 60 * 24 * 7)
    return TokenResponse(access_token=access, refresh_token=refresh)

