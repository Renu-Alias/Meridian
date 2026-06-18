from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class StackProfileBase(BaseModel):
    technologies: str

class UserBase(BaseModel):
    username: str
    email: str
    bio: Optional[str] = None
    is_recruiter_visible: bool = False

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class WalletResponse(BaseModel):
    balance: float
    stripe_account_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
