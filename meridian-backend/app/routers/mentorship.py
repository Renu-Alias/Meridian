from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.mentorship import MentorshipSubmission
from app.models.post import Post
from app.models.user import StackProfile, User
from app.routers.posts import _author_brief
from app.schemas.mentorship import (
    MentorshipReview,
    MentorshipSubmissionCreate,
    MentorshipSubmissionRead,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/mentored", tags=["mentorship"])


@router.post("", response_model=MentorshipSubmissionRead)
def submit_to_mentored_track(
    post_id: str,
    req: MentorshipSubmissionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    existing = db.query(MentorshipSubmission).filter(MentorshipSubmission.post_id == post_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already submitted")
    post.is_mentored = True
    sub = MentorshipSubmission(post_id=post_id, author_id=user.id, domain=req.domain)
    db.add(sub)
    db.flush()
    mentors = db.query(User).filter(User.is_mentor == True, User.id != user.id).all()
    domain_lower = req.domain.lower() if req.domain else ""
    best_mentor = None
    best_score = 0
    for mentor in mentors:
        m_stack = [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == mentor.id).all()]
        score = sum(1 for t in m_stack if domain_lower in t.lower())
        if score > best_score:
            best_score = score
            best_mentor = mentor
    if best_mentor:
        sub.mentor_id = best_mentor.id
        sub.status = "pending_review"
        sub.matched_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)
    return MentorshipSubmissionRead(
        id=sub.id,
        post_id=sub.post_id,
        author=_author_brief(user),
        mentor=None,
        status=sub.status,
        domain=sub.domain,
        reviewer_notes=sub.reviewer_notes,
        reviewer_credit=sub.reviewer_credit,
        created_at=sub.created_at,
    )


@router.get("", response_model=list[MentorshipSubmissionRead])
def list_submissions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    subs = db.query(MentorshipSubmission).filter(
        (MentorshipSubmission.author_id == user.id) | (MentorshipSubmission.mentor_id == user.id)
    ).order_by(MentorshipSubmission.created_at.desc()).all()
    result = []
    for s in subs:
        author = db.query(User).filter(User.id == s.author_id).first()
        mentor = db.query(User).filter(User.id == s.mentor_id).first() if s.mentor_id else None
        result.append(MentorshipSubmissionRead(
            id=s.id,
            post_id=s.post_id,
            author=_author_brief(author) if author else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
            mentor=_author_brief(mentor) if mentor else None,
            status=s.status,
            domain=s.domain,
            reviewer_notes=s.reviewer_notes,
            reviewer_credit=s.reviewer_credit,
            created_at=s.created_at,
            matched_at=s.matched_at,
            reviewed_at=s.reviewed_at,
        ))
    return result


@router.put("/{submission_id}/review", response_model=MentorshipSubmissionRead)
def review_submission(
    submission_id: str,
    req: MentorshipReview,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(MentorshipSubmission).filter(MentorshipSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.status = req.status
    sub.reviewer_notes = req.reviewer_notes
    sub.reviewer_credit = req.reviewer_credit
    if req.status in ("approved", "changes_requested"):
        sub.mentor_id = user.id
        from datetime import datetime
        sub.reviewed_at = datetime.utcnow()
    if req.status == "approved":
        post = db.query(Post).filter(Post.id == sub.post_id).first()
        if post:
            post.status = "published"
            post.is_mentored = True
            from datetime import datetime
            post.published_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)
    author = db.query(User).filter(User.id == sub.author_id).first()
    mentor = db.query(User).filter(User.id == sub.mentor_id).first() if sub.mentor_id else None
    return MentorshipSubmissionRead(
        id=sub.id,
        post_id=sub.post_id,
        author=_author_brief(author) if author else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
        mentor=_author_brief(mentor) if mentor else None,
        status=sub.status,
        domain=sub.domain,
        reviewer_notes=sub.reviewer_notes,
        reviewer_credit=sub.reviewer_credit,
        created_at=sub.created_at,
        matched_at=sub.matched_at,
        reviewed_at=sub.reviewed_at,
    )
