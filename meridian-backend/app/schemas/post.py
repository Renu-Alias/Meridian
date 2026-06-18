from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class PostBase(BaseModel):
    title: str
    content: str
    tags: Optional[str] = None

class PostCreate(PostBase):
    is_published: bool = False

class PostResponse(PostBase):
    id: int
    author_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PatchCreate(BaseModel):
    diff_content: str

class PatchResponse(BaseModel):
    id: int
    post_id: int
    submitter_id: int
    diff_content: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ForkCreate(BaseModel):
    pass

class ReactionCreate(BaseModel):
    reaction_type: str
