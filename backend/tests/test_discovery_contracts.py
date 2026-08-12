import pytest
from pydantic import ValidationError

from app.modules.discovery.contracts import (
    Choice,
    DecisionResult,
    EngineAction,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    QualificationBrief,
    QualificationLevel,
    ReasonCode,
    ResponseType,
    contract_json_schemas,
)


def test_ask_decision_requires_complete_question_shape() -> None:
    decision = DecisionResult(
        action=EngineAction.ASK,
        target_objective=ObjectiveKey.BUDGET,
        question="Quelle fourchette budgétaire avez-vous en tête?",
        response_type=ResponseType.BUDGET_RANGE,
        choices=[],
        reason_code=ReasonCode.REQUIRED_UNKNOWN,
    )

    assert decision.target_objective == ObjectiveKey.BUDGET


def test_choice_question_requires_options() -> None:
    with pytest.raises(ValidationError):
        DecisionResult(
            action=EngineAction.ASK,
            target_objective=ObjectiveKey.SERVICE_SOUGHT,
            question="Quel service recherchez-vous?",
            response_type=ResponseType.SINGLE_CHOICE,
            choices=[],
            reason_code=ReasonCode.REQUIRED_UNKNOWN,
        )


def test_complete_decision_rejects_question_content() -> None:
    with pytest.raises(ValidationError):
        DecisionResult(
            action=EngineAction.COMPLETE,
            target_objective=ObjectiveKey.PRIMARY_GOAL,
            question="Une dernière question",
            response_type=ResponseType.TEXT,
            choices=[Choice(value="oui", label="Oui")],
            reason_code=ReasonCode.ALL_REQUIRED_COMPLETE,
        )


def test_contracts_export_json_schema() -> None:
    schemas = contract_json_schemas()

    assert "decision_result" in schemas
    assert schemas["marketing_discovery_brief"]["type"] == "object"


def test_legacy_brief_without_recommended_questions_remains_valid() -> None:
    brief = MarketingDiscoveryBrief(
        company={},
        qualification=QualificationBrief(
            level=QualificationLevel.FOLLOW_UP,
            reasons=["Information à compléter."],
        ),
    )

    assert brief.recommended_questions == []
