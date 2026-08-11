from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import InMemoryRateLimiter
from app.modules.contact.repository import SqlAlchemyContactRepository
from app.modules.contact.schemas import ContactRequest, ContactResponse
from app.modules.contact.service import ContactService


settings = get_settings()
rate_limiter = InMemoryRateLimiter(
    settings.rate_limit_max_requests, settings.rate_limit_window_seconds
)
router = APIRouter(tags=["contact"])


def client_key(request: Request) -> str:
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def get_contact_service(database: Session = Depends(get_db)) -> ContactService:
    return ContactService(SqlAlchemyContactRepository(database))


@router.post(
    "/api/v1/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/api/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_contact_request(
    payload: ContactRequest,
    request: Request,
    service: ContactService = Depends(get_contact_service),
) -> ContactResponse:
    if payload.website:
        return ContactResponse(
            success=True, message="Votre demande a bien été reçue."
        )

    if not rate_limiter.allow(client_key(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de demandes ont été envoyées. Veuillez réessayer plus tard.",
        )

    service.submit(payload)
    return ContactResponse(success=True, message="Votre demande a bien été reçue.")
