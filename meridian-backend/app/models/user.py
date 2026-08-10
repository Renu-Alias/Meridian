import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=False)
    bio = Column(Text, default="")
    avatar_url = Column(String, default="")
    role = Column(String, default="engineer")
    seniority = Column(String, default="")
    github_id = Column(String, unique=True, nullable=True)
    github_username = Column(String, nullable=True)
    linkedin_id = Column(String, unique=True, nullable=True)
    linkedin_username = Column(String, nullable=True)
    recruiter_visible = Column(Boolean, default=False)
    password_hash = Column(String, default="")
    is_mentor = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stack_profiles = relationship("StackProfile", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credibility_score = relationship("CredibilityScore", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("SkillsGraphEntry", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    mentorship_submissions = relationship("MentorshipSubmission", back_populates="author", foreign_keys="MentorshipSubmission.author_id")
    mentorship_reviews = relationship("MentorshipSubmission", back_populates="mentor", foreign_keys="MentorshipSubmission.mentor_id")
    following = relationship(
        "Follow", back_populates="follower", foreign_keys="Follow.follower_id", cascade="all, delete-orphan"
    )
    followers = relationship(
        "Follow", back_populates="followed", foreign_keys="Follow.followed_id", cascade="all, delete-orphan"
    )


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follows_follower_followed"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    follower_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    followed_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    follower = relationship("User", back_populates="following", foreign_keys=[follower_id])
    followed = relationship("User", back_populates="followers", foreign_keys=[followed_id])


class StackProfile(Base):
    __tablename__ = "stack_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    technology = Column(String, nullable=False)
    source = Column(String, default="manual")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="stack_profiles")


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, default="")
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
