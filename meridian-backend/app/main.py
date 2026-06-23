from contextlib import asynccontextmanager

from alembic.config import Config as AlembicConfig
from alembic import command
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.routers import account, auth, feed, interactions, mentorship, notifications, posts, qa_search, recruiter, users, wallet
from app.seed import seed_technologies


@asynccontextmanager
async def lifespan(app: FastAPI):
    alembic_cfg = AlembicConfig("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    db = SessionLocal()
    try:
        seed_technologies(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Meridian API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(feed.router)
app.include_router(interactions.router)
app.include_router(wallet.router)
app.include_router(mentorship.router)
app.include_router(notifications.router)
app.include_router(recruiter.router)
app.include_router(account.router)
app.include_router(qa_search.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
