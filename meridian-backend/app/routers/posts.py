from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interaction import Fork, Reaction
from app.models.post import (
    Citation,
    ClaimFlag,
    Patch,
    Post,
    PostVersion,
    post_tags,
)
from app.models.qa import QAThread
from app.models.user import Technology, User
from app.schemas.post import (
    AuthorBrief,
    CitationCreate,
    CitationRead,
    ClaimFlagCreate,
    ClaimFlagRead,
    ForkRead,
    PatchCreate,
    PatchRead,
    PatchReview,
    PostCreate,
    PostRead,
    PostUpdate,
)
from app.schemas.qa import QAThreadAnswer, QAThreadCreate, QAThreadRead
from app.services.auth import get_current_user
from app.services.matching import parse_skills_from_post
from app.services.notifications import (
    create_fork_notification,
    create_patch_notification,
    create_patch_reviewed_notification,
    create_qa_answered_notification,
    create_qa_notification,
)

router = APIRouter(prefix="/posts", tags=["posts"])


def _author_brief(user: User) -> AuthorBrief:
    return AuthorBrief(id=user.id, username=user.username, display_name=user.display_name, avatar_url=user.avatar_url or "")


def _post_to_read(post: Post, db: Session) -> PostRead:
    tags = [t.name for t in post.tags]
    citations = db.query(Citation).filter(Citation.post_id == post.id).all()
    comments = db.query(QAThread).filter(QAThread.post_id == post.id).count()
    forks = db.query(Fork).filter(Fork.source_post_id == post.id).count()
    reactions = db.query(Reaction).filter(Reaction.post_id == post.id).all()
    counts = {}
    for r in reactions:
        counts[r.reaction_type] = counts.get(r.reaction_type, 0) + 1
    return PostRead(
        id=post.id,
        title=post.title,
        body=post.body or "",
        excerpt=post.excerpt or "",
        author=_author_brief(post.author),
        tags=tags,
        status=post.status,
        version=post.version,
        fork_of_id=post.fork_of_id,
        is_mentored=post.is_mentored or False,
        impact_score=post.impact_score or 0,
        citations=[CitationRead(id=c.id, anchor_text=c.anchor_text, url=c.url, citation_type=c.citation_type, position_start=c.position_start, position_end=c.position_end) for c in citations],
        created_at=post.created_at,
        updated_at=post.updated_at,
        published_at=post.published_at,
        comment_count=comments,
        fork_count=forks,
        reaction_counts=counts,
    )


