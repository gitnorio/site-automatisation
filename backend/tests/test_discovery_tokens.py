from datetime import UTC, datetime, timedelta

import pytest

from app.modules.discovery.tokens import (
    ConsultationTokenError,
    issue_consultation_token,
    verify_consultation_token,
)


NOW = datetime(2026, 8, 11, 12, 0, tzinfo=UTC)


def test_signed_consultation_token_is_valid_for_its_consultation() -> None:
    token = issue_consultation_token(
        "consultation-1",
        secret="test-secret",
        ttl_seconds=600,
        now=NOW,
    )

    verify_consultation_token(
        token,
        consultation_id="consultation-1",
        secret="test-secret",
        now=NOW + timedelta(minutes=5),
    )


@pytest.mark.parametrize("change", ["signature", "consultation", "expiration"])
def test_signed_consultation_token_rejects_invalid_links(change: str) -> None:
    token = issue_consultation_token(
        "consultation-1",
        secret="test-secret",
        ttl_seconds=60,
        now=NOW,
    )
    consultation_id = "consultation-1"
    current_time = NOW
    if change == "signature":
        token = f"{token[:-1]}{'a' if token[-1] != 'a' else 'b'}"
    elif change == "consultation":
        consultation_id = "consultation-2"
    else:
        current_time = NOW + timedelta(minutes=2)

    with pytest.raises(ConsultationTokenError):
        verify_consultation_token(
            token,
            consultation_id=consultation_id,
            secret="test-secret",
            now=current_time,
        )
