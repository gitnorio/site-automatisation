from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Koto Discovery API"
    app_env: Literal["development", "test", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    database_url: str = Field(
        default="sqlite:///./data/astrapio.db",
        validation_alias=AliasChoices("DATABASE_URL", "CONTACT_DATABASE_URL"),
    )
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    trust_proxy_headers: bool = Field(default=False, alias="TRUST_PROXY_HEADERS")
    rate_limit_max_requests: int = Field(default=5, alias="RATE_LIMIT_MAX_REQUESTS")
    rate_limit_window_seconds: int = Field(
        default=3600, alias="RATE_LIMIT_WINDOW_SECONDS"
    )
    discovery_llm_provider: Literal["openai", "mock"] = Field(
        default="mock", alias="DISCOVERY_LLM_PROVIDER"
    )
    discovery_llm_model: str | None = Field(
        default=None, alias="DISCOVERY_LLM_MODEL"
    )
    openai_api_key: SecretStr | None = Field(default=None, alias="OPENAI_API_KEY")
    llm_timeout_seconds: int = Field(
        default=30, ge=5, le=120, alias="LLM_TIMEOUT_SECONDS"
    )
    llm_max_retries: int = Field(default=2, ge=0, le=5, alias="LLM_MAX_RETRIES")
    discovery_max_questions: int = Field(
        default=14, ge=6, le=20, alias="DISCOVERY_MAX_QUESTIONS"
    )
    consultation_token_secret: SecretStr = Field(
        default=SecretStr("development-only-secret-change-me"),
        alias="CONSULTATION_TOKEN_SECRET",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_llm_configuration(self) -> "Settings":
        if self.discovery_llm_provider == "openai":
            if not self.discovery_llm_model:
                raise ValueError("DISCOVERY_LLM_MODEL est requis avec le fournisseur OpenAI.")
            if not self.openai_api_key or not self.openai_api_key.get_secret_value():
                raise ValueError("OPENAI_API_KEY est requis avec le fournisseur OpenAI.")
        uses_development_secret = (
            self.consultation_token_secret.get_secret_value()
            == "development-only-secret-change-me"
        )
        if self.app_env == "production" and uses_development_secret:
            raise ValueError("CONSULTATION_TOKEN_SECRET doit être remplacé en production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
