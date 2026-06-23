from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TransactionRead(BaseModel):
    id: str
    post_id: Optional[str] = None
    amount: float
    transaction_type: str
    description: str
    created_at: datetime


class WalletRead(BaseModel):
    id: str
    balance: float
    pending: float
    lifetime_paid: float
    stripe_account_id: Optional[str] = None
    transactions: list[TransactionRead] = []
    updated_at: datetime
