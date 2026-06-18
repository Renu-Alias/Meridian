from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import Wallet
from app.schemas.user import WalletResponse

router = APIRouter()

@router.get("/{user_id}", response_model=WalletResponse)
async def get_wallet(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalars().first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

@router.post("/{user_id}/payout")
async def request_payout(user_id: int, db: AsyncSession = Depends(get_db)):
    # Mock Stripe integration
    return {"status": "Payout requested via Stripe Connect"}
