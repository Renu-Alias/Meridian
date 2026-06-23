from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import StackProfile, Technology, User
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
    gh_token = token_data["access_token"]
    user_resp = httpx.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {gh_token}"},
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


@router.post("/github/import")
def github_import(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import httpx
    if not user.github_username:
        raise HTTPException(status_code=400, detail="No GitHub account linked")
    resp = httpx.get(
        f"https://api.github.com/users/{user.github_username}/repos?per_page=100",
        headers={"Accept": "application/vnd.github.v3+json"},
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch GitHub repos")
    repos = resp.json()
    languages = set()
    for repo in repos:
        if repo.get("language"):
            languages.add(repo["language"])
    for lang in languages:
        existing = db.query(StackProfile).filter(
            StackProfile.user_id == user.id,
            StackProfile.technology == lang,
        ).first()
        if not existing:
            db.add(StackProfile(user_id=user.id, technology=lang, source="github"))
        tech = db.query(Technology).filter(Technology.name == lang).first()
        if not tech:
            db.add(Technology(name=lang, category="", is_approved=True))
    db.commit()
    stack = db.query(StackProfile).filter(StackProfile.user_id == user.id).all()
    return {"imported_languages": list(languages), "stack": [s.technology for s in stack]}


@router.post("/linkedin")
def linkedin_oauth(code: str, db: Session = Depends(get_db)):
    import httpx
    from app.config import settings
    token_resp = httpx.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            "redirect_uri": "http://localhost:5173/auth/linkedin/callback",
        },
        headers={"Accept": "application/json"},
    )
    token_data = token_resp.json()
    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail="LinkedIn OAuth failed")
    li_token = token_data["access_token"]
    profile_resp = httpx.get(
        "https://api.linkedin.com/v2/userinfo",
        headers={"Authorization": f"Bearer {li_token}"},
    )
    li_profile = profile_resp.json()
    li_sub = li_profile.get("sub", "")
    user = db.query(User).filter(User.linkedin_id == li_sub).first()
    if not user:
        email = li_profile.get("email", f"{li_sub}@linkedin.user")
        name = li_profile.get("name", li_sub)
        username = li_profile.get("preferred_username", li_sub[:12])
        user = User(
            linkedin_id=li_sub,
            linkedin_username=li_profile.get("preferred_username", ""),
            email=email,
            username=username,
            display_name=name,
            avatar_url=li_profile.get("picture", ""),
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
