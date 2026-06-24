# Product Requirements Document (PRD)
## Meridian — Peer-Driven Blogging Platform for Engineers
 
| Field | Detail |
|---|---|
| Document Status | Draft v0.1 |
| Product Owner | Product Team |
| Last Updated | June 18, 2026 |
| Audience | Engineering, Design, Growth, Leadership |
| Related Artifacts | Engineering README / Architecture Overview |
 
---
 
## 1. Overview
 
### 1.1 Product Vision
Meridian is a blogging platform built exclusively for engineers, designed to replace algorithmic, follower-driven distribution (the Medium/Hashnode model) with **peer-driven discovery, technical integrity, and long-term content value**. Where existing platforms reward virality and frequency, Meridian rewards relevance, accuracy, and applied impact.
 
### 1.2 Problem Statement
Technical writers currently face three structural problems on general-purpose blogging platforms:
 
- **Poor distribution fit** — a deep, narrow technical post (e.g., Kafka consumer-lag tuning) is shown to broad audiences instead of the engineers actively working with that technology, so it underperforms regardless of quality.
- **Decaying value** — once published, technical posts go stale as APIs, libraries, and best practices change, but there is no structured way for the community to keep them accurate.
- **Misaligned incentives** — monetization and ranking are tied to pageviews and engagement, not to whether the content was technically sound or actually useful to someone's job.
### 1.3 Target Users & Personas
 
| Persona | Description | Primary Goals |
|---|---|---|
| **Sana — Mid-level Backend Engineer** | Writes occasionally about tools she uses in production. | Reach engineers on her exact stack; get credit when her writing is actually applied. |
| **Marcus — Senior Staff Engineer** | Writes frequently, has deep expertise in 2–3 domains. | Build a credible public track record; mentor others; earn from real-world impact. |
| **Devika — Junior Engineer** | Wants to write but is intimidated by public critique. | Publish with guidance; get visibility without fear of being torn apart in public. |
| **Priya — Engineering Manager / Technical Recruiter** | Sourcing engineers for her team. | Find candidates by verified, demonstrated expertise rather than keyword-stuffed resumes. |
 
### 1.4 Competitive Positioning
Relative to Medium and Hashnode, Meridian's differentiation rests entirely on its eight core USPs (Section 4): stack-aware distribution instead of follower-based feeds, living/patchable posts instead of static articles, collaborative forking instead of solo-only publishing, impact-based pay instead of pageview-based pay, and a structured mentorship path instead of an unmoderated free-for-all.
 
---
 
## 2. Goals & Success Metrics
 
| Goal | Primary Metric(s) |
|---|---|
| Improve content-to-reader relevance | CTR on "For Your Stack" feed vs. generic feed; average session depth |
| Keep technical content accurate over time | % of posts >6 months old with at least one accepted patch; median post "freshness age" |
| Encourage true collaborative authorship | # forks created per month; % of forks that merge changes back upstream |
| Reward demonstrated impact, not just attention | # of "Used This At Work" reactions per post; monthly payout volume distributed |
| Increase trust in technical claims | % of published posts with at least one verified citation; # of unverified-claim flags resolved |
| Build a sustainable mentorship pipeline | # of active mentors; % of Mentored Track submissions published within SLA |
| Make writing a credible professional signal | # of public profiles with a populated Skills Graph; recruiter search opt-in rate |
| Lower the barrier for new technical writers | % of first-time authors who use the Mentored Track; mentee retention after first post |
 
---
 
## 3. Scope
 
