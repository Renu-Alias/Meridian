from app.config import settings

_model = None


def _get_model():
    global _model
    if _model is None and "sentence-transformers" in settings.SENTENCE_TRANSFORMER_MODEL:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(settings.SENTENCE_TRANSFORMER_MODEL)
        except Exception:
            pass
    return _model


def compute_relevance(post_tags: list[str], user_stack: list[str]) -> float:
    if not post_tags or not user_stack:
        return 0.0
    tag_set = set(t.lower() for t in post_tags)
    stack_set = set(t.lower() for t in user_stack)
    overlap = tag_set & stack_set
    if overlap:
        return min(1.0, len(overlap) / max(len(tag_set), 1) * 1.5)
    model = _get_model()
    if model:
        try:
            post_emb = model.encode(" ".join(post_tags))
            user_emb = model.encode(" ".join(user_stack))
            from numpy import dot
            from numpy.linalg import norm
            cos_sim = dot(post_emb, user_emb) / (norm(post_emb) * norm(user_emb) + 1e-8)
            return float(max(0, cos_sim))
        except Exception:
            pass
    return 0.0


def parse_skills_from_post(body: str, existing_skills: dict[str, float]) -> dict[str, float]:
    tech_keywords = {
        "python", "javascript", "typescript", "rust", "go", "golang",
        "kubernetes", "docker", "aws", "gcp", "azure",
        "react", "vue", "angular", "node", "deno",
        "postgresql", "mysql", "mongodb", "redis",
        "kafka", "rabbitmq", "grpc", "rest", "graphql",
        "terraform", "ansible", "prometheus", "grafana",
        "linux", "wasm", "webassembly", "llm", "machine learning",
    }
    body_lower = body.lower()
    for kw in tech_keywords:
        if kw in body_lower:
            existing_skills[kw] = existing_skills.get(kw, 0) + 10.0
    for skill in existing_skills:
        existing_skills[skill] = min(100.0, existing_skills[skill])
    return existing_skills
