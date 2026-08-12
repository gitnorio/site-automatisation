import pytest

from app.modules.discovery.blueprint import (
    EXPECTED_IMPOSED_QUESTIONS,
    get_marketing_discovery_blueprint,
)
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    EngineAction,
    ExtractedUpdate,
    ExtractionInput,
    ExtractionResult,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    QualificationBrief,
    QualificationLevel,
    ReasonCode,
    ResponseType,
)
from app.modules.discovery.guardrails import (
    DiscoveryGuardrailError,
    deterministic_stop_decision,
    validate_brief_result,
    validate_decision_result,
    validate_extraction_result,
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
        question="Pourquoi cherchez-vous une agence maintenant?",
        answer="Nos coûts d'acquisition augmentent depuis trois mois.",
        objectives=objective_snapshots(),
    )


def test_extraction_requires_evidence_from_the_actual_answer() -> None:
    input_data = extraction_input()
    invalid_result = ExtractionResult(
        updates=[
            ExtractedUpdate(
                objective=ObjectiveKey.TRIGGER_PROBLEM,
                state=ObjectiveState.CONFIRMED,
                value={"problem": "Coûts en hausse"},
                confidence=0.9,
                evidence="Le prospect veut doubler ses revenus.",
            )
        ]
    )

    with pytest.raises(DiscoveryGuardrailError, match="extrait exact"):
        validate_extraction_result(input_data, invalid_result)


def test_extraction_contradictions_must_match_updates() -> None:
    input_data = extraction_input()
    invalid_result = ExtractionResult(
        updates=[
            ExtractedUpdate(
                objective=ObjectiveKey.TRIGGER_PROBLEM,
                state=ObjectiveState.CONFIRMED,
                value={"problem": "Coûts en hausse"},
                confidence=0.9,
                evidence="coûts d'acquisition augmentent",
            )
        ],
        detected_contradictions=[ObjectiveKey.TRIGGER_PROBLEM],
    )

    with pytest.raises(DiscoveryGuardrailError, match="contradictions"):
        validate_extraction_result(input_data, invalid_result)


def test_decision_prioritizes_required_contradiction_over_unknown() -> None:
    objectives = objective_snapshots()
    budget = next(item for item in objectives if item.key == ObjectiveKey.BUDGET)
    budget.state = ObjectiveState.CONTRADICTION
    input_data = DecisionInput(
        consultation_id="consultation-1",
        question_count=3,
        max_questions=14,
        objectives=objectives,
    )
    valid_result = DecisionResult(
        action=EngineAction.ASK,
        target_objective=ObjectiveKey.BUDGET,
        question="Vous avez indiqué deux budgets différents. Lequel faut-il retenir?",
        response_type=ResponseType.BUDGET_RANGE,
        reason_code=ReasonCode.REQUIRED_CONTRADICTION,
    )

    validate_decision_result(input_data, valid_result)


def test_unknown_imposed_objective_uses_exact_product_question() -> None:
    objectives = objective_snapshots()
    input_data = DecisionInput(
        consultation_id="consultation-1",
        question_count=4,
        max_questions=14,
        objectives=objectives,
    )
    valid_result = DecisionResult(
        action=EngineAction.ASK,
        target_objective=ObjectiveKey.TRIGGER_PROBLEM,
        question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.TRIGGER_PROBLEM],
        response_type=ResponseType.TEXT,
        reason_code=ReasonCode.REQUIRED_UNKNOWN,
    )

    validate_decision_result(input_data, valid_result)


@pytest.mark.parametrize(
    "unsafe_question",
    [
        "Vous devriez investir dans la publicité payante. Quel est votre secteur?",
        "Nous vous recommandons le SEO. Quel est votre secteur?",
        "Nous garantissons le résultat. Quel est votre secteur?",
        "Votre agence est inefficace. Quel est votre secteur?",
    ],
)
def test_decision_rejects_prohibited_content(unsafe_question: str) -> None:
    input_data = DecisionInput(
        consultation_id="consultation-1",
        question_count=1,
        max_questions=14,
        objectives=objective_snapshots(),
    )
    unsafe_result = DecisionResult(
        action=EngineAction.ASK,
        target_objective=ObjectiveKey.COMPANY_PROFILE,
        question=unsafe_question,
        response_type=ResponseType.TEXT,
        reason_code=ReasonCode.REQUIRED_UNKNOWN,
    )

    with pytest.raises(DiscoveryGuardrailError, match="garde-fou"):
        validate_decision_result(input_data, unsafe_result)


def test_backend_completes_without_llm_at_question_limit() -> None:
    input_data = DecisionInput(
        consultation_id="consultation-1",
        question_count=14,
        max_questions=14,
        objectives=objective_snapshots(),
    )

    decision = deterministic_stop_decision(input_data)

    assert decision is not None
    assert decision.action == EngineAction.COMPLETE
    assert decision.reason_code == ReasonCode.QUESTION_LIMIT_REACHED


def test_brief_must_preserve_missing_and_contradictory_objectives() -> None:
    objectives = objective_snapshots()
    budget = next(item for item in objectives if item.key == ObjectiveKey.BUDGET)
    budget.state = ObjectiveState.CONTRADICTION
    input_data = BriefInput(
        consultation_id="consultation-1",
        objectives=objectives,
    )
    brief = build_marketing_discovery_brief(input_data)

    validate_brief_result(input_data, brief)

    brief.contradictions = []
    with pytest.raises(DiscoveryGuardrailError, match="contradictions"):
        validate_brief_result(input_data, brief)


def test_brief_questions_follow_deterministic_clarification_needs() -> None:
    objectives = objective_snapshots()
    budget = next(item for item in objectives if item.key == ObjectiveKey.BUDGET)
    budget.state = ObjectiveState.CONTRADICTION
    input_data = BriefInput(
        consultation_id="consultation-1",
        objectives=objectives,
    )
    brief = build_marketing_discovery_brief(input_data)

    assert 3 <= len(brief.recommended_questions) <= 8
    assert brief.recommended_questions[0].topic == ObjectiveKey.BUDGET
    assert brief.recommended_questions[0].priority.value == "high"
    assert brief.recommended_questions[0].source.value == "contradiction"
    validate_brief_result(input_data, brief)

    brief.recommended_questions[0].source = "deepening"
    with pytest.raises(DiscoveryGuardrailError, match="besoins détectés"):
        validate_brief_result(input_data, brief)


def test_brief_rejects_a_fact_absent_from_structured_objectives() -> None:
    input_data = BriefInput(
        consultation_id="consultation-1",
        objectives=objective_snapshots(),
    )
    brief = build_marketing_discovery_brief(input_data)
    brief.primary_goal = "Doubler les revenus en six mois"

    with pytest.raises(DiscoveryGuardrailError, match="fait absent"):
        validate_brief_result(input_data, brief)


def test_brief_rejects_a_qualification_not_derived_by_the_backend() -> None:
    input_data = BriefInput(
        consultation_id="consultation-1",
        objectives=objective_snapshots(),
    )
    brief = build_marketing_discovery_brief(input_data)
    brief.qualification = QualificationBrief(
        level=QualificationLevel.PRIORITY,
        reasons=["Qualification inventée par le modèle."],
    )

    with pytest.raises(DiscoveryGuardrailError, match="qualification"):
        validate_brief_result(input_data, brief)
