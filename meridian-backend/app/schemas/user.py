from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class StackProfileRead(BaseModel):
    id: str
    technology: str
    source: str
    created_at: datetime


class UserCreate(BaseModel):
    email: str
    username: str
    display_name: str
    password: Optional[str] = None


class UserRead(BaseModel):
    id: str
    email: str
    username: str
    display_name: str
    bio: str
    avatar_url: str
    role: str
    seniority: str
    github_username: Optional[str] = None
    linkedin_username: Optional[str] = None
    recruiter_visible: bool
    is_mentor: bool
    created_at: datetime
    stack: list[StackProfileRead] = []


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    seniority: Optional[str] = None
    recruiter_visible: Optional[bool] = None


class StackProfileUpdate(BaseModel):
    technologies: list[str]


class TechnologyRead(BaseModel):
    id: str
    name: str
    category: str
    is_approved: bool


class TechnologyCreate(BaseModel):
    name: str
    category: str = ""
