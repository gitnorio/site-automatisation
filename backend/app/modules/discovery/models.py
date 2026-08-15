"""Modèles SQLAlchemy du domaine Discovery."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


def new_uuid() -> str:
    return str(uuid.uuid4())


class OrganizationModel(Base):
    __tablename__ = "organizations"
    __table_args__ = (
        CheckConstraint(
            "minimum_qualifying_budget_cad BETWEEN 0 AND 10000000",
            name="ck_organizations_minimum_qualifying_budget",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(150))
    minimum_qualifying_budget_cad: Mapped[int] = mapped_column(
        Integer,
        default=2_500,
        server_default="2500",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    blueprints: Mapped[list["BlueprintModel"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    consultations: Mapped[list["ConsultationModel"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )


class BlueprintModel(Base):
    __tablename__ = "blueprints"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "name",
            "version",
            name="uq_blueprints_organization_name_version",
        ),
        CheckConstraint("vertical = 'marketing_agency'", name="ck_blueprints_vertical"),
        CheckConstraint("version >= 1", name="ck_blueprints_version"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120))
    vertical: Mapped[str] = mapped_column(String(40))
    version: Mapped[int] = mapped_column(Integer)
    config: Mapped[dict[str, object]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    organization: Mapped[OrganizationModel] = relationship(back_populates="blueprints")
    consultations: Mapped[list["ConsultationModel"]] = relationship(
        back_populates="blueprint"
    )


class ConsultationModel(Base):
    __tablename__ = "consultations"
    __table_args__ = (
        CheckConstraint("question_count >= 0", name="ck_consultations_question_count"),
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed', 'abandoned')",
            name="ck_consultations_status",
        ),
        CheckConstraint(
            "stop_reason IS NULL OR stop_reason IN "
            "('all_required_objectives_complete', 'question_limit_reached', "
            "'prospect_abandoned')",
            name="ck_consultations_stop_reason",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        index=True,
    )
    blueprint_id: Mapped[str] = mapped_column(
        ForeignKey("blueprints.id", ondelete="RESTRICT"),
        index=True,
    )
    status: Mapped[str] = mapped_column(String(20), default="not_started", index=True)
    stop_reason: Mapped[str | None] = mapped_column(String(40), nullable=True)
    question_count: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    organization: Mapped[OrganizationModel] = relationship(back_populates="consultations")
    blueprint: Mapped[BlueprintModel] = relationship(back_populates="consultations")
    objectives: Mapped[list["ConsultationObjectiveModel"]] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
    )
    turns: Mapped[list["ConsultationTurnModel"]] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
        order_by="ConsultationTurnModel.turn_index",
    )
    brief: Mapped["DiscoveryBriefModel | None"] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
        uselist=False,
    )
    automation_deliveries: Mapped[list["AutomationDeliveryModel"]] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
    )
    field_test_review: Mapped["FieldTestReviewModel | None"] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
        uselist=False,
    )


class ConsultationObjectiveModel(Base):
    __tablename__ = "consultation_objectives"
    __table_args__ = (
        UniqueConstraint(
            "consultation_id",
            "objective_key",
            name="uq_consultation_objectives_key",
        ),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_consultation_objectives_confidence",
        ),
        CheckConstraint(
            "state IN ('unknown', 'partial', 'confirmed', 'contradiction', 'incomplete')",
            name="ck_consultation_objectives_state",
        ),
        CheckConstraint(
            "source IS NULL OR source IN ('answer', 'system')",
            name="ck_consultation_objectives_source",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    consultation_id: Mapped[str] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        index=True,
    )
    objective_key: Mapped[str] = mapped_column(String(50))
    required: Mapped[bool] = mapped_column(Boolean)
    state: Mapped[str] = mapped_column(String(20), default="unknown")
    value_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str | None] = mapped_column(String(20), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    consultation: Mapped[ConsultationModel] = relationship(back_populates="objectives")


class ConsultationTurnModel(Base):
    __tablename__ = "consultation_turns"
    __table_args__ = (
        UniqueConstraint(
            "consultation_id",
            "turn_index",
            name="uq_consultation_turns_index",
        ),
        CheckConstraint("turn_index >= 1", name="ck_consultation_turns_index"),
        CheckConstraint(
            "response_type IN ('text', 'single_choice', 'multi_choice', 'number', "
            "'budget_range', 'date_or_timeline')",
            name="ck_consultation_turns_response_type",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    consultation_id: Mapped[str] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        index=True,
    )
    turn_index: Mapped[int] = mapped_column(Integer)
    target_objective: Mapped[str | None] = mapped_column(String(50), nullable=True)
    question: Mapped[str] = mapped_column(Text)
    response_type: Mapped[str] = mapped_column(String(30))
    choices_json: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    raw_answer: Mapped[object | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    consultation: Mapped[ConsultationModel] = relationship(back_populates="turns")


class DiscoveryBriefModel(Base):
    __tablename__ = "discovery_briefs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    consultation_id: Mapped[str] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    brief_json: Mapped[dict[str, object]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    consultation: Mapped[ConsultationModel] = relationship(back_populates="brief")
