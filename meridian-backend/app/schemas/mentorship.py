from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.post import AuthorBrief


class MentorshipSubmissionCreate(BaseModel):
    domain: str = ""


class MentorshipSubmissionRead(BaseModel):
    id: str
    post_id: str
    author: AuthorBrief
    mentor: Optional[AuthorBrief] = None
    status: str
    domain: str
    reviewer_notes: str
    reviewer_credit: str
    created_at: datetime
    matched_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None


class MentorshipReview(BaseModel):
    status: str
    reviewer_notes: str = ""
    reviewer_credit: str = ""