@router.post("")
def create_post(
    req: PostCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = Post(
        title=req.title,
        body=req.body,
        excerpt=req.excerpt,
        author_id=user.id,
        status="draft",
        is_mentored=req.is_mentored,
    )
    db.add(post)
    db.flush()
    for tech_name in req.tags:
        tech = db.query(Technology).filter(Technology.name == tech_name).first()
        if tech:
            post.tags.append(tech)
    skills = {s.skill_name: s.depth for s in user.skills}
    updated = parse_skills_from_post(req.body, skills)
    from app.models.skills import SkillsGraphEntry
    for skill_name, depth in updated.items():
        entry = db.query(SkillsGraphEntry).filter(
            SkillsGraphEntry.user_id == user.id,
            SkillsGraphEntry.skill_name == skill_name,
        ).first()
        if entry:
            entry.depth = depth
        else:
            db.add(SkillsGraphEntry(user_id=user.id, skill_name=skill_name, depth=depth))
    db.commit()
    db.refresh(post)
    return _post_to_read(post, db)


@router.get("")
def list_posts(
    status: str = "published",
    tag: str = "",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Post).filter(Post.author_id == user.id)
    if status:
        q = q.filter(Post.status == status)
    if tag:
        tech = db.query(Technology).filter(Technology.name == tag).first()
        if tech:
            q = q.filter(Post.tags.contains(tech))
    return [_post_to_read(p, db) for p in q.order_by(Post.created_at.desc()).all()]


@router.get("/{post_id}")
def get_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _post_to_read(post, db)


@router.put("/{post_id}")
def update_post(
    post_id: str,
    req: PostUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    if req.title is not None:
        post.title = req.title
    if req.body is not None:
        post.body = req.body
    if req.excerpt is not None:
        post.excerpt = req.excerpt
    if req.tags is not None:
        post.tags.clear()
        for tech_name in req.tags:
            tech = db.query(Technology).filter(Technology.name == tech_name).first()
            if tech:
                post.tags.append(tech)
    db.commit()
    db.refresh(post)
    return _post_to_read(post, db)


@router.post("/{post_id}/publish")
def publish_post(
    post_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    post.status = "published"
    post.published_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return _post_to_read(post, db)


@router.post("/{post_id}/citations", response_model=CitationRead)
def add_citation(
    post_id: str,
    req: CitationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    c = Citation(post_id=post_id, **req.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.post("/{post_id}/flags", response_model=ClaimFlagRead)
def flag_claim(
    post_id: str,
    req: ClaimFlagCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    flag = ClaimFlag(post_id=post_id, flager_id=user.id, **req.model_dump())
    db.add(flag)
    from app.models.skills import CredibilityScore
    score = db.query(CredibilityScore).filter(CredibilityScore.user_id == post.author_id).first()
    if not score:
        score = CredibilityScore(user_id=post.author_id)
        db.add(score)
    score.flagged_claims += 1
    db.commit()
    db.refresh(flag)
    return ClaimFlagRead(
        id=flag.id,
        post_id=flag.post_id,
        flager=_author_brief(user),
        citation_id=flag.citation_id,
        reason=flag.reason,
        status=flag.status,
        created_at=flag.created_at,
    )


@router.post("/{post_id}/patches", response_model=PatchRead)
def submit_patch(
    post_id: str,
    req: PatchCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    patch = Patch(post_id=post_id, submitter_id=user.id, **req.model_dump())
    db.add(patch)
    db.commit()
    db.refresh(patch)
    create_patch_notification(db, post.author_id, user.display_name, post.title, post.id)
    return PatchRead(
        id=patch.id,
        post_id=patch.post_id,
        submitter=_author_brief(user),
        title=patch.title,
        description=patch.description,
        diff=patch.diff,
        status=patch.status,
        reviewer_comment=patch.reviewer_comment,
        created_at=patch.created_at,
        updated_at=patch.updated_at,
    )


@router.get("/{post_id}/patches", response_model=list[PatchRead])
def list_patches(post_id: str, db: Session = Depends(get_db)):
    patches = db.query(Patch).filter(Patch.post_id == post_id).order_by(Patch.created_at.desc()).all()
    result = []
    for p in patches:
        sub = db.query(User).filter(User.id == p.submitter_id).first()
        result.append(PatchRead(
            id=p.id,
            post_id=p.post_id,
            submitter=_author_brief(sub) if sub else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
            title=p.title,
            description=p.description,
            diff=p.diff,
            status=p.status,
            reviewer_comment=p.reviewer_comment,
            created_at=p.created_at,
            updated_at=p.updated_at,
        ))
    return result


@router.put("/{post_id}/patches/{patch_id}/review", response_model=PatchRead)
def review_patch(
    post_id: str,
    patch_id: str,
    req: PatchReview,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Only the author can review patches")
    patch = db.query(Patch).filter(Patch.id == patch_id, Patch.post_id == post_id).first()
    if not patch:
        raise HTTPException(status_code=404, detail="Patch not found")
    patch.status = req.status
    patch.reviewer_comment = req.reviewer_comment
    if req.status == "approved":
        version_num = sum(1 for v in post.versions) + 1
        post.version = f"v{version_num}.0"
        old_body = post.body
        post.body = req_status = patch.diff or old_body
        new_version = PostVersion(
            post_id=post.id,
            version=post.version,
            body=post.body,
            diff=patch.diff,
            patch_id=patch.id,
            author_id=patch.submitter_id,
            notes=f"Patch approved: {patch.title}",
        )
        db.add(new_version)
    db.commit()
    db.refresh(patch)
    create_patch_reviewed_notification(db, patch.submitter_id, req.status, post.title, post.id)
    sub = db.query(User).filter(User.id == patch.submitter_id).first()
    return PatchRead(
        id=patch.id,
        post_id=patch.post_id,
        submitter=_author_brief(sub) if sub else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
        title=patch.title,
        description=patch.description,
        diff=patch.diff,
        status=patch.status,
        reviewer_comment=patch.reviewer_comment,
        created_at=patch.created_at,
        updated_at=patch.updated_at,
    )


@router.get("/{post_id}/versions", response_model=list[dict])
def list_versions(post_id: str, db: Session = Depends(get_db)):
    versions = db.query(PostVersion).filter(PostVersion.post_id == post_id).order_by(PostVersion.created_at.desc()).all()
    return [
        {
            "id": v.id,
            "version": v.version,
            "notes": v.notes,
            "author_username": db.query(User).filter(User.id == v.author_id).first().username if v.author_id else "original",
            "created_at": v.created_at.isoformat() if v.created_at else "",
        }
        for v in versions
    ]


@router.post("/{post_id}/fork")
def fork_post(
    post_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original = db.query(Post).filter(Post.id == post_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Post not found")
    fork = Post(
        title=f"Fork: {original.title}",
        body=original.body,
        excerpt=original.excerpt,
        author_id=user.id,
        status="draft",
        fork_of_id=original.id,
    )
    db.add(fork)
    db.flush()
    for tag in original.tags:
        fork.tags.append(tag)
    fork_link = Fork(source_post_id=original.id, fork_post_id=fork.id, forker_id=user.id)
    db.add(fork_link)
    db.commit()
    db.refresh(fork)
    create_fork_notification(db, original.author_id, user.display_name, original.title, fork.id)
    return _post_to_read(fork, db)


@router.get("/{post_id}/forks", response_model=list[ForkRead])
def list_forks(post_id: str, db: Session = Depends(get_db)):
    forks = db.query(Fork).filter(Fork.source_post_id == post_id).all()
    result = []
    for f in forks:
        forker = db.query(User).filter(User.id == f.forker_id).first()
        result.append(ForkRead(
            id=f.id,
            source_post_id=f.source_post_id,
            fork_post_id=f.fork_post_id,
            forker=_author_brief(forker) if forker else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
            merge_suggestion_status=f.merge_suggestion_status,
            created_at=f.created_at,
        ))
    return result


@router.post("/{post_id}/qa", response_model=QAThreadRead)
def ask_question(
    post_id: str,
    req: QAThreadCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    thread = QAThread(post_id=post_id, questioner_id=user.id, question=req.question)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    create_qa_notification(db, post.author_id, user.display_name, post.id)
    return QAThreadRead(
        id=thread.id,
        post_id=thread.post_id,
        questioner=_author_brief(user),
        question=thread.question,
        answer="",
        answerer=None,
        is_answered=False,
        created_at=thread.created_at,
    )


@router.get("/{post_id}/qa", response_model=list[QAThreadRead])
def list_qa(post_id: str, db: Session = Depends(get_db)):
    threads = db.query(QAThread).filter(QAThread.post_id == post_id).order_by(QAThread.created_at.desc()).all()
    result = []
    for t in threads:
        questioner = db.query(User).filter(User.id == t.questioner_id).first()
        answerer = db.query(User).filter(User.id == t.answerer_id).first() if t.answerer_id else None
        result.append(QAThreadRead(
            id=t.id,
            post_id=t.post_id,
            questioner=_author_brief(questioner) if questioner else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
            question=t.question,
            answer=t.answer or "",
            answerer=_author_brief(answerer) if answerer else None,
            is_answered=t.is_answered or False,
            created_at=t.created_at,
            answered_at=t.answered_at,
        ))
    return result


@router.put("/{post_id}/qa/{thread_id}/answer", response_model=QAThreadRead)
def answer_question(
    post_id: str,
    thread_id: str,
    req: QAThreadAnswer,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Only the author can answer")
    thread = db.query(QAThread).filter(QAThread.id == thread_id, QAThread.post_id == post_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="QA thread not found")
    thread.answer = req.answer
    thread.answerer_id = user.id
    thread.is_answered = True
    thread.answered_at = datetime.utcnow()
    thread.is_indexed = True
    db.commit()
    db.refresh(thread)
    create_qa_answered_notification(db, thread.questioner_id, post.title, post.id)
    questioner = db.query(User).filter(User.id == thread.questioner_id).first()
    return QAThreadRead(
        id=thread.id,
        post_id=thread.post_id,
        questioner=_author_brief(questioner) if questioner else _author_brief(User(id="", username="unknown", display_name="Unknown", avatar_url="")),
        question=thread.question,
        answer=thread.answer,
        answerer=_author_brief(user),
        is_answered=True,
        created_at=thread.created_at,
        answered_at=thread.answered_at,
    )


@router.get("/{post_id}/faq", response_model=list[dict])
def get_faq(post_id: str, db: Session = Depends(get_db)):
    threads = db.query(QAThread).filter(
        QAThread.post_id == post_id,
        QAThread.is_answered == True,
    ).all()
    return [
        {"question": t.question, "answer": t.answer, "answered_at": t.answered_at.isoformat() if t.answered_at else ""}
        for t in threads
    ]
