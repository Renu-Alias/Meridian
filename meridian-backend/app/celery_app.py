from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings

celery_app = Celery(
    "meridian",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def get_db():
    db = _SessionLocal()
    try:
        return db
    finally:
        db.close()


@celery_app.task
def process_payout(wallet_id: str, amount: float):
    from app.models.wallet import Transaction, Wallet
    db = get_db()
    try:
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if wallet and wallet.pending >= amount:
            wallet.pending -= amount
            txn = Transaction(
                wallet_id=wallet.id,
                amount=amount,
                transaction_type="payout_completed",
                description="Payout processed",
            )
            db.add(txn)
            db.commit()
    finally:
        db.close()


@celery_app.task
def compute_stack_matching():
    from app.models.post import Post
    from app.models.user import StackProfile, User
    from app.services.matching import compute_relevance
    db = get_db()
    try:
        users = db.query(User).all()
        posts = db.query(Post).filter(Post.status == "published").all()
        for user in users:
            stack = [s.technology for s in db.query(StackProfile).filter(StackProfile.user_id == user.id).all()]
            for post in posts:
                tags = [t.name for t in post.tags]
                compute_relevance(tags, stack)
    finally:
        db.close()


@celery_app.task
def send_notification(user_id: str, category: str, title: str, detail: str):
    from app.services.notifications import create_notification
    db = get_db()
    try:
        create_notification(db, user_id, category, title, detail)
    finally:
        db.close()
