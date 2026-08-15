"""Projection en lecture seule des consultations pour l'espace agence."""

from app.modules.discovery.contracts import (
    BlueprintConfig,
    ConsultationStatus,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    QualificationLevel,
    ResponseType,
)
from app.modules.discovery.brief import build_recommended_questions
from app.modules.discovery.models import (
    ConsultationModel,
    ConsultationObjectiveModel,
    OrganizationModel,
)
from app.modules.discovery.repository import DiscoveryRepository
from app.modules.discovery.workspace_schemas import (
    WorkspaceAnswer,
    WorkspaceConsultationDetail,
    WorkspaceConsultationList,
    WorkspaceConsultationSummary,
    WorkspaceAutomationAttempt,
    WorkspaceAutomationDelivery,
    WorkspaceMetrics,
    WorkspaceObjective,
    WorkspaceQualificationSettings,
    WorkspaceQualificationSettingsInput,
    WorkspaceQualificationSettingsList,
    WorkspaceTurn,
)
from app.modules.field_testing.service import field_test_review_from_model


class WorkspaceQueryService:
    def __init__(self, repository: DiscoveryRepository) -> None:
        self.repository = repository

    def list_consultations(self) -> WorkspaceConsultationList:
        records = self.repository.list_workspace_consultations()
        summaries = [self._summary(record) for record in records]
        return WorkspaceConsultationList(
            metrics=WorkspaceMetrics(
                in_progress=sum(
                    summary.status == ConsultationStatus.IN_PROGRESS
                    for summary in summaries
                ),
                completed=sum(
                    summary.status == ConsultationStatus.COMPLETED
                    for summary in summaries
                ),
                to_review=sum(
                    summary.status
                    in {ConsultationStatus.COMPLETED, ConsultationStatus.ABANDONED}
                    and summary.qualification is not None
                    for summary in summaries
                ),
            ),
            consultations=summaries,
        )

    def get_consultation(self, consultation_id: str) -> WorkspaceConsultationDetail:
        record = self.repository.get_workspace_consultation(consultation_id)
        blueprint = BlueprintConfig.model_validate(record.blueprint.config)
        objective_order = {
            objective.key: index for index, objective in enumerate(blueprint.objectives)
        }
        brief = _brief(record)
        return WorkspaceConsultationDetail(
            id=record.id,
            organization_name=record.organization.name,
            blueprint_name=record.blueprint.name,
            status=ConsultationStatus(record.status),
            stop_reason=record.stop_reason,
            question_count=record.question_count,
            max_questions=blueprint.max_questions,
            created_at=record.created_at,
            started_at=record.started_at,
            completed_at=record.completed_at,
            brief=brief,
            objectives=[
                WorkspaceObjective(
                    key=ObjectiveKey(objective.objective_key),
                    required=objective.required,
                    state=ObjectiveState(objective.state),
                    answer=_objective_answer(objective),
                )
                for objective in sorted(
                    record.objectives,
                    key=lambda item: objective_order[ObjectiveKey(item.objective_key)],
                )
            ],
            turns=[
                WorkspaceTurn(
                    id=turn.id,
                    number=turn.turn_index,
                    target_objective=(
                        ObjectiveKey(turn.target_objective)
                        if turn.target_objective
                        else None
                    ),
                    question=turn.question,
                    response_type=ResponseType(turn.response_type),
                    answer=_safe_answer(turn.raw_answer),
                    answered_at=turn.answered_at,
                )
                for turn in record.turns
            ],
            automations=[
                WorkspaceAutomationDelivery(
                    id=delivery.id,
                    connector_name=delivery.connector_name,
                    status=delivery.status,
                    attempt_count=delivery.attempt_count,
                    actions=[
                        str(action.get("type"))
                        for action in delivery.payload_json.get("actions", [])
                        if isinstance(action, dict) and action.get("type")
                    ],
                    last_error=delivery.last_error,
                    completed_at=delivery.completed_at,
                    attempts=[
                        WorkspaceAutomationAttempt(
                            number=attempt.attempt_number,
                            status=attempt.status,
                            http_status=attempt.http_status,
                            error_type=attempt.error_type,
                            started_at=attempt.started_at,
                            completed_at=attempt.completed_at,
                        )
                        for attempt in delivery.attempts
                    ],
                )
                for delivery in record.automation_deliveries
            ],
            field_test_review=(
                field_test_review_from_model(record.field_test_review)
                if record.field_test_review
                else None
            ),
        )

    def _summary(self, record: ConsultationModel) -> WorkspaceConsultationSummary:
        blueprint = BlueprintConfig.model_validate(record.blueprint.config)
        brief = _brief(record)
        primary_goal = brief.primary_goal if brief else _primary_goal(record)
        latest_delivery = max(
            record.automation_deliveries,
            key=lambda delivery: delivery.created_at,
            default=None,
        )
        return WorkspaceConsultationSummary(
            id=record.id,
            organization_name=record.organization.name,
            status=ConsultationStatus(record.status),
            question_count=record.question_count,
            max_questions=blueprint.max_questions,
            created_at=record.created_at,
            completed_at=record.completed_at,
            primary_goal=primary_goal,
            qualification=brief.qualification.level if brief else None,
            automation_status=(
                latest_delivery.status
                if latest_delivery
                else None
            ),
        )


