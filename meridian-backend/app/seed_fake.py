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
    "Backend Engineer", "Frontend Engineer", "Full Stack Engineer",
    "ML Engineer", "SRE", "DevOps Engineer", "Security Engineer",
    "Tech Lead", "Distinguished Engineer", "Infrastructure Engineer",
    "Data Engineer", "Embedded Systems Engineer", "Systems Programmer",
    "API Platform Engineer", "Observability Engineer", "Cloud Architect",
    "Compiler Engineer", "Database Engineer", "Open Source Maintainer",
]

SENIORITY = ["", "", "Junior", "Mid", "Senior", "Senior", "Staff", "Principal", "Distinguished"]

TECHNOLOGY_POOL = [
    "Python", "TypeScript", "Rust", "Go", "C++", "Zig", "Java", "Kotlin", "Elixir",
    "React", "Vue", "Svelte", "Next.js", "Tailwind CSS", "SolidJS",
    "FastAPI", "Django", "Flask", "Node", "GraphQL", "gRPC", "tRPC",
    "PostgreSQL", "MongoDB", "Redis", "ClickHouse", "Elasticsearch", "SQLite",
    "Kafka", "RabbitMQ", "NATS", "Docker", "Kubernetes", "Terraform", "Pulumi",
    "AWS", "GCP", "Azure", "Prometheus", "Grafana", "OpenTelemetry", "Jaeger",
    "PyTorch", "TensorFlow", "JAX", "LLM", "Wasm", "Linux Kernel", "eBPF",
    "Temporal", "Deno", "Bun", "Tauri", "WebRTC", "Supabase",
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
    "memory allocator tuning", "actor model concurrency", "CRDT-based sync",
    "hot-reload without downtime", "incremental compiler design", "garbage collector pauses",
    "tail latency reduction", "write-ahead logging", "snapshot isolation",
    "fan-out at scale", "webhook delivery guarantees", "idempotency keys",
    "cold start optimization", "distributed tracing propagation", "canary releases",
    "connection draining", "leader election", "bloom filter usage",
    "data pagination at scale", "API versioning strategy", "graceful degradation",
    "token bucket vs leaky bucket", "epoll vs io_uring", "copy-on-write semantics",
]

TITLE_PATTERNS = [
    "Refactoring {topic} in production",
    "Implementing {topic} from scratch",
    "How we scaled {topic} to 10x traffic",
    "A deep dive into {topic}",
    "Lessons learned from {topic}",
    "Optimizing {topic} for p99 latency",
    "Rethinking {topic} with {tech}",
    "Building a reliable {topic} pipeline",
    "Why we replaced our {topic} with {tech}",
    "The hidden cost of {topic}",
    "How {tech} changed our approach to {topic}",
    "Production postmortem: {topic} at scale",
    "Six months with {tech}: what worked and what didn't",
    "Cutting p99 latency in half with {tech}",
    "The architecture behind our {topic} system",
    "Stop reinventing {topic} — use {tech}",
    "What nobody tells you about {topic}",
    "From 0 to production: {topic} with {tech}",
    "We benchmarked every {topic} approach. Here's what won.",
    "{tech} internals: understanding {topic}",
]

EXCERPT_TEMPLATES = [
    "A practical walkthrough of {topic} — the architecture, the failure modes, and the metrics that matter.",
    "Breaking down how we solved {topic} end-to-end, including the tradeoffs and benchmarks that convinced us.",
    "Everything I learned implementing {topic} in a real system, with code, numbers, and honest hindsight.",
    "How {tech} made {topic} dramatically simpler — and the sharp edges we hit along the way.",
    "The full story of our {topic} rewrite: what broke, what we kept, and what we'd do differently.",
    "If you've been burned by naive {topic} approaches before, this post is for you.",
    "We spent 3 months fixing {topic}. Here's the architecture that finally held.",
    "A measured comparison of every serious approach to {topic} — with real production numbers.",
    "Why {tech} is the right tool for {topic}, and the three places where it still falls short.",
    "From incident to insight: how a {topic} failure led us to rebuild with {tech}.",
]

