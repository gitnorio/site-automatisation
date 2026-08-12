import asyncio

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import BriefInput, ObjectiveKey, ObjectiveState, ResponseType
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.state import ObjectiveUpdate
from app.modules.automation.contracts import AutomationDispatchInput
from app.modules.automation.repository import SqlAlchemyAutomationRepository
from app.modules.automation.service import AutomationService


def workspace_headers() -> dict[str, str]:
    return {"X-Workspace-Key": get_settings().workspace_api_key.get_secret_value()}


def create_reviewable_consultation() -> str:
    with SessionLocal() as database:
        service = DiscoveryService(SqlAlchemyDiscoveryRepository(database))
        organization = service.create_organization("Agence Boréale")
        blueprint = service.create_blueprint(
            organization.id,
            get_marketing_discovery_blueprint(),
        )
        consultation = service.create_consultation(organization.id, blueprint.id)
        service.start(consultation.id)
        turn = service.ask_question(
            consultation.id,
            target_objective=ObjectiveKey.PRIMARY_GOAL,
            question="Quel résultat concret espérez-vous atteindre?",
            response_type=ResponseType.TEXT,
        )
        service.answer_question(
            consultation.id,
            turn.id,
            raw_answer="Doubler les demandes qualifiées.",
            updates=(
                ObjectiveUpdate(
                    key=ObjectiveKey.PRIMARY_GOAL,
                    state=ObjectiveState.CONFIRMED,
                    value={"answer": "Doubler les demandes qualifiées."},
                    confidence=0.95,
                ),
            ),
        )
        state = service.abandon(consultation.id)
        brief = build_marketing_discovery_brief(
            BriefInput(
                consultation_id=consultation.id,
                completed_at=consultation.completed_at,
                objectives=list(state.objectives),
            )
        )
        service.create_brief(consultation.id, brief)
        automation = AutomationService(
            SqlAlchemyAutomationRepository(database),
            None,
        )
        asyncio.run(
            automation.dispatch(
                AutomationDispatchInput(
                    consultation_id=consultation.id,
                    organization_id=organization.id,
                    organization_name=organization.name,
                    consultation_status=consultation.status,
                    completed_at=consultation.completed_at,
                    brief=brief,
                )
            )
        )
        return consultation.id


def test_workspace_routes_require_the_server_key(client: TestClient) -> None:
    response = client.get("/api/v1/workspace/consultations")

    assert response.status_code == 401


def test_workspace_lists_reviewable_consultations(client: TestClient) -> None:
    consultation_id = create_reviewable_consultation()

    response = client.get(
        "/api/v1/workspace/consultations",
        headers=workspace_headers(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["metrics"] == {
        "in_progress": 0,
        "completed": 0,
        "to_review": 1,
    }
    assert payload["consultations"][0]["id"] == consultation_id
    assert payload["consultations"][0]["primary_goal"] == "Doubler les demandes qualifiées."
    assert payload["consultations"][0]["qualification"] == "follow_up"
    assert payload["consultations"][0]["automation_status"] == "skipped"


def test_workspace_detail_exposes_brief_answers_and_safe_objectives(
    client: TestClient,
) -> None:
    consultation_id = create_reviewable_consultation()

    response = client.get(
        f"/api/v1/workspace/consultations/{consultation_id}",
        headers=workspace_headers(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["brief"]["primary_goal"] == "Doubler les demandes qualifiées."
    assert payload["turns"][0]["answer"] == "Doubler les demandes qualifiées."
    primary_goal = next(
        objective
        for objective in payload["objectives"]
        if objective["key"] == "primary_goal"
    )
    assert primary_goal == {
        "key": "primary_goal",
        "required": True,
        "state": "confirmed",
        "answer": "Doubler les demandes qualifiées.",
    }
    assert "confidence" not in primary_goal
    assert "source" not in primary_goal
    assert payload["automations"][0]["status"] == "skipped"
    assert payload["automations"][0]["actions"] == [
        "crm.upsert",
        "owner.assign",
        "team.notify",
        "webhook.deliver",
    ]


def test_workspace_exposes_safe_integration_configuration(client: TestClient) -> None:
    response = client.get(
        "/api/v1/workspace/integrations",
        headers=workspace_headers(),
    )

    assert response.status_code == 200
    assert response.json() == {
        "provider": "disabled",
        "enabled": False,
        "max_attempts": 3,
        "actions": [
            "crm.upsert",
            "owner.assign",
            "team.notify",
            "webhook.deliver",
        ],
    }
