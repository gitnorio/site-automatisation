"""Persistance transactionnelle du journal d'automatisation."""

from datetime import UTC, datetime
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.automation.contracts import (
    AutomationAttemptStatus,
    AutomationDeliveryStatus,
    ConsultationReadyEvent,
    ConnectorResult,
)
from app.modules.automation.models import (
    AutomationAttemptModel,
    AutomationDeliveryModel,
)


class AutomationRepository(Protocol):
    def find_delivery(
        self,
        consultation_id: str,
        event_type: str,
        connector_name: str,
    ) -> AutomationDeliveryModel | None: ...

    def create_delivery(
        self,
        event: ConsultationReadyEvent,
        connector_name: str,
    ) -> AutomationDeliveryModel: ...

    def mark_skipped(self, delivery_id: str, reason: str) -> AutomationDeliveryModel: ...

    def start_attempt(self, delivery_id: str) -> AutomationAttemptModel: ...

    def complete_attempt(
        self,
        delivery_id: str,
        attempt_id: str,
        result: ConnectorResult,
    ) -> AutomationDeliveryModel: ...

    def fail_attempt(
        self,
        delivery_id: str,
        attempt_id: str,
        error: Exception,
        *,
        final: bool,
    ) -> AutomationDeliveryModel: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...


class SqlAlchemyAutomationRepository:
    def __init__(self, database: Session) -> None:
        self.database = database

    def find_delivery(
        self,
        consultation_id: str,
        event_type: str,
        connector_name: str,
    ) -> AutomationDeliveryModel | None:
        statement = (
            select(AutomationDeliveryModel)
            .options(selectinload(AutomationDeliveryModel.attempts))
            .where(
                AutomationDeliveryModel.consultation_id == consultation_id,
                AutomationDeliveryModel.event_type == event_type,
                AutomationDeliveryModel.connector_name == connector_name,
            )
        )
        return self.database.scalar(statement)

    def create_delivery(
        self,
        event: ConsultationReadyEvent,
        connector_name: str,
    ) -> AutomationDeliveryModel:
        delivery = AutomationDeliveryModel(
            id=event.event_id,
            consultation_id=event.consultation_id,
            event_type=event.event_type,
            connector_name=connector_name,
            status=AutomationDeliveryStatus.PENDING.value,
            payload_json=event.model_dump(mode="json"),
        )
        self.database.add(delivery)
        self.database.flush()
        return delivery

    def mark_skipped(
        self,
        delivery_id: str,
        reason: str,
    ) -> AutomationDeliveryModel:
        delivery = self._delivery(delivery_id)
        delivery.status = AutomationDeliveryStatus.SKIPPED.value
        delivery.last_error = reason[:1000]
        delivery.completed_at = datetime.now(UTC)
        self.database.flush()
        return delivery

    def start_attempt(self, delivery_id: str) -> AutomationAttemptModel:
        delivery = self._delivery(delivery_id)
        delivery.attempt_count += 1
        delivery.status = AutomationDeliveryStatus.DELIVERING.value
        attempt = AutomationAttemptModel(
            delivery_id=delivery_id,
            attempt_number=delivery.attempt_count,
            status=AutomationAttemptStatus.STARTED.value,
        )
        self.database.add(attempt)
        self.database.flush()
        return attempt

    def complete_attempt(
        self,
        delivery_id: str,
        attempt_id: str,
        result: ConnectorResult,
    ) -> AutomationDeliveryModel:
        delivery = self._delivery(delivery_id)
        attempt = self._attempt(attempt_id)
        now = datetime.now(UTC)
        attempt.status = AutomationAttemptStatus.SUCCEEDED.value
        attempt.http_status = result.status_code
        attempt.external_id = result.external_id
        attempt.completed_at = now
        delivery.status = AutomationDeliveryStatus.SUCCEEDED.value
        delivery.result_json = result.model_dump(mode="json")
        delivery.last_error = None
        delivery.completed_at = now
        self.database.flush()
        return delivery

    def fail_attempt(
        self,
        delivery_id: str,
        attempt_id: str,
        error: Exception,
        *,
        final: bool,
    ) -> AutomationDeliveryModel:
        delivery = self._delivery(delivery_id)
        attempt = self._attempt(attempt_id)
        now = datetime.now(UTC)
        error_type = type(error).__name__[:120]
        error_message = str(error)[:1000] or error_type
        attempt.status = AutomationAttemptStatus.FAILED.value
        attempt.error_type = error_type
        attempt.error_message = error_message
        attempt.completed_at = now
        delivery.status = (
            AutomationDeliveryStatus.FAILED.value
            if final
            else AutomationDeliveryStatus.PENDING.value
        )
        delivery.last_error = error_message
        delivery.completed_at = now if final else None
        self.database.flush()
        return delivery

    def commit(self) -> None:
        self.database.commit()

    def rollback(self) -> None:
        self.database.rollback()

    def _delivery(self, delivery_id: str) -> AutomationDeliveryModel:
        delivery = self.database.get(AutomationDeliveryModel, delivery_id)
        if delivery is None:
            raise LookupError("Livraison d'automatisation introuvable.")
        return delivery

    def _attempt(self, attempt_id: str) -> AutomationAttemptModel:
        attempt = self.database.get(AutomationAttemptModel, attempt_id)
        if attempt is None:
            raise LookupError("Tentative d'automatisation introuvable.")
        return attempt
