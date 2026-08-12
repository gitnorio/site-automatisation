import asyncio
import hashlib
import hmac

import httpx

from app.core.database import SessionLocal
from app.integrations.automation.webhook import WebhookAutomationConnector
from app.modules.automation.contracts import (
    AutomationDispatchInput,
    AutomationDeliveryStatus,
    ConnectorResult,
)
from app.modules.automation.repository import SqlAlchemyAutomationRepository
from app.modules.automation.service import (
    AutomationService,
    build_consultation_ready_event,
)
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.brief import build_marketing_discovery_brief
from app.modules.discovery.contracts import BriefInput
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService


class SequenceConnector:
    name = "test"

    def __init__(self, outcomes: list[ConnectorResult | Exception]) -> None:
        self.outcomes = outcomes
        self.calls = 0

    async def deliver(self, event) -> ConnectorResult:
        outcome = self.outcomes[self.calls]
        self.calls += 1
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


def create_dispatch_input() -> AutomationDispatchInput:
    with SessionLocal() as database:
        discovery = DiscoveryService(SqlAlchemyDiscoveryRepository(database))
        organization = discovery.create_organization("Agence Boréale")
        blueprint = discovery.create_blueprint(
            organization.id,
            get_marketing_discovery_blueprint(),
        )
        consultation = discovery.create_consultation(organization.id, blueprint.id)
        state = discovery.abandon(consultation.id)
        brief = build_marketing_discovery_brief(
            BriefInput(
                consultation_id=consultation.id,
                completed_at=consultation.completed_at,
                objectives=list(state.objectives),
            )
        )
        discovery.create_brief(consultation.id, brief)
        return AutomationDispatchInput(
            consultation_id=consultation.id,
            organization_id=organization.id,
            organization_name=organization.name,
            consultation_status=consultation.status,
            completed_at=consultation.completed_at,
            brief=brief,
        )


def test_event_contains_only_the_explicit_crm_allowlist(clean_database: None) -> None:
    event = build_consultation_ready_event(create_dispatch_input())
    serialized = event.model_dump_json()

    assert set(event.crm_fields.model_dump()) == {
        "company_profile",
        "target_customer",
        "primary_goal",
        "trigger_problem",
        "service_sought",
        "current_channels",
        "tools",
        "previous_agency_experience",
        "budget",
        "timeline",
        "respondent_role",
        "qualification",
        "qualification_reasons",
        "missing_information",
        "contradictions",
    }
    assert "raw_answer" not in serialized
    assert "confidence" not in serialized
    assert "evidence" not in serialized
    assert [action.type for action in event.actions] == [
        "crm.upsert",
        "owner.assign",
        "team.notify",
        "webhook.deliver",
    ]


def test_delivery_retries_and_journals_every_attempt(
    clean_database: None,
) -> None:
    dispatch_input = create_dispatch_input()
    connector = SequenceConnector(
        [
            RuntimeError("temporary-1"),
            RuntimeError("temporary-2"),
            ConnectorResult(accepted=True, status_code=202, external_id="crm-42"),
        ]
    )
    with SessionLocal() as database:
        service = AutomationService(
            SqlAlchemyAutomationRepository(database),
            connector,
            max_retries=2,
        )

        delivery = asyncio.run(service.dispatch(dispatch_input))
        replayed = asyncio.run(service.dispatch(dispatch_input))

        assert delivery.status == AutomationDeliveryStatus.SUCCEEDED.value
        assert delivery.attempt_count == 3
        assert [attempt.status for attempt in delivery.attempts] == [
            "failed",
            "failed",
            "succeeded",
        ]
        assert replayed.id == delivery.id
        assert connector.calls == 3


def test_connector_failure_is_returned_as_a_failed_delivery(
    clean_database: None,
) -> None:
    dispatch_input = create_dispatch_input()
    connector = SequenceConnector([RuntimeError("offline"), RuntimeError("offline")])
    with SessionLocal() as database:
        service = AutomationService(
            SqlAlchemyAutomationRepository(database),
            connector,
            max_retries=1,
        )

        delivery = asyncio.run(service.dispatch(dispatch_input))

        assert delivery.status == AutomationDeliveryStatus.FAILED.value
        assert delivery.attempt_count == 2
        assert delivery.last_error == "offline"


def test_disabled_connector_creates_an_auditable_skipped_delivery(
    clean_database: None,
) -> None:
    dispatch_input = create_dispatch_input()
    with SessionLocal() as database:
        service = AutomationService(
            SqlAlchemyAutomationRepository(database),
            None,
        )

        delivery = asyncio.run(service.dispatch(dispatch_input))

        assert delivery.status == AutomationDeliveryStatus.SKIPPED.value
        assert delivery.attempt_count == 0


def test_webhook_connector_signs_body_and_sends_idempotency_key(
    clean_database: None,
) -> None:
    event = build_consultation_ready_event(create_dispatch_input())
    captured: dict[str, str | bytes] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["body"] = request.content
        captured["signature"] = request.headers["X-Koto-Signature"]
        captured["idempotency"] = request.headers["Idempotency-Key"]
        return httpx.Response(202, headers={"X-External-Id": "crm-42"})

    connector = WebhookAutomationConnector(
        url="https://example.test/koto",
        secret="webhook-secret",
        timeout_seconds=5,
        transport=httpx.MockTransport(handler),
    )

    result = asyncio.run(connector.deliver(event))

    expected = hmac.new(
        b"webhook-secret",
        captured["body"],
        hashlib.sha256,
    ).hexdigest()
    assert captured["signature"] == f"sha256={expected}"
    assert captured["idempotency"] == event.event_id
    assert result.external_id == "crm-42"
