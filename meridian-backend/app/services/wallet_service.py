from sqlalchemy.orm import Session

from app.models.wallet import Transaction, Wallet


def ensure_wallet(user_id: str, db: Session) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def credit_wallet(
    user_id: str,
    post_id: str,
    amount: float,
    transaction_type: str,
    description: str,
    db: Session,
) -> Wallet:
    wallet = ensure_wallet(user_id, db)
    wallet.balance += amount
    wallet.lifetime_paid += amount
    txn = Transaction(
        wallet_id=wallet.id,
        post_id=post_id,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
    )
    db.add(txn)
    db.commit()
    db.refresh(wallet)
    return wallet
