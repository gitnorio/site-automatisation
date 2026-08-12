from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import (
    BriefInput,
    ObjectiveState,
    ResponseType,
)
from app.modules.discovery.models import ConsultationModel
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.state import ObjectiveUpdate


def workspace_headers() -> dict[str, str]:
    return {"X-Workspace-Key": get_settings().workspace_api_key.get_secret_value()}


def create_consultation(*, outcome: str) -> str:
    with SessionLocal() as database:
        service = DiscoveryService(SqlAlchemyDiscoveryRepository(database))
        organization = service.create_organization(f"Agence {outcome}")
        blueprint = service.create_blueprint(
            organization.id,
            get_marketing_discovery_blueprint(),
        )
        consultation = service.create_consultation(organization.id, blueprint.id)
        if outcome == "not_started":
            return consultation.id

        service.start(consultation.id)
        state = service.repository.load_state(consultation.id)
        turn = service.ask_question(
            consultation.id,
            target_objective=next(
                objective.key for objective in state.objectives if objective.required
            ),
            question="Présentez votre situation.",
            response_type=ResponseType.TEXT,
        )
        updates = tuple(
            ObjectiveUpdate(
                key=objective.key,
                state=ObjectiveState.CONFIRMED,
                value={"answer": f"Réponse {objective.key.value}"},
                confidence=0.95,
            )
            for objective in state.objectives
            if objective.required
        )
        state = service.answer_question(
            consultation.id,
            turn.id,
            raw_answer="Réponse confidentielle du prospect",
            updates=(
                updates
                if outcome == "completed"
                else updates[:1]
            ),
        )
        if outcome == "abandoned":
            state = service.abandon(consultation.id)
        record = database.get(ConsultationModel, consultation.id)
        assert record is not None
        brief = build_marketing_discovery_brief(
            BriefInput(
                consultation_id=consultation.id,
                completed_at=record.completed_at,
                objectives=list(state.objectives),
            )
        )
        service.create_brief(consultation.id, brief)

        finished_at = datetime(2026, 8, 11, 16, 0, tzinfo=UTC)
        duration = 600 if outcome == "completed" else 300
        record.started_at = finished_at - timedelta(seconds=duration)
        record.completed_at = finished_at
        database.commit()
        return consultation.id


def review_payload(
    *,
    usefulness: int = 5,
    observed_live: bool = True,
) -> dict[str, object]:
    return {
        "reviewer_role": "strategist",
        "observed_live": observed_live,
        "prospect_understood_without_help": True if observed_live else None,
        "felt_like_static_form": False if observed_live else None,
        "obvious_repetition": False if observed_live else None,
        "follow_ups_relevant": True if observed_live else None,
        "guardrail_issue": False if observed_live else None,
        "brief_usefulness": usefulness,
        "brief_preparedness": usefulness,
        "agency_would_use": usefulness >= 4,
        "notes": "Le brief a permis de préparer la rencontre.",
    }


def test_field_test_dashboard_measures_funnel_duration_and_human_feedback(
    client: TestClient,
) -> None:
    completed_id = create_consultation(outcome="completed")
    abandoned_id = create_consultation(outcome="abandoned")
    create_consultation(outcome="not_started")
    completed_review = client.put(
        f"/api/v1/workspace/consultations/{completed_id}/field-test-review",
        headers=workspace_headers(),
        json=review_payload(),
    )
    abandoned_review = client.put(
        f"/api/v1/workspace/consultations/{abandoned_id}/field-test-review",
        headers=workspace_headers(),
        json=review_payload(usefulness=3, observed_live=False),
    )
    assert completed_review.status_code == 200
    assert abandoned_review.status_code == 200

    response = client.get(
        "/api/v1/workspace/field-tests",
        headers=workspace_headers(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["metrics"] == {
        "invitations": 3,
        "started": 2,
        "completed": 1,
        "abandoned": 1,
        "active": 0,
        "start_rate": 66.7,
        "completion_rate": 50.0,
        "abandonment_rate": 50.0,
        "median_duration_seconds": 450,
        "average_answered_questions": 1.0,
        "reviewed_briefs": 2,
        "observed_live": 1,
        "average_brief_usefulness": 4.0,
        "useful_brief_rate": 50.0,
        "agency_adoption_rate": 50.0,
        "understood_without_help_rate": 100.0,
        "conversational_experience_rate": 100.0,
        "no_repetition_rate": 100.0,
        "relevant_follow_ups_rate": 100.0,
        "guardrail_compliance_rate": 100.0,
    }
    assert "Réponse confidentielle du prospect" not in response.text
    assert len(payload["consultations"]) == 3


def test_field_test_review_is_upserted_and_visible_in_consultation_detail(
    client: TestClient,
) -> None:
    consultation_id = create_consultation(outcome="completed")
    first = client.put(
        f"/api/v1/workspace/consultations/{consultation_id}/field-test-review",
        headers=workspace_headers(),
        json=review_payload(),
    )
    updated_payload = review_payload(usefulness=4)
    updated_payload["notes"] = "Deuxième lecture du même brief."
    second = client.put(
        f"/api/v1/workspace/consultations/{consultation_id}/field-test-review",
        headers=workspace_headers(),
        json=updated_payload,
    )

    assert second.status_code == 200
    assert second.json()["id"] == first.json()["id"]
    assert second.json()["brief_usefulness"] == 4
    detail = client.get(
        f"/api/v1/workspace/consultations/{consultation_id}",
        headers=workspace_headers(),
    )
    assert detail.json()["field_test_review"]["notes"] == "Deuxième lecture du même brief."


def test_live_review_requires_every_observation_criterion(client: TestClient) -> None:
    consultation_id = create_consultation(outcome="completed")
    payload = review_payload()
    payload["follow_ups_relevant"] = None

    response = client.put(
        f"/api/v1/workspace/consultations/{consultation_id}/field-test-review",
        headers=workspace_headers(),
        json=payload,
    )

    assert response.status_code == 422


def test_review_requires_a_final_brief(client: TestClient) -> None:
    consultation_id = create_consultation(outcome="not_started")

    response = client.put(
        f"/api/v1/workspace/consultations/{consultation_id}/field-test-review",
        headers=workspace_headers(),
        json=review_payload(observed_live=False),
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Une revue terrain exige un brief final."
