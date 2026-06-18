from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.post import Post, Fork
from app.models.interaction import Reaction
from app.schemas.post import PostCreate, PostResponse, ForkCreate, ReactionCreate
from typing import List

router = APIRouter()

@router.post("/", response_model=PostResponse)
async def create_post(post: PostCreate, author_id: int, db: AsyncSession = Depends(get_db)):
    db_post = Post(**post.model_dump(), author_id=author_id)
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

@router.get("/", response_model=List[PostResponse])
async def list_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post))
    return result.scalars().all()

@router.post("/{post_id}/fork", response_model=PostResponse)
async def fork_post(post_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    # Simple mock fork logic
    db_post = await db.get(Post, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_post = Post(title=db_post.title, content=db_post.content, author_id=user_id, is_published=False)
    db.add(new_post)
    await db.flush()
    
    fork_link = Fork(post_id=post_id, forked_post_id=new_post.id, user_id=user_id)
    db.add(fork_link)
    await db.commit()
    await db.refresh(new_post)
    return new_post

@router.post("/{post_id}/reactions")
async def add_reaction(post_id: int, user_id: int, reaction: ReactionCreate, db: AsyncSession = Depends(get_db)):
    db_reaction = Reaction(post_id=post_id, user_id=user_id, reaction_type=reaction.reaction_type)
    db.add(db_reaction)
    await db.commit()
    return {"status": "success"}
