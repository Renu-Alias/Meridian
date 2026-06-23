from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.post import ClaimFlag
from app.models.skills import CredibilityScore
from app.models.user import User


def compute_credibility_score(user_id: str, db: Session) -> CredibilityScore:
    score = db.query(CredibilityScore).filter(CredibilityScore.user_id == user_id).first()
    if not score:
        score = CredibilityScore(user_id=user_id)
        db.add(score)
    total = score.verified_claims + score.flagged_claims
    if total > 0:
        score.score = round((score.verified_claims / total) * 100, 1)
    else:
        score.score = 100.0
    db.commit()
    db.refresh(score)
    return score
