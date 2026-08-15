import asyncio
from collections.abc import Mapping

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.integrations.llm.mock import MockDiscoveryLLM
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.contracts import (
    ConsultationStatus,
    DecisionInput,
    ObjectiveKey,
    ObjectiveState,
    QualificationLevel,
    ReasonCode,
)
from app.modules.discovery.models import ConsultationTurnModel, DiscoveryBriefModel
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.state import (
    ObjectiveUpdate,
    apply_objective_updates,
    initialize_consultation_state,
    start_consultation,
)
from app.modules.discovery.tokens import issue_consultation_token


DEFAULT_ANSWERS: dict[ObjectiveKey, str | list[str]] = {
    ObjectiveKey.COMPANY_PROFILE: "Entreprise B2B québécoise de 25 personnes.",
    ObjectiveKey.TARGET_CUSTOMER: "PME canadiennes de 20 à 200 employés.",
    ObjectiveKey.CURRENT_CHANNELS: ["seo"],
    ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE: "Aucune agence auparavant.",
    ObjectiveKey.PRIMARY_GOAL: "Obtenir 30 demandes qualifiées par mois.",
    ObjectiveKey.TRIGGER_PROBLEM: "La croissance des demandes ralentit depuis trois mois.",
    ObjectiveKey.SERVICE_SOUGHT: ["strategy"],
    ObjectiveKey.BUDGET: "4 000 $ à 6 000 $ CA par mois.",
    ObjectiveKey.TIMELINE: "Démarrage souhaité dans six semaines.",
    ObjectiveKey.DECISION_PROCESS: "Je prends la décision finale.",
}


def create_public_consultation(
    *,
    minimum_budget_cad: int = 2_500,
) -> tuple[str, str]:
    settings = get_settings()
    with SessionLocal() as database:
        repository = SqlAlchemyDiscoveryRepository(database)
        service = DiscoveryService(repository)
        organization = service.create_organization("Agence Scénarios")
        repository.update_organization_minimum_budget(
            organization.id,
            minimum_budget_cad,
        )
        repository.commit()
        blueprint = service.create_blueprint(
            organization.id,
            get_marketing_discovery_blueprint(),
        )
        consultation = service.create_consultation(organization.id, blueprint.id)
        token = issue_consultation_token(
            consultation.id,
            secret=settings.consultation_token_secret.get_secret_value(),
            ttl_seconds=settings.consultation_token_ttl_seconds,
        )
        return consultation.id, token


def public_url(consultation_id: str, token: str, suffix: str) -> str:
    return f"/api/v1/consultations/{consultation_id}{suffix}?token={token}"


def run_scenario(
    client: TestClient,
    overrides: Mapping[ObjectiveKey, str | list[str]],
    *,
    minimum_budget_cad: int = 2_500,
) -> tuple[str, dict[str, object], list[ObjectiveKey]]:
    consultation_id, token = create_public_consultation(
        minimum_budget_cad=minimum_budget_cad,
    )
    response = client.post(public_url(consultation_id, token, "/start"))
    asked_objectives: list[ObjectiveKey] = []

    while response.json()["status"] == ConsultationStatus.IN_PROGRESS:
        question = response.json()["question"]
        with SessionLocal() as database:
            turn = database.get(ConsultationTurnModel, question["turn_id"])
            assert turn is not None
            objective = ObjectiveKey(turn.target_objective)
        asked_objectives.append(objective)
        answer = overrides.get(objective, DEFAULT_ANSWERS[objective])
        response = client.post(
            public_url(consultation_id, token, "/answers"),
            json={"turn_id": question["turn_id"], "answer": answer},
        )
        assert response.status_code == 200

    with SessionLocal() as database:
        record = database.query(DiscoveryBriefModel).filter_by(
            consultation_id=consultation_id
        ).one()
        brief = dict(record.brief_json)
    return consultation_id, brief, asked_objectives


def test_scenario_more_leads_with_little_current_marketing(client: TestClient) -> None:
    _, brief, asked = run_scenario(
        client,
        {
            ObjectiveKey.CURRENT_CHANNELS: ["none"],
            ObjectiveKey.PRIMARY_GOAL: "Obtenir 40 nouveaux leads qualifiés par mois.",
            ObjectiveKey.TRIGGER_PROBLEM: "Nous faisons très peu de marketing actuellement.",
        },
    )

    assert brief["current_marketing"]["channels"] == ["none"]
    assert brief["primary_goal"] == "Obtenir 40 nouveaux leads qualifiés par mois."
    assert brief["qualification"]["level"] == QualificationLevel.PRIORITY
    assert len(asked) == len(set(asked))


def test_scenario_meta_ads_with_declining_roas(client: TestClient) -> None:
    _, brief, _ = run_scenario(
        client,
        {
            ObjectiveKey.CURRENT_CHANNELS: ["paid_media"],
            ObjectiveKey.PRIMARY_GOAL: "Ramener le ROAS Meta Ads au-dessus de 3.",
            ObjectiveKey.TRIGGER_PROBLEM: "Le ROAS Meta Ads est passé de 4 à 1,8 en quatre mois.",
            ObjectiveKey.SERVICE_SOUGHT: ["paid_media"],
        },
    )

    assert brief["current_marketing"]["channels"] == ["paid_media"]
    assert "ROAS Meta Ads" in brief["trigger_problem"]
    assert brief["service_sought"] == "paid_media"


