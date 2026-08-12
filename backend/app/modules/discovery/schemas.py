"""Contrats HTTP publics de l'expérience prospect."""

from typing import TypeAlias

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.discovery.contracts import ConsultationStatus, ResponseType


AnswerValue: TypeAlias = str | int | float | list[str]


class PublicChoice(BaseModel):
    model_config = ConfigDict(extra="forbid")

    value: str
    label: str


class PublicQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    turn_id: str
    number: int = Field(ge=1)
    maximum: int = Field(ge=1)
    prompt: str
    response_type: ResponseType
    choices: list[PublicChoice] = Field(default_factory=list)


class PublicConsultation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    consultation_id: str
    organization_name: str
    status: ConsultationStatus
    estimated_minutes: int = 7
    question: PublicQuestion | None = None
    message: str | None = None


class AnswerSubmission(BaseModel):
    model_config = ConfigDict(extra="forbid")

    turn_id: str = Field(min_length=1, max_length=80)
    answer: AnswerValue

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, value: AnswerValue) -> AnswerValue:
        if isinstance(value, str) and not value.strip():
            raise ValueError("La réponse ne peut pas être vide.")
        if isinstance(value, list):
            cleaned = [item.strip() for item in value if item.strip()]
            if not cleaned:
                raise ValueError("Sélectionnez au moins une réponse.")
            if len(cleaned) != len(set(cleaned)):
                raise ValueError("Une option ne peut être sélectionnée qu'une fois.")
            return cleaned
        return value
