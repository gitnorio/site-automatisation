"""Journal durable des livraisons et tentatives d'automatisation."""

from datetime import datetime

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.discovery.models import ConsultationModel, new_uuid, utc_now


class AutomationDeliveryModel(Base):
    __tablename__ = "automation_deliveries"
    __table_args__ = (
        UniqueConstraint(
            "consultation_id",
            "event_type",
            "connector_name",
            name="uq_automation_deliveries_event_connector",
        ),
        CheckConstraint("attempt_count >= 0", name="ck_automation_deliveries_attempt_count"),
        CheckConstraint(
            "status IN ('pending', 'delivering', 'succeeded', 'failed', 'skipped')",
            name="ck_automation_deliveries_status",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    consultation_id: Mapped[str] = mapped_column(
        ForeignKey("consultations.id", ondelete="CASCADE"),
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(80))
    connector_name: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), index=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    payload_json: Mapped[dict[str, object]] = mapped_column(JSON)
    result_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    consultation: Mapped[ConsultationModel] = relationship(
        back_populates="automation_deliveries"
    )
    attempts: Mapped[list["AutomationAttemptModel"]] = relationship(
        back_populates="delivery",
        cascade="all, delete-orphan",
        order_by="AutomationAttemptModel.attempt_number",
    )


class AutomationAttemptModel(Base):
    __tablename__ = "automation_attempts"
    __table_args__ = (
        UniqueConstraint(
            "delivery_id",
            "attempt_number",
            name="uq_automation_attempts_delivery_number",
        ),
        CheckConstraint("attempt_number >= 1", name="ck_automation_attempts_number"),
        CheckConstraint(
            "status IN ('started', 'succeeded', 'failed')",
            name="ck_automation_attempts_status",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    delivery_id: Mapped[str] = mapped_column(
        ForeignKey("automation_deliveries.id", ondelete="CASCADE"),
        index=True,
    )
    attempt_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20))
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    external_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    error_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    delivery: Mapped[AutomationDeliveryModel] = relationship(back_populates="attempts")