### 3.1 In Scope — V1
- Account creation with GitHub and LinkedIn OAuth import for stack profile setup
- Manual stack tagging and a controlled technology taxonomy
- Stack-matched discovery feed (rule-based + embedding similarity via `sentence-transformers`)
- Post authoring with rich text/Markdown, code blocks, and inline citations
- Patch submission and PR-style author review/approval workflow (Living Posts)
- One-click forking with preserved attribution chain and merge-suggestion flow
- Reaction system: Bookmark, Share Internally, "Used This At Work"
- Wallet ledger and basic Stripe Connect payout flow
- Claim verification: inline citations, community "unverified claim" flagging, author credibility score
- Structured Q&A panel per post, with auto-generated FAQ from resolved threads
- Auto-generated Skills Graph and public author profile
- Mentored Track: submission, mentor matching, review workspace, reviewer credit
- Opt-in recruiter search over public profiles
### 3.2 Out of Scope — V1 (Candidate for Later Phases)
- Native mobile apps (responsive web only at launch)
- Deep, continuous two-way GitHub/LinkedIn sync (V1 is import-on-connect, not live sync)
- Automated/algorithmic fact-checking of citations (V1 relies on community flagging + author response)
- Recruiter marketplace billing and outreach tooling beyond basic search/contact request
- Multi-language / i18n support
- Advanced anti-fraud detection for "Used This At Work" gaming
- Public API for third-party integrations
---
 
## 4. Feature Requirements
 
Each USP below is broken into description, user stories, functional requirements, acceptance criteria, and dependencies.
 
### 4.1 USP 1 — Stack-Matched Discovery
**Description:** Posts are matched to readers based on their active technology stack rather than follower graphs, so a Kafka-tuning post reaches engineers currently working with Kafka.
 
**User Stories**
- As an author, I want to tag my post with the technologies it covers, so the right readers find it.
- As a reader, I want my feed to reflect my current stack, so I don't waste time on irrelevant content.
**Functional Requirements**
- FR-1.1: System shall allow authors to tag a post with one or more technologies from a controlled taxonomy, with the ability to request new tags pending moderation.
- FR-1.2: System shall allow readers to set an "active stack" profile, populated from GitHub repo language/dependency data, LinkedIn skills, and manual entry.
- FR-1.3: System shall compute a relevance score between a post's tags and a reader's stack profile using embedding similarity, and rank the "For Your Stack" feed accordingly.
- FR-1.4: System shall let readers manually adjust or remove stack entries at any time.
**Acceptance Criteria**
- A post tagged with a given technology appears with measurably higher rank in the feeds of readers whose stack profile includes that technology, compared to readers without it.
- Removing a technology from a stack profile removes related posts from the "For Your Stack" feed within one refresh cycle.
**Dependencies:** GitHub/LinkedIn OAuth integration, `sentence-transformers` matching service, technology taxonomy data store.
 
---
 
### 4.2 USP 2 — Living Posts
**Description:** Readers can submit patches — corrections or updates — to existing posts, similar to a pull request, keeping technical content accurate over time.
 
**User Stories**
- As a reader, I want to suggest a fix to an outdated post, so future readers aren't misled.
- As an author, I want to review and accept/reject suggested patches, so I retain control over my own work.
**Functional Requirements**
- FR-2.1: System shall allow any registered reader to submit a patch (a proposed text diff) against a published post.
- FR-2.2: System shall present patches to the original author in a PR-style review interface with approve, request-changes, and reject actions.
- FR-2.3: System shall maintain a full version history for every post, including all accepted patches and their authors.
- FR-2.4: System shall notify the patch submitter when a decision is made.
**Acceptance Criteria**
- A submitted patch is visible to the author in a queue with a clear diff view before any decision is made.
- Once approved, the patch is merged into the live post and recorded in version history with submitter attribution.
**Dependencies:** Diff/version-history storage, Celery notification jobs.
 
---
 
### 4.3 USP 3 — Collaborative Forking
**Description:** A GitHub-style forking model lets engineers fork an existing post, build on it, and publish their own version with full attribution back to the original.
 
