"""Generate realistic fake/demo data for Meridian.

Covers accounts, posts, reactions (likes), comments/Q&A threads, forks,
patches, citations, mentorship submissions, notifications, wallets,
transactions, skills graphs, stack profiles, and credibility scores.

Usage (run from meridian-backend/):
    python -m app.seed_fake                  # wipe + 25 users + 60 posts
    python -m app.seed_fake --users 40 --posts 100
    python -m app.seed_fake --no-wipe        # append to existing data
    python -m app.seed_fake --seed 7         # reproducible output

Every seeded user has the same password so you can log in as any of them:
    password: password123
"""
import argparse
import random
from datetime import datetime, timedelta

from faker import Faker

from app.database import SessionLocal
from app.models import (
    Citation,
    ClaimFlag,
    CredibilityScore,
    Fork,
    MentorshipSubmission,
    Notification,
    Patch,
    Post,
    PostVersion,
    QAThread,
    Reaction,
    SkillsGraphEntry,
    StackProfile,
    Technology,
    Transaction,
    User,
    Wallet,
    post_tags,
)
from app.seed import seed_technologies
from app.services.password import hash_password

DEFAULT_PASSWORD = "password123"

VALID_REACTION_TYPES = ["bookmark", "share_internal", "used_at_work", "upvote"]
REACTION_WEIGHTS = {"bookmark": 0.05, "share_internal": 0.10, "used_at_work": 0.50}

ROLES = [
    "Software Engineer", "Senior Software Engineer", "Staff Engineer",
    "Principal Engineer", "Engineering Manager", "Platform Engineer",
    "Backend Engineer", "Frontend Engineer", "ML Engineer", "SRE",
    "DevOps Engineer", "Security Engineer", "Tech Lead", "Distinguished Engineer",
]

SENIORITY = ["", "", "Junior", "Mid", "Senior", "Senior", "Staff", "Principal"]

TECHNOLOGY_POOL = [
    "Python", "TypeScript", "Rust", "Go", "C++", "Zig",
    "React", "Vue", "Svelte", "Next.js", "Tailwind CSS",
    "FastAPI", "Django", "Flask", "Node", "GraphQL", "gRPC",
    "PostgreSQL", "MongoDB", "Redis", "ClickHouse", "Elasticsearch",
    "Kafka", "RabbitMQ", "Docker", "Kubernetes", "Terraform",
    "AWS", "GCP", "Azure", "Prometheus", "Grafana", "OpenTelemetry",
    "PyTorch", "TensorFlow", "LLM", "Wasm", "Linux Kernel", "eBPF",
]

TOPICS = [
    "event loop scheduling", "consensus replication", "zero-downtime migrations",
    "database connection pooling", "distributed rate limiting", "observability pipelines",
    "CI/CD pipeline caching", "feature flag rollout", "gRPC streaming backpressure",
    "WebAssembly modules", "GPU inference serving", "LLM prompt caching",
    "semantic search indexing", "message queue reliability", "service mesh traffic shaping",
    "cache invalidation", "background job orchestration", "multi-region failover",
    "real-time collaboration", "audio processing at scale", "packet capture on Linux",
    "browser rendering performance", "CSS architecture", "schema evolution",
]

TITLE_PATTERNS = [
    "Refactoring {topic} in production",
    "Implementing {topic} from scratch",
    "How we scaled {topic}",
    "A deep dive into {topic}",
    "Lessons learned from {topic}",
    "Optimizing {topic} for latency",
    "Rethinking {topic} with {tech}",
    "Building a reliable {topic} pipeline",
]

EXCERPT_TEMPLATES = [
    "A practical walkthrough of {topic} — the architecture, the failure modes, and the metrics that matter.",
    "Breaking down how we solved {topic} end-to-end, including the tradeoffs and benchmarks that convinced us.",
    "Everything I learned implementing {topic} in a real system, with code, numbers, and honest hindsight.",
    "How {tech} made {topic} dramatically simpler — and the sharp edges we hit along the way.",
]

