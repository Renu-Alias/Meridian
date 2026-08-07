from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.skills import CredibilityScore, SkillsGraphEntry
from app.models.user import StackProfile, Technology, User

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


@router.get("/search")
def recruiter_search(
    technology: str = Query("", description="Filter by technology name"),
    min_credibility: float = Query(0.0, ge=0.0, le=100.0),
    min_depth: float = Query(0.0, ge=0.0, le=100.0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.recruiter_visible == True).all()
    results = []
    for user in users:
        skills = db.query(SkillsGraphEntry).filter(SkillsGraphEntry.user_id == user.id).all()
        cred = db.query(CredibilityScore).filter(CredibilityScore.user_id == user.id).first()
        cred_score = cred.score if cred else 100.0
        stack = [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == user.id).all()]
        matches_tech = True
        if technology:
            matches_tech = any(technology.lower() in t.lower() for t in stack) or any(technology.lower() in s.skill_name.lower() for s in skills)
        matches_cred = cred_score >= min_credibility
        matches_depth = True
        if min_depth > 0 and skills:
            matches_depth = any(s.depth >= min_depth for s in skills)
        if matches_tech and matches_cred and matches_depth:
            results.append({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "display_name": user.display_name,
                    "avatar_url": user.avatar_url,
                    "bio": user.bio,
                    "role": user.role,
                    "seniority": user.seniority,
                },
                "stack": stack,
                "skills": [{"skill_name": s.skill_name, "depth": s.depth} for s in skills],
                "credibility_score": cred_score,
            })
    results.sort(key=lambda r: r["credibility_score"], reverse=True)
    return results[:limit]
