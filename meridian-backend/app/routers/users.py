from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.skills import CredibilityScore, SkillsGraphEntry
from app.models.user import StackProfile, Technology, User
from app.schemas.skills import CredibilityScoreRead, SkillsGraphEntryRead
from app.schemas.user import (
    StackProfileUpdate,
    TechnologyCreate,
    TechnologyRead,
    UserRead,
    UserUpdate,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


def _user_to_read(user: User, db: Session) -> UserRead:
    stack = db.query(StackProfile).filter(StackProfile.user_id == user.id).all()
    return UserRead(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        bio=user.bio or "",
        avatar_url=user.avatar_url or "",
        role=user.role or "",
        seniority=user.seniority or "",
        github_username=user.github_username,
        linkedin_username=user.linkedin_username,
        recruiter_visible=user.recruiter_visible or False,
        is_mentor=user.is_mentor or False,
        created_at=user.created_at,
        stack=[s for s in stack],
    )


@router.get("/profile/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    skills = db.query(SkillsGraphEntry).filter(SkillsGraphEntry.user_id == user.id).all()
    cred = db.query(CredibilityScore).filter(CredibilityScore.user_id == user.id).first()
    return {
        "user": _user_to_read(user, db),
        "skills": [SkillsGraphEntryRead(skill_name=s.skill_name, depth=s.depth, source=s.source) for s in skills],
        "credibility": CredibilityScoreRead(
            score=cred.score if cred else 100.0,
            verified_claims=cred.verified_claims if cred else 0,
            flagged_claims=cred.flagged_claims if cred else 0,
            resolved_flags=cred.resolved_flags if cred else 0,
        ) if cred else CredibilityScoreRead(score=100.0, verified_claims=0, flagged_claims=0, resolved_flags=0),
    }


@router.put("/me")
def update_profile(
    update: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return _user_to_read(user, db)


@router.put("/me/stack")
def update_stack(
    update: StackProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(StackProfile).filter(StackProfile.user_id == user.id).delete()
    for tech in update.technologies:
        db.add(StackProfile(user_id=user.id, technology=tech, source="manual"))
    db.commit()
    stack = db.query(StackProfile).filter(StackProfile.user_id == user.id).all()
    return stack


@router.get("/me/stack")
def get_stack(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(StackProfile).filter(StackProfile.user_id == user.id).all()


@router.get("/technologies", response_model=list[TechnologyRead])
def list_technologies(db: Session = Depends(get_db)):
    return db.query(Technology).filter(Technology.is_approved == True).all()


@router.post("/technologies", response_model=TechnologyRead)
def create_technology(
    req: TechnologyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tech = Technology(name=req.name, category=req.category, is_approved=True)
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech
