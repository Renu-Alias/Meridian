from pydantic import BaseModel


class SkillsGraphEntryRead(BaseModel):
    skill_name: str
    depth: float
    source: str


class CredibilityScoreRead(BaseModel):
    score: float
    verified_claims: int
    flagged_claims: int
    resolved_flags: int
