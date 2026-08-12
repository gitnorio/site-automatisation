"""DTO minimaux autorisés dans l'espace agence."""

from datetime import datetime
from typing import TypeAlias

from pydantic import BaseModel, ConfigDict, Field

from app.modules.discovery.contracts import (
    ConsultationStatus,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveState,
    QualificationLevel,
    ResponseType,
)
from app.modules.automation.contracts import (
    AutomationAttemptStatus,
    AutomationDeliveryStatus,
)
from app.modules.field_testing.contracts import FieldTestReview


WorkspaceAnswer: TypeAlias = str | int | float | list[str] | None


class WorkspaceMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    in_progress: int = Field(ge=0)
    completed: int = Field(ge=0)
    to_review: int = Field(ge=0)


class WorkspaceConsultationSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    organization_name: str
    status: ConsultationStatus
    question_count: int = Field(ge=0)
    max_questions: int = Field(ge=1)
    created_at: datetime
    completed_at: datetime | None = None
    primary_goal: str | None = None
    qualification: QualificationLevel | None = None
    automation_status: AutomationDeliveryStatus | None = None


class WorkspaceConsultationList(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metrics: WorkspaceMetrics
    consultations: list[WorkspaceConsultationSummary]


class WorkspaceObjective(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: ObjectiveKey
    required: bool
    state: ObjectiveState
    answer: WorkspaceAnswer = None


class WorkspaceTurn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    number: int = Field(ge=1)
    target_objective: ObjectiveKey | None = None
    question: str
    response_type: ResponseType
    answer: WorkspaceAnswer = None
    answered_at: datetime | None = None


class WorkspaceAutomationAttempt(BaseModel):
    model_config = ConfigDict(extra="forbid")

    number: int = Field(ge=1)
    status: AutomationAttemptStatus
    http_status: int | None = None
    error_type: str | None = None
    started_at: datetime
    completed_at: datetime | None = None


class WorkspaceAutomationDelivery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    connector_name: str
    status: AutomationDeliveryStatus
    attempt_count: int = Field(ge=0)
    actions: list[str]
    last_error: str | None = None
    completed_at: datetime | None = None
    attempts: list[WorkspaceAutomationAttempt]


class WorkspaceIntegrationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: str
    enabled: bool
    max_attempts: int = Field(ge=1)
    actions: list[str]


class WorkspaceConsultationDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    organization_name: str
    blueprint_name: str
    status: ConsultationStatus
    stop_reason: str | None = None
    question_count: int = Field(ge=0)
    max_questions: int = Field(ge=1)
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    brief: MarketingDiscoveryBrief | None = None
    objectives: list[WorkspaceObjective]
    turns: list[WorkspaceTurn]
    automations: list[WorkspaceAutomationDelivery]
    field_test_review: FieldTestReview | None = None
