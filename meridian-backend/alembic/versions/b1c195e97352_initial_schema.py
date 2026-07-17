"""initial_schema

Revision ID: b1c195e97352
Revises:
Create Date: 2026-06-23 17:47:38.336837
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1c195e97352"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "technologies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True, server_default=""),
        sa.Column("is_approved", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_technologies_name"), "technologies", ["name"])

    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True, server_default=""),
        sa.Column("avatar_url", sa.String(), nullable=True, server_default=""),
        sa.Column("role", sa.String(), nullable=True, server_default="engineer"),
        sa.Column("seniority", sa.String(), nullable=True, server_default=""),
        sa.Column("github_id", sa.String(), nullable=True),
        sa.Column("github_username", sa.String(), nullable=True),
        sa.Column("linkedin_id", sa.String(), nullable=True),
        sa.Column("linkedin_username", sa.String(), nullable=True),
        sa.Column("recruiter_visible", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("password_hash", sa.String(), nullable=True, server_default=""),
        sa.Column("is_mentor", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("github_id"),
        sa.UniqueConstraint("linkedin_id"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "posts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=True, server_default=""),
        sa.Column("excerpt", sa.String(), nullable=True, server_default=""),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=True, server_default="draft"),
        sa.Column("version", sa.String(), nullable=True, server_default="v1.0"),
        sa.Column("current_version_id", sa.String(), nullable=True),
        sa.Column("fork_of_id", sa.String(), nullable=True),
        sa.Column("is_mentored", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("impact_score", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["fork_of_id"], ["posts.id"], ondelete="SET NULL"),
    )
    op.create_index(op.f("ix_posts_author_id"), "posts", ["author_id"])

    op.create_table(
        "citations",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("anchor_text", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("citation_type", sa.String(), nullable=True, server_default="link"),
        sa.Column("position_start", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("position_end", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_citations_post_id"), "citations", ["post_id"])

    op.create_table(
        "claim_flags",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("flager_id", sa.String(), nullable=False),
        sa.Column("citation_id", sa.String(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True, server_default=""),
        sa.Column("status", sa.String(), nullable=True, server_default="open"),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["flager_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["citation_id"], ["citations.id"], ondelete="SET NULL"),
    )
    op.create_index(op.f("ix_claim_flags_post_id"), "claim_flags", ["post_id"])

    op.create_table(
        "credibility_scores",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("score", sa.Float(), nullable=True, server_default="100.0"),
        sa.Column("verified_claims", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("flagged_claims", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("resolved_flags", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "mentorship_submissions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column("mentor_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True, server_default="pending_match"),
        sa.Column("domain", sa.String(), nullable=True, server_default=""),
        sa.Column("reviewer_notes", sa.Text(), nullable=True, server_default=""),
        sa.Column("reviewer_credit", sa.String(), nullable=True, server_default=""),
        sa.Column("matched_at", sa.DateTime(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["mentor_id"], ["users.id"], ondelete="SET NULL"),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("detail", sa.Text(), nullable=True, server_default=""),
        sa.Column("link", sa.String(), nullable=True, server_default=""),
        sa.Column("is_read", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"])

    op.create_table(
        "patches",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("submitter_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True, server_default=""),
        sa.Column("description", sa.Text(), nullable=True, server_default=""),
        sa.Column("diff", sa.Text(), nullable=True, server_default=""),
        sa.Column("status", sa.String(), nullable=True, server_default="pending"),
        sa.Column("reviewer_comment", sa.Text(), nullable=True, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["submitter_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_patches_post_id"), "patches", ["post_id"])

    op.create_table(
        "post_tags",
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("technology_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("post_id", "technology_id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["technology_id"], ["technologies.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "post_versions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=True, server_default=""),
        sa.Column("diff", sa.Text(), nullable=True, server_default=""),
        sa.Column("patch_id", sa.String(), nullable=True),
        sa.Column("author_id", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="SET NULL"),
    )

    op.create_table(
        "qa_threads",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("questioner_id", sa.String(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=True, server_default=""),
        sa.Column("answerer_id", sa.String(), nullable=True),
        sa.Column("is_answered", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("is_indexed", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("answered_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["questioner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["answerer_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index(op.f("ix_qa_threads_post_id"), "qa_threads", ["post_id"])

    op.create_table(
        "reactions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("reaction_type", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_reactions_post_id"), "reactions", ["post_id"])

    op.create_table(
        "skills_graph_entries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("skill_name", sa.String(), nullable=False),
        sa.Column("depth", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("source", sa.String(), nullable=True, server_default="auto"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_skills_graph_entries_user_id"), "skills_graph_entries", ["user_id"])

    op.create_table(
        "stack_profiles",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("technology", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=True, server_default="manual"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "forks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("source_post_id", sa.String(), nullable=False),
        sa.Column("fork_post_id", sa.String(), nullable=False),
        sa.Column("forker_id", sa.String(), nullable=False),
        sa.Column("merge_suggestion_status", sa.String(), nullable=True, server_default="none"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["source_post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["fork_post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["forker_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_forks_source_post_id"), "forks", ["source_post_id"])

    op.create_table(
        "wallets",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("balance", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("pending", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("lifetime_paid", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("wallet_id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("transaction_type", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="SET NULL"),
    )


def downgrade() -> None:
    op.drop_table("transactions")
    op.drop_table("wallets")
    op.drop_table("forks")
    op.drop_index(op.f("ix_forks_source_post_id"), "forks")
    op.drop_table("stack_profiles")
    op.drop_index(op.f("ix_skills_graph_entries_user_id"), "skills_graph_entries")
    op.drop_table("skills_graph_entries")
    op.drop_index(op.f("ix_reactions_post_id"), "reactions")
    op.drop_table("reactions")
    op.drop_index(op.f("ix_qa_threads_post_id"), "qa_threads")
    op.drop_table("qa_threads")
    op.drop_table("post_versions")
    op.drop_table("post_tags")
    op.drop_index(op.f("ix_patches_post_id"), "patches")
    op.drop_table("patches")
    op.drop_index(op.f("ix_notifications_user_id"), "notifications")
    op.drop_table("notifications")
    op.drop_table("mentorship_submissions")
    op.drop_table("credibility_scores")
    op.drop_index(op.f("ix_claim_flags_post_id"), "claim_flags")
    op.drop_table("claim_flags")
    op.drop_index(op.f("ix_citations_post_id"), "citations")
    op.drop_table("citations")
    op.drop_index(op.f("ix_posts_author_id"), "posts")
    op.drop_table("posts")
    op.drop_index(op.f("ix_users_username"), "users")
    op.drop_table("users")
    op.drop_index(op.f("ix_technologies_name"), "technologies")
    op.drop_table("technologies")
