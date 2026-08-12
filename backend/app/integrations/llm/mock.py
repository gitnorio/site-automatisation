"""Fournisseur LLM déterministe utilisé en développement et dans les tests."""

from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.blueprint import EXPECTED_IMPOSED_QUESTIONS
from app.modules.discovery.contracts import (
    BriefInput,
    Choice,
    DecisionInput,
    DecisionResult,
    EngineAction,
    ExtractedUpdate,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    ReasonCode,
    ResponseType,
)
from app.modules.discovery.guardrails import deterministic_stop_decision


QUESTION_BY_OBJECTIVE: dict[ObjectiveKey, str] = {
    ObjectiveKey.COMPANY_PROFILE: "Pouvez-vous présenter brièvement votre entreprise?",
    ObjectiveKey.TARGET_CUSTOMER: "Qui est votre clientèle cible principale?",
    ObjectiveKey.POSITIONING_COMPETITORS: "Comment décririez-vous votre positionnement?",
    ObjectiveKey.CURRENT_CHANNELS: "Quels canaux marketing utilisez-vous actuellement?",
    ObjectiveKey.TOOLS_PLATFORMS: "Quels outils marketing utilisez-vous actuellement?",
    ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE: EXPECTED_IMPOSED_QUESTIONS[
        ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE
    ],
    ObjectiveKey.INTERNAL_MARKETING_TEAM: "Quelles ressources marketing avez-vous à l'interne?",
    ObjectiveKey.PRIMARY_GOAL: EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.PRIMARY_GOAL],
    ObjectiveKey.TRIGGER_PROBLEM: EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.TRIGGER_PROBLEM],
    ObjectiveKey.DESIRED_MEASURABLE_RESULTS: "Quels résultats aimeriez-vous pouvoir mesurer?",
    ObjectiveKey.SERVICE_SOUGHT: "Quel type de service recherchez-vous?",
    ObjectiveKey.BUDGET: EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.BUDGET],
    ObjectiveKey.TIMELINE: EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.TIMELINE],
    ObjectiveKey.DECISION_PROCESS: EXPECTED_IMPOSED_QUESTIONS[
        ObjectiveKey.DECISION_PROCESS
    ],
}


RESPONSE_TYPE_BY_OBJECTIVE: dict[ObjectiveKey, ResponseType] = {
    ObjectiveKey.CURRENT_CHANNELS: ResponseType.MULTI_CHOICE,
    ObjectiveKey.TOOLS_PLATFORMS: ResponseType.MULTI_CHOICE,
    ObjectiveKey.SERVICE_SOUGHT: ResponseType.MULTI_CHOICE,
    ObjectiveKey.BUDGET: ResponseType.BUDGET_RANGE,
    ObjectiveKey.TIMELINE: ResponseType.DATE_OR_TIMELINE,
}


CHOICES_BY_OBJECTIVE: dict[ObjectiveKey, tuple[Choice, ...]] = {
    ObjectiveKey.CURRENT_CHANNELS: (
        Choice(value="none", label="Aucun canal actif"),
        Choice(value="seo", label="SEO"),
        Choice(value="paid_media", label="Publicité payante"),
        Choice(value="social", label="Réseaux sociaux"),
        Choice(value="email", label="Email"),
        Choice(value="other", label="Autre"),
    ),
    ObjectiveKey.TOOLS_PLATFORMS: (
        Choice(value="analytics", label="Analytics"),
        Choice(value="crm", label="CRM"),
        Choice(value="ads", label="Plateformes publicitaires"),
        Choice(value="other", label="Autre"),
    ),
    ObjectiveKey.SERVICE_SOUGHT: (
        Choice(value="strategy", label="Stratégie"),
        Choice(value="seo", label="SEO"),
        Choice(value="paid_media", label="Paid media"),
        Choice(value="branding", label="Branding"),
        Choice(value="other", label="Autre"),
    ),
}


VAGUE_ANSWERS = {
    "je ne sais pas",
    "pas sûr",
    "pas certaine",
    "peut-être",
    "aucune idée",
}


class MockDiscoveryLLM:
    async def extract_answer(self, input_data: ExtractionInput) -> ExtractionResult:
        answer_text = _answer_as_text(input_data.answer)
        target = _objective(input_data.objectives, input_data.target_objective)
        state = _extracted_state(target, input_data.answer)
        update = ExtractedUpdate(
            objective=input_data.target_objective,
            state=state,
            value={"answer": input_data.answer},
            confidence=0.55 if state == ObjectiveState.PARTIAL else 0.95,
            evidence=answer_text[:1000],
        )
        contradictions = (
            [input_data.target_objective]
            if state == ObjectiveState.CONTRADICTION
            else []
        )
        return ExtractionResult(
            updates=[update],
            detected_contradictions=contradictions,
        )

    async def decide_next_step(self, input_data: DecisionInput) -> DecisionResult:
        stop_decision = deterministic_stop_decision(input_data)
        if stop_decision is not None:
            return stop_decision

        target, reason = _next_required_objective(input_data.objectives)
        question = _question_for(target)
        response_type = RESPONSE_TYPE_BY_OBJECTIVE.get(target.key, ResponseType.TEXT)
        return DecisionResult(
            action=EngineAction.ASK,
            target_objective=target.key,
            question=question,
            response_type=response_type,
            choices=list(CHOICES_BY_OBJECTIVE.get(target.key, ())),
            reason_code=reason,
        )

    async def generate_brief(
        self,
        input_data: BriefInput,
    ) -> MarketingDiscoveryBrief:
        return build_marketing_discovery_brief(input_data)


def _objective(
    objectives: list[ObjectiveSnapshot],
    key: ObjectiveKey,
) -> ObjectiveSnapshot:
    return next(objective for objective in objectives if objective.key == key)


def _extracted_state(
    target: ObjectiveSnapshot,
    answer: str | int | float | list[str],
) -> ObjectiveState:
    answer_text = _answer_as_text(answer)
    previous_answer = target.value.get("answer") if target.value else None
    if (
        target.state == ObjectiveState.CONFIRMED
        and previous_answer is not None
        and _answer_as_text(previous_answer) != answer_text
    ):
        return ObjectiveState.CONTRADICTION
    if not answer_text.strip() or answer_text.casefold().strip() in VAGUE_ANSWERS:
        return ObjectiveState.PARTIAL
    return ObjectiveState.CONFIRMED


def _next_required_objective(
    objectives: list[ObjectiveSnapshot],
) -> tuple[ObjectiveSnapshot, ReasonCode]:
    priorities = (
        (ObjectiveState.CONTRADICTION, ReasonCode.REQUIRED_CONTRADICTION),
        (ObjectiveState.PARTIAL, ReasonCode.REQUIRED_PARTIAL),
        (ObjectiveState.UNKNOWN, ReasonCode.REQUIRED_UNKNOWN),
    )
    for state, reason in priorities:
        target = next(
            (
                objective
                for objective in objectives
                if objective.required and objective.state == state
            ),
            None,
        )
        if target is not None:
            return target, reason
    raise ValueError("Aucun objectif obligatoire interrogeable.")


def _question_for(target: ObjectiveSnapshot) -> str:
    if target.state == ObjectiveState.CONTRADICTION:
        return "Vous avez mentionné des informations différentes. Pouvez-vous clarifier?"
    if target.state == ObjectiveState.PARTIAL:
        return f"Pouvez-vous préciser votre réponse concernant {target.key.value}?"
    return QUESTION_BY_OBJECTIVE[target.key]


def _answer_as_text(answer: object) -> str:
    if isinstance(answer, list):
        return " ".join(str(item) for item in answer)
    return str(answer)
