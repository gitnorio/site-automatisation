"""Add field test reviews.

Revision ID: 20260811_0003
Revises: 20260811_0002
Create Date: 2026-08-11
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260811_0003"
down_revision: str | None = "20260811_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "field_test_reviews",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("consultation_id", sa.String(length=36), nullable=False),
        sa.Column("reviewer_role", sa.String(length=30), nullable=False),
        sa.Column("observed_live", sa.Boolean(), nullable=False),
        sa.Column("prospect_understood_without_help", sa.Boolean(), nullable=True),
        sa.Column("felt_like_static_form", sa.Boolean(), nullable=True),
        sa.Column("obvious_repetition", sa.Boolean(), nullable=True),
        sa.Column("follow_ups_relevant", sa.Boolean(), nullable=True),
        sa.Column("guardrail_issue", sa.Boolean(), nullable=True),
        sa.Column("brief_usefulness", sa.Integer(), nullable=False),
        sa.Column("brief_preparedness", sa.Integer(), nullable=False),
        sa.Column("agency_would_use", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "brief_usefulness BETWEEN 1 AND 5",
            name="ck_field_test_reviews_usefulness",
        ),
        sa.CheckConstraint(
            "brief_preparedness BETWEEN 1 AND 5",
            name="ck_field_test_reviews_preparedness",
        ),
        sa.CheckConstraint(
            "reviewer_role IN ('owner', 'strategist', 'account_manager', 'sales', 'other')",
            name="ck_field_test_reviews_role",
        ),
        sa.ForeignKeyConstraint(
            ["consultation_id"], ["consultations.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consultation_id"),
    )
    op.create_index(
        "ix_field_test_reviews_consultation_id",
        "field_test_reviews",
        ["consultation_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_table("field_test_reviews")