**User Stories**
- As a reader, I want to fork a post to add my own perspective, so I can build on existing work instead of starting from scratch.
- As an original author, I want to see who has forked my work and optionally merge their improvements back.
**Functional Requirements**
- FR-3.1: System shall provide a one-click "Fork" action on any published post, creating an editable copy owned by the forking user.
- FR-3.2: System shall preserve and display the full attribution chain (original author and any intermediate forks) on every forked post.
- FR-3.3: System shall allow a fork author to submit a merge suggestion back to the upstream post, using the same review flow as patches.
- FR-3.4: System shall list all forks of a given post, accessible from the original post page.
**Acceptance Criteria**
- Forking a post creates a new, independently editable post with a visible "Forked from [original]" link.
- The original author can view a list of all forks and any pending merge suggestions from them.
**Dependencies:** Post versioning system (shared with USP 2), lineage/graph data model.
 
---
### 4.4 USP 4 — Impact-Based Reputation & Global Ranking

**Description:** A point-based reputation system rewards engineers for the real-world
impact of their writing. Points are earned when others fork, repost, or mark a post
as "used at work", and fuel a global rank that influences post visibility and
author credibility across the platform.

---

### User Stories

* As a writer, I want to earn points when others find my work useful, so that my
  reputation reflects my real contribution to the community.
* As a writer, I want to see a breakdown of how I earned my points, so that I
  understand what kind of writing resonates most.
* As a reader, I want to see an author's rank and tier before reading their post,
  so that I can quickly assess their credibility at a glance.
* As a reader, I want to mark a post as "used at work", so that I can reward writers
  whose work had a direct impact on me professionally.

---

### Functional Requirements

* FR-4.1: System shall award points to a writer whenever another user forks,
  reposts, or reacts with "used at work" on their post, with point values
  scaled by the acting user's rank multiplier.
* FR-4.2: System shall maintain a point ledger per user, logging every point
  event with action type, source user, base points, multiplier applied,
  and timestamp.
* FR-4.3: System shall assign each user a rank tier based on their cumulative
  points, progressing through: Newcomer → Contributor → Engineer →
  Senior → Architect → Fellow.
* FR-4.4: System shall display a rank tier badge on every author profile and
  post card, with a breakdown tooltip showing total points and top
  point sources.
* FR-4.5: System shall maintain a paginated global leaderboard, refreshed every
  24 hours, filterable by rank tier, tech stack tag, and time period
  (weekly, monthly, all-time).
* FR-4.6: System shall boost discovery feed visibility for higher-ranked authors,
  proportional to their current rank tier.

---

### Acceptance Criteria

* A "used at work" reaction on a post correctly awards +15 points (adjusted by
  multiplier) to the post author, limited to one reaction per user per post.
* A fork from a `Senior`-tier user awards `10 × 2.0 = 20 points` to the
  original author, not a flat 10.
* An author's rank tier badge updates within 24 hours of crossing a points
  threshold.
* The global leaderboard returns correct results when filtered by stack tag
  and time period.
* Every point event appears in the author's point ledger with full event metadata.

---

### Dependencies

* USP-02 Living Posts — patch acceptance triggers a point event for the patch submitter
* USP-03 Collaborative Forking — fork action triggers a point event for the original author
* USP-08 Mentored Publishing — successful mentee publish triggers a point event for the mentor
* Celery + Redis — async rank recalculation every 24 hours and leaderboard caching
---
 
### 4.5 USP 5 — Claim Verification
**Description:** Technical assertions in a post can be linked to supporting proof (code, benchmarks, papers), and the community can flag unverified claims, feeding into a per-author credibility score.
 
**User Stories**
- As an author, I want to attach evidence to a specific claim, so readers can verify it instantly.
- As a reader, I want to flag a claim that lacks evidence, so the community can hold authors accountable.
**Functional Requirements**
- FR-5.1: System shall let authors attach an inline citation (link to code, benchmark, or paper) to any highlighted span of text in the editor.
- FR-5.2: System shall render citations as inline markers that expand to show the linked source on click.
- FR-5.3: System shall let any reader flag a claim as "unverified," visible to other readers and to the author.
- FR-5.4: System shall compute a per-author credibility score based on the ratio of verified to flagged-and-unresolved claims across their published posts.
**Acceptance Criteria**
- A claim with an attached citation displays a visible verification marker distinct from unflagged or flagged text.
- Flagging a claim surfaces it to the author with an option to respond or add supporting evidence.
**Dependencies:** Citation data model, credibility scoring service.
 
