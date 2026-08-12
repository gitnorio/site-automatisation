"""Construction déterministe d’un brief structuré Discovery."""

from app.modules.discovery.contracts import (
    BriefInput,
    CompanyBrief,
    CurrentMarketingBrief,
    DecisionBrief,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
)
from app.modules.discovery.qualification import qualify_consultation


def build_marketing_discovery_brief(input_data: BriefInput) -> MarketingDiscoveryBrief:
    objectives = {objective.key: objective for objective in input_data.objectives}
    missing = [
        objective.key
        for objective in input_data.objectives
        if objective.state
        in {ObjectiveState.UNKNOWN, ObjectiveState.PARTIAL, ObjectiveState.INCOMPLETE}
    ]
    contradictions = [
        objective.key
        for objective in input_data.objectives
        if objective.state == ObjectiveState.CONTRADICTION
    ]
    return MarketingDiscoveryBrief(
        company=CompanyBrief(
            sector=_objective_text(objectives.get(ObjectiveKey.COMPANY_PROFILE)),
            target_customer=_objective_text(objectives.get(ObjectiveKey.TARGET_CUSTOMER)),
        ),
        primary_goal=_objective_text(objectives.get(ObjectiveKey.PRIMARY_GOAL)),
        trigger_problem=_objective_text(objectives.get(ObjectiveKey.TRIGGER_PROBLEM)),
        service_sought=_objective_text(objectives.get(ObjectiveKey.SERVICE_SOUGHT)),
        current_marketing=CurrentMarketingBrief(
            channels=_objective_list(objectives.get(ObjectiveKey.CURRENT_CHANNELS)),
            tools=_objective_list(objectives.get(ObjectiveKey.TOOLS_PLATFORMS)),
            internal_team=_objective_text(
                objectives.get(ObjectiveKey.INTERNAL_MARKETING_TEAM)
            ),
        ),
        previous_agency_experience=_objective_text(
            objectives.get(ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE)
        ),
        budget=_objective_text(objectives.get(ObjectiveKey.BUDGET)),
        timeline=_objective_text(objectives.get(ObjectiveKey.TIMELINE)),
        decision=DecisionBrief(
            respondent_role=_objective_text(
                objectives.get(ObjectiveKey.DECISION_PROCESS)
            )
        ),
        qualification=qualify_consultation(input_data.objectives),
        missing_information=missing,
        contradictions=contradictions,
    )


def _objective_text(objective: ObjectiveSnapshot | None) -> str | None:
    if objective is None or objective.value is None:
        return None
    answer = objective.value.get("answer")
    if answer is None:
        return None
    if isinstance(answer, list):
        return ", ".join(str(item) for item in answer)
    return str(answer)


def _objective_list(objective: ObjectiveSnapshot | None) -> list[str]:
    if objective is None or objective.value is None:
        return []
    answer = objective.value.get("answer")
    if isinstance(answer, list):
        return [str(item) for item in answer]
    if answer is None:
        return []
    return [str(answer)]
