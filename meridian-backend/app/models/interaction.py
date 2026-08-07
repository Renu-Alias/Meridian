import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reaction_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="reactions")
    user = relationship("User")


class Fork(Base):
    __tablename__ = "forks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    fork_post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    forker_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    merge_suggestion_status = Column(String, default="none")
    created_at = Column(DateTime, default=datetime.utcnow)

    source_post = relationship("Post", foreign_keys=[source_post_id])
    fork_post = relationship("Post", foreign_keys=[fork_post_id])
    forker = relationship("User")
