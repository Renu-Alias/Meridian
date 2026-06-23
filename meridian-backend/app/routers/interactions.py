from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interaction import Reaction
from app.models.post import Post
from app.models.user import User
from app.services.auth import get_current_user
from app.services.wallet_service import credit_wallet

router = APIRouter(prefix="/posts/{post_id}/reactions", tags=["interactions"])

REACTION_WEIGHTS = {
    "bookmark": 0.05,
    "share_internal": 0.10,
    "used_at_work": 0.50,
}


@router.post("")
def add_reaction(
    post_id: str,
    reaction_type: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.user_id == user.id,
        Reaction.reaction_type == reaction_type,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"detail": "Reaction removed", "active": False}
    reaction = Reaction(post_id=post_id, user_id=user.id, reaction_type=reaction_type)
    db.add(reaction)
    if reaction_type in REACTION_WEIGHTS:
        amount = REACTION_WEIGHTS[reaction_type]
        if amount > 0:
            credit_wallet(
                user_id=post.author_id,
                post_id=post.id,
                amount=amount,
                transaction_type=reaction_type,
                description=f"{reaction_type} reaction on '{post.title}'",
                db=db,
            )
    reaction_count = db.query(Reaction).filter(Reaction.post_id == post_id, Reaction.reaction_type == reaction_type).count()
    post.impact_score = (post.impact_score or 0) + 1
    db.commit()
    return {"detail": "Reaction added", "active": True, "count": reaction_count}


@router.get("")
def get_reactions(
    post_id: str,
    db: Session = Depends(get_db),
):
    reactions = db.query(Reaction).filter(Reaction.post_id == post_id).all()
    counts = {}
    for r in reactions:
        counts[r.reaction_type] = counts.get(r.reaction_type, 0) + 1
    return counts
