from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    source_link = Column(String, nullable=False)
    claim_text = Column(Text, nullable=False)

class ClaimFlag(Base):
    __tablename__ = "claim_flags"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"))
    claim_text = Column(Text, nullable=False)
    status = Column(String, default="open") # open, resolved

class QAThread(Base):
    __tablename__ = "qa_threads"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    asker_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)

    post = relationship("Post", back_populates="qa_threads")

class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    reaction_type = Column(String) # bookmark, share, used_at_work
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="reactions")
