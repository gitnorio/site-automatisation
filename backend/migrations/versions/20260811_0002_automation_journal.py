"""Add the automation delivery journal.

Revision ID: 20260811_0002
Revises: 20260811_0001
Create Date: 2026-08-11
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260811_0002"
down_revision: str | None = "20260811_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "automation_deliveries",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("consultation_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("connector_name", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("result_json", sa.JSON(), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("attempt_count >= 0", name="ck_automation_deliveries_attempt_count"),
        sa.CheckConstraint(
            "status IN ('pending', 'delivering', 'succeeded', 'failed', 'skipped')",
            name="ck_automation_deliveries_status",
        ),
        sa.ForeignKeyConstraint(
            ["consultation_id"], ["consultations.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "consultation_id",
            "event_type",
            "connector_name",
            name="uq_automation_deliveries_event_connector",
        ),
    )
    op.create_index(
        "ix_automation_deliveries_consultation_id",
        "automation_deliveries",
        ["consultation_id"],
    )
    op.create_index(
        "ix_automation_deliveries_status",
        "automation_deliveries",
        ["status"],
    )
    op.create_table(
        "automation_attempts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("delivery_id", sa.String(length=36), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("http_status", sa.Integer(), nullable=True),
        sa.Column("external_id", sa.String(length=200), nullable=True),
        sa.Column("error_type", sa.String(length=120), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("attempt_number >= 1", name="ck_automation_attempts_number"),
        sa.CheckConstraint(
            "status IN ('started', 'succeeded', 'failed')",
            name="ck_automation_attempts_status",
        ),
        sa.ForeignKeyConstraint(
            ["delivery_id"], ["automation_deliveries.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "delivery_id",
            "attempt_number",
            name="uq_automation_attempts_delivery_number",
        ),
    )
    op.create_index(
        "ix_automation_attempts_delivery_id",
        "automation_attempts",
        ["delivery_id"],
    )


def downgrade() -> None:
    op.drop_table("automation_attempts")
    op.drop_table("automation_deliveries")
