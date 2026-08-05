import os
os.environ["CONTACT_DATABASE_URL"] = "sqlite://"
os.environ["RATE_LIMIT_MAX_REQUESTS"] = "5"
os.environ["RATE_LIMIT_WINDOW_SECONDS"] = "3600"

import pytest
from fastapi.testclient import TestClient

from app.api.contact import rate_limiter
from app.core.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def clean_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    rate_limiter.reset()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def valid_payload() -> dict[str, object]:
    return {
        "name": "Marie Tremblay",
        "company": "Atelier du Nord",
        "email": "marie@example.com",
        "phone": "514 555-0199",
        "companySize": "11-50",
        "needType": "automatisation",
        "tools": "Microsoft 365 et un CRM interne",
        "description": "Nous souhaitons réduire la saisie manuelle de nos demandes clients.",
        "contactPreference": "courriel",
        "consent": True,
        "website": "",
    }