---
 
### 4.6 USP 6 — Posts That Talk Back (Structured Q&A)
**Description:** Each post has a structured Q&A section, separate from general comments, where the author answers reader questions; resolved threads roll up into an auto-generated FAQ.
 
**User Stories**
- As a reader, I want to ask the author a specific technical question tied to the post, distinct from a comment thread.
- As an author, I want my answered questions to compound into documentation over time, rather than getting buried in comments.
**Functional Requirements**
- FR-6.1: System shall provide a structured Q&A panel on every post, separate from any general comment section.
- FR-6.2: System shall visually highlight author-answered questions.
- FR-6.3: System shall auto-generate an FAQ section on the post from resolved (author-answered) Q&A threads.
- FR-6.4: System shall index Q&A content so it is searchable independently of the main post body.
**Acceptance Criteria**
- A question submitted in the Q&A panel is visually distinguishable from comments and persists with the post.
- Once an author answers a question, it appears in the post's auto-generated FAQ section.
**Dependencies:** Search indexing for Q&A content, notification system for new questions/answers.
 
---
 
### 4.7 USP 7 — Writing as Your Portfolio
**Description:** Every published post is parsed for technologies, concepts, and depth, automatically building a verified skills profile that recruiters can search (opt-in only).
 
**User Stories**
- As an author, I want my published writing to build a credible, verifiable skills profile automatically.
- As a recruiter, I want to search for engineers by demonstrated expertise rather than self-reported resumes.
**Functional Requirements**
- FR-7.1: System shall parse published posts for technologies, concepts, and relative depth, and update the author's Skills Graph accordingly.
- FR-7.2: System shall display the Skills Graph and verified expertise tags on a public author profile.
- FR-7.3: System shall provide an opt-in toggle controlling whether a profile is discoverable in recruiter search.
- FR-7.4: System shall provide a recruiter-facing search interface filterable by technology, depth signal, and credibility score (from USP 5).
**Acceptance Criteria**
- Publishing a new post updates the author's Skills Graph without manual input.
- An author who has not opted in does not appear in recruiter search results under any filter combination.
**Dependencies:** Content parsing/NLP pipeline (shared infrastructure with USP 1 matching), credibility scoring (USP 5).
 
---
 
### 4.8 USP 8 — Mentored Publishing for Beginners
**Description:** A dedicated track lets junior engineers submit drafts for review and mentorship by senior volunteers before publishing, with reviewer credit shown on the final post.
 
**User Stories**
- As a junior engineer, I want expert feedback before my post goes public, so I can publish with confidence.
- As a senior engineer, I want a structured way to mentor and receive credit for my review work.
**Functional Requirements**
- FR-8.1: System shall let any author submit a draft to the "Mentored Track" instead of publishing directly.
- FR-8.2: System shall match submissions to a senior volunteer reviewer based on declared domain/technology overlap.
- FR-8.3: System shall provide a review workspace with inline commenting and suggested edits, distinct from the public Q&A/patch flows.
- FR-8.4: System shall display reviewer credit on the published post once the mentor approves it for publication.
- FR-8.5: System shall track time-to-review against a defined SLA and surface this to mentors as a workload indicator.
**Acceptance Criteria**
- A submission to the Mentored Track is not publicly visible until a matched mentor approves it.
- The published post displays the mentor's name/credit in a clearly distinguishable location from the primary author byline.
**Dependencies:** Mentor pool/availability data, matching logic (domain taxonomy shared with USP 1).
 