CODE_SNIPPETS = {
    "Rust": "pub async fn poll_events(&mut self) -> Result<(), Error> {\n    let mut ring = IoUring::builder().build(256)?;\n    loop {\n        ring.submit_and_wait(1)?;\n        for cqe in ring.completion() {\n            self.handle_cqe(cqe).await?;\n        }\n    }\n}",
    "Go": "func NewLimiter(r Store, limit int) *Limiter {\n    return &Limiter{store: r, limit: limit, window: time.Minute}\n}\n\nfunc (l *Limiter) Allow(ctx context.Context, key string) (bool, error) {\n    count, err := l.store.Incr(ctx, key, l.window)\n    if err != nil {\n        return true, err // fail open\n    }\n    return count <= l.limit, nil\n}",
    "Python": "async def process_batch(batch: list[Event], sem: asyncio.Semaphore) -> list[Result]:\n    async with sem:\n        tasks = [asyncio.create_task(handle(e)) for e in batch]\n        results = await asyncio.gather(*tasks, return_exceptions=True)\n    return [r for r in results if not isinstance(r, Exception)]",
    "TypeScript": "export function useVirtualRows<T>(items: T[], containerHeight: number) {\n  const [scrollTop, setScrollTop] = useState(0);\n  const start = Math.floor(scrollTop / ROW_HEIGHT);\n  const end = Math.min(items.length, start + Math.ceil(containerHeight / ROW_HEIGHT) + 1);\n  return { visibleItems: items.slice(start, end), startIndex: start };\n}",
    "Kubernetes": "apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 6\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 1\n      maxSurge: 2\n  template:\n    spec:\n      terminationGracePeriodSeconds: 60\n      containers:\n        - name: worker\n          image: meridian/worker:2.4.1\n          resources:\n            requests:\n              cpu: 250m\n              memory: 256Mi",
    "PostgreSQL": "-- Concurrent index creation to avoid table locks\nCREATE INDEX CONCURRENTLY idx_events_created_status\n  ON events (created_at DESC)\n  WHERE status = 'processed';\n\n-- Partition detach (non-blocking in PG 14+)\nALTER TABLE events\n  DETACH PARTITION events_2024_q4 CONCURRENTLY;",
    "Python:async": "class RateLimiter:\n    def __init__(self, rate: int, period: float = 1.0):\n        self._tokens = rate\n        self._rate = rate\n        self._period = period\n        self._lock = asyncio.Lock()\n\n    async def acquire(self) -> None:\n        async with self._lock:\n            if self._tokens <= 0:\n                await asyncio.sleep(self._period / self._rate)\n            self._tokens -= 1",
    "Go:grpc": "func (s *Server) StreamEvents(req *pb.StreamRequest, stream pb.Events_StreamEventsServer) error {\n    ch := s.bus.Subscribe(req.Topic)\n    defer s.bus.Unsubscribe(ch)\n    for {\n        select {\n        case evt := <-ch:\n            if err := stream.Send(evt); err != nil {\n                return err\n            }\n        case <-stream.Context().Done():\n            return nil\n        }\n    }\n}",
    "Rust:memory": "#[repr(C, align(64))]\nstruct CacheAligned<T>(T);\n\nimpl<T: Send> CacheAligned<T> {\n    pub fn new(val: T) -> Self { Self(val) }\n\n    /// Zero-cost read through a shared reference.\n    pub fn get(&self) -> &T { &self.0 }\n}\n\n// Prevents false sharing on hot paths across cores.",
    "Elixir": "defmodule Pipeline.Supervisor do\n  use Supervisor\n\n  def start_link(opts), do: Supervisor.start_link(__MODULE__, opts, name: __MODULE__)\n\n  @impl true\n  def init(_opts) do\n    children = [\n      {Registry, keys: :unique, name: Pipeline.Registry},\n      {DynamicSupervisor, strategy: :one_for_one, name: Pipeline.WorkerSup}\n    ]\n    Supervisor.init(children, strategy: :one_for_all)\n  end\nend",
    "eBPF": "SEC(\"tracepoint/syscalls/sys_enter_write\")\nint trace_write(struct trace_event_raw_sys_enter *ctx) {\n    u32 pid = bpf_get_current_pid_tgid() >> 32;\n    u64 ts = bpf_ktime_get_ns();\n    bpf_map_update_elem(&start_times, &pid, &ts, BPF_ANY);\n    return 0;\n}",
}

