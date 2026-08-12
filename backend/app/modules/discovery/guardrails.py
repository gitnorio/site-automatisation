"""Garde-fous déterministes du moteur Discovery."""

import json
import re
from collections.abc import Iterable

from app.modules.discovery.blueprint import EXPECTED_IMPOSED_QUESTIONS
from app.modules.discovery.brief import build_recommended_questions
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    EngineAction,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    ReasonCode,
)
from app.modules.discovery.qualification import qualify_consultation


class DiscoveryGuardrailError(ValueError):
    pass


PROHIBITED_PROSPECT_PATTERNS = tuple(
    re.compile(pattern, flags=re.IGNORECASE)
    for pattern in (
        r"\b(?:je|nous)\s+(?:vous\s+)?recommand(?:e|ons)\b",
        r"\bvous\s+devriez\b",
        r"\bil\s+faut\s+(?:investir|choisir|utiliser|lancer|augmenter|réduire)\b",
        r"\b(?:optez|investissez|choisissez)\s+pour\b",
        r"\b(?:meilleure?|idéale?)\s+(?:stratégie|canal|plateforme|agence)\b",
        r"\b(?:nous\s+)?garantissons\b",
        r"\bnous\s+(?:livrerons|réaliserons)\b",
        r"\b(?:prix|tarif)\s+(?:sera|serait)\b",
        r"\b(?:coûtera|livré\s+en|réalisé\s+en)\b",
        r"\b(?:agence|prestataire)\s+(?:est\s+)?(?:incompétente?|mauvaise?|inefficace)\b",
    )
)


def validate_extraction_result(
    input_data: ExtractionInput,
    result: ExtractionResult,
) -> None:
    available_keys = {objective.key for objective in input_data.objectives}
    update_keys = [update.objective for update in result.updates]
    if len(update_keys) != len(set(update_keys)):
        raise DiscoveryGuardrailError("L'extraction contient un objectif en double.")
    if not set(update_keys).issubset(available_keys):
        raise DiscoveryGuardrailError("L'extraction cible un objectif absent de la consultation.")

    forbidden_states = {ObjectiveState.UNKNOWN, ObjectiveState.INCOMPLETE}
    if any(update.state in forbidden_states for update in result.updates):
        raise DiscoveryGuardrailError("Le LLM ne peut pas réinitialiser ou clôturer un objectif.")

    contradiction_updates = {
        update.objective
        for update in result.updates
        if update.state == ObjectiveState.CONTRADICTION
    }
    if set(result.detected_contradictions) != contradiction_updates:
        raise DiscoveryGuardrailError(
            "Les contradictions détectées doivent correspondre aux mises à jour."
        )

    answer_text = _answer_as_text(input_data.answer)
    for update in result.updates:
        if _normalize(update.evidence) not in _normalize(answer_text):
            raise DiscoveryGuardrailError(
                "Chaque preuve doit être un extrait exact de la réponse du prospect."
            )


def deterministic_stop_decision(input_data: DecisionInput) -> DecisionResult | None:
    if input_data.question_count >= input_data.max_questions:
        return DecisionResult(
            action=EngineAction.COMPLETE,
            target_objective=None,
            question=None,
            response_type=None,
            reason_code=ReasonCode.QUESTION_LIMIT_REACHED,
        )
    required = [objective for objective in input_data.objectives if objective.required]
    if required and all(
        objective.state == ObjectiveState.CONFIRMED for objective in required
    ):
        return DecisionResult(
            action=EngineAction.COMPLETE,
            target_objective=None,
            question=None,
            response_type=None,
            reason_code=ReasonCode.ALL_REQUIRED_COMPLETE,
        )
    return None


def validate_decision_result(
    input_data: DecisionInput,
    result: DecisionResult,
) -> None:
    stop_decision = deterministic_stop_decision(input_data)
    if stop_decision is not None:
        if result != stop_decision:
            raise DiscoveryGuardrailError("Le LLM ne peut pas contourner une règle d'arrêt.")
        return
    if result.action != EngineAction.ASK or result.target_objective is None:
        raise DiscoveryGuardrailError("La consultation doit continuer avec une question.")

    objectives_by_key = {objective.key: objective for objective in input_data.objectives}
    target = objectives_by_key.get(result.target_objective)
    if target is None:
        raise DiscoveryGuardrailError("La décision cible un objectif absent de la consultation.")

    expected_state, expected_reason = _highest_priority_required_state(
        input_data.objectives
    )
    if not target.required or target.state != expected_state:
        raise DiscoveryGuardrailError("La décision ne respecte pas la priorité des objectifs.")
    if result.reason_code != expected_reason:
        raise DiscoveryGuardrailError("Le code de raison ne correspond pas à l'état ciblé.")

    imposed_question = EXPECTED_IMPOSED_QUESTIONS.get(target.key)
    if target.state == ObjectiveState.UNKNOWN and imposed_question:
        if result.question != imposed_question:
            raise DiscoveryGuardrailError("La question imposée doit être utilisée mot pour mot.")
    assert_safe_prospect_text(result.question or "")


