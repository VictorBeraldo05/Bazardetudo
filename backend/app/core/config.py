from functools import lru_cache

from pydantic import Field
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


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

