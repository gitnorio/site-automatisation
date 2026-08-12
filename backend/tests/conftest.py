import os
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://koto:koto@localhost:5433/koto_test",
)
os.environ["RATE_LIMIT_MAX_REQUESTS"] = "5"
os.environ["RATE_LIMIT_WINDOW_SECONDS"] = "3600"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.modules.contact.router import rate_limiter
from app.core.database import Base, engine
from app.main import app


def reset_test_schema() -> None:
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("DROP TABLE IF EXISTS alembic_version"))


@pytest.fixture
def clean_database() -> None:
    reset_test_schema()
    Base.metadata.create_all(bind=engine)
    rate_limiter.reset()
    yield
    reset_test_schema()


@pytest.fixture
def client(clean_database: None) -> TestClient:
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
