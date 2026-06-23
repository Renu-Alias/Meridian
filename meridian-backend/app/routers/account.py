import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interaction import Fork, Reaction
from app.models.mentorship import MentorshipSubmission
from app.models.notification import Notification
from app.models.post import Citation, ClaimFlag, Patch, Post, PostVersion
from app.models.qa import QAThread
from app.models.skills import CredibilityScore, SkillsGraphEntry
from app.models.user import StackProfile, User
from app.models.wallet import Transaction, Wallet
from app.services.auth import get_current_user

router = APIRouter(prefix="/account", tags=["account"])


@router.get("/export")
def export_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = {
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "display_name": user.display_name,
            "bio": user.bio,
            "role": user.role,
            "seniority": user.seniority,
            "created_at": user.created_at.isoformat() if user.created_at else "",
        },
        "stack": [
            {"technology": s.technology, "source": s.source}
            for s in db.query(StackProfile).filter(StackProfile.user_id == user.id).all()
        ],
        "posts": [
            {
                "id": p.id,
                "title": p.title,
                "status": p.status,
                "version": p.version,
                "published_at": p.published_at.isoformat() if p.published_at else "",
            }
            for p in db.query(Post).filter(Post.author_id == user.id).all()
        ],
        "wallet": {
            "balance": wallet.balance,
            "lifetime_paid": wallet.lifetime_paid,
            "transactions": [
                {"amount": t.amount, "type": t.transaction_type, "description": t.description, "created_at": t.created_at.isoformat() if t.created_at else ""}
                for t in db.query(Transaction).join(Wallet).filter(Wallet.user_id == user.id).all()
            ],
        } if (wallet := db.query(Wallet).filter(Wallet.user_id == user.id).first()) else {},
        "skills": [
            {"skill_name": s.skill_name, "depth": s.depth}
            for s in db.query(SkillsGraphEntry).filter(SkillsGraphEntry.user_id == user.id).all()
        ],
        "mentorship": [
            {
                "id": s.id,
                "status": s.status,
                "domain": s.domain,
                "created_at": s.created_at.isoformat() if s.created_at else "",
            }
            for s in db.query(MentorshipSubmission).filter(
                (MentorshipSubmission.author_id == user.id) | (MentorshipSubmission.mentor_id == user.id)
            ).all()
        ],
        "exported_at": datetime.utcnow().isoformat(),
    }
    return data


@router.delete("/delete")
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post_ids = [p.id for p in db.query(Post).filter(Post.author_id == user.id).all()]
    db.query(SkillsGraphEntry).filter(SkillsGraphEntry.user_id == user.id).delete()
    db.query(CredibilityScore).filter(CredibilityScore.user_id == user.id).delete()
    db.query(Wallet).filter(Wallet.user_id == user.id).delete()
    db.query(Notification).filter(Notification.user_id == user.id).delete()
    db.query(StackProfile).filter(StackProfile.user_id == user.id).delete()
    db.query(MentorshipSubmission).filter(
        (MentorshipSubmission.author_id == user.id) | (MentorshipSubmission.mentor_id == user.id)
    ).delete()
    db.query(Reaction).filter(Reaction.user_id == user.id).delete()
    db.query(Fork).filter(Fork.forker_id == user.id).delete()
    for pid in post_ids:
        db.query(Citation).filter(Citation.post_id == pid).delete()
        db.query(ClaimFlag).filter(ClaimFlag.post_id == pid).delete()
        db.query(Patch).filter(Patch.post_id == pid).delete()
        db.query(PostVersion).filter(PostVersion.post_id == pid).delete()
        db.query(QAThread).filter(QAThread.post_id == pid).delete()
    db.query(Post).filter(Post.author_id == user.id).delete()
    db.delete(user)
    db.commit()
    return {"detail": "Account permanently deleted"}
