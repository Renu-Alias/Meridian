import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.post import Post
from app.models.skills import CredibilityScore, SkillsGraphEntry
from app.models.user import Follow, StackProfile, Technology, User
from app.routers.posts import _post_to_read
from app.schemas.skills import CredibilityScoreRead, SkillsGraphEntryRead
from app.schemas.user import (
    StackProfileUpdate,
    TechnologyCreate,
    TechnologyRead,
    UserRead,
    UserUpdate,
)
from app.services.auth import get_current_user, get_current_user_optional
from app.services.notifications import create_follow_notification

router = APIRouter(prefix="/users", tags=["users"])


def _user_to_read(user: User, db: Session) -> UserRead:
    stack = db.query(StackProfile).filter(StackProfile.user_id == user.id).all()
    followers_count = db.query(Follow).filter(Follow.followed_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()
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
        followers_count=followers_count,
        following_count=following_count,
    )


@router.get("/profile/{username}")
def get_profile(
    username: str,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    skills = db.query(SkillsGraphEntry).filter(SkillsGraphEntry.user_id == user.id).all()
    cred = db.query(CredibilityScore).filter(CredibilityScore.user_id == user.id).first()
    followers_count = db.query(Follow).filter(Follow.followed_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()
    is_following = False
    if viewer is not None and viewer.id != user.id:
        is_following = (
            db.query(Follow)
            .filter(Follow.follower_id == viewer.id, Follow.followed_id == user.id)
            .first()
            is not None
        )
    return {
        "user": _user_to_read(user, db),
        "skills": [SkillsGraphEntryRead(skill_name=s.skill_name, depth=s.depth, source=s.source) for s in skills],
        "credibility": CredibilityScoreRead(
            score=cred.score if cred else 100.0,
            verified_claims=cred.verified_claims if cred else 0,
            flagged_claims=cred.flagged_claims if cred else 0,
            resolved_flags=cred.resolved_flags if cred else 0,
        ) if cred else CredibilityScoreRead(score=100.0, verified_claims=0, flagged_claims=0, resolved_flags=0),
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following,
    }


@router.post("/profile/{username}/follow")
def follow_user(
    username: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
    existing = db.query(Follow).filter(
        Follow.follower_id == user.id,
        Follow.followed_id == target.id,
    ).first()
    if not existing:
        db.add(Follow(follower_id=user.id, followed_id=target.id))
        db.commit()
        create_follow_notification(db, target.id, user.display_name or user.username, user.username)
    followers_count = db.query(Follow).filter(Follow.followed_id == target.id).count()
    return {"detail": "Now following", "is_following": True, "followers_count": followers_count}


@router.delete("/profile/{username}/follow")
def unfollow_user(
    username: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(Follow).filter(
        Follow.follower_id == user.id,
        Follow.followed_id == target.id,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    followers_count = db.query(Follow).filter(Follow.followed_id == target.id).count()
    return {"detail": "Unfollowed", "is_following": False, "followers_count": followers_count}


@router.get("/profile/{username}/posts")
def get_profile_posts(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    posts = (
        db.query(Post)
        .filter(Post.author_id == user.id, Post.status == "published")
        .order_by(Post.created_at.desc())
        .all()
    )
    return [_post_to_read(p, db) for p in posts]


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


ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
AVATAR_EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}
MAX_AVATAR_BYTES = 5 * 1024 * 1024


def _delete_old_avatar(user: User):
    url = user.avatar_url or ""
    if "/uploads/avatars/" not in url:
        return
    filename = os.path.basename(url.split("/uploads/avatars/")[-1])
    path = os.path.join(settings.AVATARS_DIR, filename)
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


def _write_file(path: str, data: bytes):
    with open(path, "wb") as f:
        f.write(data)


@router.post("/me/avatar")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP or GIF images are allowed")
    data = await file.read()
    if len(data) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 5 MB")
    os.makedirs(settings.AVATARS_DIR, exist_ok=True)
    filename = f"{user.id}_{uuid.uuid4().hex[:8]}.{AVATAR_EXT[file.content_type]}"
    await run_in_threadpool(_write_file, os.path.join(settings.AVATARS_DIR, filename), data)
    _delete_old_avatar(user)
    base = str(request.base_url).rstrip("/")
    user.avatar_url = f"{base}/uploads/avatars/{filename}"
    db.commit()
    db.refresh(user)
    return {"avatar_url": user.avatar_url}


@router.delete("/me/avatar")
def remove_avatar(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _delete_old_avatar(user)
    user.avatar_url = ""
    db.commit()
    db.refresh(user)
    return {"avatar_url": ""}


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
