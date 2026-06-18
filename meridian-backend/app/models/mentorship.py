from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class MentorshipSubmission(Base):
    __tablename__ = "mentorship_submissions"

    id = Column(Integer, primary_key=True, index=True)
    mentee_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    status = Column(String, default="pending_match") # pending_match, in_review, approved, published
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
