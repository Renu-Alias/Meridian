"""Full integration test for all completed backend features."""
import os, sys
os.chdir("D:\\Meridian\\meridian-backend")
sys.path.insert(0, "D:\\Meridian\\meridian-backend")

try: os.remove("meridian.db")
except: pass

from app.models import *  # noqa: register all models
from app.database import Base, engine
Base.metadata.create_all(bind=engine)

from app.seed import seed_technologies
from app.database import SessionLocal
db = SessionLocal()
seed_technologies(db)
db.close()

from app.main import app
from fastapi.testclient import TestClient
client = TestClient(app, raise_server_exceptions=False)

def req(method, path, data=None, token=None):
    h = {"Content-Type": "application/json"}
    if token: h["Authorization"] = f"Bearer {token}"
    r = client.request(method, path, json=data, headers=h)
    return r.json() if r.status_code < 400 else {"error": r.status_code, "detail": r.text}

def ok(result, msg=""):
    assert "error" not in result, f"FAIL {msg}: {result}"
    return result

# 1. Register
r = ok(req("POST", "/auth/register", {"email":"a@t.com","username":"tester","display_name":"Tester"}), "register")
token = r["access_token"]
print("1. Register OK")

# 2. Technologies already seeded, verify
techs = req("GET", "/users/technologies")
assert len(techs) > 50, f"Expected 50+ techs, got {len(techs)}"
print(f"2. {len(techs)} technologies seeded")

# 3. Update stack
ok(req("PUT", "/users/me/stack", {"technologies":["Rust","Kubernetes","Python"]}, token), "stack")
print("3. Stack updated")

# 4. Create + publish post
post = ok(req("POST", "/posts", {"title":"Rust+K8s","body":"Testing Rust and Kubernetes async io_uring","excerpt":"test","tags":["Rust","Kubernetes"]}, token), "create")
pid = post["id"]
ok(req("POST", f"/posts/{pid}/publish", token=token), "publish")
print("4. Post created & published")

# 5. Add reaction (should credit wallet)
r = req("POST", f"/posts/{pid}/reactions?reaction_type=used_at_work", token=token)
ok(r, "reaction")
print("5. Reaction added")

# 6. Verify wallet credited
wallet = ok(req("GET", "/wallet", token=token), "wallet")
assert wallet["balance"] > 0, f"Expected balance > 0, got {wallet['balance']}"
print(f"6. Wallet: ${wallet['balance']}")

# 7. Feed shows post
feed = ok(req("GET", "/feed", token=token), "feed")
assert len(feed) >= 1
print(f"7. Feed: {len(feed)} posts")

# 8. Profile with skills
profile = ok(req("GET", "/users/profile/tester"), "profile")
assert len(profile["skills"]) > 0, f"Expected skills, got {profile['skills']}"
print(f"8. Profile: {profile['user']['username']}, {len(profile['skills'])} skills")

# 9. Patch submit
patch = ok(req("POST", f"/posts/{pid}/patches", {"title":"Fix","description":"Update","diff":"rust 2024"}, token), "patch")
print("9. Patch submitted")

# 10. Approve patch
ok(req("PUT", f"/posts/{pid}/patches/{patch['id']}/review", {"status":"approved","reviewer_comment":"ok"}, token), "review")
print("10. Patch approved")

# 11. Version created
versions = ok(req("GET", f"/posts/{pid}/versions", token=token), "versions")
assert len(versions) >= 1
print(f"11. {len(versions)} version(s)")

# 12. Fork
fork = ok(req("POST", f"/posts/{pid}/fork", token=token), "fork")
print("12. Fork created")

# 13. Forks listed
forks = ok(req("GET", f"/posts/{pid}/forks", token=token), "forks")
assert len(forks) >= 1
print(f"13. {len(forks)} fork(s)")

# 14. Q&A ask
qa = ok(req("POST", f"/posts/{pid}/qa", {"question":"What edition?"}, token), "qa")
print("14. Question asked")

# 15. Q&A answer
ans = ok(req("PUT", f"/posts/{pid}/qa/{qa['id']}/answer", {"answer":"2024 edition"}, token), "answer")
assert ans["is_answered"] == True
print("15. Question answered")

# 16. FAQ generated
faq = ok(req("GET", f"/posts/{pid}/faq", token=token), "faq")
assert len(faq) >= 1
print(f"16. FAQ: {len(faq)} entries")

# 17. Q&A search
qa_search = ok(req("GET", "/qa/search?q=edition"), "qa_search")
assert len(qa_search) >= 1
print(f"17. Q&A search: {len(qa_search)} results")

# 18. Notifications created
notifs = ok(req("GET", "/notifications", token=token), "notifs")
assert len(notifs) >= 1, f"Expected notifications, got {len(notifs)}"
print(f"18. {len(notifs)} notification(s)")

# 19. Recruiter search
recruit = ok(req("GET", "/recruiter/search?technology=Rust"), "recruiter")
# Our user has recruiter_visible=False by default, so results may be empty
print(f"19. Recruiter search: {len(recruit)} results")

# 20. Stripe connect (mock mode)
stripe = ok(req("POST", "/wallet/connect/stripe", token=token), "stripe")
assert "account_id" in stripe
print(f"20. Stripe connect: {stripe['account_id']}")

# 21. Data export
export = ok(req("GET", "/account/export", token=token), "export")
assert "user" in export and "posts" in export
print(f"21. Data export: {export['user']['username']}, {len(export['posts'])} posts")

# 22. Rate limiting test - 3 different types fills the slot, 4th fails 429
# Already have 1 used_at_work from step 5
ok(req("POST", f"/posts/{pid}/reactions?reaction_type=bookmark", token=token), "rate1")
ok(req("POST", f"/posts/{pid}/reactions?reaction_type=share_internal", token=token), "rate2")
# Next one exceeds max 3
r = req("POST", f"/posts/{pid}/reactions?reaction_type=upvote", token=token)
assert "error" in r and r["error"] == 429, f"Expected 429 rate limit (3 max), got {r}"
print("22. Rate limiting: 429 when exceeding 3 reactions per post")

# 23. Account deletion (cleanup)
del_result = ok(req("DELETE", "/account/delete", token=token), "delete")
print(f"23. Account deleted")

print("\n=== ALL 23 TESTS PASSED ===")
