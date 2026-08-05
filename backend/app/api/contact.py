from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import InMemoryRateLimiter
from app.repositories.contact import SqlAlchemyContactRepository
from app.schemas.contact import ContactRequest, ContactResponse


settings = get_settings()
rate_limiter = InMemoryRateLimiter(
    settings.rate_limit_max_requests, settings.rate_limit_window_seconds
)
router = APIRouter(prefix="/api", tags=["contact"])


def client_key(request: Request) -> str:
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED
)
def create_contact_request(
    payload: ContactRequest,
    request: Request,
    database: Session = Depends(get_db),
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

    repository = SqlAlchemyContactRepository(database)
    repository.create(payload)
    return ContactResponse(success=True, message="Votre demande a bien été reçue.")

