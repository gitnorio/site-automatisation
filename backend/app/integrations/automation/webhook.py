"""Connecteur pilote par webhook signé."""

import hashlib
import hmac

import httpx

from app.modules.automation.contracts import ConsultationReadyEvent, ConnectorResult


class WebhookDeliveryError(RuntimeError):
    pass


class WebhookAutomationConnector:
    name = "webhook"

    def __init__(
        self,
        *,
        url: str,
        secret: str,
        timeout_seconds: int,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.url = url
        self.secret = secret
        self.timeout_seconds = timeout_seconds
        self.transport = transport

    async def deliver(self, event: ConsultationReadyEvent) -> ConnectorResult:
        body = event.model_dump_json().encode("utf-8")
        signature = hmac.new(
            self.secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()
        async with httpx.AsyncClient(
            timeout=self.timeout_seconds,
            transport=self.transport,
        ) as client:
            response = await client.post(
                self.url,
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "Idempotency-Key": event.event_id,
                    "X-Koto-Event": event.event_type,
                    "X-Koto-Signature": f"sha256={signature}",
                },
            )
        if not 200 <= response.status_code < 300:
            raise WebhookDeliveryError(
                f"Le webhook a répondu avec le statut HTTP {response.status_code}."
            )
        external_id = response.headers.get("X-External-Id")
        return ConnectorResult(
            accepted=True,
            status_code=response.status_code,
            external_id=external_id,
        )
