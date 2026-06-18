from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags = Column(String, nullable=True)

    author = relationship("User", back_populates="posts")
    versions = relationship("PostVersion", back_populates="post")
    forks = relationship("Fork", back_populates="post")
    reactions = relationship("Reaction", back_populates="post")
    qa_threads = relationship("QAThread", back_populates="post")

class PostVersion(Base):
    __tablename__ = "post_versions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    submitter_id = Column(Integer, ForeignKey("users.id"))
    diff_content = Column(Text, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="versions")

class Fork(Base):
    __tablename__ = "forks"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    forked_post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", foreign_keys=[post_id], back_populates="forks")
