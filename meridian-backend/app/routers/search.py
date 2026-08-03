from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.models.qa import QAThread
from app.models.user import StackProfile, Technology, User
from app.routers.posts import _post_to_read

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/posts")
def search_posts(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    posts = (
        db.query(Post)
        .filter(
            Post.status == "published",
            or_(
                Post.title.ilike(query),
                Post.body.ilike(query),
                Post.excerpt.ilike(query),
                Post.tags.any(Technology.name.ilike(query)),
            ),
        )
        .order_by(Post.impact_score.desc())
        .limit(limit)
        .all()
    )
    return {"total": len(posts), "items": [_post_to_read(p, db) for p in posts]}


@router.get("/users")
def search_users(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    users = (
        db.query(User)
        .filter(
            or_(
                User.username.ilike(query),
                User.display_name.ilike(query),
                User.bio.ilike(query),
            )
        )
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url or "",
            "role": u.role or "",
            "seniority": u.seniority or "",
            "bio": u.bio or "",
            "stack": [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == u.id).all()],
        }
        for u in users
    ]


def _published_count(db: Session, tech: Technology) -> int:
    return db.query(Post).filter(Post.status == "published", Post.tags.contains(tech)).count()


@router.get("/topics")
def search_topics(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    techs = (
        db.query(Technology)
        .filter(Technology.name.ilike(query))
        .order_by(Technology.name.asc())
        .limit(limit)
        .all()
    )
    return [
        {"name": t.name, "category": t.category, "count": _published_count(db, t)}
        for t in techs
    ]


@router.get("/suggest")
def suggest(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    topics = [
        {"name": t.name, "count": _published_count(db, t)}
        for t in db.query(Technology).filter(Technology.name.ilike(query)).limit(limit).all()
    ]
    users = [
        {
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url or "",
            "role": u.role or "",
            "stack": [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == u.id).all()],
        }
        for u in db.query(User)
        .filter(or_(User.username.ilike(query), User.display_name.ilike(query)))
        .limit(limit)
        .all()
    ]
    posts = [
        {
            "id": p.id,
            "title": p.title,
            "excerpt": p.excerpt,
            "author": {
                "id": p.author.id,
                "username": p.author.username,
                "display_name": p.author.display_name,
                "avatar_url": p.author.avatar_url or "",
            } if p.author else None,
            "tags": [t.name for t in p.tags],
        }
        for p in db.query(Post)
        .filter(
            Post.status == "published",
            or_(
                Post.title.ilike(query),
                Post.excerpt.ilike(query),
                Post.tags.any(Technology.name.ilike(query)),
            ),
        )
        .order_by(Post.impact_score.desc())
        .limit(limit)
        .all()
    ]
    return {"topics": topics, "users": users, "posts": posts}


@router.get("/qa")
def search_qa(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    threads = (
        db.query(QAThread)
        .filter(
            QAThread.is_indexed == True,
            or_(
                QAThread.question.ilike(query),
                QAThread.answer.ilike(query),
            ),
        )
        .order_by(QAThread.answered_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": t.id,
            "post_id": t.post_id,
            "question": t.question,
            "answer": t.answer,
            "is_answered": t.is_answered,
            "answered_at": t.answered_at.isoformat() if t.answered_at else "",
        }
        for t in threads
    ]
