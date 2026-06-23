from sqlalchemy.orm import Session

from app.models.user import Technology

COMMON_TECHNOLOGIES = [
    "Python", "JavaScript", "TypeScript", "Rust", "Go", "Java", "Kotlin", "C#",
    "Ruby", "PHP", "C++", "C", "Swift", "Scala", "Elixir", "Clojure", "Haskell",
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Node",
    "Django", "Flask", "FastAPI", "Spring", "Rails", "Laravel",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch",
    "Docker", "Kubernetes", "Terraform", "Ansible", "AWS", "GCP", "Azure",
    "Linux", "Nginx", "Apache", "Kafka", "RabbitMQ", "gRPC", "GraphQL",
    "Prometheus", "Grafana", "OpenTelemetry", "Wasm", "WebAssembly",
    "Machine Learning", "LLM", "PyTorch", "TensorFlow", "Scikit-learn",
]


def seed_technologies(db: Session):
    existing = {t.name for t in db.query(Technology).all()}
    for name in COMMON_TECHNOLOGIES:
        if name not in existing:
            tech = Technology(name=name, category="", is_approved=True)
            db.add(tech)
    db.commit()
