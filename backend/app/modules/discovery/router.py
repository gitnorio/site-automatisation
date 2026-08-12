"""Routes HTTP publiques du domaine Discovery."""

from collections.abc import Awaitable, Callable
from typing import TypeVar

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.integrations.llm.factory import create_discovery_orchestrator
from app.integrations.automation.factory import create_automation_service
from app.modules.discovery.orchestrator import DiscoveryLLMExhaustedError
from app.modules.discovery.public_flow import (
    PublicConsultationConflictError,
    PublicConsultationFlow,
)
from app.modules.discovery.repository import (
    DiscoveryRecordNotFoundError,
    SqlAlchemyDiscoveryRepository,
)
from app.modules.discovery.schemas import AnswerSubmission, PublicConsultation
from app.modules.discovery.tokens import (
    ConsultationTokenError,
    verify_consultation_token,
)


router = APIRouter(prefix="/api/v1/consultations", tags=["consultations"])
ResponseT = TypeVar("ResponseT")


def get_public_flow(
    database: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> PublicConsultationFlow:
    repository = SqlAlchemyDiscoveryRepository(database)
    return PublicConsultationFlow(
        repository,
        create_discovery_orchestrator(settings),
        create_automation_service(database, settings),
    )


def authorize_consultation(
    consultation_id: str,
    token: str = Query(min_length=20),
    settings: Settings = Depends(get_settings),
) -> None:
    try:
        verify_consultation_token(
            token,
            consultation_id=consultation_id,
            secret=settings.consultation_token_secret.get_secret_value(),
        )
    except ConsultationTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error


@router.get(
    "/{consultation_id}",
    response_model=PublicConsultation,
    dependencies=[Depends(authorize_consultation)],
)
async def get_consultation(
    consultation_id: str,
    flow: PublicConsultationFlow = Depends(get_public_flow),
) -> PublicConsultation:
    return await _run(lambda: flow.get(consultation_id))


@router.post(
    "/{consultation_id}/start",
    response_model=PublicConsultation,
    dependencies=[Depends(authorize_consultation)],
)
async def start_consultation(
    consultation_id: str,
    flow: PublicConsultationFlow = Depends(get_public_flow),
) -> PublicConsultation:
    return await _run(lambda: flow.start(consultation_id))


@router.post(
    "/{consultation_id}/answers",
    response_model=PublicConsultation,
    dependencies=[Depends(authorize_consultation)],
)
async def answer_consultation(
    consultation_id: str,
    payload: AnswerSubmission,
    flow: PublicConsultationFlow = Depends(get_public_flow),
) -> PublicConsultation:
    return await _run(
        lambda: flow.answer(
            consultation_id,
            turn_id=payload.turn_id,
            answer=payload.answer,
        )
    )


@router.post(
    "/{consultation_id}/abandon",
    response_model=PublicConsultation,
    dependencies=[Depends(authorize_consultation)],
)
async def abandon_consultation(
    consultation_id: str,
    flow: PublicConsultationFlow = Depends(get_public_flow),
) -> PublicConsultation:
    return await _run(lambda: flow.abandon(consultation_id))


async def _run(operation: Callable[[], Awaitable[ResponseT]]) -> ResponseT:
    try:
        return await operation()
    except DiscoveryRecordNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation introuvable.",
        ) from error
    except PublicConsultationConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
    except DiscoveryLLMExhaustedError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La consultation ne peut pas poursuivre pour le moment. Réessayez.",
        ) from error
