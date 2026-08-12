"""Fabrique du connecteur et du service d'automatisation."""

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.integrations.automation.webhook import WebhookAutomationConnector
from app.modules.automation.repository import SqlAlchemyAutomationRepository
from app.modules.automation.service import AutomationConnector, AutomationService


def create_automation_connector(settings: Settings) -> AutomationConnector | None:
    if settings.automation_provider == "disabled":
        return None
    if settings.automation_webhook_url is None or settings.automation_webhook_secret is None:
        raise ValueError("La configuration du connecteur webhook est incomplète.")
    return WebhookAutomationConnector(
        url=settings.automation_webhook_url,
        secret=settings.automation_webhook_secret.get_secret_value(),
        timeout_seconds=settings.automation_timeout_seconds,
    )


def create_automation_service(
    database: Session,
    settings: Settings,
) -> AutomationService:
    return AutomationService(
        SqlAlchemyAutomationRepository(database),
        create_automation_connector(settings),
        max_retries=settings.automation_max_retries,
    )
