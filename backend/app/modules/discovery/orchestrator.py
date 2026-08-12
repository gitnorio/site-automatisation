"""Orchestration validée et reprise des appels LLM Discovery."""

import logging
from collections.abc import Awaitable, Callable
from typing import TypeVar

from app.integrations.llm.base import DiscoveryLLM
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
)
from app.modules.discovery.guardrails import (
    deterministic_stop_decision,
    validate_brief_result,
    validate_decision_result,
    validate_extraction_result,
)


logger = logging.getLogger(__name__)
ResultT = TypeVar("ResultT")


class DiscoveryLLMExhaustedError(RuntimeError):
    def __init__(self, operation: str, attempts: int) -> None:
        super().__init__(
            f"L'opération LLM {operation} a échoué après {attempts} tentative(s)."
        )
        self.operation = operation
        self.attempts = attempts


class DiscoveryOrchestrator:
    def __init__(self, llm: DiscoveryLLM, *, max_retries: int = 2) -> None:
        if max_retries < 0:
            raise ValueError("Le nombre de reprises ne peut pas être négatif.")
        self.llm = llm
        self.max_retries = max_retries

    async def extract_answer(
        self,
        input_data: ExtractionInput,
    ) -> ExtractionResult:
        return await self._run_validated(
            operation="extract",
            call=lambda: self.llm.extract_answer(input_data),
            validate=lambda result: validate_extraction_result(input_data, result),
        )

    async def decide_next_step(
        self,
        input_data: DecisionInput,
    ) -> DecisionResult:
        stop_decision = deterministic_stop_decision(input_data)
        if stop_decision is not None:
            return stop_decision
        return await self._run_validated(
            operation="decide",
            call=lambda: self.llm.decide_next_step(input_data),
            validate=lambda result: validate_decision_result(input_data, result),
        )

    async def generate_brief(
        self,
        input_data: BriefInput,
    ) -> MarketingDiscoveryBrief:
        try:
            return await self._run_validated(
                operation="brief",
                call=lambda: self.llm.generate_brief(input_data),
                validate=lambda result: validate_brief_result(input_data, result),
            )
        except DiscoveryLLMExhaustedError:
            fallback = build_marketing_discovery_brief(input_data)
            validate_brief_result(input_data, fallback)
            logger.warning(
                "discovery_brief_deterministic_fallback consultation_id=%s",
                input_data.consultation_id,
            )
            return fallback

    async def _run_validated(
        self,
        *,
        operation: str,
        call: Callable[[], Awaitable[ResultT]],
        validate: Callable[[ResultT], None],
    ) -> ResultT:
        attempts = self.max_retries + 1
        for attempt in range(1, attempts + 1):
            try:
                result = await call()
                validate(result)
                logger.info(
                    "discovery_llm_success operation=%s attempt=%s",
                    operation,
                    attempt,
                )
                return result
            except Exception as error:
                if attempt == attempts:
                    logger.error(
                        "discovery_llm_exhausted operation=%s attempts=%s error_type=%s",
                        operation,
                        attempts,
                        type(error).__name__,
                    )
                    raise DiscoveryLLMExhaustedError(operation, attempts) from error
                logger.warning(
                    "discovery_llm_retry operation=%s attempt=%s error_type=%s",
                    operation,
                    attempt,
                    type(error).__name__,
                )
        raise AssertionError("La boucle de reprises doit toujours retourner ou échouer.")
