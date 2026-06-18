from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import users, posts, patches, wallet

app = FastAPI(title="Meridian Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(patches.router, prefix="/api", tags=["patches"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
