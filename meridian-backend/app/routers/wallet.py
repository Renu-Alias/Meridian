from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
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


@router.post("/payout")
def request_payout(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.wallet import Transaction
    wallet = ensure_wallet(user.id, db)
    if wallet.balance <= 0:
        return {"detail": "No balance to payout"}
    amount = wallet.balance
    wallet.balance = 0
    wallet.pending += amount
    txn = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        transaction_type="payout_request",
        description="Payout requested",
    )
    db.add(txn)
    db.commit()
    return {"detail": "Payout requested", "amount": amount}
