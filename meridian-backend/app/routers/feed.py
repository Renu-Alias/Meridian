from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interaction import Reaction
from app.models.post import Post
from app.models.user import StackProfile, User
from app.routers.posts import _author_brief, _post_to_read
from app.services.auth import get_current_user
from app.services.matching import compute_relevance

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("")
def get_feed(
    filter: str = "for_your_stack",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    posts = db.query(Post).filter(Post.status == "published").order_by(Post.created_at.desc()).all()
    if filter == "for_your_stack":
        stack = [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == user.id).all()]
        scored = []
        for p in posts:
            tags = [t.name for t in p.tags]
            score = compute_relevance(tags, stack)
            scored.append((score, p))
        scored.sort(key=lambda x: -x[0])
        posts = [p for _, p in scored]
    elif filter == "trending":
        posts.sort(key=lambda p: p.impact_score or 0, reverse=True)
    return [_post_to_read(p, db) for p in posts]


@router.get("/discover")
def get_discover(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    all_posts = db.query(Post).filter(Post.status == "published").order_by(Post.impact_score.desc()).all()
    trending = all_posts[:5] if len(all_posts) >= 5 else all_posts
    mentors = db.query(User).filter(User.is_mentor == True).limit(5).all()
    return {
        "featured": _post_to_read(all_posts[0], db) if all_posts else None,
        "trending": [_post_to_read(p, db) for p in trending],
        "mentors": [
            {"id": m.id, "display_name": m.display_name, "username": m.username, "bio": m.bio, "avatar_url": m.avatar_url}
            for m in mentors
        ],
    }
