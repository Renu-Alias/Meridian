from app.workers.celery_app import celery_app
import time

@celery_app.task
def compute_stack_match_embeddings(post_id: int):
    # Mock computation
    print(f"Computing NLP embeddings for post {post_id} using sentence-transformers...")
    time.sleep(2)
    print(f"Embeddings saved for post {post_id}.")
    return True

@celery_app.task
def process_impact_payout(post_id: int, user_id: int):
    # Mock stripe payout
    print(f"Processing Stripe payout for user {user_id} on post {post_id}...")
    time.sleep(1)
    print("Payout complete.")
    return True
