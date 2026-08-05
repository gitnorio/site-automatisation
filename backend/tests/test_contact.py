from sqlalchemy import func, select

from app.core.database import SessionLocal
from app.models.contact import ContactRequestModel


def count_contacts() -> int:
    with SessionLocal() as database:
        return database.scalar(select(func.count(ContactRequestModel.id))) or 0


def test_health(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_valid_contact_is_persisted(client, valid_payload) -> None:
    response = client.post("/api/contact", json=valid_payload)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert count_contacts() == 1


def test_consent_is_required(client, valid_payload) -> None:
    valid_payload["consent"] = False
    response = client.post("/api/contact", json=valid_payload)
    assert response.status_code == 422
    assert count_contacts() == 0


def test_honeypot_is_not_persisted(client, valid_payload) -> None:
    valid_payload["website"] = "https://robot.example"
    response = client.post("/api/contact", json=valid_payload)
    assert response.status_code == 201
    assert count_contacts() == 0


def test_rate_limit_blocks_sixth_request(client, valid_payload) -> None:
    for index in range(5):
        payload = {**valid_payload, "email": f"marie{index}@example.com"}
        assert client.post("/api/contact", json=payload).status_code == 201
    response = client.post("/api/contact", json=valid_payload)
    assert response.status_code == 429
    assert count_contacts() == 5

