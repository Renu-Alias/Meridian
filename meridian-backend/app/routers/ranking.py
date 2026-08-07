from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.models.skills import CredibilityScore
from app.models.user import StackProfile, User

router = APIRouter(prefix="/ranking", tags=["ranking"])


@router.get("/posts")
def ranking_posts(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    posts = (
        db.query(Post)
        .filter(Post.status == "published")
        .order_by(Post.impact_score.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": p.id,
            "title": p.title,
            "impact_score": p.impact_score or 0,
            "author": {
                "id": p.author.id,
                "username": p.author.username,
                "display_name": p.author.display_name,
                "avatar_url": p.author.avatar_url or "",
            } if p.author else None,
            "tags": [t.name for t in p.tags],
            "created_at": p.created_at.isoformat() if p.created_at else "",
            "published_at": p.published_at.isoformat() if p.published_at else "",
        }
        for p in posts
    ]


@router.get("/authors")
def ranking_authors(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    scores = (
        db.query(CredibilityScore)
        .order_by(CredibilityScore.score.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "user_id": s.user_id,
            "credibility_score": s.score,
            "verified_claims": s.verified_claims,
            "username": s.user.username if s.user else "",
            "display_name": s.user.display_name if s.user else "",
            "avatar_url": s.user.avatar_url or "" if s.user else "",
            "stack": [sp.technology for sp in db.query(StackProfile).filter(StackProfile.user_id == s.user_id).all()],
        }
        for s in scores
    ]
