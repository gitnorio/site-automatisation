from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.title() for part in rest)


class CompanySize(StrEnum):
    SMALL = "1-10"
    MEDIUM = "11-50"
    LARGE = "51-200"
    ENTERPRISE = "201-plus"
    UNSPECIFIED = "non-precise"


class NeedType(StrEnum):
    AUTOMATION = "automatisation"
    ASSISTANT = "assistant-ia"
    KNOWLEDGE = "base-connaissances"
    INTEGRATION = "integration"
    CUSTOM = "sur-mesure"
    CONSULTATION = "consultation"
    OTHER = "autre"


class ContactPreference(StrEnum):
    EMAIL = "courriel"
    PHONE = "telephone"
    NONE = "aucune-preference"


class ContactRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        str_strip_whitespace=True,
        alias_generator=to_camel,
    )

    name: str = Field(min_length=2, max_length=100)
    company: str = Field(min_length=2, max_length=150)
    email: EmailStr = Field(max_length=254)
    phone: str | None = Field(default=None, max_length=30)
    company_size: CompanySize
    need_type: NeedType
    tools: str | None = Field(default=None, max_length=500)
    description: str = Field(min_length=20, max_length=5000)
    contact_preference: ContactPreference
    consent: bool
    website: str | None = Field(default=None, max_length=200)

    @field_validator("consent")
    @classmethod
    def consent_is_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Le consentement est requis.")
        return value


class ContactResponse(BaseModel):
    success: bool
    message: str
