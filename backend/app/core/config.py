from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Astrapio Contact API"
    database_url: str = Field(
        default="sqlite:///./data/astrapio.db", alias="CONTACT_DATABASE_URL"
    )
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    trust_proxy_headers: bool = Field(default=False, alias="TRUST_PROXY_HEADERS")
    rate_limit_max_requests: int = Field(default=5, alias="RATE_LIMIT_MAX_REQUESTS")
    rate_limit_window_seconds: int = Field(
        default=3600, alias="RATE_LIMIT_WINDOW_SECONDS"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

