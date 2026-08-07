import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class QAThread(Base):
    __tablename__ = "qa_threads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    questioner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, default="")
    answerer_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_answered = Column(Boolean, default=False)
    is_indexed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime, nullable=True)

    post = relationship("Post", back_populates="qa_threads")
    questioner = relationship("User", foreign_keys=[questioner_id])
    answerer = relationship("User", foreign_keys=[answerer_id])
