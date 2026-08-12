"""Dépôt SQLAlchemy du domaine Discovery."""

from datetime import UTC, datetime
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.discovery.contracts import (
    BlueprintConfig,
    Choice,
    ConsultationStatus,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveSource,
    ObjectiveState,
    ResponseType,
)
from app.modules.discovery.models import (
    BlueprintModel,
    ConsultationModel,
    ConsultationObjectiveModel,
    ConsultationTurnModel,
    DiscoveryBriefModel,
    OrganizationModel,
)
from app.modules.discovery.state import ConsultationState, ConsultationStopReason
from app.modules.automation.models import AutomationDeliveryModel
from app.modules.field_testing.models import FieldTestReviewModel


class DiscoveryRecordNotFoundError(LookupError):
    pass


class DiscoveryRepository(Protocol):
    def create_organization(self, name: str) -> OrganizationModel: ...

    def create_blueprint(
        self, organization_id: str, blueprint: BlueprintConfig
    ) -> BlueprintModel: ...

    def create_consultation(
        self, organization_id: str, blueprint_id: str
    ) -> ConsultationModel: ...

    def load_state(self, consultation_id: str) -> ConsultationState: ...

    def get_consultation(self, consultation_id: str) -> ConsultationModel: ...

    def list_workspace_consultations(self) -> list[ConsultationModel]: ...

    def get_workspace_consultation(
        self, consultation_id: str
    ) -> ConsultationModel: ...

    def get_turn(
        self, consultation_id: str, turn_id: str
    ) -> ConsultationTurnModel: ...

    def get_pending_turn(
        self, consultation_id: str
    ) -> ConsultationTurnModel | None: ...

    def get_brief(self, consultation_id: str) -> DiscoveryBriefModel | None: ...

    def save_state(
        self,
        consultation_id: str,
        state: ConsultationState,
        answer_updated_keys: frozenset[ObjectiveKey] = frozenset(),
    ) -> ConsultationModel: ...

    def add_turn(
        self,
        consultation_id: str,
        turn_index: int,
        target_objective: ObjectiveKey,
        question: str,
        response_type: ResponseType,
        choices: tuple[Choice, ...] = (),
    ) -> ConsultationTurnModel: ...

    def answer_turn(
        self,
        consultation_id: str,
        turn_id: str,
        raw_answer: object,
    ) -> ConsultationTurnModel: ...

    def create_brief(
        self,
        consultation_id: str,
        brief: MarketingDiscoveryBrief,
    ) -> DiscoveryBriefModel: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...