TECH_RELATED = {
    "Rust": ["Linux Kernel", "Wasm", "gRPC", "eBPF"],
    "Go": ["Kubernetes", "Docker", "Terraform", "gRPC"],
    "Python": ["FastAPI", "LLM", "PyTorch", "Kafka"],
    "TypeScript": ["React", "Next.js", "GraphQL", "tRPC"],
    "Kubernetes": ["Docker", "Terraform", "Prometheus", "Grafana"],
    "Redis": ["PostgreSQL", "Kubernetes", "NATS"],
    "PostgreSQL": ["ClickHouse", "Redis", "Temporal"],
    "Kafka": ["RabbitMQ", "Go", "ClickHouse"],
    "LLM": ["PyTorch", "TensorFlow", "Elasticsearch", "JAX"],
    "eBPF": ["Linux Kernel", "Prometheus", "Grafana", "Rust"],
    "AWS": ["Kubernetes", "Terraform", "Pulumi"],
    "GCP": ["Kubernetes", "Go", "BigQuery"],
    "Elixir": ["NATS", "PostgreSQL", "WebRTC"],
    "Temporal": ["Go", "Python", "Kubernetes"],
}

BIO_TEMPLATES = [
    "Staff engineer at {company}. I work on {area1} and {area2}. Previously at {prev}. Open source contributor.",
    "Building {area1} infrastructure. Passionate about {area2} and writing about things I learn the hard way.",
    "{seniority} engineer focused on {area1}. I write about distributed systems, performance, and the occasional war story.",
    "I've spent the last {years} years working on {area1} at scale. Now I write so future-me doesn't forget.",
    "Engineering lead at {company}. My interests are {area1}, {area2}, and making complex systems boring.",
    "Former {prev} engineer. Obsessed with {area1}. I write long-form posts about real production problems.",
    "Principal engineer. I break things at scale and write about how to un-break them. Specialising in {area1}.",
    "Independent contractor and open source maintainer. Current obsession: {area1} with {tech}.",
    "I run the {area1} platform team at {company}. Occasional conference speaker. Infrequent blogger.",
    "SRE turned software engineer. I care deeply about {area1}, on-call health, and {area2}.",
]

BIO_COMPANIES = [
    "a fintech startup", "a tier-1 cloud provider", "a high-frequency trading firm",
    "a mid-size SaaS company", "a distributed-systems consultancy", "an adtech platform",
    "a developer tools company", "a ride-sharing platform", "a genomics lab",
]

BIO_AREAS = [
    "distributed systems", "database internals", "observability", "ML infrastructure",
    "API platform", "frontend performance", "compiler tooling", "storage engines",
    "real-time messaging", "data pipelines", "security engineering", "developer experience",
    "container orchestration", "edge computing", "streaming architectures",
]

BIO_PREV_COMPANIES = [
    "Google", "Meta", "Stripe", "Cloudflare", "HashiCorp", "Datadog",
    "Vercel", "PlanetScale", "Figma", "Linear", "Notion", "Retool",
]

QA_QUESTION_TEMPLATES = [
    "Did you consider {alt} as an alternative? Would love to understand the tradeoffs.",
    "How does this hold up under {condition}? We hit a similar issue and ended up with a different approach.",
    "What does your {metric} look like under sustained load? Our numbers were quite different.",
    "Have you profiled the {component} path specifically? That was our bottleneck.",
    "Is there a reason you chose {choice} over the simpler approach? Just trying to understand the motivation.",
    "What happens to {component} during a rolling restart? Did you have to handle that separately?",
    "How do you handle {scenario} in this setup? We struggled with that edge case for weeks.",
    "Did this approach change how you think about {concept} more broadly?",
    "What's your p99 at peak? Curious how it compares to the before numbers.",
    "Did you open-source this? Would love to look at the full implementation.",
    "What would you do differently if you were starting over today?",
    "How long did the migration take end-to-end? And was there any rollback plan?",
    "Is this approach idiomatic {tech} or did you have to fight the framework a bit?",
    "How does this interact with your existing {component}? Any conflicts there?",
    "What's the team size that owns this? Curious about the operational burden.",
]

