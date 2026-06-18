
# 📝 Meridian — Where Great Engineering Writing Gets Found
 
> A peer-driven blogging platform built for tech enthusiasts and engineers.  
> Great posts don't go unread here.
 
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/backend-Python-3776AB?logo=python)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)
 
---
 
## 🚀 What is Meridian?
 
**Meridian** is an open blogging platform designed exclusively for engineers and tech enthusiasts. Unlike Medium or Hashnode — where algorithmic feeds and follower counts dictate who gets read — Meridian is built around **peer-driven discovery**, **technical integrity**, and **long-term value**.
 
Eight core USPs define everything we build:
 
---
 
## ✨ Core USPs
 
### 1. 🎯 Stack-Matched Discovery
> *"Write once, reach the exact team that needs it."*
 
Posts are intelligently matched to engineers based on their current tech stack, pulled from GitHub and LinkedIn integrations. A post about Kafka tuning lands in front of engineers actively working with Kafka — not random followers.
 
- Tag posts with technologies used
- Readers opt into their active stack profile
- Zero wasted impressions; 100% relevant reach
---
 
### 2. ⏱️ Living Posts — Your Writing Doesn't Expire
> *"Your best posts don't go stale."*
 
Technical content has a shelf life. Surfaced lets the community submit *patches* to outdated posts — like a pull request but for writing. Articles stay accurate, keep ranking, and keep helping.
 
- Community-submitted corrections and updates
- Author approves/rejects patches via a PR-style interface
- Version history for every post
---
 
### 3. 🤝 Collaborative Forking
> *"Co-author with engineers you've never met."*
 
A GitHub-style forking model for blog posts. Fork someone's article, improve it, add your perspective, and publish your version with full attribution. Collaborative technical writing, not just solo publishing.
 
- One-click fork any post
- Full attribution chain preserved
- Merge suggestions back to the original author
---
 
### 4. 💰 Impact-Based Monetization
> *"Get paid per engineer who actually applies your idea."*
 
Writers earn micro-payments not on reads, but when readers bookmark, share internally, or mark a post as *"used this at work"*. Reward impact, not clickbait.
 
- Stripe-powered micro-payment wallet
- "Used at work" reaction triggers writer earnings
- Monthly payout dashboard with impact analytics
---
 
### 5. 🧪 Claim Verification
> *"Every claim is linked to a proof."*
 
A structured post format where technical assertions must link to code, benchmarks, or papers. Readers can instantly verify claims. Builds a culture of honest, rigorous engineering writing.
 
- Inline citation system for code snippets and benchmarks
- "Unverified claim" flag raised by community
- Credibility score per author based on verification rate
---
 
### 6. 🗣️ Posts That Talk Back
> *"Blog posts that evolve into documentation."*
 
Each post has a structured Q&A section — not a comment section, but threaded questions the author answers. Posts grow into living, searchable documentation over time.
 
- Structured Q&A separate from general comments
- Author answers are highlighted and indexed
- Posts auto-generate an FAQ section from resolved threads
---
 
### 7. 🧭 Writing as Your Portfolio
> *"Your writing becomes your engineering CV."*
 
Every post you publish is parsed for technologies, concepts, and depth — auto-building a verified skills profile. Recruiters search Surfaced not for resumes, but for *thinkers*.
 
- Auto-generated skills graph from post content
- Public author profile with verified expertise tags
- Recruiter search tier (opt-in only)
---
 
### 8. 🌱 Mentored Publishing for Beginners
> *"No expertise required to be heard."*
 
A dedicated track for junior engineers — posts are reviewed and mentored by senior volunteers before going live. Beginners get expert feedback AND visibility, without fear of public criticism.
 
- Submit to "Mentored Track" before publishing
- Matched with a senior reviewer in your domain
- Reviewer credit shown on the published post
---
 
## 🛠️ Tech Stack
 
### Frontend — React
```
meridian-frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── context/           # Global state (auth, theme, stack profile)
│   ├── services/          # API calls to backend
│   └── utils/             # Helpers and formatters
├── public/
├── package.json
└── vite.config.js
```
 
**Key libraries:**
- `React 18` + `React Router v6`
- `TanStack Query` — server state & caching
- `Zustand` — lightweight client state
- `Monaco Editor` — rich code blocks in posts
- `Tailwind CSS` — utility-first styling
---
 
### Backend — Python
```
meridian-backend/
├── app/
│   ├── api/               # Route handlers (FastAPI routers)
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── services/          # Business logic layer
│   ├── workers/           # Background tasks (Celery)
│   └── core/              # Config, auth, middleware
├── tests/
├── requirements.txt
└── main.py
```
 
**Key libraries:**
- `FastAPI` — high-performance async API framework
- `PostgreSQL` + `SQLAlchemy` — primary data store
- `Redis` — caching and session management
- `Celery` — async background jobs (patch notifications, payouts)
- `sentence-transformers` — NLP for stack-matching posts to readers
- `Stripe SDK` — micro-payment processing
---
 
## 🗂️ Architecture Overview
 
```
           ┌─────────────────────┐        ┌──────────────────────┐
           │   React Frontend    │◄──────►│   FastAPI Backend    │
           │   (Vite + TS)       │  REST  │   (Python 3.11+)     │
           └─────────────────────┘        └──────────┬───────────┘
                                                     │
                              ┌──────────────────────┼─────────────────────┐
                              │                      │                     │
                       ┌──────▼──────┐      ┌────────▼──────┐     ┌────────▼──────┐
                       │ PostgreSQL  │      │     Redis     │     │    Celery     │
                       │  (primary   │      │  (cache +     │     │  (background  │
                       │   store)    │      │   sessions)   │     │    tasks)     │
                       └─────────────┘      └───────────────┘     └───────────────┘
```
 
---
 
## ⚡ Getting Started
 
### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
### Frontend Setup
```bash
cd meridian-frontend
npm install
cp .env.example .env        # Add your API base URL
npm run dev                 # Runs on http://localhost:5173
```
 
### Backend Setup
```bash
cd meridian-backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Add DB, Redis, Stripe keys
alembic upgrade head        # Run migrations
uvicorn main:app --reload   # Runs on http://localhost:8000
```
 
---
 
## 🧪 Running Tests
 
```bash
# Frontend
cd meridian-frontend && npm run test
 
# Backend
cd meridian-backend && pytest --cov=app tests/
```
 
---

<p align="center">Built with ❤️ for engineers, by engineers.</p>