CODE_SNIPPETS = {
    "Rust": "pub async fn poll_events(&mut self) -> Result<(), Error> {\n    let mut ring = IoUring::new(256)?;\n    loop {\n        self.flush_completions(&mut ring).await?;\n    }\n}",
    "Go": "func NewLimiter(r store) *Limiter {\n    return &Limiter{store: r, window: time.Minute}\n}\n\nfunc (l *Limiter) Allow(key string) bool {\n    return l.store.Incr(key, l.window) <= l.limit\n}",
    "Python": "async def process(batch: list[Event]) -> None:\n    async with semaphore:\n        results = await gather(*[handle(e) for e in batch])\n    await buffer.flush(results)",
    "TypeScript": "export function useVirtualRows<T>(items: T[], size: number) {\n  return useMemo(() => items.slice(0, Math.ceil(size / ROW_H)), [items, size]);\n}",
    "Kubernetes": "spec:\n  replicas: 6\n  strategy:\n    rollingUpdate:\n      maxUnavailable: 1\n  template:\n    spec:\n      containers:\n        - image: meridian/worker:2.4",
    "PostgreSQL": "CREATE INDEX CONCURRENTLY idx_events_created\n  ON events (created_at)\n  WHERE status = 'processed';\n\nALTER TABLE events DETACH PARTITION events_2025_old;",
}

TECH_RELATED = {
    "Rust": ["Linux Kernel", "Wasm", "gRPC"],
    "Go": ["Kubernetes", "Docker", "Terraform"],
    "Python": ["FastAPI", "LLM", "PyTorch"],
    "TypeScript": ["React", "Next.js", "GraphQL"],
    "Kubernetes": ["Docker", "Terraform", "Prometheus"],
    "Redis": ["PostgreSQL", "Kubernetes"],
    "PostgreSQL": ["ClickHouse", "Redis"],
    "Kafka": ["RabbitMQ", "Go"],
    "LLM": ["PyTorch", "TensorFlow", "Elasticsearch"],
    "eBPF": ["Linux Kernel", "Prometheus", "Grafana"],
    "AWS": ["Kubernetes", "Terraform"],
    "GCP": ["Kubernetes", "Go"],
}


def _now() -> datetime:
    return datetime.utcnow()


def rand_dt(days_ago_max: int) -> datetime:
    return _now() - timedelta(
        days=random.random() * days_ago_max,
        hours=random.random() * 24,
        minutes=random.random() * 60,
    )


def _avatar(index: int) -> str:
    return f"https://i.pravatar.cc/150?img={(index % 70) + 1}"


def ensure_technology(db, name: str) -> Technology:
    tech = db.query(Technology).filter(Technology.name == name).first()
    if not tech:
        tech = Technology(name=name, category="", is_approved=True)
        db.add(tech)
        db.flush()
    return tech


def unique_handle(faker: Faker, used: set) -> tuple[str, str]:
    for _ in range(100):
        slug = (f"{faker.first_name()}.{faker.last_name()}").lower().replace(" ", ".")
        if slug not in used:
            used.add(slug)
            return slug, f"@{slug}"
    # fallback — suffix with a random token to guarantee uniqueness
    slug = f"user.{random.randint(100000, 999999)}"
    used.add(slug)
    return slug, f"@{slug}"


def make_user(db, faker: Faker, index: int, used: set) -> User:
    slug, handle = unique_handle(faker, used)
    display_name = faker.name()
    created = rand_dt(400)

    user = User(
        email=f"{slug}@meridian.dev",
        username=slug,
        display_name=display_name,
        bio=faker.paragraph(nb_sentences=3),
        avatar_url=_avatar(index),
        role=random.choice(ROLES),
        seniority=random.choice(SENIORITY),
        recruiter_visible=random.random() < 0.4,
        is_mentor=random.random() < 0.2,
        is_active=True,
        password_hash=hash_password(DEFAULT_PASSWORD),
        created_at=created,
        updated_at=created,
    )
    db.add(user)
    db.flush()

    # Wallet
    wallet = Wallet(
        user_id=user.id,
        balance=round(random.uniform(20, 400), 2),
        pending=round(random.uniform(0, 60), 2),
        lifetime_paid=round(random.uniform(50, 3000), 2),
        created_at=created,
        updated_at=created,
    )
    db.add(wallet)

    # Credibility score
    db.add(
        CredibilityScore(
            user_id=user.id,
            score=round(random.uniform(72, 99), 1),
            verified_claims=random.randint(1, 40),
            flagged_claims=random.randint(0, 8),
            resolved_flags=random.randint(0, 8),
            updated_at=created,
        )
    )

    # Skills graph (source = auto/manual)
    stack = random.sample(TECHNOLOGY_POOL, random.randint(3, 7))
    for skill in stack:
        db.add(
            SkillsGraphEntry(
                user_id=user.id,
                skill_name=skill,
                depth=round(random.uniform(20, 95), 1),
                source=random.choice(["auto", "manual"]),
                created_at=created,
                updated_at=created,
            )
        )
        db.add(
            StackProfile(user_id=user.id, technology=skill, source="manual", created_at=created)
        )

    db.flush()
    return user