QA_ALTERNATIVES = [
    "io_uring", "FoundationDB", "Temporal", "NATS JetStream", "Apache Flink",
    "CockroachDB", "TiKV", "Scylla", "Vitess", "PlanetScale", "Materialize",
]
QA_CONDITIONS = [
    "network partitions", "clock skew", "burst traffic", "cold caches",
    "high write amplification", "large payloads", "cross-region latency",
]
QA_METRICS = [
    "memory footprint", "CPU utilisation", "GC pause time", "tail latency",
    "throughput", "error rate", "connection count",
]
QA_COMPONENTS = [
    "connection pool", "serialisation", "scheduler", "write path",
    "read path", "auth middleware", "retry logic",
]
QA_SCENARIOS = [
    "partial failures", "duplicate delivery", "out-of-order events",
    "back-pressure", "poison-pill messages", "thundering herd",
]


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


def _make_bio(faker: Faker) -> str:
    template = random.choice(BIO_TEMPLATES)
    return template.format(
        company=random.choice(BIO_COMPANIES),
        area1=random.choice(BIO_AREAS),
        area2=random.choice(BIO_AREAS),
        prev=random.choice(BIO_PREV_COMPANIES),
        seniority=random.choice(["Senior", "Staff", "Principal"]),
        years=random.randint(3, 12),
        tech=random.choice(TECHNOLOGY_POOL),
    )


