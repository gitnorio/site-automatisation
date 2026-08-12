"""Orchestration isolée des automatisations simples post-consultation."""

import logging
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Protocol, TypeVar

from app.modules.automation.contracts import (
    AutomationAction,
    AutomationActionType,
    AutomationDispatchInput,
    AutomationDeliveryStatus,
    CRMAllowedFields,
    ConsultationReadyEvent,
    ConnectorResult,
    QualificationLevel,
)
from app.modules.automation.models import AutomationDeliveryModel
from app.modules.automation.repository import AutomationRepository


logger = logging.getLogger(__name__)
CommitResult = TypeVar("CommitResult")


class AutomationConnector(Protocol):
    name: str

    async def deliver(self, event: ConsultationReadyEvent) -> ConnectorResult: ...


class AutomationService:
    def __init__(
        self,
        repository: AutomationRepository,
        connector: AutomationConnector | None,
        *,
        max_retries: int = 2,
    ) -> None:
        if max_retries < 0:
            raise ValueError("Le nombre de reprises ne peut pas être négatif.")
        self.repository = repository
        self.connector = connector
        self.max_retries = max_retries

    async def dispatch(
        self,
        dispatch_input: AutomationDispatchInput,
    ) -> AutomationDeliveryModel:
        connector_name = self.connector.name if self.connector else "disabled"
        existing = self.repository.find_delivery(
            dispatch_input.consultation_id,
            "consultation.ready",
            connector_name,
        )
        if existing is not None:
            return existing

        event = build_consultation_ready_event(dispatch_input)
        delivery = self._commit(
            lambda: self.repository.create_delivery(event, connector_name)
        )
        if self.connector is None:
            return self._commit(
                lambda: self.repository.mark_skipped(
                    delivery.id,
                    "Aucun connecteur d'automatisation n'est configuré.",
                )
            )

        total_attempts = self.max_retries + 1
        for attempt_number in range(1, total_attempts + 1):
            attempt = self._commit(
                lambda: self.repository.start_attempt(delivery.id)
            )
            try:
                result = await self.connector.deliver(event)
                if not result.accepted:
                    raise RuntimeError("Le connecteur a refusé l'événement.")
                delivery = self._commit(
                    lambda: self.repository.complete_attempt(
                        delivery.id,
                        attempt.id,
                        result,
                    )
                )
                logger.info(
                    "automation_delivery_succeeded delivery_id=%s connector=%s attempts=%s",
                    delivery.id,
                    connector_name,
                    attempt_number,
                )
                return delivery
            except Exception as error:
                final = attempt_number == total_attempts
                delivery = self._commit(
                    lambda: self.repository.fail_attempt(
                        delivery.id,
                        attempt.id,
                        error,
                        final=final,
                    )
                )
                logger.warning(
                    "automation_delivery_failed delivery_id=%s connector=%s attempt=%s final=%s error_type=%s",
                    delivery.id,
                    connector_name,
                    attempt_number,
                    final,
                    type(error).__name__,
                )
        if delivery.status != AutomationDeliveryStatus.FAILED.value:
            raise AssertionError("Une livraison épuisée doit être marquée failed.")
        return delivery

    def _commit(
        self,
        operation: Callable[[], CommitResult],
    ) -> CommitResult:
        try:
            result = operation()
            self.repository.commit()
            return result
        except Exception:
            self.repository.rollback()
            raise


def build_consultation_ready_event(
    dispatch_input: AutomationDispatchInput,
) -> ConsultationReadyEvent:
    brief = dispatch_input.brief
    qualification = brief.qualification.level
    assignment_target = {
        QualificationLevel.PRIORITY: "priority_sales",
        QualificationLevel.FOLLOW_UP: "discovery_follow_up",
        QualificationLevel.UNQUALIFIED: "nurture",
    }[qualification]
    return ConsultationReadyEvent(
        event_id=str(uuid.uuid4()),
        occurred_at=datetime.now(UTC),
        consultation_id=dispatch_input.consultation_id,
        organization_id=dispatch_input.organization_id,
        organization_name=dispatch_input.organization_name,
        consultation_status=dispatch_input.consultation_status,
        completed_at=dispatch_input.completed_at,
        crm_fields=CRMAllowedFields(
            company_profile=brief.company.sector,
            target_customer=brief.company.target_customer,
            primary_goal=brief.primary_goal,
            trigger_problem=brief.trigger_problem,
            service_sought=brief.service_sought,
            current_channels=(
                brief.current_marketing.channels if brief.current_marketing else []
            ),
            tools=brief.current_marketing.tools if brief.current_marketing else [],
            previous_agency_experience=brief.previous_agency_experience,
            budget=brief.budget,
            timeline=brief.timeline,
            respondent_role=(
                brief.decision.respondent_role if brief.decision else None
            ),
            qualification=qualification,
            qualification_reasons=brief.qualification.reasons,
            missing_information=brief.missing_information,
            contradictions=brief.contradictions,
            recommended_questions=brief.recommended_questions,
        ),
        actions=[
            AutomationAction(
                type=AutomationActionType.CRM_UPSERT,
                target="crm.prospect_record",
            ),
            AutomationAction(
                type=AutomationActionType.OWNER_ASSIGN,
                target=assignment_target,
            ),
            AutomationAction(
                type=AutomationActionType.TEAM_NOTIFY,
                target="sales_team",
            ),
            AutomationAction(
                type=AutomationActionType.WEBHOOK_DELIVER,
                target="configured_endpoint",
            ),
        ],
    )
