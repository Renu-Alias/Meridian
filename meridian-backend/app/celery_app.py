from celery import Celery

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


@celery_app.task
def process_payout(wallet_id: str, amount: float):
    pass


@celery_app.task
def compute_stack_matching():
    pass


@celery_app.task
def send_notification(user_id: str, category: str, title: str, detail: str):
    pass
