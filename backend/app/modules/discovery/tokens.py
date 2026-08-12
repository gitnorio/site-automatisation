"""Jetons publics signés pour les liens de consultation."""

import base64
import hashlib
import hmac
import json
from datetime import UTC, datetime, timedelta


class ConsultationTokenError(ValueError):
    pass


def issue_consultation_token(
    consultation_id: str,
    *,
    secret: str,
    ttl_seconds: int,
    now: datetime | None = None,
) -> str:
    issued_at = now or datetime.now(UTC)
    payload = {
        "consultation_id": consultation_id,
        "expires_at": int((issued_at + timedelta(seconds=ttl_seconds)).timestamp()),
    }
    encoded_payload = _encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signature = _signature(encoded_payload, secret)
    return f"{encoded_payload}.{signature}"


def verify_consultation_token(
    token: str,
    *,
    consultation_id: str,
    secret: str,
    now: datetime | None = None,
) -> None:
    try:
        encoded_payload, supplied_signature = token.split(".", 1)
        expected_signature = _signature(encoded_payload, secret)
        if not hmac.compare_digest(supplied_signature, expected_signature):
            raise ConsultationTokenError("Le lien de consultation est invalide.")
        payload = json.loads(_decode(encoded_payload))
        token_consultation_id = str(payload["consultation_id"])
        expires_at = int(payload["expires_at"])
    except ConsultationTokenError:
        raise
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
        raise ConsultationTokenError("Le lien de consultation est invalide.") from error

    current_time = now or datetime.now(UTC)
    if token_consultation_id != consultation_id:
        raise ConsultationTokenError("Le lien de consultation est invalide.")
    if expires_at <= int(current_time.timestamp()):
        raise ConsultationTokenError("Le lien de consultation a expiré.")


def _signature(encoded_payload: str, secret: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return _encode(digest)


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)
