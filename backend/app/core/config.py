from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Bazar de Tudo API"
    api_v1_str: str = "/api/v1"
    environment: str = "development"
    backend_cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./bazar.db"
    whatsapp_provider: str = "mock"
    whatsapp_base_url: str = "https://provider.example.com"
    whatsapp_api_token: str = "change-me"
    store_whatsapp: str = "5519998253607"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str = "Bazar de Tudo"
    smtp_use_tls: bool = True
    app_public_url: str | None = None
    heartbeat_enabled: bool = False
    heartbeat_interval_minutes: int = 10

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("DATABASE_URL must be a string")
        normalized = value.strip()
        if normalized.startswith("postgresql://"):
            return normalized.replace("postgresql://", "postgresql+psycopg://", 1)
        if normalized.startswith("postgres://"):
            return normalized.replace("postgres://", "postgresql+psycopg://", 1)
        return normalized

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            normalized = value.strip()
            if not normalized:
                return []
            if normalized.startswith("["):
                import json

                parsed = json.loads(normalized)
                if not isinstance(parsed, list):
                    raise ValueError("BACKEND_CORS_ORIGINS JSON must be a list")
                return [str(item) for item in parsed]
            return [item.strip() for item in normalized.split(",") if item.strip()]
        raise ValueError("Invalid BACKEND_CORS_ORIGINS value")

    @field_validator("app_public_url", mode="before")
    @classmethod
    def normalize_app_public_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().rstrip("/")
        return normalized or None

    @field_validator("heartbeat_interval_minutes")
    @classmethod
    def validate_heartbeat_interval(cls, value: int) -> int:
        if value < 1:
            raise ValueError("HEARTBEAT_INTERVAL_MINUTES must be at least 1")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