def test_scenario_rebranding_after_an_acquisition(client: TestClient) -> None:
    _, brief, _ = run_scenario(
        client,
        {
            ObjectiveKey.PRIMARY_GOAL: "Unifier nos deux marques sous une nouvelle identité.",
            ObjectiveKey.TRIGGER_PROBLEM: "Nous venons d'acquérir un concurrent régional.",
            ObjectiveKey.SERVICE_SOUGHT: ["branding"],
        },
    )

    assert brief["service_sought"] == "branding"
    assert "acquérir" in brief["trigger_problem"]
    assert brief["qualification"]["level"] == QualificationLevel.PRIORITY


def test_scenario_incompatible_budget_is_unqualified(client: TestClient) -> None:
    _, brief, _ = run_scenario(
        client,
        {ObjectiveKey.BUDGET: "500 $ à 1 000 $ CA par mois."},
    )

    assert brief["qualification"]["level"] == QualificationLevel.UNQUALIFIED
    assert "2 500 $ CA" in brief["qualification"]["reasons"][0]


def test_scenario_uses_the_company_configured_budget_threshold(
    client: TestClient,
) -> None:
    _, brief, _ = run_scenario(
        client,
        {ObjectiveKey.BUDGET: "4 000 $ à 6 000 $ CA par mois."},
        minimum_budget_cad=7_500,
    )

    assert brief["qualification"]["level"] == QualificationLevel.UNQUALIFIED
    assert "7 500 $ CA" in brief["qualification"]["reasons"][0]


def test_scenario_current_or_previous_agency_remains_factual(client: TestClient) -> None:
    agency_answer = (
        "Nous travaillons avec une agence depuis un an; les rapports sont clairs, "
        "mais nous cherchons plus de disponibilité."
    )
    _, brief, _ = run_scenario(
        client,
        {ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE: agency_answer},
    )

    assert brief["previous_agency_experience"] == agency_answer
    assert "incompétente" not in brief["previous_agency_experience"]


def test_scenario_vague_answer_triggers_a_precise_follow_up(client: TestClient) -> None:
    consultation_id, token = create_public_consultation()
    response = client.post(public_url(consultation_id, token, "/start"))
    primary_goal_attempts = 0

    while response.json()["status"] == ConsultationStatus.IN_PROGRESS:
        question = response.json()["question"]
        with SessionLocal() as database:
            turn = database.get(ConsultationTurnModel, question["turn_id"])
            assert turn is not None
            objective = ObjectiveKey(turn.target_objective)
        answer = DEFAULT_ANSWERS[objective]
        if objective == ObjectiveKey.PRIMARY_GOAL:
            primary_goal_attempts += 1
            if primary_goal_attempts == 1:
                answer = "Je ne sais pas"
            else:
                assert "préciser" in question["prompt"]
                answer = "Obtenir 30 demandes qualifiées par mois."
        response = client.post(
            public_url(consultation_id, token, "/answers"),
            json={"turn_id": question["turn_id"], "answer": answer},
        )
        assert response.status_code == 200

    assert primary_goal_attempts == 2
    with SessionLocal() as database:
        brief = database.query(DiscoveryBriefModel).filter_by(
            consultation_id=consultation_id
        ).one().brief_json
    assert brief["qualification"]["level"] == QualificationLevel.PRIORITY


def test_scenario_required_contradiction_is_clarified_first() -> None:
    state = start_consultation(
        initialize_consultation_state(get_marketing_discovery_blueprint())
    )
    state = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONFIRMED,
                value={"answer": "5 000 $ par mois"},
                confidence=0.95,
            ),
        ),
    )
    state = apply_objective_updates(
        state,
        (
            ObjectiveUpdate(
                key=ObjectiveKey.BUDGET,
                state=ObjectiveState.CONTRADICTION,
                value={"answer": "1 000 $ par mois"},
                confidence=0.8,
            ),
        ),
    )
    decision = asyncio.run(
        MockDiscoveryLLM().decide_next_step(
            DecisionInput(
                consultation_id="scenario-contradiction",
                question_count=3,
                max_questions=14,
                objectives=list(state.objectives),
            )
        )
    )

    assert decision.target_objective == ObjectiveKey.BUDGET
    assert decision.reason_code == ReasonCode.REQUIRED_CONTRADICTION
    assert "clarifier" in str(decision.question)


def test_scenario_abandonment_preserves_answers_and_marks_missing(client: TestClient) -> None:
    consultation_id, token = create_public_consultation()
    response = client.post(public_url(consultation_id, token, "/start"))

    for _ in range(3):
        question = response.json()["question"]
        with SessionLocal() as database:
            turn = database.get(ConsultationTurnModel, question["turn_id"])
            assert turn is not None
            objective = ObjectiveKey(turn.target_objective)
        response = client.post(
            public_url(consultation_id, token, "/answers"),
            json={
                "turn_id": question["turn_id"],
                "answer": DEFAULT_ANSWERS[objective],
            },
        )

    response = client.post(public_url(consultation_id, token, "/abandon"))

    assert response.json()["status"] == ConsultationStatus.ABANDONED
    with SessionLocal() as database:
        brief = database.query(DiscoveryBriefModel).filter_by(
            consultation_id=consultation_id
        ).one().brief_json
    assert brief["company"]["sector"] == DEFAULT_ANSWERS[ObjectiveKey.COMPANY_PROFILE]
    assert "budget" in brief["missing_information"]
    assert brief["qualification"]["level"] == QualificationLevel.FOLLOW_UP
