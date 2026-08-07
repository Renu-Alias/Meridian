from pydantic import BaseModel


class SkillsGraphEntryRead(BaseModel):
    model_config = {"from_attributes": True}
    skill_name: str
    depth: float
    source: str


class CredibilityScoreRead(BaseModel):
    model_config = {"from_attributes": True}
    score: float
    verified_claims: int
    flagged_claims: int
    resolved_flags: int
