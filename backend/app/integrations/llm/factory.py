"""Fabrique du fournisseur LLM Discovery configuré."""

from app.core.config import Settings
from app.integrations.llm.base import DiscoveryLLM
from app.integrations.llm.mock import MockDiscoveryLLM
from app.integrations.llm.openai import OpenAIDiscoveryLLM
from app.modules.discovery.orchestrator import DiscoveryOrchestrator


def create_discovery_llm(settings: Settings) -> DiscoveryLLM:
    if settings.discovery_llm_provider == "mock":
        return MockDiscoveryLLM()
    if settings.openai_api_key is None or settings.discovery_llm_model is None:
        raise ValueError("La configuration OpenAI est incomplète.")
    return OpenAIDiscoveryLLM(
        api_key=settings.openai_api_key.get_secret_value(),
        model=settings.discovery_llm_model,
        timeout_seconds=settings.llm_timeout_seconds,
        reasoning_effort=settings.discovery_llm_reasoning_effort,
        safety_secret=settings.consultation_token_secret.get_secret_value(),
    )


def create_discovery_orchestrator(settings: Settings) -> DiscoveryOrchestrator:
    return DiscoveryOrchestrator(
        create_discovery_llm(settings),
        max_retries=settings.llm_max_retries,
    )
