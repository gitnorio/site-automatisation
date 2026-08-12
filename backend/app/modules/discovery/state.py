"""Fonctions pures pour l’état d’une consultation Discovery."""

from dataclasses import dataclass, replace
from enum import StrEnum

from app.modules.discovery.contracts import (
    BlueprintConfig,
    ConsultationStatus,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
)


class ConsultationStopReason(StrEnum):
    ALL_REQUIRED_CONFIRMED = "all_required_objectives_complete"
    QUESTION_LIMIT_REACHED = "question_limit_reached"
    PROSPECT_ABANDONED = "prospect_abandoned"


@dataclass(frozen=True)
class ObjectiveUpdate:
    key: ObjectiveKey
    state: ObjectiveState
    value: dict[str, object] | None = None
    confidence: float | None = None

    def __post_init__(self) -> None:
        if self.confidence is not None and not 0 <= self.confidence <= 1:
            raise ValueError("La confiance d'un objectif doit être comprise entre 0 et 1.")


@dataclass(frozen=True)
class ConsultationState:
    status: ConsultationStatus
    question_count: int
    max_questions: int
    objectives: tuple[ObjectiveSnapshot, ...]
    stop_reason: ConsultationStopReason | None = None

    def __post_init__(self) -> None:
        if self.question_count < 0:
            raise ValueError("Le nombre de questions ne peut pas être négatif.")
        if self.max_questions < 1:
            raise ValueError("Le plafond de questions doit être positif.")
        if self.question_count > self.max_questions:
            raise ValueError("Le nombre de questions ne peut pas dépasser le plafond.")

        objective_keys = [objective.key for objective in self.objectives]
        if len(objective_keys) != len(set(objective_keys)):
            raise ValueError("Chaque objectif de consultation doit être unique.")
        if not any(objective.required for objective in self.objectives):
            raise ValueError("Une consultation exige au moins un objectif obligatoire.")
        if self.status in {ConsultationStatus.COMPLETED, ConsultationStatus.ABANDONED}:
            if self.stop_reason is None:
                raise ValueError("Une consultation terminée exige une raison d'arrêt.")
        elif self.stop_reason is not None:
            raise ValueError("Une consultation active ne peut pas avoir de raison d'arrêt.")

        isolated_objectives = tuple(
            objective.model_copy(deep=True) for objective in self.objectives
        )
        object.__setattr__(self, "objectives", isolated_objectives)


ALLOWED_OBJECTIVE_TRANSITIONS: dict[ObjectiveState, frozenset[ObjectiveState]] = {
    ObjectiveState.UNKNOWN: frozenset(
        {
            ObjectiveState.PARTIAL,
            ObjectiveState.CONFIRMED,
            ObjectiveState.CONTRADICTION,
        }
    ),
    ObjectiveState.PARTIAL: frozenset(
        {
            ObjectiveState.PARTIAL,
            ObjectiveState.CONFIRMED,
            ObjectiveState.CONTRADICTION,
        }
    ),
    ObjectiveState.CONFIRMED: frozenset(
        {ObjectiveState.CONFIRMED, ObjectiveState.CONTRADICTION}
    ),
    ObjectiveState.CONTRADICTION: frozenset(
        {
            ObjectiveState.PARTIAL,
            ObjectiveState.CONFIRMED,
            ObjectiveState.CONTRADICTION,
        }
    ),
    ObjectiveState.INCOMPLETE: frozenset({ObjectiveState.INCOMPLETE}),
}


def initialize_consultation_state(blueprint: BlueprintConfig) -> ConsultationState:
    objectives = tuple(
        ObjectiveSnapshot(
            key=objective.key,
            required=objective.required,
            state=ObjectiveState.UNKNOWN,
        )
        for objective in blueprint.objectives
    )
    return ConsultationState(
        status=ConsultationStatus.NOT_STARTED,
        question_count=0,
        max_questions=blueprint.max_questions,
        objectives=objectives,
    )


def start_consultation(state: ConsultationState) -> ConsultationState:
    if state.status != ConsultationStatus.NOT_STARTED:
        raise ValueError("Seule une consultation non commencée peut être démarrée.")
    return replace(state, status=ConsultationStatus.IN_PROGRESS)


def record_question(state: ConsultationState) -> ConsultationState:
    _require_in_progress(state)
    if state.question_count >= state.max_questions:
        raise ValueError("Le plafond de questions est déjà atteint.")
    return replace(state, question_count=state.question_count + 1)


def apply_objective_updates(
    state: ConsultationState,
    updates: tuple[ObjectiveUpdate, ...],
) -> ConsultationState:
    _require_in_progress(state)
    update_keys = [update.key for update in updates]
    if len(update_keys) != len(set(update_keys)):
        raise ValueError("Une réponse ne peut mettre à jour un objectif qu'une seule fois.")

    objectives_by_key = {objective.key: objective for objective in state.objectives}
    unknown_keys = set(update_keys) - set(objectives_by_key)
    if unknown_keys:
        raise ValueError("Une mise à jour cible un objectif absent de la consultation.")

    for update in updates:
        current = objectives_by_key[update.key]
        allowed_states = ALLOWED_OBJECTIVE_TRANSITIONS[current.state]
        if update.state not in allowed_states:
            raise ValueError(
                f"Transition interdite pour {update.key}: {current.state} vers {update.state}."
            )
        objectives_by_key[update.key] = current.model_copy(
            update={
                "state": update.state,
                "value": update.value,
                "confidence": update.confidence,
            },
            deep=True,
        )

    updated_objectives = tuple(
        objectives_by_key[objective.key] for objective in state.objectives
    )
    return replace(state, objectives=updated_objectives)


def evaluate_stop_rules(state: ConsultationState) -> ConsultationState:
    _require_in_progress(state)
    required_objectives = tuple(
        objective for objective in state.objectives if objective.required
    )
    if all(
        objective.state == ObjectiveState.CONFIRMED
        for objective in required_objectives
    ):
        return _finalize(
            state,
            status=ConsultationStatus.COMPLETED,
            reason=ConsultationStopReason.ALL_REQUIRED_CONFIRMED,
        )
    if state.question_count >= state.max_questions:
        return _finalize(
            state,
            status=ConsultationStatus.COMPLETED,
            reason=ConsultationStopReason.QUESTION_LIMIT_REACHED,
        )
    return state


def abandon_consultation(state: ConsultationState) -> ConsultationState:
    if state.status not in {
        ConsultationStatus.NOT_STARTED,
        ConsultationStatus.IN_PROGRESS,
    }:
        raise ValueError("Une consultation terminée ne peut pas être abandonnée.")
    return _finalize(
        state,
        status=ConsultationStatus.ABANDONED,
        reason=ConsultationStopReason.PROSPECT_ABANDONED,
    )


def _require_in_progress(state: ConsultationState) -> None:
    if state.status != ConsultationStatus.IN_PROGRESS:
        raise ValueError("La consultation doit être en cours.")


def _finalize(
    state: ConsultationState,
    *,
    status: ConsultationStatus,
    reason: ConsultationStopReason,
) -> ConsultationState:
    finalized_objectives = tuple(
        objective.model_copy(update={"state": ObjectiveState.INCOMPLETE}, deep=True)
        if objective.state in {ObjectiveState.UNKNOWN, ObjectiveState.PARTIAL}
        else objective.model_copy(deep=True)
        for objective in state.objectives
    )
    return replace(
        state,
        status=status,
        objectives=finalized_objectives,
        stop_reason=reason,
    )
