import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class MentorshipSubmission(Base):
    __tablename__ = "mentorship_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="pending_match")
    domain = Column(String, default="")
    reviewer_notes = Column(Text, default="")
    reviewer_credit = Column(String, default="")
    matched_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="mentorship")
    author = relationship("User", back_populates="mentorship_submissions", foreign_keys=[author_id])
    mentor = relationship("User", back_populates="mentorship_reviews", foreign_keys=[mentor_id])