---
 
## 5. UI/UX Requirements
 
### 5.1 Design Principles
- **Stack-first, not feed-first:** the reader's technology context should visibly shape what they see, not be hidden behind a generic algorithm.
- **Evidence is visible, not buried:** citations, verification status, and credibility signals should be glanceable, not nested behind extra clicks.
- **Collaboration looks like collaboration:** forks, patches, and mentorship should visually resemble version control (diffs, lineage, PR-style review) so the mental model is familiar to engineers.
- **Beginners are protected by design:** the Mentored Track UI should never expose unpublished junior drafts to public critique.
### 5.2 Information Architecture (Sitemap)
```
/onboarding          → Stack profile setup
/feed                → Home / Discovery feed
/post/:id            → Post detail / reader view
/editor/new          → New post editor
/editor/:id           → Edit existing post / patch submission mode
/post/:id/patches     → Patch review interface (author only)
/post/:id/forks       → Fork & lineage view
/profile/:username    → Author profile / portfolio
/wallet               → Wallet & earnings dashboard
/mentored             → Mentored Track (submission queue, mentor dashboard)
/recruiter-search     → Recruiter search (opt-in tier, recruiter accounts)
/notifications        → Notification center
/settings             → Account, privacy, payout, and notification settings
```
 
### 5.3 Page & Component Specifications
 
