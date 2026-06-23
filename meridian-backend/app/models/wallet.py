import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Float, default=0.0)
    pending = Column(Float, default=0.0)
    lifetime_paid = Column(Float, default=0.0)
    stripe_account_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(String, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)
    description = Column(Text, default="")
    stripe_payout_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")
    post = relationship("Post")
