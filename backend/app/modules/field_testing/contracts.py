"""Contrats stricts du carnet de preuves terrain."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.modules.discovery.contracts import ConsultationStatus, QualificationLevel


class StrictFieldTestContract(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class FieldTestReviewerRole(StrEnum):
    OWNER = "owner"
    STRATEGIST = "strategist"
    ACCOUNT_MANAGER = "account_manager"
    SALES = "sales"
    OTHER = "other"


class FieldTestReviewInput(StrictFieldTestContract):
    reviewer_role: FieldTestReviewerRole
    observed_live: bool
    prospect_understood_without_help: bool | None = None
    felt_like_static_form: bool | None = None
    obvious_repetition: bool | None = None
    follow_ups_relevant: bool | None = None
    guardrail_issue: bool | None = None
    brief_usefulness: int = Field(ge=1, le=5)
    brief_preparedness: int = Field(ge=1, le=5)
    agency_would_use: bool
    notes: str | None = Field(default=None, max_length=2_000)

    @model_validator(mode="after")
    def require_live_observations(self) -> "FieldTestReviewInput":
        observations = (
            self.prospect_understood_without_help,
            self.felt_like_static_form,
            self.obvious_repetition,
            self.follow_ups_relevant,
            self.guardrail_issue,
        )
        if self.observed_live and any(value is None for value in observations):
            raise ValueError(
                "Une observation en direct exige une réponse à chaque critère prospect."
            )
        return self


class FieldTestReview(StrictFieldTestContract):
    id: str
    consultation_id: str
    reviewer_role: FieldTestReviewerRole
    observed_live: bool
    prospect_understood_without_help: bool | None = None
    felt_like_static_form: bool | None = None
    obvious_repetition: bool | None = None
    follow_ups_relevant: bool | None = None
    guardrail_issue: bool | None = None
    brief_usefulness: int = Field(ge=1, le=5)
    brief_preparedness: int = Field(ge=1, le=5)
    agency_would_use: bool
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class FieldTestMetrics(StrictFieldTestContract):
    invitations: int = Field(ge=0)
    started: int = Field(ge=0)
    completed: int = Field(ge=0)
    abandoned: int = Field(ge=0)
    active: int = Field(ge=0)
    start_rate: float = Field(ge=0, le=100)
    completion_rate: float = Field(ge=0, le=100)
    abandonment_rate: float = Field(ge=0, le=100)
    median_duration_seconds: int | None = Field(default=None, ge=0)
    average_answered_questions: float = Field(ge=0)
    reviewed_briefs: int = Field(ge=0)
    observed_live: int = Field(ge=0)
    average_brief_usefulness: float | None = Field(default=None, ge=1, le=5)
    useful_brief_rate: float | None = Field(default=None, ge=0, le=100)
    agency_adoption_rate: float | None = Field(default=None, ge=0, le=100)
    understood_without_help_rate: float | None = Field(default=None, ge=0, le=100)
    conversational_experience_rate: float | None = Field(default=None, ge=0, le=100)
    no_repetition_rate: float | None = Field(default=None, ge=0, le=100)
    relevant_follow_ups_rate: float | None = Field(default=None, ge=0, le=100)
    guardrail_compliance_rate: float | None = Field(default=None, ge=0, le=100)


class FieldTestConsultationSummary(StrictFieldTestContract):
    id: str
    organization_name: str
    status: ConsultationStatus
    qualification: QualificationLevel | None = None
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    answered_questions: int = Field(ge=0)
    review: FieldTestReview | None = None


class FieldTestDashboard(StrictFieldTestContract):
    metrics: FieldTestMetrics
    consultations: list[FieldTestConsultationSummary]
