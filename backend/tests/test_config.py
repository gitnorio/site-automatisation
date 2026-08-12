import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_openai_provider_requires_model_and_api_key() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            DISCOVERY_LLM_PROVIDER="openai",
            DISCOVERY_LLM_MODEL="",
            OPENAI_API_KEY="",
        )


def test_production_rejects_development_token_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            APP_ENV="production",
            DISCOVERY_LLM_PROVIDER="mock",
            CONSULTATION_TOKEN_SECRET="development-only-secret-change-me",
        )


def test_sqlite_database_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, DATABASE_URL="sqlite:///./data/koto.db")


def test_webhook_provider_requires_url_and_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            AUTOMATION_PROVIDER="webhook",
            AUTOMATION_WEBHOOK_URL="",
            AUTOMATION_WEBHOOK_SECRET="",
        )


def test_production_webhook_requires_https() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            APP_ENV="production",
            CONSULTATION_TOKEN_SECRET="production-consultation-secret",
            WORKSPACE_API_KEY="production-workspace-key",
            AUTOMATION_PROVIDER="webhook",
            AUTOMATION_WEBHOOK_URL="http://example.test/koto",
            AUTOMATION_WEBHOOK_SECRET="production-webhook-secret",
        )
