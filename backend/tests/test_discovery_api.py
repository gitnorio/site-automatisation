from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.models import (
    ConsultationModel,
    ConsultationTurnModel,
    DiscoveryBriefModel,
)
from app.modules.automation.models import AutomationDeliveryModel
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.tokens import issue_consultation_token


def create_public_consultation() -> tuple[str, str]:
    settings = get_settings()
    with SessionLocal() as database:
        service = DiscoveryService(SqlAlchemyDiscoveryRepository(database))
        organization = service.create_organization("Agence Boréale")
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


def public_url(consultation_id: str, token: str, suffix: str = "") -> str:
    return f"/api/v1/consultations/{consultation_id}{suffix}?token={token}"


def test_public_consultation_starts_answers_and_resumes(client: TestClient) -> None:
    consultation_id, token = create_public_consultation()

    initial = client.get(public_url(consultation_id, token))
    assert initial.status_code == 200
    assert initial.json()["status"] == "not_started"
    assert initial.json()["organization_name"] == "Agence Boréale"
    assert initial.json()["question"] is None

    started = client.post(public_url(consultation_id, token, "/start"))
    assert started.status_code == 200
    first_question = started.json()["question"]
    assert started.json()["status"] == "in_progress"
    assert first_question["number"] == 1
    assert first_question["response_type"] == "text"

    payload = {
        "turn_id": first_question["turn_id"],
        "answer": "Nous sommes une firme de services professionnels de 25 personnes.",
    }
    answered = client.post(
        public_url(consultation_id, token, "/answers"),
        json=payload,
    )
    assert answered.status_code == 200
    assert answered.json()["question"]["number"] == 2

    replayed = client.post(
        public_url(consultation_id, token, "/answers"),
        json=payload,
    )
    assert replayed.status_code == 200
    assert replayed.json()["question"]["turn_id"] == answered.json()["question"]["turn_id"]

    with SessionLocal() as database:
        first_turn = database.get(ConsultationTurnModel, first_question["turn_id"])
        consultation = database.get(ConsultationModel, consultation_id)
        assert first_turn is not None
        assert first_turn.raw_answer == payload["answer"]
        assert first_turn.answered_at is not None
        assert consultation is not None
        assert consultation.question_count == 2


def test_public_consultation_rejects_a_modified_token(client: TestClient) -> None:
    consultation_id, token = create_public_consultation()
    modified_token = f"{token[:-1]}{'a' if token[-1] != 'a' else 'b'}"

    response = client.get(public_url(consultation_id, modified_token))

    assert response.status_code == 401


def test_public_consultation_can_be_interrupted(client: TestClient) -> None:
    consultation_id, token = create_public_consultation()

    response = client.post(public_url(consultation_id, token, "/abandon"))

    assert response.status_code == 200
    assert response.json()["status"] == "abandoned"
    assert "enregistrée" in response.json()["message"]

    with SessionLocal() as database:
        consultation = database.get(ConsultationModel, consultation_id)
        assert consultation is not None
        assert consultation.brief is not None


def test_completed_public_consultation_creates_the_structured_brief(
    client: TestClient,
) -> None:
    consultation_id, token = create_public_consultation()
    response = client.post(public_url(consultation_id, token, "/start"))

    while response.json()["status"] == "in_progress":
        question = response.json()["question"]
        answer: str | list[str] = "Réponse suffisamment précise pour confirmer cet objectif."
        if question["response_type"] == "multi_choice":
            answer = [question["choices"][0]["value"]]
        response = client.post(
            public_url(consultation_id, token, "/answers"),
            json={"turn_id": question["turn_id"], "answer": answer},
        )
        assert response.status_code == 200

    assert response.json()["status"] == "completed"
    with SessionLocal() as database:
        brief = database.query(DiscoveryBriefModel).filter_by(
            consultation_id=consultation_id
        ).one()
        assert brief.brief_json["qualification"]["level"] == "priority"
        assert brief.brief_json["missing_information"] == [
            "positioning_competitors",
            "tools_platforms",
            "internal_marketing_team",
            "desired_measurable_results",
        ]
        delivery = database.query(AutomationDeliveryModel).filter_by(
            consultation_id=consultation_id
        ).one()
        assert delivery.status == "skipped"
