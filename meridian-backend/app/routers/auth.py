from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    username: str
    display_name: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == req.email) | (User.username == req.username)).first():
        raise HTTPException(status_code=409, detail="Email or username already taken")
    user = User(email=req.email, username=req.username, display_name=req.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user_id=user.id)


@router.post("/github")
def github_oauth(code: str, db: Session = Depends(get_db)):
    import httpx
    from app.config import settings
    token_resp = httpx.post(
        "https://github.com/login/oauth/access_token",
        json={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        },
        headers={"Accept": "application/json"},
    )
    token_data = token_resp.json()
    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail="GitHub OAuth failed")
    user_resp = httpx.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {token_data['access_token']}"},
    )
    gh_user = user_resp.json()
    user = db.query(User).filter(User.github_id == str(gh_user["id"])).first()
    if not user:
        user = User(
            github_id=str(gh_user["id"]),
            github_username=gh_user["login"],
            email=gh_user.get("email", f"{gh_user['login']}@github.user") or f"{gh_user['login']}@github.user",
            username=gh_user["login"],
            display_name=gh_user.get("name", gh_user["login"]),
            avatar_url=gh_user.get("avatar_url", ""),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user_id=user.id)


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
    }
