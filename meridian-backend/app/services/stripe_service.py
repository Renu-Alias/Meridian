import stripe
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.wallet import Transaction, Wallet

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_connect_account(user: User, db: Session) -> str:
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
    if wallet and wallet.stripe_account_id:
        return wallet.stripe_account_id
    if not stripe.api_key:
        wallet_id = wallet.id if wallet else None
        return f"acct_mock_{user.id[:8]}"
    try:
        account = stripe.Account.create(
            type="express",
            country="US",
            email=user.email,
            business_profile={"name": user.display_name},
            capabilities={"transfers": {"requested": True}},
        )
        if not wallet:
            wallet = Wallet(user_id=user.id)
            db.add(wallet)
        wallet.stripe_account_id = account.id
        db.commit()
        return account.id
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")


def create_account_link(account_id: str, refresh_url: str, return_url: str) -> str:
    if not stripe.api_key or account_id.startswith("acct_mock_"):
        return return_url
    try:
        link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type="account_onboarding",
        )
        return link.url
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")


def process_payout_to_stripe(wallet: Wallet, amount: float, db: Session) -> dict:
    if not wallet.stripe_account_id:
        raise HTTPException(status_code=400, detail="No Stripe account connected")
    if wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    if not stripe.api_key:
        wallet.balance -= amount
        wallet.pending += amount
        txn = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            transaction_type="payout",
            description="Payout processed (mock Stripe)",
        )
        db.add(txn)
        db.commit()
        return {"status": "mock", "amount": amount}
    try:
        transfer = stripe.Transfer.create(
            amount=int(amount * 100),
            currency="usd",
            destination=wallet.stripe_account_id,
            description="Meridian author payout",
        )
        wallet.balance -= amount
        txn = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            transaction_type="payout",
            description="Payout processed",
            stripe_payout_id=transfer.id,
        )
        db.add(txn)
        db.commit()
        return {"status": "completed", "stripe_transfer_id": transfer.id, "amount": amount}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe payout failed: {str(e)}")