def compose_title(faker: Faker, topic: str, tech: str) -> str:
    pattern = random.choice(TITLE_PATTERNS)
    return pattern.format(topic=topic, tech=tech).capitalize()


def compose_body(faker: Faker, topic: str, tech: str) -> str:
    ops_per_day = random.randint(200, 900)
    p99_before = random.randint(40, 90)
    p99_after = random.randint(8, 25)
    savings = random.randint(20, 80)
    loc = random.randint(100, 900)
    return "\n\n".join(
        [
            f"I spent the last few weeks working on {topic}, and after two rounds of rewrites I finally have something worth sharing. "
            f"The short version: {tech} handled the heavy lifting, but the real win came from simplifying how we reason about {topic}.",
            f"### Context\nOur system processes roughly {ops_per_day}k events a day. We originally solved {topic} with a naive approach "
            f"that worked at small scale, then fell over once traffic patterns shifted. This post covers the architecture we landed on "
            f"and the alternatives we rejected.",
            f"### Implementation\nWe leaned on {tech} for the core path. The first draft was over-engineered — dozens of config knobs and a "
            f"generic abstraction layer — and the second draft cut all of it in favor of a ~{loc} line implementation that is much easier to "
            f"reason about. A few key decisions:\n- {faker.sentence()}\n- {faker.sentence()}\n- {faker.sentence()}",
            f"### Benchmarks\nThe change reduced p99 latency from {p99_before}ms to {p99_after}ms and cut error-budget burn by roughly "
            f"{savings}%. CPU usage in the hottest path also dropped by {random.randint(10, 45)}%. Numbers were captured with OpenTelemetry "
            f"traces and Prometheus histograms across three regions.",
            f"### What I'd do differently\nHindsight is {random.randint(2, 9)}/10. I'd validate the failure modes earlier and write the load "
            f"test before the implementation, not after. Happy to answer questions in the comments.",
        ]
    )


def compose_tags(tech: str) -> list[str]:
    tags = [tech]
    tags += TECH_RELATED.get(tech, [])
    tags += [random.choice(TECHNOLOGY_POOL) for _ in range(random.randint(0, 1))]
    seen: set[str] = set()
    out: list[str] = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out[:4]


def make_post(
    db,
    faker: Faker,
    author: User,
    created: datetime,
    source: Post | None = None,
) -> Post:
    tech = random.choice(TECHNOLOGY_POOL)
    topic = random.choice(TOPICS)
    title = compose_title(faker, topic, tech)
    body = compose_body(faker, topic, tech)
    excerpt = random.choice(EXCERPT_TEMPLATES).format(topic=topic, tech=tech)
    status = "published" if random.random() < 0.9 else "draft"

    post = Post(
        title=title,
        body=body,
        excerpt=excerpt,
        author_id=author.id,
        status=status,
        version=random.choice(["v1.0", "v1.2", "v2.0", "v2.3", "v3.0"]),
        impact_score=random.randint(60, 2500),
        created_at=created,
        updated_at=created,
        published_at=created if status == "published" else None,
        fork_of_id=source.id if source else None,
    )
    db.add(post)
    db.flush()

    for tag_name in compose_tags(tech):
        tag = ensure_technology(db, tag_name)
        post.tags.append(tag)

    # Version history row
    db.add(PostVersion(post_id=post.id, version=post.version, body=body, author_id=author.id, created_at=created))

    # Citations
    for _ in range(random.randint(0, 3)):
        db.add(
            Citation(
                post_id=post.id,
                anchor_text=" ".join(excerpt.split()[: random.randint(2, 5)]),
                url=f"https://example.org/{random.randint(1000, 9999)}",
                citation_type=random.choice(["link", "paper", "spec", "benchmark"]),
                position_start=random.randint(0, 40),
                position_end=random.randint(41, 120),
                created_at=created,
            )
        )

    db.flush()
    return post


def make_comment(db, faker: Faker, post: Post, questioner: User, created: datetime, all_users: list[User]):
    thread = QAThread(
        post_id=post.id,
        questioner_id=questioner.id,
        question=faker.sentence(nb_words=random.randint(8, 18)),
        created_at=created,
    )
    if random.random() < 0.7:
        thread.answer = "\n".join(faker.paragraphs(nb=2))
        thread.answerer_id = post.author_id
        thread.is_answered = True
        thread.is_indexed = random.random() < 0.8
        thread.answered_at = created + timedelta(hours=random.uniform(1, 48))
    db.add(thread)


