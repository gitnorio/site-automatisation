import asyncio

import pytest

from app.integrations.llm.mock import MockDiscoveryLLM
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    ExtractedUpdate,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
)
from app.modules.discovery.orchestrator import (
    DiscoveryLLMExhaustedError,
    DiscoveryOrchestrator,
)


def objective_snapshots() -> list[ObjectiveSnapshot]:
    return [
        ObjectiveSnapshot(
            key=objective.key,
            required=objective.required,
            state=ObjectiveState.UNKNOWN,
        )
        for objective in get_marketing_discovery_blueprint().objectives
    ]


def extraction_input() -> ExtractionInput:
    return ExtractionInput(
        consultation_id="consultation-1",
        target_objective=ObjectiveKey.TRIGGER_PROBLEM,
        question="Pourquoi maintenant?",
        answer="Nos coûts augmentent.",
        objectives=objective_snapshots(),
    )


class SequencedLLM:
    def __init__(
        self,
        extraction_results: list[ExtractionResult | Exception],
    ) -> None:
        self.extraction_results = extraction_results
        self.extraction_calls = 0
        self.decision_calls = 0

    async def extract_answer(self, input_data: ExtractionInput) -> ExtractionResult:
        result = self.extraction_results[self.extraction_calls]
        self.extraction_calls += 1
        if isinstance(result, Exception):
            raise result
        return result

    async def decide_next_step(self, input_data: DecisionInput) -> DecisionResult:
        self.decision_calls += 1
        return await MockDiscoveryLLM().decide_next_step(input_data)

    async def generate_brief(
        self,
        input_data: BriefInput,
    ) -> MarketingDiscoveryBrief:
        return await MockDiscoveryLLM().generate_brief(input_data)


def invalid_extraction() -> ExtractionResult:
    return ExtractionResult(
        updates=[
            ExtractedUpdate(
                objective=ObjectiveKey.TRIGGER_PROBLEM,
                state=ObjectiveState.CONFIRMED,
                value={"answer": "Fait inventé"},
                confidence=0.9,
                evidence="Fait inventé",
            )
        ]
    )


def valid_extraction() -> ExtractionResult:
    return ExtractionResult(
        updates=[
            ExtractedUpdate(
                objective=ObjectiveKey.TRIGGER_PROBLEM,
                state=ObjectiveState.CONFIRMED,
                value={"answer": "Nos coûts augmentent."},
                confidence=0.9,
                evidence="Nos coûts augmentent.",
            )
        ]
    )


def test_orchestrator_retries_invalid_output_then_accepts_valid_output() -> None:
    provider = SequencedLLM([invalid_extraction(), valid_extraction()])
    orchestrator = DiscoveryOrchestrator(provider, max_retries=1)

    result = asyncio.run(orchestrator.extract_answer(extraction_input()))

    assert result == valid_extraction()
    assert provider.extraction_calls == 2


def test_orchestrator_retries_transient_error_without_logging_answer(
    caplog: pytest.LogCaptureFixture,
) -> None:
    provider = SequencedLLM([RuntimeError("temporary"), valid_extraction()])
    orchestrator = DiscoveryOrchestrator(provider, max_retries=1)

    result = asyncio.run(orchestrator.extract_answer(extraction_input()))

    assert result == valid_extraction()
    assert "discovery_llm_retry" in caplog.text
    assert "Nos coûts augmentent." not in caplog.text


def test_orchestrator_fails_after_retry_limit() -> None:
    provider = SequencedLLM([invalid_extraction(), invalid_extraction()])
    orchestrator = DiscoveryOrchestrator(provider, max_retries=1)

    with pytest.raises(DiscoveryLLMExhaustedError) as error:
        asyncio.run(orchestrator.extract_answer(extraction_input()))

    assert error.value.operation == "extract"
    assert error.value.attempts == 2


def test_orchestrator_stops_without_calling_llm() -> None:
    provider = SequencedLLM([])
    orchestrator = DiscoveryOrchestrator(provider, max_retries=2)
    input_data = DecisionInput(
        consultation_id="consultation-1",
        question_count=14,
        max_questions=14,
        objectives=objective_snapshots(),
    )

    decision = asyncio.run(orchestrator.decide_next_step(input_data))

    assert decision.action.value == "complete"
    assert provider.decision_calls == 0