class SqlAlchemyDiscoveryRepository:
    def __init__(self, database: Session) -> None:
        self.database = database

    def create_organization(self, name: str) -> OrganizationModel:
        organization = OrganizationModel(name=name)
        self.database.add(organization)
        self.database.flush()
        return organization

    def create_blueprint(
        self,
        organization_id: str,
        blueprint: BlueprintConfig,
    ) -> BlueprintModel:
        self._get_organization(organization_id)
        record = BlueprintModel(
            organization_id=organization_id,
            name=blueprint.name,
            vertical=blueprint.vertical,
            version=blueprint.version,
            config=blueprint.model_dump(mode="json"),
        )
        self.database.add(record)
        self.database.flush()
        return record

    def create_consultation(
        self,
        organization_id: str,
        blueprint_id: str,
    ) -> ConsultationModel:
        blueprint = self._get_blueprint(blueprint_id)
        if blueprint.organization_id != organization_id:
            raise ValueError("Le Blueprint n'appartient pas à cette organisation.")

        blueprint_config = BlueprintConfig.model_validate(blueprint.config)
        consultation = ConsultationModel(
            organization_id=organization_id,
            blueprint_id=blueprint_id,
            status=ConsultationStatus.NOT_STARTED.value,
            question_count=0,
            objectives=[
                ConsultationObjectiveModel(
                    objective_key=objective.key.value,
                    required=objective.required,
                    state=ObjectiveState.UNKNOWN.value,
                )
                for objective in blueprint_config.objectives
            ],
        )
        self.database.add(consultation)
        self.database.flush()
        return consultation

    def load_state(self, consultation_id: str) -> ConsultationState:
        consultation = self._get_consultation_with_state(consultation_id)
        blueprint = BlueprintConfig.model_validate(consultation.blueprint.config)
        objective_order = {
            objective.key: index for index, objective in enumerate(blueprint.objectives)
        }
        objective_snapshots = tuple(
            ObjectiveSnapshot(
                key=ObjectiveKey(objective.objective_key),
                required=objective.required,
                state=ObjectiveState(objective.state),
                value=objective.value_json,
                confidence=objective.confidence,
            )
            for objective in sorted(
                consultation.objectives,
                key=lambda item: objective_order[ObjectiveKey(item.objective_key)],
            )
        )
        return ConsultationState(
            status=ConsultationStatus(consultation.status),
            question_count=consultation.question_count,
            max_questions=blueprint.max_questions,
            objectives=objective_snapshots,
            stop_reason=(
                ConsultationStopReason(consultation.stop_reason)
                if consultation.stop_reason
                else None
            ),
        )

    def get_consultation(self, consultation_id: str) -> ConsultationModel:
        statement = (
            select(ConsultationModel)
            .options(selectinload(ConsultationModel.organization))
            .where(ConsultationModel.id == consultation_id)
        )
        consultation = self.database.scalar(statement)
        if consultation is None:
            raise DiscoveryRecordNotFoundError("Consultation introuvable.")
        return consultation

    def list_workspace_consultations(self) -> list[ConsultationModel]:
        statement = (
            select(ConsultationModel)
            .options(
                selectinload(ConsultationModel.organization),
                selectinload(ConsultationModel.blueprint),
                selectinload(ConsultationModel.objectives),
                selectinload(ConsultationModel.brief),
                selectinload(ConsultationModel.automation_deliveries).selectinload(
                    AutomationDeliveryModel.attempts
                ),
                selectinload(ConsultationModel.field_test_review),
            )
            .order_by(ConsultationModel.created_at.desc())
        )
        return list(self.database.scalars(statement).all())

    def get_workspace_consultation(
        self,
        consultation_id: str,
    ) -> ConsultationModel:
        statement = (
            select(ConsultationModel)
            .options(
                selectinload(ConsultationModel.organization),
                selectinload(ConsultationModel.blueprint),
                selectinload(ConsultationModel.objectives),
                selectinload(ConsultationModel.turns),
                selectinload(ConsultationModel.brief),
                selectinload(ConsultationModel.automation_deliveries).selectinload(
                    AutomationDeliveryModel.attempts
                ),
                selectinload(ConsultationModel.field_test_review),
            )
            .where(ConsultationModel.id == consultation_id)
        )
        consultation = self.database.scalar(statement)
        if consultation is None:
            raise DiscoveryRecordNotFoundError("Consultation introuvable.")
        return consultation

    def get_turn(
        self,
        consultation_id: str,
        turn_id: str,
    ) -> ConsultationTurnModel:
        turn = self.database.get(ConsultationTurnModel, turn_id)
        if turn is None or turn.consultation_id != consultation_id:
            raise DiscoveryRecordNotFoundError("Tour de consultation introuvable.")
        return turn

    def get_pending_turn(
        self,
        consultation_id: str,
    ) -> ConsultationTurnModel | None:
        self._get_consultation(consultation_id)
        statement = (
            select(ConsultationTurnModel)
            .where(
                ConsultationTurnModel.consultation_id == consultation_id,
                ConsultationTurnModel.answered_at.is_(None),
            )
            .order_by(ConsultationTurnModel.turn_index.desc())
            .limit(1)
        )
        return self.database.scalar(statement)

    def get_brief(self, consultation_id: str) -> DiscoveryBriefModel | None:
        self._get_consultation(consultation_id)
        statement = select(DiscoveryBriefModel).where(
            DiscoveryBriefModel.consultation_id == consultation_id
        )
        return self.database.scalar(statement)

    def save_state(
        self,
        consultation_id: str,
        state: ConsultationState,
        answer_updated_keys: frozenset[ObjectiveKey] = frozenset(),
    ) -> ConsultationModel:
        consultation = self._get_consultation_with_state(consultation_id)
        now = datetime.now(UTC)
        consultation.status = state.status.value
        consultation.stop_reason = state.stop_reason.value if state.stop_reason else None
        consultation.question_count = state.question_count

        if state.status == ConsultationStatus.IN_PROGRESS and consultation.started_at is None:
            consultation.started_at = now
        if state.status in {ConsultationStatus.COMPLETED, ConsultationStatus.ABANDONED}:
            consultation.completed_at = consultation.completed_at or now

        records_by_key = {
            ObjectiveKey(record.objective_key): record
            for record in consultation.objectives
        }
        if set(records_by_key) != {objective.key for objective in state.objectives}:
            raise ValueError("Les objectifs persistés ne correspondent pas à l'état fourni.")

        for objective in state.objectives:
            record = records_by_key[objective.key]
            changed = (
                record.state != objective.state.value
                or record.value_json != objective.value
                or record.confidence != objective.confidence
            )
            record.state = objective.state.value
            record.value_json = objective.value
            record.confidence = objective.confidence
            if objective.key in answer_updated_keys:
                record.source = ObjectiveSource.ANSWER.value
            elif changed and objective.state == ObjectiveState.INCOMPLETE:
                record.source = ObjectiveSource.SYSTEM.value
            if changed:
                record.updated_at = now

        self.database.flush()
        return consultation

    def add_turn(
        self,
        consultation_id: str,
        turn_index: int,
        target_objective: ObjectiveKey,
        question: str,
        response_type: ResponseType,
        choices: tuple[Choice, ...] = (),
    ) -> ConsultationTurnModel:
        self._get_consultation(consultation_id)
        turn = ConsultationTurnModel(
            consultation_id=consultation_id,
            turn_index=turn_index,
            target_objective=target_objective.value,
            question=question,
            response_type=response_type.value,
            choices_json=(
                [choice.model_dump(mode="json") for choice in choices]
                if choices
                else None
            ),
        )
        self.database.add(turn)
        self.database.flush()
        return turn

    def answer_turn(
        self,
        consultation_id: str,
        turn_id: str,
        raw_answer: object,
    ) -> ConsultationTurnModel:
        turn = self.get_turn(consultation_id, turn_id)
        if turn.answered_at is not None:
            raise ValueError("Ce tour possède déjà une réponse.")
        turn.raw_answer = raw_answer
        turn.answered_at = datetime.now(UTC)
        self.database.flush()
        return turn

    def create_brief(
        self,
        consultation_id: str,
        brief: MarketingDiscoveryBrief,
    ) -> DiscoveryBriefModel:
        consultation = self._get_consultation(consultation_id)
        if consultation.status not in {
            ConsultationStatus.COMPLETED.value,
            ConsultationStatus.ABANDONED.value,
        }:
            raise ValueError("Le brief ne peut être créé qu'après la fin de la consultation.")
        record = DiscoveryBriefModel(
            consultation_id=consultation_id,
            brief_json=brief.model_dump(mode="json"),
        )
        self.database.add(record)
        self.database.flush()
        return record

    def commit(self) -> None:
        self.database.commit()

    def rollback(self) -> None:
        self.database.rollback()

    def _get_organization(self, organization_id: str) -> OrganizationModel:
        organization = self.database.get(OrganizationModel, organization_id)
        if organization is None:
            raise DiscoveryRecordNotFoundError("Organisation introuvable.")
        return organization

    def _get_blueprint(self, blueprint_id: str) -> BlueprintModel:
        blueprint = self.database.get(BlueprintModel, blueprint_id)
        if blueprint is None:
            raise DiscoveryRecordNotFoundError("Blueprint introuvable.")
        return blueprint

    def _get_consultation(self, consultation_id: str) -> ConsultationModel:
        consultation = self.database.get(ConsultationModel, consultation_id)
        if consultation is None:
            raise DiscoveryRecordNotFoundError("Consultation introuvable.")
        return consultation

    def _get_consultation_with_state(self, consultation_id: str) -> ConsultationModel:
        statement = (
            select(ConsultationModel)
            .options(
                selectinload(ConsultationModel.objectives),
                selectinload(ConsultationModel.blueprint),
            )
            .where(ConsultationModel.id == consultation_id)
        )
        consultation = self.database.scalar(statement)
        if consultation is None:
            raise DiscoveryRecordNotFoundError("Consultation introuvable.")
        return consultation
