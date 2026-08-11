from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictContract(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ObjectiveKey(StrEnum):
    COMPANY_PROFILE = "company_profile"
    TARGET_CUSTOMER = "target_customer"
    POSITIONING_COMPETITORS = "positioning_competitors"
    CURRENT_CHANNELS = "current_channels"
    TOOLS_PLATFORMS = "tools_platforms"
    PREVIOUS_AGENCY_EXPERIENCE = "previous_agency_experience"
    INTERNAL_MARKETING_TEAM = "internal_marketing_team"
    PRIMARY_GOAL = "primary_goal"
    TRIGGER_PROBLEM = "trigger_problem"
    DESIRED_MEASURABLE_RESULTS = "desired_measurable_results"
    SERVICE_SOUGHT = "service_sought"
    BUDGET = "budget"
    TIMELINE = "timeline"
    DECISION_PROCESS = "decision_process"


class ObjectiveState(StrEnum):
    UNKNOWN = "unknown"
    PARTIAL = "partial"
    CONFIRMED = "confirmed"
    CONTRADICTION = "contradiction"
    INCOMPLETE = "incomplete"


class ResponseType(StrEnum):
    TEXT = "text"
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    NUMBER = "number"
    BUDGET_RANGE = "budget_range"
    DATE_OR_TIMELINE = "date_or_timeline"


class EngineAction(StrEnum):
    ASK = "ask"
    COMPLETE = "complete"


class ReasonCode(StrEnum):
    REQUIRED_CONTRADICTION = "required_objective_contradiction"
    REQUIRED_PARTIAL = "required_objective_partial"
    REQUIRED_UNKNOWN = "required_objective_unknown"
    OPTIONAL_RELEVANT = "optional_objective_relevant"
    ALL_REQUIRED_COMPLETE = "all_required_objectives_complete"
    QUESTION_LIMIT_REACHED = "question_limit_reached"


class QualificationLevel(StrEnum):
    PRIORITY = "priority"
    FOLLOW_UP = "follow_up"
    UNQUALIFIED = "unqualified"


class BlueprintObjective(StrictContract):
    key: ObjectiveKey
    required: bool
    expected_information: str = Field(min_length=1, max_length=500)
    imposed_question: str | None = Field(default=None, max_length=500)


class BlueprintConfig(StrictContract):
    name: str = Field(min_length=1, max_length=120)
    vertical: Literal["marketing_agency"] = "marketing_agency"
    version: int = Field(default=1, ge=1)
    max_questions: int = Field(default=14, ge=6, le=20)
    objectives: list[BlueprintObjective] = Field(min_length=1)


class ObjectiveSnapshot(StrictContract):
    key: ObjectiveKey
    required: bool
    state: ObjectiveState
    value: dict[str, object] | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)


class Choice(StrictContract):
    value: str = Field(min_length=1, max_length=100)
    label: str = Field(min_length=1, max_length=160)


class ExtractedUpdate(StrictContract):
    objective: ObjectiveKey
    state: ObjectiveState
    value: dict[str, object] | None = None
    confidence: float = Field(ge=0, le=1)
    evidence: str = Field(min_length=1, max_length=1000)


class ExtractionInput(StrictContract):
    consultation_id: str = Field(min_length=1, max_length=80)
    target_objective: ObjectiveKey
    question: str = Field(min_length=1, max_length=500)
    answer: str | int | float | list[str]
    objectives: list[ObjectiveSnapshot]


class ExtractionResult(StrictContract):
    updates: list[ExtractedUpdate]
    detected_contradictions: list[ObjectiveKey] = Field(default_factory=list)


class DecisionInput(StrictContract):
    consultation_id: str = Field(min_length=1, max_length=80)
    question_count: int = Field(ge=0)
    max_questions: int = Field(ge=1)
    objectives: list[ObjectiveSnapshot]


class DecisionResult(StrictContract):
    action: EngineAction
    target_objective: ObjectiveKey | None
    question: str | None = Field(default=None, max_length=500)
    response_type: ResponseType | None
    choices: list[Choice] = Field(default_factory=list)
    reason_code: ReasonCode

    @model_validator(mode="after")
    def validate_action_shape(self) -> "DecisionResult":
        if self.action == EngineAction.ASK:
            if not self.target_objective or not self.question or not self.response_type:
                raise ValueError("Une décision ask exige un objectif, une question et un type de réponse.")
            if self.response_type in {ResponseType.SINGLE_CHOICE, ResponseType.MULTI_CHOICE} and not self.choices:
                raise ValueError("Une question à choix exige au moins une option.")
        if self.action == EngineAction.COMPLETE:
            if self.target_objective or self.question or self.response_type or self.choices:
                raise ValueError("Une décision complete ne doit contenir aucune question.")
            if self.reason_code not in {
                ReasonCode.ALL_REQUIRED_COMPLETE,
                ReasonCode.QUESTION_LIMIT_REACHED,
            }:
                raise ValueError("Une décision complete exige une raison d’arrêt autorisée.")
        return self


class CompanyBrief(StrictContract):
    sector: str | None = None
    offer: str | None = None
    size: str | None = None
    target_customer: str | None = None


class CurrentMarketingBrief(StrictContract):
    channels: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    internal_team: str | None = None


class DecisionBrief(StrictContract):
    respondent_role: str | None = None
    decision_maker: bool | None = None
    stakeholders: list[str] = Field(default_factory=list)


class QualificationBrief(StrictContract):
    level: QualificationLevel
    reasons: list[str] = Field(min_length=1)


class MarketingDiscoveryBrief(StrictContract):
    company: CompanyBrief
    primary_goal: str | None = None
    trigger_problem: str | None = None
    service_sought: str | None = None
    current_marketing: CurrentMarketingBrief | None = None
    previous_agency_experience: str | None = None
    budget: str | None = None
    timeline: str | None = None
    decision: DecisionBrief | None = None
    qualification: QualificationBrief
    missing_information: list[ObjectiveKey] = Field(default_factory=list)
    contradictions: list[ObjectiveKey] = Field(default_factory=list)
    important_notes: list[str] = Field(default_factory=list)


class BriefInput(StrictContract):
    consultation_id: str = Field(min_length=1, max_length=80)
    completed_at: datetime | None = None
    objectives: list[ObjectiveSnapshot]


def contract_json_schemas() -> dict[str, dict[str, object]]:
    return {
        "extraction_input": ExtractionInput.model_json_schema(),
        "extraction_result": ExtractionResult.model_json_schema(),
        "decision_input": DecisionInput.model_json_schema(),
        "decision_result": DecisionResult.model_json_schema(),
        "brief_input": BriefInput.model_json_schema(),
        "marketing_discovery_brief": MarketingDiscoveryBrief.model_json_schema(),
    }
