from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.post import AuthorBrief


class QAThreadCreate(BaseModel):
    question: str


class QAThreadAnswer(BaseModel):
    answer: str


class QAThreadRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    post_id: str
    questioner: AuthorBrief
    question: str
    answer: str
    answerer: Optional[AuthorBrief] = None
    is_answered: bool
    created_at: datetime
    answered_at: Optional[datetime] = None
