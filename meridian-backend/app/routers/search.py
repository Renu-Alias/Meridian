from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.models.qa import QAThread

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
            ),
        )
        .order_by(Post.impact_score.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": p.id,
            "title": p.title,
            "excerpt": p.excerpt,
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
