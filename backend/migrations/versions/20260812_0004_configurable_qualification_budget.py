"""Make the organization qualification budget configurable.

Revision ID: 20260812_0004
Revises: 20260811_0003
Create Date: 2026-08-12
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260812_0004"
down_revision: str | None = "20260811_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "organizations",
        sa.Column(
            "minimum_qualifying_budget_cad",
            sa.Integer(),
            server_default="2500",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "ck_organizations_minimum_qualifying_budget",
        "organizations",
        "minimum_qualifying_budget_cad BETWEEN 0 AND 10000000",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_organizations_minimum_qualifying_budget",
        "organizations",
        type_="check",
    )
    op.drop_column("organizations", "minimum_qualifying_budget_cad")
