from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Koto Discovery API"
    app_env: Literal["development", "test", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    database_url: str = Field(
        default="postgresql+psycopg://koto:koto@localhost:5433/koto",
        alias="DATABASE_URL",
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
    discovery_llm_reasoning_effort: Literal[
        "none", "low", "medium", "high", "xhigh", "max"
    ] = Field(default="low", alias="DISCOVERY_LLM_REASONING_EFFORT")
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
    consultation_token_ttl_seconds: int = Field(
        default=2_592_000,
        ge=300,
        le=31_536_000,
        alias="CONSULTATION_TOKEN_TTL_SECONDS",
    )
    workspace_api_key: SecretStr = Field(
        default=SecretStr("development-workspace-key-change-me"),
        alias="WORKSPACE_API_KEY",
    )
    automation_provider: Literal["disabled", "webhook"] = Field(
        default="disabled", alias="AUTOMATION_PROVIDER"
    )
    automation_webhook_url: str | None = Field(
        default=None, alias="AUTOMATION_WEBHOOK_URL"
    )
    automation_webhook_secret: SecretStr | None = Field(
        default=None, alias="AUTOMATION_WEBHOOK_SECRET"
    )
    automation_timeout_seconds: int = Field(
        default=5, ge=2, le=30, alias="AUTOMATION_TIMEOUT_SECONDS"
    )
    automation_max_retries: int = Field(
        default=2, ge=0, le=3, alias="AUTOMATION_MAX_RETRIES"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @field_validator("database_url")
    @classmethod
    def require_postgresql(cls, value: str) -> str:
        if not value.startswith(("postgresql://", "postgresql+psycopg://")):
            raise ValueError("DATABASE_URL doit utiliser PostgreSQL.")
        return value

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
        uses_development_workspace_key = (
            self.workspace_api_key.get_secret_value()
            == "development-workspace-key-change-me"
        )
        if self.app_env == "production" and uses_development_workspace_key:
            raise ValueError("WORKSPACE_API_KEY doit être remplacé en production.")
        if self.automation_provider == "webhook":
            if not self.automation_webhook_url:
                raise ValueError("AUTOMATION_WEBHOOK_URL est requis avec le connecteur webhook.")
            if not self.automation_webhook_secret:
                raise ValueError("AUTOMATION_WEBHOOK_SECRET est requis avec le connecteur webhook.")
            if self.app_env == "production" and not self.automation_webhook_url.startswith(
                "https://"
            ):
                raise ValueError("AUTOMATION_WEBHOOK_URL doit utiliser HTTPS en production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
