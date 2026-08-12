"""Service transactionnel du domaine Discovery."""

from collections.abc import Callable
from typing import TypeVar

from app.modules.discovery.blueprint import validate_marketing_blueprint_v1
from app.modules.discovery.contracts import (
    BlueprintConfig,
    Choice,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ResponseType,
)
from app.modules.discovery.models import (
    BlueprintModel,
    ConsultationModel,
    ConsultationTurnModel,
    DiscoveryBriefModel,
    OrganizationModel,
)
from app.modules.discovery.repository import DiscoveryRepository
from app.modules.discovery.state import (
    ConsultationState,
    ObjectiveUpdate,
    abandon_consultation,
    apply_objective_updates,
    evaluate_stop_rules,
    record_question,
    start_consultation,
)


ResultT = TypeVar("ResultT")


class DiscoveryService:
    def __init__(self, repository: DiscoveryRepository) -> None:
        self.repository = repository

    def create_organization(self, name: str) -> OrganizationModel:
        normalized_name = name.strip()
        if not normalized_name:
            raise ValueError("Le nom de l'organisation est requis.")
        return self._commit(lambda: self.repository.create_organization(normalized_name))

    def create_blueprint(
        self,
        organization_id: str,
        blueprint: BlueprintConfig,
    ) -> BlueprintModel:
        validate_marketing_blueprint_v1(blueprint)
        return self._commit(
            lambda: self.repository.create_blueprint(organization_id, blueprint)
        )

    def create_consultation(
        self,
        organization_id: str,
        blueprint_id: str,
    ) -> ConsultationModel:
        return self._commit(
            lambda: self.repository.create_consultation(
                organization_id,
                blueprint_id,
            )
        )

    def start(self, consultation_id: str) -> ConsultationState:
        def operation() -> ConsultationState:
            state = start_consultation(self.repository.load_state(consultation_id))
            self.repository.save_state(consultation_id, state)
            return state

        return self._commit(operation)

    def ask_question(
        self,
        consultation_id: str,
        *,
        target_objective: ObjectiveKey,
        question: str,
        response_type: ResponseType,
        choices: tuple[Choice, ...] = (),
    ) -> ConsultationTurnModel:
        normalized_question = question.strip()
        if not normalized_question:
            raise ValueError("La question ne peut pas être vide.")

        def operation() -> ConsultationTurnModel:
            state = self.repository.load_state(consultation_id)
            if target_objective not in {objective.key for objective in state.objectives}:
                raise ValueError("La question cible un objectif absent de la consultation.")
            updated_state = record_question(state)
            turn = self.repository.add_turn(
                consultation_id=consultation_id,
                turn_index=updated_state.question_count,
                target_objective=target_objective,
                question=normalized_question,
                response_type=response_type,
                choices=choices,
            )
            self.repository.save_state(consultation_id, updated_state)
            return turn

        return self._commit(operation)

    def answer_question(
        self,
        consultation_id: str,
        turn_id: str,
        *,
        raw_answer: object,
        updates: tuple[ObjectiveUpdate, ...],
    ) -> ConsultationState:
        def operation() -> ConsultationState:
            state = self.repository.load_state(consultation_id)
            updated_state = apply_objective_updates(state, updates)
            final_state = evaluate_stop_rules(updated_state)
            self.repository.answer_turn(consultation_id, turn_id, raw_answer)
            self.repository.save_state(
                consultation_id,
                final_state,
                answer_updated_keys=frozenset(update.key for update in updates),
            )
            return final_state

        return self._commit(operation)

    def abandon(self, consultation_id: str) -> ConsultationState:
        def operation() -> ConsultationState:
            state = abandon_consultation(self.repository.load_state(consultation_id))
            self.repository.save_state(consultation_id, state)
            return state

        return self._commit(operation)

    def create_brief(
        self,
        consultation_id: str,
        brief: MarketingDiscoveryBrief,
    ) -> DiscoveryBriefModel:
        return self._commit(
            lambda: self.repository.create_brief(consultation_id, brief)
        )

    def _commit(self, operation: Callable[[], ResultT]) -> ResultT:
        try:
            result = operation()
            self.repository.commit()
            return result
        except Exception:
            self.repository.rollback()
            raise
