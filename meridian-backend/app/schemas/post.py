from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CitationCreate(BaseModel):
    anchor_text: str
    url: str
    citation_type: str = "link"
    position_start: int = 0
    position_end: int = 0


class CitationRead(BaseModel):
    id: str
    anchor_text: str
    url: str
    citation_type: str
    position_start: int
    position_end: int


class PostCreate(BaseModel):
    title: str
    body: str = ""
    excerpt: str = ""
    tags: list[str] = []
    is_mentored: bool = False


class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    excerpt: Optional[str] = None
    tags: Optional[list[str]] = None


class AuthorBrief(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: str


class PostRead(BaseModel):
    id: str
    title: str
    body: str
    excerpt: str
    author: AuthorBrief
    tags: list[str]
    status: str
    version: str
    fork_of_id: Optional[str] = None
    is_mentored: bool
    impact_score: int
    citations: list[CitationRead] = []
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    comment_count: int = 0
    fork_count: int = 0
    reaction_counts: dict = {}


class PatchCreate(BaseModel):
    title: str
    description: str = ""
    diff: str = ""


class PatchRead(BaseModel):
    id: str
    post_id: str
    submitter: AuthorBrief
    title: str
    description: str
    diff: str
    status: str
    reviewer_comment: str
    created_at: datetime
    updated_at: datetime


class PatchReview(BaseModel):
    status: str
    reviewer_comment: str = ""


class ClaimFlagCreate(BaseModel):
    citation_id: Optional[str] = None
    reason: str = ""


class ClaimFlagRead(BaseModel):
    id: str
    post_id: str
    flager: AuthorBrief
    citation_id: Optional[str]
    reason: str
    status: str
    created_at: datetime


class ForkRead(BaseModel):
    id: str
    source_post_id: str
    fork_post_id: str
    forker: AuthorBrief
    merge_suggestion_status: str
    created_at: datetime
