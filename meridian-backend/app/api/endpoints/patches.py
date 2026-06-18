from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.post import PostVersion
from app.schemas.post import PatchCreate, PatchResponse
from typing import List

router = APIRouter()

@router.post("/{post_id}/patches", response_model=PatchResponse)
async def submit_patch(post_id: int, submitter_id: int, patch: PatchCreate, db: AsyncSession = Depends(get_db)):
    db_patch = PostVersion(**patch.model_dump(), post_id=post_id, submitter_id=submitter_id)
    db.add(db_patch)
    await db.commit()
    await db.refresh(db_patch)
    return db_patch

@router.post("/patches/{patch_id}/approve")
async def approve_patch(patch_id: int, db: AsyncSession = Depends(get_db)):
    db_patch = await db.get(PostVersion, patch_id)
    if not db_patch:
        raise HTTPException(status_code=404, detail="Patch not found")
    
    db_patch.status = "approved"
    # Logic to merge diff_content into Post would go here
    await db.commit()
    return {"status": "success", "patch_id": patch_id}