**5.3.1 Onboarding & Stack Profile Setup**
- GitHub and LinkedIn OAuth connect buttons with explanation of requested scopes
- Auto-populated stack chips from import, each removable
- Searchable multi-select technology picker with autocomplete (controlled taxonomy)
- Optional seniority/role selector (used later for Mentored Track matching)
- Step progress indicator and "skip for now" option
**5.3.2 Home / Discovery Feed**
- Top navigation: logo, global search, "Write" button, notification bell, profile avatar
- Feed tabs: "For Your Stack" (default), "Following," "All," "Mentored Track"
- Post card: title, author byline, stack/tag chips, verification badge, "Living Post — patched N days ago" indicator where applicable, reaction counts, estimated read time
- Sidebar: active stack profile summary with quick-edit link, trending technologies widget
- Empty/cold-start state for users without a populated stack profile, prompting setup
**5.3.3 Post Detail / Reader View**
- Header: title, author byline with credibility score badge, publish/last-updated date, tag chips
- Body renderer with syntax-highlighted code blocks and inline citation markers (expand on click to show source)
- Inline "flag as unverified" control on highlighted claims
- Reaction bar: Bookmark, Share Internally, Used This At Work, Fork
- Patch history drawer (collapsed by default) showing a timeline of accepted patches
- Fork lineage breadcrumb when the post is itself a fork
- Structured Q&A panel: question list, author-answered items visually highlighted, "Ask a question" CTA, auto-generated FAQ accordion
- Author mini-card linking to full profile
**5.3.4 Editor (Compose / Edit)**
- Title field and technology tag picker (shared component with onboarding)
- Markdown/rich-text editor with code block support and live preview
- Citation tool: highlight text, attach a link to code/benchmark/paper
- Autosave status indicator
- "Submit to Mentored Track" toggle with domain selector, shown only for first-time or opted-in authors
- Fork context banner when editing a forked draft, showing original post and attribution settings
- Constrained "patch mode" for non-author contributors, producing a diff rather than a full overwrite
- Primary actions: Save Draft, Preview, Publish (or "Submit for Mentorship" when toggled)
**5.3.5 Patch Review Interface (author-only)**
- Diff viewer (before/after) per pending patch
- Patch metadata: submitter, rationale, submission date
- Approve / Request Changes / Reject actions with optional comment
- Threaded discussion on each patch
**5.3.6 Fork & Lineage View**
- Lineage visualization showing original post and downstream forks
- "Forked from" badge linking to the upstream post
- Merge-suggestion panel for proposing changes back upstream
- Full fork list with author and date for each
**5.3.7 Author Profile / Portfolio**
- Header: avatar, name, bio, credibility score, linked GitHub/LinkedIn
- Auto-generated Skills Graph (grouped by technology/concept with depth indicators)
- Published post list with per-post impact stats (Used At Work count, verification rate)
- Mentored Track history (as mentee and/or mentor)
- "Visible to recruiters" opt-in toggle with a plain-language explanation of what becomes searchable
- Earnings summary teaser linking to the Wallet dashboard
**5.3.8 Wallet & Earnings Dashboard**
- Current balance and payout history table
- Earnings breakdown by post and reaction type
- Monthly impact analytics chart
- Stripe Connect account management
- Manual payout request action (if payouts are not fully automatic)
**5.3.9 Mentored Track**
- Mentee view: submission queue with status (pending match, in review, approved, published)
- Mentor matching screen showing domain-matched senior reviewers and availability
- Review workspace: inline commenting, suggested edits, approve-to-publish action
- Reviewer credit configuration (how the mentor's name appears on the published post)
- Mentor dashboard: assigned drafts, time-to-review SLA indicator
**5.3.10 Recruiter Search (opt-in tier)**
- Filterable search: technology, depth/seniority signal, credibility score
- Result cards showing Skills Graph preview, contact-request action respecting author privacy settings
- Clear indication that only opted-in authors appear in results
**5.3.11 Notifications**
- Notification center covering patch decisions, Q&A answers, mentions, fork activity, and payout events
- Per-category notification preferences (in-app vs. email)
**5.3.12 Settings**
- Account & linked OAuth accounts
- Stack profile editor
- Privacy controls (recruiter visibility, public profile toggle)
- Notification preferences
- Payout/Stripe account management
- Data export and account deletion
### 5.4 Responsive & Accessibility Requirements
- Fully responsive across desktop, tablet, and mobile breakpoints; V1 is web-only (no native app).
- Target WCAG 2.1 AA: keyboard-navigable editor and diff viewer, sufficient color contrast for tags/badges, screen-reader labels on all reaction and review controls.
- Code blocks must remain horizontally scrollable on narrow viewports without breaking the surrounding layout.
---
 
## 6. Technical Requirements
 
### 6.1 System Architecture
The React frontend communicates with the FastAPI backend over REST. The backend is the single source of truth, backed by PostgreSQL for durable storage, Redis for caching and session state, and Celery for asynchronous background work (patch notifications, payout processing, matching jobs).
 
```
React Frontend (Vite + TS)  ⇄  FastAPI Backend (Python 3.11+)
                                        │
                ┌───────────────────────┼───────────────────────┐
           PostgreSQL              Redis (cache/             Celery (async
         (primary store)            sessions)                background jobs)
```
 
### 6.2 Frontend
- React 18 with React Router v6
- TanStack Query for server state and caching
- Zustand for lightweight client state
- Monaco Editor for in-post code blocks
- Tailwind CSS for styling
### 6.3 Backend
- FastAPI for the async API layer
- SQLAlchemy ORM over PostgreSQL as the primary data store
- Redis for caching and session management
- Celery for background jobs: patch notifications, payout processing, stack-matching recomputation
- `sentence-transformers` for embedding-based stack-to-post matching (USP 1) and content parsing for the Skills Graph (USP 7)
- Stripe SDK for micropayment processing and payouts (USP 4)
### 6.4 Core Data Entities (proposed)
 
| Entity | Purpose |
|---|---|
| User | Account, auth, OAuth links, role/seniority |
| StackProfile | A user's active technologies, sourced from import + manual edits |
| Post | Title, body, tags, status, version pointer |
| PostVersion / Patch | Version history and pending/accepted patches |
| Fork | Lineage link between a post and its origin |
| Citation | Claim-to-evidence link within a post |
| ClaimFlag | Community flag on an unverified claim |
| QAThread | Structured question/answer tied to a post |
| Reaction | Bookmark / Share / Used At Work events |
| Wallet / Transaction | Earnings ledger and payout records |
| MentorshipSubmission | Mentored Track draft, status, mentor assignment |
| SkillsGraphEntry | Parsed technology/concept/depth signal per author |
| CredibilityScore | Derived score from citation verification ratio |
 
### 6.5 Third-Party Integrations
- **GitHub OAuth** — read-only access to repos/languages for stack import
- **LinkedIn OAuth** — skills/experience import for stack profile
- **Stripe Connect** — author payouts and PCI-compliant payment handling
---
 
## 7. Non-Functional Requirements
 
| Category | Requirement |
|---|---|
| Performance | Discovery feed should render initial results within an acceptable interactive-load budget even under embedding-based ranking. |
| Security | OAuth scopes limited to read-only where possible; payment data handled via Stripe-hosted elements, not stored directly. |
| Scalability | Stateless API layer behind a load balancer; Celery workers scale independently for matching and payout jobs. |
| Reliability | Defined uptime target with backup and retention policy for PostgreSQL. |
| Accessibility | WCAG 2.1 AA across core flows (feed, reader, editor, review interfaces). |
| Data Compliance | Support data export and account deletion requests; financial compliance delegated to Stripe (PCI DSS). |
 
---
 
## 8. Analytics & Instrumentation
Key events to instrument, mapped to the goals in Section 2: stack tag applied, feed impression by match score, reaction fired (by type), patch submitted/approved/rejected, fork created, merge-suggestion submitted, citation added, claim flagged/resolved, Q&A question asked/answered, wallet credited, payout requested/completed, Mentored Track submission/match/publish, recruiter search performed/contact requested.
 
---
 
## 9. Risks, Assumptions & Open Questions
- **Cold start for matching:** new users without GitHub/LinkedIn history have no stack signal; manual tagging must be a first-class path, not a fallback.
- **Gaming of "Used This At Work":** self-reported impact reactions are vulnerable to abuse; rate-limiting and possible verification heuristics need further definition.
- **Patch/fork spam:** an open patch and fork system needs reviewer-reputation or rate-limit gating to avoid noise for popular authors.
- **Mentor supply:** the Mentored Track depends on a sufficient pool of senior volunteers; matching SLA is contingent on mentor availability, which is not yet modeled.
- **Citation verification depth:** V1 verification is citation-presence plus community flagging, not automated fact-checking — this should be clearly communicated to authors and readers as a current limitation.
- **Recruiter privacy:** opt-in design needs to prevent unwanted contact; exact visibility boundaries (e.g., what a non-contacting recruiter can see) require further definition.
---
 
## 10. Proposed Release Phasing
1. **Foundations:** auth, stack profile setup, basic post CRUD, unranked feed.
2. **Discovery & Verification:** stack-matched feed (USP 1), claim verification (USP 5).
3. **Collaboration:** Living Posts/patches (USP 2), Collaborative Forking (USP 3).
4. **Engagement Loop:** Structured Q&A (USP 6), Writing as Portfolio (USP 7).
5. **Monetization & Growth:** Impact-Based Monetization (USP 4), Mentored Publishing (USP 8), Recruiter Search.
---
 
## 11. Appendix: Glossary
- **Living Post:** A published post that can receive community-submitted patches over time.
- **Patch:** A proposed correction or update to a post, reviewed PR-style by the original author.
- **Fork:** An independently editable copy of a post, with preserved attribution to the original.
- **Stack Profile:** A reader's or author's set of active technologies, used for matching and the Skills Graph.
- **Credibility Score:** A per-author score derived from the ratio of verified to flagged-and-unresolved claims.
- **Mentored Track:** A pre-publication review path for junior engineers, matched with senior volunteer reviewers.
- **Used This At Work:** A reaction signaling that a reader applied the post's content in their own job, used as a monetization trigger.
