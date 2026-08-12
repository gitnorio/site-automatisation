"""Revue humaine liée à une consultation observée sur le terrain."""

from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.discovery.models import ConsultationModel, new_uuid, utc_now


class FieldTestReviewModel(Base):
    __tablename__ = "field_test_reviews"
    __table_args__ = (
        CheckConstraint(
            "brief_usefulness BETWEEN 1 AND 5",
            name="ck_field_test_reviews_usefulness",
        ),
        CheckConstraint(
            "brief_preparedness BETWEEN 1 AND 5",
            name="ck_field_test_reviews_preparedness",
        ),
        CheckConstraint(
            "reviewer_role IN ('owner', 'strategist', 'account_manager', 'sales', 'other')",
            name="ck_field_test_reviews_role",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    consultation_id: Mapped[str] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    reviewer_role: Mapped[str] = mapped_column(String(30))
    observed_live: Mapped[bool] = mapped_column(Boolean)
    prospect_understood_without_help: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    felt_like_static_form: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    obvious_repetition: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    follow_ups_relevant: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    guardrail_issue: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    brief_usefulness: Mapped[int] = mapped_column(Integer)
    brief_preparedness: Mapped[int] = mapped_column(Integer)
    agency_would_use: Mapped[bool] = mapped_column(Boolean)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    consultation: Mapped[ConsultationModel] = relationship(
        back_populates="field_test_review"
    )