def wipe(db) -> None:
    """Delete all rows in FK-safe order, then re-seed technologies."""
    db.execute(post_tags.delete())
    for model in [
        Transaction, Fork, ClaimFlag, Citation, QAThread, Reaction,
        Patch, PostVersion, Notification, MentorshipSubmission, Post,
        Wallet, CredibilityScore, SkillsGraphEntry, StackProfile, User,
        Technology,
    ]:
        db.query(model).delete()
    db.commit()


def seed(db, num_users: int, num_posts: int) -> dict:
    faker = Faker()
    faker.seed_instance(random.randint(0, 2**32))
    used: set[str] = set()

    users = [make_user(db, faker, i, used) for i in range(num_users)]
    db.commit()
    print(f"Seeded {len(users)} users (password: {DEFAULT_PASSWORD})")

    # Posts authored by users
    posts: list[Post] = []
    for i in range(num_posts):
        author = random.choice(users)
        posts.append(make_post(db, faker, author, rand_dt(300)))
    db.commit()
    print(f"Seeded {len(posts)} posts")

    published = [p for p in posts if p.status == "published"]

    # Reactions (likes)
    reactions = 0
    for post in published:
        sample = random.sample(users, min(random.randint(0, 24), len(users)))
        for user in sample:
            if user.id == post.author_id:
                continue
            db.add(
                Reaction(
                    post_id=post.id,
                    user_id=user.id,
                    reaction_type=random.choice(VALID_REACTION_TYPES),
                    created_at=post.published_at + timedelta(hours=random.uniform(0, 300)),
                )
            )
            reactions += 1
    db.commit()
    print(f"Seeded {reactions} reactions")

    # Comments / Q&A threads
    comments = 0
    for post in published:
        for _ in range(random.randint(0, 8)):
            make_comment(db, faker, post, random.choice(users), post.published_at + timedelta(hours=random.uniform(1, 300)), users)
            comments += 1
    db.commit()
    print(f"Seeded {comments} comments/Q&A threads")

    # Forks (each fork also creates a fork post)
    forks = 0
    for post in published:
        for _ in range(random.randint(0, 3)):
            forker = random.choice(users)
            if forker.id == post.author_id:
                continue
            fork_post = make_post(
                db, faker, forker, post.published_at + timedelta(hours=random.uniform(1, 200)), source=post
            )
            fork_post.status = "published"
            fork_post.published_at = fork_post.created_at
            db.add(
                Fork(
                    source_post_id=post.id,
                    fork_post_id=fork_post.id,
                    forker_id=forker.id,
                    merge_suggestion_status=random.choice(["none", "none", "pending", "proposed"]),
                    created_at=fork_post.created_at,
                )
            )
            db.add(
                Notification(
                    user_id=post.author_id,
                    category="Forks",
                    title=f"{forker.display_name} forked your post",
                    detail=f"'{post.title}' was forked with attribution chain preserved.",
                    link=f"/posts/{fork_post.id}",
                    created_at=fork_post.created_at,
                )
            )
            forks += 1
    db.commit()
    print(f"Seeded {forks} forks")

    # Patches
    patches = 0
    for post in published:
        for _ in range(random.randint(0, 3)):
            submitter = random.choice(users)
            if submitter.id == post.author_id:
                continue
            status = random.choice(["pending", "pending", "approved", "merged", "rejected"])
            patch = Patch(
                post_id=post.id,
                submitter_id=submitter.id,
                title=f"Fix: {faker.sentence(nb_words=6).rstrip('.')}",
                description=faker.sentence(nb_words=12),
                diff=f"- {faker.sentence()}\n+ {faker.sentence()}",
                status=status,
                reviewer_comment=faker.sentence(nb_words=10) if status in ("approved", "rejected") else "",
                created_at=post.published_at + timedelta(hours=random.uniform(1, 200)),
                updated_at=post.published_at + timedelta(hours=random.uniform(1, 260)),
            )
            db.add(patch)
            db.add(
                Notification(
                    user_id=post.author_id if random.random() < 0.5 else submitter.id,
                    category="Patches",
                    title=f"Patch {status} on '{post.title}'",
                    detail=f"{submitter.display_name}'s patch was {status}.",
                    link=f"/posts/{post.id}",
                    created_at=patch.updated_at,
                )
            )
            patches += 1
    db.commit()
    print(f"Seeded {patches} patches")

    # Mentorship submissions
    submissions = 0
    mentors = [u for u in users if u.is_mentor]
    for post in published:
        if random.random() < 0.3:
            status = random.choice(["pending_match", "pending_match", "matched", "reviewed"])
            sub = MentorshipSubmission(
                post_id=post.id,
                author_id=post.author_id,
                mentor_id=random.choice(mentors).id if mentors and status in ("matched", "reviewed") else None,
                status=status,
                domain=post.tags[0].name if post.tags else "",
                reviewer_notes=faker.sentence(nb_words=12) if status == "reviewed" else "",
                reviewer_credit=random.choice(["credibility", "impact", "peer_review"]) if status == "reviewed" else "",
                created_at=post.published_at + timedelta(hours=random.uniform(1, 100)),
                matched_at=post.published_at + timedelta(hours=random.uniform(100, 200)) if status in ("matched", "reviewed") else None,
                reviewed_at=post.published_at + timedelta(hours=random.uniform(200, 300)) if status == "reviewed" else None,
            )
            db.add(sub)
            submissions += 1
    db.commit()
    print(f"Seeded {submissions} mentorship submissions")

    # Wallet transactions + Q&A notifications
    transactions = 0
    qa_notifs = 0
    for post in published:
        like_count = sum(1 for r in post.reactions) if hasattr(post, "reactions") else 0
        earnings = round(like_count * random.choice([0.05, 0.1, 0.25, 0.5]), 2)
        if earnings > 0:
            wallet = db.query(Wallet).filter(Wallet.user_id == post.author_id).first()
            if wallet:
                db.add(
                    Transaction(
                        wallet_id=wallet.id,
                        post_id=post.id,
                        amount=earnings,
                        transaction_type="used_at_work",
                        description=f"used_at_work reaction on '{post.title}'",
                        created_at=post.published_at + timedelta(days=random.uniform(0, 30)),
                    )
                )
                wallet.balance = round(wallet.balance + earnings, 2)
                wallet.lifetime_paid = round(wallet.lifetime_paid + earnings, 2)
                transactions += 1
                db.add(
                    Notification(
                        user_id=post.author_id,
                        category="Payouts",
                        title=f"Wallet credited ${earnings:.2f}",
                        detail=f"Earned from reactions on '{post.title}'.",
                        link="/wallet",
                        created_at=post.published_at + timedelta(days=random.uniform(0, 30)),
                    )
                )

        # Notify author about comments
        qa = db.query(QAThread).filter(QAThread.post_id == post.id).first()
        if qa and qa.questioner:
            db.add(
                Notification(
                    user_id=post.author_id,
                    category="Q&A",
                    title=f"New question from {qa.questioner.display_name}",
                    detail=f"A reader asked a question on '{post.title}'.",
                    link=f"/posts/{post.id}",
                    created_at=qa.created_at,
                )
            )
            qa_notifs += 1

    db.commit()
    print(f"Seeded {transactions} wallet transactions, {qa_notifs} Q&A notifications")

    # Flag a few posts to keep the verification UI interesting
    for post in random.sample(published, min(3, len(published))):
        flager_id = (
            random.choice([u.id for u in users if u.id != post.author_id])
            if len(users) > 1
            else post.author_id
        )
        db.add(
            ClaimFlag(
                post_id=post.id,
                flager_id=flager_id,
                citation_id=post.citations[0].id if post.citations else None,
                reason=random.choice(
                    ["Please provide a source for the latency claim.",
                     "The benchmark methodology is unclear.",
                     "Missing evidence for the throughput numbers."]
                ),
                status=random.choice(["open", "resolved"]),
                resolved_at=rand_dt(30) if random.random() < 0.5 else None,
                created_at=post.published_at + timedelta(hours=random.uniform(1, 200)),
            )
        )
    db.commit()

    return {
        "users": len(users),
        "posts": len(posts),
        "reactions": reactions,
        "comments": comments,
        "forks": forks,
        "patches": patches,
        "submissions": submissions,
        "transactions": transactions,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Meridian with realistic fake data.")
    parser.add_argument("--users", type=int, default=25, help="number of fake accounts (default 25)")
    parser.add_argument("--posts", type=int, default=60, help="number of fake posts (default 60)")
    parser.add_argument("--seed", type=int, default=None, help="random seed for reproducibility")
    parser.add_argument(
        "--no-wipe",
        action="store_true",
        help="append to existing data instead of clearing the database first",
    )
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    db = SessionLocal()
    try:
        seed_technologies(db)
        if not args.no_wipe:
            wipe(db)
            print("Database wiped.")
        stats = seed(db, args.users, args.posts)
    finally:
        db.close()

    print("\nDone. Summary:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    print(f"\nLog in with any seeded account using password '{DEFAULT_PASSWORD}'.")


if __name__ == "__main__":
    main()
