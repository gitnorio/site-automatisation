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