def make_user(db, faker: Faker, index: int, used: set) -> User:
    slug, handle = unique_handle(faker, used)
    display_name = faker.name()
    created = rand_dt(400)

    user = User(
        email=f"{slug}@meridian.dev",
        username=slug,
        display_name=display_name,
        bio=_make_bio(faker),
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


def _pick_snippet(tech: str) -> str | None:
    """Return a code snippet for the given tech, trying specialised keys first."""
    keys = [k for k in CODE_SNIPPETS if k.startswith(tech)]
    if keys:
        return CODE_SNIPPETS[random.choice(keys)]
    # Fallback: pick a random snippet 20% of the time even for unmatched tech
    if random.random() < 0.2:
        return random.choice(list(CODE_SNIPPETS.values()))
    return None


def compose_body(faker: Faker, topic: str, tech: str) -> str:
    ops_per_day = random.randint(200, 900)
    p99_before = random.randint(40, 120)
    p99_after = random.randint(8, 30)
    savings = random.randint(20, 80)
    loc = random.randint(80, 1200)
    cpu_drop = random.randint(10, 55)
    weeks = random.randint(2, 16)

    structures = [
        # Structure A: context → implementation → benchmarks → retrospective
        "\n\n".join([
            f"I spent the last {weeks} weeks working on {topic}, and after {random.choice(['two rounds of rewrites', 'several false starts', 'a painful incident'])} I finally have something worth sharing. "
            f"The short version: {tech} handled the heavy lifting, but the real win came from simplifying how we reason about {topic}.",
            f"### Context\nOur system processes roughly {ops_per_day}k events a day. We originally solved {topic} with a naive approach "
            f"that worked at small scale, then fell over once traffic patterns shifted. This post covers the architecture we landed on "
            f"and the alternatives we rejected.",
            f"### Implementation\nWe leaned on {tech} for the core path. The first draft was over-engineered — dozens of config knobs and a "
            f"generic abstraction layer — and the second draft cut all of it in favor of a ~{loc} line implementation that is much easier to "
            f"reason about. A few key decisions:\n- {faker.sentence()}\n- {faker.sentence()}\n- {faker.sentence()}",
            f"### Benchmarks\nThe change reduced p99 latency from {p99_before}ms to {p99_after}ms and cut error-budget burn by roughly "
            f"{savings}%. CPU usage in the hottest path also dropped by {cpu_drop}%. Numbers were captured with OpenTelemetry "
            f"traces and Prometheus histograms across three regions.",
            f"### What I'd do differently\nHindsight is {random.randint(2, 9)}/10. I'd validate the failure modes earlier and write the load "
            f"test before the implementation, not after. Happy to answer questions in the comments.",
        ]),
        # Structure B: problem → alternatives considered → chosen approach → results
        "\n\n".join([
            f"We had a {topic} problem. It wasn't obvious at first — the system looked fine in staging and only revealed itself at {ops_per_day}k daily requests. "
            f"This post is a blow-by-blow account of how we diagnosed it, what we tried, and what finally worked.",
            f"### The problem\n{faker.sentence()} {faker.sentence()} The p99 had crept from {p99_after}ms up to {p99_before}ms over three months. "
            f"We'd added {random.choice(['caching', 'retries', 'circuit breakers', 'rate limiting'])} as band-aids but the root cause was always {topic}.",
            f"### Alternatives we considered\nWe looked at three approaches before settling on {tech}:\n"
            f"1. **{random.choice(QA_ALTERNATIVES)}** — promising but operationally heavy for our team size.\n"
            f"2. **A home-grown solution** — we prototyped it in {random.randint(3, 10)} days but the edge cases multiplied fast.\n"
            f"3. **{tech}** — the one we shipped. {faker.sentence()}",
            f"### What we built\nThe final implementation sits at around {loc} lines and has been running in production for "
            f"{random.randint(3, 26)} weeks without incident. {faker.sentence()} {faker.sentence()}\n"
            f"The three design decisions that mattered most:\n- {faker.sentence()}\n- {faker.sentence()}\n- {faker.sentence()}",
            f"### Results\np99: {p99_before}ms → {p99_after}ms. Error rate: -{savings}%. On-call pages per week: "
            f"{random.randint(8, 20)} → {random.randint(0, 3)}. The team is happy. The pager is quiet.",
        ]),
        # Structure C: opinion-first essay style
        "\n\n".join([
            f"Most engineers overcomplicate {topic}. I know because I did it for three years before a {random.choice(['5am incident', 'painful postmortem', 'brutal code review'])} "
            f"forced me to confront the unnecessary complexity I'd built.",
            f"### The trap\nThe standard approach to {topic} involves {faker.sentence().lower()} It feels principled. "
            f"It's taught in courses. And at {random.randint(50, 500)}k requests per day it completely falls apart because {faker.sentence().lower()}",
            f"### What actually works\n{tech} gives you {faker.sentence().lower()} The key insight is that {faker.sentence().lower()} "
            f"Once you internalise that, {topic} becomes {random.choice(['a solved problem', 'dramatically simpler', 'a 200-line module instead of a 2000-line framework'])}.",
            f"### The numbers\nBefore: p99 {p99_before}ms, {ops_per_day * 10}k ops/hour, {cpu_drop + random.randint(5,20)}% CPU. "
            f"After: p99 {p99_after}ms, same throughput, {random.randint(8,30)}% CPU. "
            f"The {loc}-line implementation replaced {random.randint(loc, loc * 5)} lines of the old system.",
            f"### Caveats\nThis works for our constraints. {faker.sentence()} If you have {random.choice(['multi-region requirements', 'strict ordering guarantees', 'sub-millisecond SLAs', 'regulatory compliance needs'])}, "
            f"you'll need to adapt it. The comments are open.",
        ]),
    ]
    return random.choice(structures)


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
    snippet = _pick_snippet(tech)
    if snippet:
        lang = tech.lower().replace(" ", "")
        body += f"\n\n### Code\n```{lang}\n{snippet}\n```"
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


def _make_question(faker: Faker) -> str:
    template = random.choice(QA_QUESTION_TEMPLATES)
    return template.format(
        alt=random.choice(QA_ALTERNATIVES),
        condition=random.choice(QA_CONDITIONS),
        metric=random.choice(QA_METRICS),
        component=random.choice(QA_COMPONENTS),
        choice=random.choice(TECHNOLOGY_POOL),
        scenario=random.choice(QA_SCENARIOS),
        concept=random.choice(TOPICS),
        tech=random.choice(TECHNOLOGY_POOL),
    )


def make_comment(db, faker: Faker, post: Post, questioner: User, created: datetime, all_users: list[User]):
    thread = QAThread(
        post_id=post.id,
        questioner_id=questioner.id,
        question=_make_question(faker),
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

    # A handful of posts get boosted into "popular" territory
    popular = set(random.sample(published, min(12, len(published))))
    for p in popular:
        p.impact_score = int((p.impact_score or 0) * random.uniform(2.5, 4.5))
    db.commit()

    # Reactions (likes)
    reactions = 0
    for post in published:
        if post in popular:
            max_reactions = random.randint(60, 200)
        else:
            max_reactions = random.randint(0, 24)
        sample = random.sample(users, min(max_reactions, len(users)))
        for user in sample:
            if user.id == post.author_id:
                continue
            if post in popular:
                reaction_type = random.choices(
                    VALID_REACTION_TYPES, weights=[10, 10, 10, 70], k=1
                )[0]
            else:
                reaction_type = random.choice(VALID_REACTION_TYPES)
            db.add(
                Reaction(
                    post_id=post.id,
                    user_id=user.id,
                    reaction_type=reaction_type,
                    created_at=post.published_at + timedelta(hours=random.uniform(0, 300)),
                )
            )
            reactions += 1
    db.commit()
    print(f"Seeded {reactions} reactions")

    # Comments / Q&A threads
    comments = 0
    for post in published:
        max_comments = random.randint(12, 40) if post in popular else random.randint(0, 8)
        for _ in range(max_comments):
            make_comment(db, faker, post, random.choice(users), post.published_at + timedelta(hours=random.uniform(1, 300)), users)
            comments += 1
    db.commit()
    print(f"Seeded {comments} comments/Q&A threads")

    # Forks (each fork also creates a fork post)
    forks = 0
    for post in published:
        max_forks = random.randint(6, 18) if post in popular else random.randint(0, 3)
        for _ in range(max_forks):
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
                    title=f"{forker.display_name} forked '{post.title[:50]}'",
                    detail=random.choice([
                        f"{forker.display_name} forked your post and is building on your work. Attribution chain preserved.",
                        f"Your post '{post.title[:45]}' was forked by {forker.display_name} — a new derivative is live.",
                        f"{forker.display_name} extended '{post.title[:45]}' with a fork. Review the changes.",
                        f"Fork created from '{post.title[:45]}' by {forker.display_name}. Your contribution was credited.",
                    ]),
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
            PATCH_DETAILS = {
                "approved": [
                    f"Your patch on '{post.title[:45]}' was approved. Changes will be merged soon.",
                    f"Great work — {submitter.display_name}'s correction to '{post.title[:45]}' was accepted.",
                ],
                "merged": [
                    f"Patch by {submitter.display_name} has been merged into '{post.title[:45]}'.",
                    f"'{post.title[:45]}' was updated with a merged patch from {submitter.display_name}.",
                ],
                "rejected": [
                    f"The patch on '{post.title[:45]}' was reviewed but not merged. See reviewer notes.",
                    f"Patch by {submitter.display_name} on '{post.title[:45]}' was declined with feedback.",
                ],
                "pending": [
                    f"{submitter.display_name} submitted a patch to '{post.title[:45]}'. Review it when you're ready.",
                    f"New patch waiting for review on '{post.title[:45]}' — submitted by {submitter.display_name}.",
                ],
            }
            patch_detail = random.choice(PATCH_DETAILS.get(status, PATCH_DETAILS["pending"]))
            db.add(patch)
            db.add(
                Notification(
                    user_id=post.author_id if random.random() < 0.5 else submitter.id,
                    category="Patches",
                    title=f"Patch {status}: '{post.title[:50]}'",
                    detail=patch_detail,
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

    # Wallet transactions (bookmark / share_internal / used_at_work) + Q&A notifications
    TRANSACTION_RATES = {
        "bookmark":       (0.04, 0.12),   # (amount_min, amount_max)
        "share_internal": (0.08, 0.20),
        "used_at_work":   (0.25, 1.50),
    }
    TRANSACTION_DETAILS = {
        "bookmark": [
            "Reader bookmarked '{title}' for later reference.",
            "'{title}' was saved to a reading list.",
            "Bookmark reaction on '{title}'.",
        ],
        "share_internal": [
            "'{title}' was shared internally within a team.",
            "A reader forwarded '{title}' to a colleague.",
            "Internal share of '{title}' in a work channel.",
        ],
        "used_at_work": [
            "Someone applied advice from '{title}' on the job.",
            "'{title}' was cited as useful during a code review.",
            "A team used '{title}' to guide an architectural decision.",
            "'{title}' influenced a production deployment decision.",
        ],
    }
    transactions = 0
    qa_notifs = 0
    for post in published:
        wallet = db.query(Wallet).filter(Wallet.user_id == post.author_id).first()
        if not wallet:
            continue

        # Generate varied transactions for every published post
        for tx_type, (amt_min, amt_max) in TRANSACTION_RATES.items():
            count = random.randint(0, 6)
            for _ in range(count):
                amount = round(random.uniform(amt_min, amt_max), 2)
                detail_tpl = random.choice(TRANSACTION_DETAILS[tx_type])
                description = detail_tpl.format(title=post.title[:60])
                db.add(Transaction(
                    wallet_id=wallet.id,
                    post_id=post.id,
                    amount=amount,
                    transaction_type=tx_type,
                    description=description,
                    created_at=post.published_at + timedelta(days=random.uniform(0, 60)),
                ))
                wallet.balance = round(wallet.balance + amount, 2)
                wallet.lifetime_paid = round(wallet.lifetime_paid + amount, 2)
                transactions += 1

        # Payout notification summarising earnings for this post
        total_earned = round(random.uniform(0.5, 8.0), 2)
        db.add(Notification(
            user_id=post.author_id,
            category="Payouts",
            title=f"Wallet credited ${total_earned:.2f}",
            detail=(
                f"Earned ${total_earned:.2f} from bookmarks, internal shares, and Used This At Work "
                f"reactions on '{post.title[:50]}'."
            ),
            link="/wallet",
            created_at=post.published_at + timedelta(days=random.uniform(1, 30)),
        ))

        # Q&A notification
        qa = db.query(QAThread).filter(QAThread.post_id == post.id).first()
        if qa and qa.questioner:
            qa_notif_templates = [
                (
                    f"{qa.questioner.display_name} asked a question on '{post.title[:45]}'",
                    f'"{qa.question[:120]}" — reply to keep the discussion going.',
                ),
                (
                    f"New question on your post from {qa.questioner.display_name}",
                    f"A reader wants to know more about '{post.title[:45]}'. Check the comments.",
                ),
                (
                    f"Reader question: {qa.question[:60]}",
                    f"{qa.questioner.display_name} is asking about '{post.title[:45]}'.",
                ),
            ]
            title, detail = random.choice(qa_notif_templates)
            db.add(Notification(
                user_id=post.author_id,
                category="Q&A",
                title=title,
                detail=detail,
                link=f"/posts/{post.id}",
                created_at=qa.created_at,
            ))
            qa_notifs += 1

    db.commit()
    print(f"Seeded {transactions} wallet transactions, {qa_notifs} Q&A notifications")

    # Mentions notifications (you were @mentioned in a comment)
    mentions = 0
    for post in published:
        qa = db.query(QAThread).filter(QAThread.post_id == post.id).first()
        if qa and qa.questioner and random.random() < 0.5:
            mention_templates = [
                (
                    f"{qa.questioner.display_name} mentioned you in a comment",
                    f"You were tagged in a discussion on '{post.title[:50]}'. Check what they said.",
                ),
                (
                    f"@{qa.questioner.username} referenced your work",
                    f"Someone cited '{post.title[:50]}' in a comment thread. Your post got noticed.",
                ),
                (
                    f"You were mentioned by {qa.questioner.display_name}",
                    f"'{post.title[:50]}' came up in a conversation — {qa.questioner.display_name} brought you in.",
                ),
                (
                    f"New mention in a comment on '{post.title[:40]}'",
                    f"{qa.questioner.display_name} referenced you directly in the Q&A thread.",
                ),
            ]
            title, detail = random.choice(mention_templates)
            db.add(
                Notification(
                    user_id=post.author_id,
                    category="Mentions",
                    title=title,
                    detail=detail,
                    link=f"/posts/{post.id}",
                    created_at=qa.created_at + timedelta(hours=random.uniform(0, 24)),
                )
            )
            mentions += 1
    db.commit()
    print(f"Seeded {mentions} mentions notifications")

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
        "mentions": mentions,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Meridian with realistic fake data.")
    parser.add_argument("--users", type=int, default=80, help="number of fake accounts (default 80)")
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