class WorkspaceSettingsService:
    def __init__(self, repository: DiscoveryRepository) -> None:
        self.repository = repository

    def list_qualification_settings(self) -> WorkspaceQualificationSettingsList:
        return WorkspaceQualificationSettingsList(
            organizations=[
                _qualification_settings(organization)
                for organization in self.repository.list_workspace_organizations()
            ]
        )

    def update_qualification_settings(
        self,
        organization_id: str,
        payload: WorkspaceQualificationSettingsInput,
    ) -> WorkspaceQualificationSettings:
        try:
            organization = self.repository.update_organization_minimum_budget(
                organization_id,
                payload.minimum_qualifying_budget_cad,
            )
            self.repository.commit()
            return _qualification_settings(organization)
        except Exception:
            self.repository.rollback()
            raise


def _qualification_settings(
    organization: OrganizationModel,
) -> WorkspaceQualificationSettings:
    return WorkspaceQualificationSettings(
        organization_id=organization.id,
        organization_name=organization.name,
        minimum_qualifying_budget_cad=organization.minimum_qualifying_budget_cad,
    )


def _brief(record: ConsultationModel) -> MarketingDiscoveryBrief | None:
    if record.brief is None:
        return None
    brief = MarketingDiscoveryBrief.model_validate(record.brief.brief_json)
    if brief.recommended_questions:
        return brief
    blueprint = BlueprintConfig.model_validate(record.blueprint.config)
    objectives_by_key = {
        ObjectiveKey(objective.objective_key): objective
        for objective in record.objectives
    }
    snapshots = [
        ObjectiveSnapshot(
            key=objective.key,
            required=objective.required,
            state=ObjectiveState(objectives_by_key[objective.key].state),
            value=objectives_by_key[objective.key].value_json,
            confidence=objectives_by_key[objective.key].confidence,
        )
        for objective in blueprint.objectives
        if objective.key in objectives_by_key
    ]
    brief.recommended_questions = build_recommended_questions(snapshots)
    return brief


def _primary_goal(record: ConsultationModel) -> str | None:
    objective = next(
        (
            item
            for item in record.objectives
            if item.objective_key == ObjectiveKey.PRIMARY_GOAL.value
        ),
        None,
    )
    if objective is None:
        return None
    answer = _objective_answer(objective)
    if answer is None:
        return None
    if isinstance(answer, list):
        return ", ".join(answer)
    return str(answer)


def _objective_answer(objective: ConsultationObjectiveModel) -> WorkspaceAnswer:
    if objective.value_json is None:
        return None
    return _safe_answer(objective.value_json.get("answer"))


def _safe_answer(value: object) -> WorkspaceAnswer:
    if value is None or isinstance(value, (str, int, float)):
        return value
    if isinstance(value, list) and all(isinstance(item, str) for item in value):
        return value
    return str(value)
