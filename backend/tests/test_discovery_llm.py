import asyncio
import json
from types import SimpleNamespace

import pytest

from app.core.config import Settings
from app.integrations.llm.factory import create_discovery_llm
from app.integrations.llm.mock import MockDiscoveryLLM
from app.integrations.llm.openai import OpenAIDiscoveryError, OpenAIDiscoveryLLM
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    EngineAction,
    ExtractionInput,
    ExtractionResult,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    ReasonCode,
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


def extraction_input(
    *,
    answer: str = "Nos coûts publicitaires augmentent.",
    objectives: list[ObjectiveSnapshot] | None = None,
) -> ExtractionInput:
    return ExtractionInput(
        consultation_id="consultation-42",
        target_objective=ObjectiveKey.TRIGGER_PROBLEM,
        question="Pourquoi cherchez-vous une agence maintenant?",
        answer=answer,
        objectives=objectives or objective_snapshots(),
    )


def test_mock_provider_extracts_confirmed_and_partial_answers() -> None:
    provider = MockDiscoveryLLM()

    confirmed = asyncio.run(provider.extract_answer(extraction_input()))
    partial = asyncio.run(
        provider.extract_answer(extraction_input(answer="Je ne sais pas"))
    )

    assert confirmed.updates[0].state == ObjectiveState.CONFIRMED
    assert partial.updates[0].state == ObjectiveState.PARTIAL


def test_mock_provider_detects_a_contradiction() -> None:
    objectives = objective_snapshots()
    trigger = next(
        item for item in objectives if item.key == ObjectiveKey.TRIGGER_PROBLEM
    )
    trigger.state = ObjectiveState.CONFIRMED
    trigger.value = {"answer": "Nous lançons une nouvelle marque."}
    provider = MockDiscoveryLLM()

    result = asyncio.run(
        provider.extract_answer(
            extraction_input(
                answer="Nos coûts publicitaires augmentent.",
                objectives=objectives,
            )
        )
    )

    assert result.updates[0].state == ObjectiveState.CONTRADICTION
    assert result.detected_contradictions == [ObjectiveKey.TRIGGER_PROBLEM]


def test_mock_provider_uses_backend_stop_decision() -> None:
    provider = MockDiscoveryLLM()
    input_data = DecisionInput(
        consultation_id="consultation-42",
        question_count=14,
        max_questions=14,
        objectives=objective_snapshots(),
    )

    result = asyncio.run(provider.decide_next_step(input_data))

    assert result.action == EngineAction.COMPLETE
    assert result.reason_code == ReasonCode.QUESTION_LIMIT_REACHED


def test_mock_provider_builds_a_structured_brief() -> None:
    provider = MockDiscoveryLLM()
    objectives = objective_snapshots()
    company = next(item for item in objectives if item.key == ObjectiveKey.COMPANY_PROFILE)
    company.state = ObjectiveState.CONFIRMED
    company.value = {"answer": "Cabinet de services financiers"}

    brief = asyncio.run(
        provider.generate_brief(
            BriefInput(consultation_id="consultation-42", objectives=objectives)
        )
    )

    assert brief.company.sector == "Cabinet de services financiers"
    assert ObjectiveKey.BUDGET in brief.missing_information


class FakeResponses:
    def __init__(self, output_parsed: object) -> None:
        self.output_parsed = output_parsed
        self.kwargs: dict[str, object] = {}

    async def parse(self, **kwargs: object) -> SimpleNamespace:
        self.kwargs = kwargs
        return SimpleNamespace(output_parsed=self.output_parsed)


class FakeOpenAIClient:
    def __init__(self, output_parsed: object) -> None:
        self.responses = FakeResponses(output_parsed)


def test_openai_provider_uses_structured_responses_and_privacy_controls() -> None:
    parsed = ExtractionResult(updates=[])
    client = FakeOpenAIClient(parsed)
    provider = OpenAIDiscoveryLLM(
        api_key="test-key",
        model="gpt-5.6-sol",
        timeout_seconds=10,
        reasoning_effort="low",
        safety_secret="secret",
        client=client,
    )

    result = asyncio.run(provider.extract_answer(extraction_input()))

    assert result is parsed
    assert client.responses.kwargs["model"] == "gpt-5.6-sol"
    assert client.responses.kwargs["text_format"] is ExtractionResult
    assert client.responses.kwargs["reasoning"] == {"effort": "low"}
    assert client.responses.kwargs["store"] is False
    safety_identifier = client.responses.kwargs["safety_identifier"]
    assert safety_identifier != "consultation-42"
    assert len(str(safety_identifier)) == 64


def test_openai_provider_rejects_missing_parsed_output() -> None:
    provider = OpenAIDiscoveryLLM(
        api_key="test-key",
        model="gpt-5.6-sol",
        timeout_seconds=10,
        safety_secret="secret",
        client=FakeOpenAIClient(None),
    )

    with pytest.raises(OpenAIDiscoveryError, match="aucune sortie structurée"):
        asyncio.run(provider.extract_answer(extraction_input()))


def test_openai_brief_receives_backend_question_requirements() -> None:
    input_data = BriefInput(
        consultation_id="consultation-42",
        objectives=objective_snapshots(),
    )
    parsed = build_marketing_discovery_brief(input_data)
    client = FakeOpenAIClient(parsed)
    provider = OpenAIDiscoveryLLM(
        api_key="test-key",
        model="gpt-5.6-sol",
        timeout_seconds=10,
        safety_secret="secret",
        client=client,
    )

    result = asyncio.run(provider.generate_brief(input_data))
    payload = json.loads(str(client.responses.kwargs["input"]))

    assert result is parsed
    assert len(payload["question_requirements"]) == 8
    assert payload["question_requirements"][0]["priority"] == "high"
    assert payload["question_requirements"][0]["source"] == "missing"


def test_factory_selects_mock_without_api_credentials() -> None:
    provider = create_discovery_llm(Settings(_env_file=None))

    assert isinstance(provider, MockDiscoveryLLM)
