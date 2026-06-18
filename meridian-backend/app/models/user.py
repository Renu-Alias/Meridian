from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    bio = Column(String, nullable=True)
    is_recruiter_visible = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="author")
    stack_profile = relationship("StackProfile", back_populates="user", uselist=False)
    skills = relationship("SkillsGraphEntry", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)

class StackProfile(Base):
    __tablename__ = "stack_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    technologies = Column(String)  # Stored as comma-separated or JSON string for simplicity
    
    user = relationship("User", back_populates="stack_profile")

class SkillsGraphEntry(Base):
    __tablename__ = "skills_graph_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    technology = Column(String, index=True)
    depth_score = Column(Float, default=0.0)

    user = relationship("User", back_populates="skills")

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Float, default=0.0)
    stripe_account_id = Column(String, nullable=True)

    user = relationship("User", back_populates="wallet")
