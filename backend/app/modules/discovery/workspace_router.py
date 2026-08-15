"""Routes de lecture protégées pour l'espace agence MVP."""

import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.modules.discovery.repository import (
    DiscoveryRecordNotFoundError,
    SqlAlchemyDiscoveryRepository,
)
from app.modules.discovery.workspace_schemas import (
    WorkspaceConsultationDetail,
    WorkspaceConsultationList,
    WorkspaceIntegrationSettings,
    WorkspaceQualificationSettings,
    WorkspaceQualificationSettingsInput,
    WorkspaceQualificationSettingsList,
)
from app.modules.automation.contracts import AutomationActionType
from app.modules.discovery.workspace_service import (
    WorkspaceQueryService,
    WorkspaceSettingsService,
)
from app.modules.field_testing.contracts import (
    FieldTestDashboard,
    FieldTestReview,
    FieldTestReviewInput,
)
from app.modules.field_testing.repository import SqlAlchemyFieldTestRepository
from app.modules.field_testing.service import FieldTestService


router = APIRouter(prefix="/api/v1/workspace", tags=["workspace"])


def authorize_workspace(
    x_workspace_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    expected = settings.workspace_api_key.get_secret_value()
    if x_workspace_key is None or not hmac.compare_digest(x_workspace_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Accès à l'espace agence refusé.",
        )


def get_workspace_service(
    database: Session = Depends(get_db),
) -> WorkspaceQueryService:
    return WorkspaceQueryService(SqlAlchemyDiscoveryRepository(database))


def get_workspace_settings_service(
    database: Session = Depends(get_db),
) -> WorkspaceSettingsService:
    return WorkspaceSettingsService(SqlAlchemyDiscoveryRepository(database))


def get_field_test_service(
    database: Session = Depends(get_db),
) -> FieldTestService:
    return FieldTestService(SqlAlchemyFieldTestRepository(database))


@router.get(
    "/consultations",
    response_model=WorkspaceConsultationList,
    dependencies=[Depends(authorize_workspace)],
)
def list_consultations(
    service: WorkspaceQueryService = Depends(get_workspace_service),
) -> WorkspaceConsultationList:
    return service.list_consultations()


@router.get(
    "/consultations/{consultation_id}",
    response_model=WorkspaceConsultationDetail,
    dependencies=[Depends(authorize_workspace)],
)
def get_consultation(
    consultation_id: str,
    service: WorkspaceQueryService = Depends(get_workspace_service),
) -> WorkspaceConsultationDetail:
    try:
        return service.get_consultation(consultation_id)
    except DiscoveryRecordNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation introuvable.",
        ) from error


@router.get(
    "/integrations",
    response_model=WorkspaceIntegrationSettings,
    dependencies=[Depends(authorize_workspace)],
)
def get_integration_settings(
    settings: Settings = Depends(get_settings),
) -> WorkspaceIntegrationSettings:
    return WorkspaceIntegrationSettings(
        provider=settings.automation_provider,
        enabled=settings.automation_provider != "disabled",
        max_attempts=settings.automation_max_retries + 1,
        actions=[action.value for action in AutomationActionType],
    )


@router.get(
    "/qualification-settings",
    response_model=WorkspaceQualificationSettingsList,
    dependencies=[Depends(authorize_workspace)],
)
def get_qualification_settings(
    service: WorkspaceSettingsService = Depends(get_workspace_settings_service),
) -> WorkspaceQualificationSettingsList:
    return service.list_qualification_settings()


@router.put(
    "/organizations/{organization_id}/qualification-settings",
    response_model=WorkspaceQualificationSettings,
    dependencies=[Depends(authorize_workspace)],
)
def update_qualification_settings(
    organization_id: str,
    payload: WorkspaceQualificationSettingsInput,
    service: WorkspaceSettingsService = Depends(get_workspace_settings_service),
) -> WorkspaceQualificationSettings:
    try:
        return service.update_qualification_settings(organization_id, payload)
    except DiscoveryRecordNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation introuvable.",
        ) from error


@router.get(
    "/field-tests",
    response_model=FieldTestDashboard,
    dependencies=[Depends(authorize_workspace)],
)
def get_field_test_dashboard(
    service: FieldTestService = Depends(get_field_test_service),
) -> FieldTestDashboard:
    return service.dashboard()


@router.put(
    "/consultations/{consultation_id}/field-test-review",
    response_model=FieldTestReview,
    dependencies=[Depends(authorize_workspace)],
)
def save_field_test_review(
    consultation_id: str,
    payload: FieldTestReviewInput,
    service: FieldTestService = Depends(get_field_test_service),
) -> FieldTestReview:
    try:
        return service.save_review(consultation_id, payload)
    except DiscoveryRecordNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation introuvable.",
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
