"""Create the initial contact and Discovery schema.

Revision ID: 20260811_0001
Revises:
Create Date: 2026-08-11
"""

from collections.abc import Callable, Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260811_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    _create_if_missing(
        "contact_requests",
        lambda: op.create_table(
            "contact_requests",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("company", sa.String(length=150), nullable=False),
            sa.Column("email", sa.String(length=254), nullable=False),
            sa.Column("phone", sa.String(length=30), nullable=True),
            sa.Column("company_size", sa.String(length=30), nullable=False),
            sa.Column("need_type", sa.String(length=40), nullable=False),
            sa.Column("tools", sa.String(length=500), nullable=True),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("contact_preference", sa.String(length=30), nullable=False),
            sa.Column("consent", sa.Boolean(), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        ),
        indexes=(("ix_contact_requests_email", ("email",)),),
    )
    _create_if_missing(
        "organizations",
        lambda: op.create_table(
            "organizations",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=150), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        ),
    )
    _create_if_missing(
        "blueprints",
        lambda: op.create_table(
            "blueprints",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("organization_id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("vertical", sa.String(length=40), nullable=False),
            sa.Column("version", sa.Integer(), nullable=False),
            sa.Column("config", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.CheckConstraint("vertical = 'marketing_agency'", name="ck_blueprints_vertical"),
            sa.CheckConstraint("version >= 1", name="ck_blueprints_version"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "organization_id",
                "name",
                "version",
                name="uq_blueprints_organization_name_version",
            ),
        ),
        indexes=(("ix_blueprints_organization_id", ("organization_id",)),),
    )
    _create_if_missing(
        "consultations",
        lambda: op.create_table(
            "consultations",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("organization_id", sa.String(length=36), nullable=False),
            sa.Column("blueprint_id", sa.String(length=36), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False),
            sa.Column("stop_reason", sa.String(length=40), nullable=True),
            sa.Column("question_count", sa.Integer(), nullable=False),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "question_count >= 0", name="ck_consultations_question_count"
            ),
            sa.CheckConstraint(
                "status IN ('not_started', 'in_progress', 'completed', 'abandoned')",
                name="ck_consultations_status",
            ),
            sa.CheckConstraint(
                "stop_reason IS NULL OR stop_reason IN "
                "('all_required_objectives_complete', 'question_limit_reached', "
                "'prospect_abandoned')",
                name="ck_consultations_stop_reason",
            ),
            sa.ForeignKeyConstraint(
                ["blueprint_id"], ["blueprints.id"], ondelete="RESTRICT"
            ),
            sa.ForeignKeyConstraint(
                ["organization_id"], ["organizations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        ),
        indexes=(
            ("ix_consultations_blueprint_id", ("blueprint_id",)),
            ("ix_consultations_organization_id", ("organization_id",)),
            ("ix_consultations_status", ("status",)),
        ),
    )
    _create_if_missing(
        "consultation_objectives",
        lambda: op.create_table(
            "consultation_objectives",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("consultation_id", sa.String(length=36), nullable=False),
            sa.Column("objective_key", sa.String(length=50), nullable=False),
            sa.Column("required", sa.Boolean(), nullable=False),
            sa.Column("state", sa.String(length=20), nullable=False),
            sa.Column("value_json", sa.JSON(), nullable=True),
            sa.Column("confidence", sa.Float(), nullable=True),
            sa.Column("source", sa.String(length=20), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
                name="ck_consultation_objectives_confidence",
            ),
            sa.CheckConstraint(
                "state IN ('unknown', 'partial', 'confirmed', 'contradiction', 'incomplete')",
                name="ck_consultation_objectives_state",
            ),
            sa.CheckConstraint(
                "source IS NULL OR source IN ('answer', 'system')",
                name="ck_consultation_objectives_source",
            ),
            sa.ForeignKeyConstraint(
                ["consultation_id"], ["consultations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "consultation_id",
                "objective_key",
                name="uq_consultation_objectives_key",
            ),
        ),
        indexes=(
            ("ix_consultation_objectives_consultation_id", ("consultation_id",)),
        ),
    )
    _create_if_missing(
        "consultation_turns",
        lambda: op.create_table(
            "consultation_turns",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("consultation_id", sa.String(length=36), nullable=False),
            sa.Column("turn_index", sa.Integer(), nullable=False),
            sa.Column("target_objective", sa.String(length=50), nullable=True),
            sa.Column("question", sa.Text(), nullable=False),
            sa.Column("response_type", sa.String(length=30), nullable=False),
            sa.Column("choices_json", sa.JSON(), nullable=True),
            sa.Column("raw_answer", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("answered_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint("turn_index >= 1", name="ck_consultation_turns_index"),
            sa.CheckConstraint(
                "response_type IN ('text', 'single_choice', 'multi_choice', 'number', "
                "'budget_range', 'date_or_timeline')",
                name="ck_consultation_turns_response_type",
            ),
            sa.ForeignKeyConstraint(
                ["consultation_id"], ["consultations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "consultation_id",
                "turn_index",
                name="uq_consultation_turns_index",
            ),
        ),
        indexes=(("ix_consultation_turns_consultation_id", ("consultation_id",)),),
    )
    _create_if_missing(
        "discovery_briefs",
        lambda: op.create_table(
            "discovery_briefs",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("consultation_id", sa.String(length=36), nullable=False),
            sa.Column("brief_json", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["consultation_id"], ["consultations.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        ),
        indexes=(
            (
                "ix_discovery_briefs_consultation_id",
                ("consultation_id",),
                True,
            ),
        ),
    )


def downgrade() -> None:
    for table_name in (
        "discovery_briefs",
        "consultation_turns",
        "consultation_objectives",
        "consultations",
        "blueprints",
        "organizations",
        "contact_requests",
    ):
        if sa.inspect(op.get_bind()).has_table(table_name):
            op.drop_table(table_name)


def _create_if_missing(
    table_name: str,
    create_table: Callable[[], object],
    *,
    indexes: tuple[
        tuple[str, tuple[str, ...]] | tuple[str, tuple[str, ...], bool], ...
    ] = (),
) -> None:
    if sa.inspect(op.get_bind()).has_table(table_name):
        return
    create_table()
    for index in indexes:
        index_name, columns, *unique = index
        op.create_index(index_name, table_name, list(columns), unique=bool(unique and unique[0]))
