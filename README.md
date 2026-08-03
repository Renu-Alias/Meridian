# Meridian

Meridian is a full-stack social platform for engineering writers and readers. The current codebase includes an authenticated frontend experience, a FastAPI backend, and several core product flows such as discovery, feed browsing, post creation, notifications, wallet interactions, profiles, settings, mentorship, and recruiter-facing endpoints.

<p align="center">
  <img src="tag.png" alt="Meridian logo" width="480">
</p>

## What the project includes

- Landing and authentication pages for unauthenticated users
- An authenticated app shell with feed, discover, notifications, wallet, profile, and settings views
- Post creation and detail pages for reading and publishing engineering content
- A post editor (`/editor/new`) accessible outside the auth shell
- Backend routes for auth, users, posts, feed, interactions, wallet, mentorship, notifications, recruiter, account, ranking, and search
- Semantic search powered by sentence-transformers (runs locally, no external API required)
- Local development defaults powered by SQLite and Alembic migrations, with optional Redis/Celery support
- PostgreSQL support via psycopg2 for production deployments
- A `seed_fake.py` script for generating realistic fake data during development

## Tech stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query, Zustand, Framer Motion
- Three.js / React Three Fiber for visual backgrounds

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy + Pydantic
- Alembic for database migrations
- SQLite by default for local development; PostgreSQL supported for production
- Optional Redis and Celery for background jobs
- sentence-transformers + scikit-learn for semantic search and ranking

## Repository layout

```text
meridian-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── utils/
└── package.json

meridian-backend/
├── app/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── seed.py
│   └── seed_fake.py
├── alembic/
├── requirements.txt
└── alembic.ini
```

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Frontend

```bash
cd meridian-frontend
npm install
npm run dev
```

The app runs on http://localhost:5173 by default.

### Backend

```bash
cd meridian-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a local environment file if you want to override defaults:

```bash
# example values
export SECRET_KEY=change-me
export DATABASE_URL=sqlite:///./meridian.db
export CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

Then start the API:

```bash
uvicorn app.main:app --reload
```

The backend will run on http://localhost:8000 and apply Alembic migrations automatically on startup.

### Seeding fake data

To populate the database with realistic test data:

```bash
cd meridian-backend
python -m app.seed_fake
```

### Useful commands

```bash
# Frontend build
cd meridian-frontend && npm run build

# Frontend lint
cd meridian-frontend && npm run lint

# Backend migrations (manual)
cd meridian-backend && alembic upgrade head
```

## Notes

This repository is under active development. The original product brief in PRD.md is still useful as a roadmap, but the current implementation is more focused on the working frontend and API flows that are already present in the codebase.
