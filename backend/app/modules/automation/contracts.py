"""Contrats stables des événements et connecteurs d'automatisation."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field

from app.modules.discovery.contracts import (
    ConsultationStatus,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    QualificationLevel,
)


class StrictAutomationContract(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class AutomationActionType(StrEnum):
    CRM_UPSERT = "crm.upsert"
    OWNER_ASSIGN = "owner.assign"
    TEAM_NOTIFY = "team.notify"
    WEBHOOK_DELIVER = "webhook.deliver"


class AutomationDeliveryStatus(StrEnum):
    PENDING = "pending"
    DELIVERING = "delivering"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    SKIPPED = "skipped"


class AutomationAttemptStatus(StrEnum):
    STARTED = "started"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class CRMAllowedFields(StrictAutomationContract):
    company_profile: str | None = None
    target_customer: str | None = None
    primary_goal: str | None = None
    trigger_problem: str | None = None
    service_sought: str | None = None
    current_channels: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    previous_agency_experience: str | None = None
    budget: str | None = None
    timeline: str | None = None
    respondent_role: str | None = None
    qualification: QualificationLevel
    qualification_reasons: list[str] = Field(min_length=1)
    missing_information: list[ObjectiveKey] = Field(default_factory=list)
    contradictions: list[ObjectiveKey] = Field(default_factory=list)


class AutomationAction(StrictAutomationContract):
    type: AutomationActionType
    target: str


class ConsultationReadyEvent(StrictAutomationContract):
    schema_version: int = 1
    event_id: str
    event_type: str = "consultation.ready"
    occurred_at: datetime
    consultation_id: str
    organization_id: str
    organization_name: str
    consultation_status: ConsultationStatus
    completed_at: datetime | None = None
    crm_fields: CRMAllowedFields
    actions: list[AutomationAction] = Field(min_length=1)


class AutomationDispatchInput(StrictAutomationContract):
    consultation_id: str
    organization_id: str
    organization_name: str
    consultation_status: ConsultationStatus
    completed_at: datetime | None = None
    brief: MarketingDiscoveryBrief


class ConnectorResult(StrictAutomationContract):
    accepted: bool
    status_code: int | None = Field(default=None, ge=100, le=599)
    external_id: str | None = Field(default=None, max_length=200)
