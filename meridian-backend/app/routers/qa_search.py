from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.qa import QAThread

router = APIRouter(prefix="/qa", tags=["qa"])


@router.get("/search")
def search_qa(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = f"%{q}%"
    threads = db.query(QAThread).filter(
        QAThread.is_indexed == True,
        or_(
            QAThread.question.ilike(query),
            QAThread.answer.ilike(query),
        ),
    ).order_by(QAThread.answered_at.desc()).limit(limit).all()
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
