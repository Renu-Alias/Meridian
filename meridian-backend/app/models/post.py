import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from app.database import Base

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", String, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", String, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
)


class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    body = Column(Text, default="")
    excerpt = Column(String, default="")
    author_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="draft")
    version = Column(String, default="v1.0")
    current_version_id = Column(String, nullable=True)
    fork_of_id = Column(String, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    is_mentored = Column(Boolean, default=False)
    impact_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    author = relationship("User", back_populates="posts")
    tags = relationship("Technology", secondary=post_tags)
    versions = relationship("PostVersion", back_populates="post", cascade="all, delete-orphan", foreign_keys="PostVersion.post_id")
    patches = relationship("Patch", back_populates="post", cascade="all, delete-orphan", foreign_keys="Patch.post_id")
    forks = relationship("Post", back_populates="fork_of")
    fork_of = relationship("Post", back_populates="forks", remote_side="Post.id")
    citations = relationship("Citation", back_populates="post", cascade="all, delete-orphan")
    claim_flags = relationship("ClaimFlag", back_populates="post", cascade="all, delete-orphan")
    qa_threads = relationship("QAThread", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")
    mentorship = relationship("MentorshipSubmission", back_populates="post", uselist=False)


class PostVersion(Base):
    __tablename__ = "post_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    version = Column(String, nullable=False)
    body = Column(Text, default="")
    diff = Column(Text, default="")
    patch_id = Column(String, nullable=True)
    author_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="versions", foreign_keys=[post_id])
    author = relationship("User")


class Patch(Base):
    __tablename__ = "patches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    submitter_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="")
    description = Column(Text, default="")
    diff = Column(Text, default="")
    status = Column(String, default="pending")
    reviewer_comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    post = relationship("Post", back_populates="patches", foreign_keys=[post_id])
    submitter = relationship("User")


class Citation(Base):
    __tablename__ = "citations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    anchor_text = Column(String, nullable=False)
    url = Column(String, nullable=False)
    citation_type = Column(String, default="link")
    position_start = Column(Integer, default=0)
    position_end = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="citations")


class ClaimFlag(Base):
    __tablename__ = "claim_flags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    flager_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    citation_id = Column(String, ForeignKey("citations.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, default="")
    status = Column(String, default="open")
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="claim_flags")
    flager = relationship("User")
    citation = relationship("Citation")
