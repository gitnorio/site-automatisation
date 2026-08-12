from dataclasses import replace

import pytest

from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.contracts import (
    ConsultationStatus,
    ObjectiveKey,
    ObjectiveState,
)
from app.modules.discovery.state import (
    ConsultationState,
    ConsultationStopReason,
    ObjectiveUpdate,
    abandon_consultation,
    apply_objective_updates,
    evaluate_stop_rules,
    initialize_consultation_state,
    record_question,
    start_consultation,
)


def started_consultation_state() -> ConsultationState:
    blueprint = get_marketing_discovery_blueprint()
    return start_consultation(initialize_consultation_state(blueprint))


def test_initialization_creates_one_unknown_state_per_blueprint_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()

    state = initialize_consultation_state(blueprint)

    assert state.status == ConsultationStatus.NOT_STARTED
    assert state.question_count == 0
    assert state.max_questions == 14
    assert [objective.key for objective in state.objectives] == [
        objective.key for objective in blueprint.objectives
    ]
    assert all(objective.state == ObjectiveState.UNKNOWN for objective in state.objectives)


def test_start_and_question_count_are_explicit_transitions() -> None:
    state = started_consultation_state()

    state = record_question(state)

    assert state.status == ConsultationStatus.IN_PROGRESS
    assert state.question_count == 1


def test_objective_can_progress_from_unknown_to_partial_to_confirmed() -> None:
    state = started_consultation_state()
    partial_state = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.PRIMARY_GOAL,
                state=ObjectiveState.PARTIAL,
                value={"goal": "Obtenir plus de demandes"},
                confidence=0.65,
            ),
        ),
    )

    confirmed_state = apply_objective_updates(
        partial_state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.PRIMARY_GOAL,
                state=ObjectiveState.CONFIRMED,
                value={"goal": "Obtenir 20 demandes qualifiées par mois"},
                confidence=0.95,
            ),
        ),
    )

    objective = next(
        item
        for item in confirmed_state.objectives
        if item.key == ObjectiveKey.PRIMARY_GOAL
    )
    assert objective.state == ObjectiveState.CONFIRMED
    assert objective.confidence == 0.95


def test_confirmed_objective_can_become_a_contradiction_and_be_resolved() -> None:
    state = started_consultation_state()
    confirmed = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONFIRMED,
                value={"range": "5000-10000"},
                confidence=0.9,
            ),
        ),
    )
    contradictory = apply_objective_updates(
        confirmed,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONTRADICTION,
                value={"ranges": ["5000-10000", "1000-2000"]},
                confidence=0.8,
            ),
        ),
    )
    resolved = apply_objective_updates(
        contradictory,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONFIRMED,
                value={"range": "5000-10000"},
                confidence=1,
            ),
        ),
    )

    budget = next(item for item in resolved.objectives if item.key == ObjectiveKey.BUDGET)
    assert budget.state == ObjectiveState.CONFIRMED


def test_all_required_objectives_complete_the_consultation() -> None:
    state = started_consultation_state()
    updates = tuple(
        ObjectiveUpdate(
            key=objective.key,
            state=ObjectiveState.CONFIRMED,
            value={"confirmed": True},
            confidence=0.9,
        )
        for objective in state.objectives
        if objective.required
    )

    completed = evaluate_stop_rules(apply_objective_updates(state, updates))

    assert completed.status == ConsultationStatus.COMPLETED
    assert completed.stop_reason == ConsultationStopReason.ALL_REQUIRED_CONFIRMED
    assert all(
        objective.state == ObjectiveState.INCOMPLETE
        for objective in completed.objectives
        if not objective.required
    )


def test_question_limit_completes_with_missing_information() -> None:
    state = started_consultation_state()
    state = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONTRADICTION,
                value={"ranges": ["1000", "5000"]},
                confidence=0.8,
            ),
            ObjectiveUpdate(
                key=ObjectiveKey.PRIMARY_GOAL,
                state=ObjectiveState.PARTIAL,
                value={"goal": "Plus de ventes"},
                confidence=0.5,
            ),
        ),
    )
    state = replace(state, question_count=state.max_questions)

    completed = evaluate_stop_rules(state)

    assert completed.status == ConsultationStatus.COMPLETED
    assert completed.stop_reason == ConsultationStopReason.QUESTION_LIMIT_REACHED
    states_by_key = {objective.key: objective.state for objective in completed.objectives}
    assert states_by_key[ObjectiveKey.BUDGET] == ObjectiveState.CONTRADICTION
    assert states_by_key[ObjectiveKey.PRIMARY_GOAL] == ObjectiveState.INCOMPLETE


def test_abandon_marks_unresolved_objectives_incomplete() -> None:
    state = started_consultation_state()
    state = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.PRIMARY_GOAL,
                state=ObjectiveState.CONFIRMED,
                value={"goal": "Croissance"},
                confidence=0.9,
            ),
        ),
    )

    abandoned = abandon_consultation(state)

    states_by_key = {objective.key: objective.state for objective in abandoned.objectives}
    assert abandoned.status == ConsultationStatus.ABANDONED
    assert abandoned.stop_reason == ConsultationStopReason.PROSPECT_ABANDONED
    assert states_by_key[ObjectiveKey.PRIMARY_GOAL] == ObjectiveState.CONFIRMED
    assert states_by_key[ObjectiveKey.BUDGET] == ObjectiveState.INCOMPLETE


def test_question_count_cannot_exceed_the_blueprint_limit() -> None:
    state = replace(
        started_consultation_state(),
        question_count=14,
    )

    with pytest.raises(ValueError, match="plafond"):
        record_question(state)


def test_incomplete_objective_is_terminal() -> None:
    state = started_consultation_state()
    objectives = tuple(
        objective.model_copy(update={"state": ObjectiveState.INCOMPLETE})
        if objective.key == ObjectiveKey.COMPANY_PROFILE
        else objective
        for objective in state.objectives
    )
    state_with_incomplete = replace(state, objectives=objectives)

    with pytest.raises(ValueError, match="Transition interdite"):
        apply_objective_updates(
            state_with_incomplete,
            (
                ObjectiveUpdate(
                    key=ObjectiveKey.COMPANY_PROFILE,
                    state=ObjectiveState.CONFIRMED,
                ),
            ),
        )
