from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.services.auth import get_current_user
from app.services.stripe_service import create_account_link, create_connect_account, process_payout_to_stripe
from app.services.wallet_service import ensure_wallet

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("")
def get_wallet(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = ensure_wallet(user.id, db)
    txns = wallet.transactions
    return {
        "id": wallet.id,
        "balance": wallet.balance,
        "pending": wallet.pending,
        "lifetime_paid": wallet.lifetime_paid,
        "stripe_account_id": wallet.stripe_account_id,
        "transactions": [
            {
                "id": t.id,
                "post_id": t.post_id,
                "amount": t.amount,
                "transaction_type": t.transaction_type,
                "description": t.description,
                "created_at": t.created_at.isoformat() if t.created_at else "",
            }
            for t in txns
        ],
        "updated_at": wallet.updated_at.isoformat() if wallet.updated_at else "",
    }


@router.post("/connect/stripe")
def connect_stripe(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account_id = create_connect_account(user, db)
    link_url = create_account_link(
        account_id=account_id,
        refresh_url="http://localhost:5173/wallet",
        return_url="http://localhost:5173/wallet?stripe=connected",
    )
    return {"account_id": account_id, "onboarding_url": link_url}


@router.post("/payout")
def request_payout(
    amount: float = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = ensure_wallet(user.id, db)
    if amount <= 0:
        amount = wallet.balance
    result = process_payout_to_stripe(wallet, amount, db)
    return {"detail": "Payout processed", **result}


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    import stripe
    from app.models.wallet import Transaction
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    if not settings.STRIPE_WEBHOOK_SECRET:
        return {"status": "skipped"}
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        return {"error": "Invalid payload"}, 400
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}, 400
    if event["type"] == "transfer.paid":
        transfer = event["data"]["object"]
        wallet = db.query(Wallet).filter(Wallet.stripe_account_id == transfer["destination"]).first()
        if wallet:
            txn = Transaction(
                wallet_id=wallet.id,
                amount=float(transfer["amount"]) / 100,
                transaction_type="stripe_payout",
                description="Stripe payout completed",
                stripe_payout_id=transfer["id"],
            )
            db.add(txn)
            db.commit()
    return {"status": "received"}
