"""add follows table

Revision ID: f4a8c1b2e9d5
Revises: b1c195e97352
Create Date: 2026-08-10 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f4a8c1b2e9d5"
down_revision: Union[str, None] = "b1c195e97352"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "follows",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("follower_id", sa.String(), nullable=False),
        sa.Column("followed_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("follower_id", "followed_id", name="uq_follows_follower_followed"),
        sa.ForeignKeyConstraint(["follower_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["followed_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_follows_follower_id"), "follows", ["follower_id"])
    op.create_index(op.f("ix_follows_followed_id"), "follows", ["followed_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_follows_followed_id"), "follows")
    op.drop_index(op.f("ix_follows_follower_id"), "follows")
    op.drop_table("follows")
