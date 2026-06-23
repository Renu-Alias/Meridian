from datetime import datetime

from pydantic import BaseModel


class ReactionCreate(BaseModel):
    reaction_type: str


class ReactionRead(BaseModel):
    id: str
    post_id: str
    user_id: str
    reaction_type: str
    created_at: datetime
