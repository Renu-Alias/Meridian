from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: str,
    category: str,
    title: str,
    detail: str = "",
    link: str = "",
) -> Notification:
    notif = Notification(
        user_id=user_id,
        category=category,
        title=title,
        detail=detail,
        link=link,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def create_patch_notification(db: Session, post_author_id: str, submitter_name: str, post_title: str, post_id: str):
    return create_notification(
        db=db,
        user_id=post_author_id,
        category="Patches",
        title=f"New patch submitted by {submitter_name}",
        detail=f"A patch was submitted for '{post_title}'",
        link=f"/posts/{post_id}/patches",
    )


def create_patch_reviewed_notification(db: Session, submitter_id: str, status: str, post_title: str, post_id: str):
    return create_notification(
        db=db,
        user_id=submitter_id,
        category="Patches",
        title=f"Patch {status} on '{post_title}'",
        detail=f"Your patch was {status} by the author",
        link=f"/posts/{post_id}",
    )


def create_fork_notification(db: Session, original_author_id: str, forker_name: str, post_title: str, fork_id: str):
    return create_notification(
        db=db,
        user_id=original_author_id,
        category="Forks",
        title=f"{forker_name} forked your post",
        detail=f"'{post_title}' was forked with attribution chain preserved",
        link=f"/posts/{fork_id}",
    )


def create_qa_notification(db: Session, post_author_id: str, questioner_name: str, post_id: str):
    return create_notification(
        db=db,
        user_id=post_author_id,
        category="Q&A",
        title=f"New question from {questioner_name}",
        detail="A reader asked a question on your post",
        link=f"/posts/{post_id}",
    )


def create_qa_answered_notification(db: Session, questioner_id: str, post_title: str, post_id: str):
    return create_notification(
        db=db,
        user_id=questioner_id,
        category="Q&A",
        title=f"Author answered your question on '{post_title}'",
        detail="The resolved answer was added to the generated FAQ",
        link=f"/posts/{post_id}",
    )


def create_wallet_notification(db: Session, user_id: str, amount: float, post_title: str):
    return create_notification(
        db=db,
        user_id=user_id,
        category="Payouts",
        title=f"Wallet credited ${amount:.2f}",
        detail=f"Earned from reactions on '{post_title}'",
        link="/wallet",
    )
