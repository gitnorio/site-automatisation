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
    RecommendedQuestion,
    RecommendedQuestionPriority,
    RecommendedQuestionSource,
)
from app.modules.discovery.qualification import qualify_consultation


QUESTION_BY_OBJECTIVE: dict[ObjectiveKey, str] = {
    ObjectiveKey.COMPANY_PROFILE: "Quelles caractéristiques de l’entreprise devons-nous confirmer avant de cadrer le mandat?",
    ObjectiveKey.TARGET_CUSTOMER: "Quel segment de clientèle doit être priorisé dans la première étape du mandat?",
    ObjectiveKey.POSITIONING_COMPETITORS: "Quels concurrents le prospect considère-t-il comme ses principales références?",
    ObjectiveKey.CURRENT_CHANNELS: "Quels canaux contribuent actuellement aux résultats, et lesquels posent problème?",
    ObjectiveKey.TOOLS_PLATFORMS: "Quels outils et plateformes devront être pris en compte dans le futur mandat?",
    ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE: "Quels éléments de l’expérience avec une agence précédente faut-il reproduire ou éviter?",
    ObjectiveKey.INTERNAL_MARKETING_TEAM: "Quelles responsabilités resteront à l’interne et lesquelles devront être confiées à l’agence?",
    ObjectiveKey.PRIMARY_GOAL: "Comment le prospect définira-t-il concrètement l’atteinte de son objectif principal?",
    ObjectiveKey.TRIGGER_PROBLEM: "Qu’est-ce qui rend ce besoin prioritaire maintenant plutôt que plus tard?",
    ObjectiveKey.DESIRED_MEASURABLE_RESULTS: "Quels indicateurs permettront de juger que le mandat produit les résultats attendus?",
    ObjectiveKey.SERVICE_SOUGHT: "Quel périmètre précis le prospect souhaite-t-il confier à l’agence?",
    ObjectiveKey.BUDGET: "Quelle enveloppe le prospect peut-il réellement engager pour ce mandat?",
    ObjectiveKey.TIMELINE: "Quelles dates ou contraintes opérationnelles déterminent l’échéancier du projet?",
    ObjectiveKey.DECISION_PROCESS: "Qui doit participer à la prochaine rencontre et valider la décision finale?",
}


DEEPENING_ORDER = (
    ObjectiveKey.DESIRED_MEASURABLE_RESULTS,
    ObjectiveKey.PRIMARY_GOAL,
    ObjectiveKey.TRIGGER_PROBLEM,
    ObjectiveKey.TARGET_CUSTOMER,
    ObjectiveKey.SERVICE_SOUGHT,
    ObjectiveKey.DECISION_PROCESS,
    ObjectiveKey.CURRENT_CHANNELS,
)


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
        recommended_questions=build_recommended_questions(input_data.objectives),
    )


def build_recommended_questions(
    objectives: list[ObjectiveSnapshot],
) -> list[RecommendedQuestion]:
    questions = [
        _question_for_objective(objective)
        for objective in objectives
        if objective.state != ObjectiveState.CONFIRMED
    ]
    questions.sort(key=_question_sort_key)
    selected = questions[:8]
    selected_topics = {question.topic for question in selected}
    objectives_by_key = {objective.key: objective for objective in objectives}

    for key in DEEPENING_ORDER:
        if len(selected) >= 3:
            break
        objective = objectives_by_key.get(key)
        if (
            objective is None
            or objective.state != ObjectiveState.CONFIRMED
            or key in selected_topics
        ):
            continue
        selected.append(
            RecommendedQuestion(
                topic=key,
                question=QUESTION_BY_OBJECTIVE[key],
                reason="Ce point est connu, mais mérite d’être relié au cadre concret du mandat.",
                priority=RecommendedQuestionPriority.LOW,
                source=RecommendedQuestionSource.DEEPENING,
            )
        )
        selected_topics.add(key)
    return selected


def _question_for_objective(objective: ObjectiveSnapshot) -> RecommendedQuestion:
    if objective.state == ObjectiveState.CONTRADICTION:
        source = RecommendedQuestionSource.CONTRADICTION
        priority = RecommendedQuestionPriority.HIGH
        reason = "Les réponses recueillies sur ce point ne concordent pas."
    elif objective.state == ObjectiveState.PARTIAL:
        source = RecommendedQuestionSource.PARTIAL
        priority = (
            RecommendedQuestionPriority.HIGH
            if objective.required
            else RecommendedQuestionPriority.MEDIUM
        )
        reason = "La première réponse reste trop générale pour cadrer le mandat."
    else:
        source = RecommendedQuestionSource.MISSING
        priority = (
            RecommendedQuestionPriority.HIGH
            if objective.required
            else RecommendedQuestionPriority.MEDIUM
        )
        reason = "Cette information n’a pas été recueillie pendant la première consultation."
    return RecommendedQuestion(
        topic=objective.key,
        question=QUESTION_BY_OBJECTIVE[objective.key],
        reason=reason,
        priority=priority,
        source=source,
    )


def _question_sort_key(
    question: RecommendedQuestion,
) -> tuple[int, int]:
    priority_order = {
        RecommendedQuestionPriority.HIGH: 0,
        RecommendedQuestionPriority.MEDIUM: 1,
        RecommendedQuestionPriority.LOW: 2,
    }
    source_order = {
        RecommendedQuestionSource.CONTRADICTION: 0,
        RecommendedQuestionSource.PARTIAL: 1,
        RecommendedQuestionSource.MISSING: 2,
        RecommendedQuestionSource.DEEPENING: 3,
    }
    return priority_order[question.priority], source_order[question.source]


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