def validate_brief_result(
    input_data: BriefInput,
    brief: MarketingDiscoveryBrief,
) -> None:
    expected_missing = {
        objective.key
        for objective in input_data.objectives
        if objective.state in {
            ObjectiveState.UNKNOWN,
            ObjectiveState.PARTIAL,
            ObjectiveState.INCOMPLETE,
        }
    }
    expected_contradictions = {
        objective.key
        for objective in input_data.objectives
        if objective.state == ObjectiveState.CONTRADICTION
    }
    if set(brief.missing_information) != expected_missing:
        raise DiscoveryGuardrailError("Le brief ne reflète pas les informations manquantes.")
    if set(brief.contradictions) != expected_contradictions:
        raise DiscoveryGuardrailError("Le brief ne reflète pas les contradictions.")
    if brief.qualification != qualify_consultation(input_data.objectives):
        raise DiscoveryGuardrailError(
            "La qualification du brief ne respecte pas les règles déterministes."
        )
    expected_questions = build_recommended_questions(input_data.objectives)
    expected_question_shape = [
        (question.topic, question.priority, question.source)
        for question in expected_questions
    ]
    actual_question_shape = [
        (question.topic, question.priority, question.source)
        for question in brief.recommended_questions
    ]
    if actual_question_shape != expected_question_shape:
        raise DiscoveryGuardrailError(
            "Les questions du brief ne respectent pas les besoins détectés par le backend."
        )
    source_text = _normalize(
        json.dumps(
            [objective.value for objective in input_data.objectives if objective.value],
            ensure_ascii=False,
        )
    )
    for fact in _brief_factual_strings(brief):
        if _normalize(fact) not in source_text:
            raise DiscoveryGuardrailError(
                "Le brief contient un fait absent des données structurées."
            )
    assert_safe_prospect_text(" ".join(_brief_text_values(brief)))


def assert_safe_prospect_text(text: str) -> None:
    if any(pattern.search(text) for pattern in PROHIBITED_PROSPECT_PATTERNS):
        raise DiscoveryGuardrailError("Le contenu généré viole un garde-fou produit.")


def _highest_priority_required_state(
    objectives: list[ObjectiveSnapshot],
) -> tuple[ObjectiveState, ReasonCode]:
    priorities = (
        (ObjectiveState.CONTRADICTION, ReasonCode.REQUIRED_CONTRADICTION),
        (ObjectiveState.PARTIAL, ReasonCode.REQUIRED_PARTIAL),
        (ObjectiveState.UNKNOWN, ReasonCode.REQUIRED_UNKNOWN),
    )
    for state, reason in priorities:
        if any(objective.required and objective.state == state for objective in objectives):
            return state, reason
    raise DiscoveryGuardrailError("Aucun objectif obligatoire interrogeable n'est disponible.")


def _answer_as_text(answer: str | int | float | list[str]) -> str:
    if isinstance(answer, list):
        return " ".join(answer)
    return str(answer)


def _normalize(text: str) -> str:
    return " ".join(text.casefold().split())


def _brief_text_values(brief: MarketingDiscoveryBrief) -> Iterable[str]:
    payload = brief.model_dump(mode="json")
    yield from _nested_strings(payload)


def _brief_factual_strings(brief: MarketingDiscoveryBrief) -> Iterable[str]:
    for value in (
        brief.company.sector,
        brief.company.offer,
        brief.company.size,
        brief.company.target_customer,
        brief.primary_goal,
        brief.trigger_problem,
        brief.service_sought,
        brief.previous_agency_experience,
        brief.budget,
        brief.timeline,
    ):
        if value:
            yield value
    if brief.current_marketing:
        yield from brief.current_marketing.channels
        yield from brief.current_marketing.tools
        if brief.current_marketing.internal_team:
            yield brief.current_marketing.internal_team
    if brief.decision:
        if brief.decision.respondent_role:
            yield brief.decision.respondent_role
        yield from brief.decision.stakeholders
    yield from brief.important_notes


def _nested_strings(value: object) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for child in value.values():
            yield from _nested_strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from _nested_strings(child)
