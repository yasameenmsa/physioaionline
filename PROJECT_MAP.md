# PhysioAI.online — Project Map

> Generated: 2026-05-14 via Planning Protocol (Revised for Physiopedia-aligned vision)
> Last Updated: 2026-05-16 (Phase 1 ✅ | Phase 2 ✅ | Email SMTP ✅ | Testing ✅ | Image Upload ✅)

---

## TECH_STACK

| Layer | Technology | Version (Locked) | Latest Available | Status |
|-------|-----------|-------------------|------------------|--------|
| Framework | Next.js | 16.1.6 | 16.2.6 | ⚠ Patch available |
| Language | TypeScript | 5.7.2 | 6.0.3 | ⚠ Major upgrade available |
| UI Library | React | 19.2.4 | 19.2.6 | ⚠ Patch available |
| Auth | NextAuth (Auth.js) | 5.0.0-beta.30 | 5.0.0-beta.31 | ⚠ Still beta |
| Database | MongoDB via Mongoose | 8.9.2 | 8.24.0 (v8) / 9.6.2 (v9) | ⚠ v8 updates available |
| Styling | Tailwind CSS | 3.4.17 | 3.4.19 (v3) / 4.3.0 (v4) | ⚠ v3 patches available |
| UI Components | shadcn/ui (Radix primitives) | — | — | ✅ Stable |
| Forms | react-hook-form + Zod | 7.54.2 / 3.24.1 | — | ✅ Stable |
| Charts | Recharts | 2.15.0 | — | ✅ For analytics |
| Markdown | react-markdown + remark-gfm | 10.1.0 / 4.0.1 | — | ✅ Installed |
| Icons | lucide-react | 0.468.0 | — | ✅ Stable |
| Email (SMTP) | nodemailer | 8.0.7 | — | ✅ Connected — bilingual (ar/en) via SMTP |
| Testing | Vitest + Playwright | 2.1.8 / 1.49.1 | — | ✅ Setup done |
| Validation | Zod | 3.24.1 | — | ✅ Stable |
| Search | MongoDB text index | — | — | ✅ Basic search via $text index |

### Deprecation Watch
- `next-auth@5.0.0-beta.x`: Still pre-release. Monitor Auth.js for stable v5.
- `mongoose@8.x`: NOT deprecated. v9 available but breaking.
- `tailwindcss@3.x`: NOT deprecated. v4 is major rewrite.
- `next@16.x`: Active, frequent patches.

---

## SYSTEM_FLOW

### User Journeys (Physiopedia Model)

```
1. VISITOR ──> Landing Page ──> Browse articles (free) ──> Search knowledge base
                                      │
                                      ▼
2. REGISTER ──> Create account ──> Verify email ──> Unlock article save, history
                                      │
                                      ▼
3. CONTRIBUTOR ──> Write article (draft) ──> Submit for review ──> Published
                                      │
                                      ▼
4. PREMIUM USER ──> Offline article access ──> Courses & CPD ──> AI assistant (future)
```

### API Data Flow (Current + Planned)

```
Client                    Next.js API Routes              MongoDB
  │                            │                            │
  │── GET  /api/auth/[...] ───>│── auth() callback ────────>│ Users
  │── POST /api/auth/register ─>│── bcrypt hash + DB ───────>│ Users
  │── POST /api/auth/verify ───>│── token check ───────────>│ Users
  │── POST /api/auth/login ────>│── NextAuth authorize ────>│ Users
  │── GET  /api/articles ──────>│── find + paginate ───────>│ Articles        [DONE]
  │── GET  /api/articles/[slug] │── findBySlug + populate ──>│ Articles        [DONE]
  │── POST /api/articles ──────>│── create draft (admin) ──>│ Articles        [DONE]
  │── PUT  /api/articles/[slug] │── update + review ───────>│ Articles        [DONE]
  │── DELETE /api/articles/[slug]│── delete ───────────────>│ Articles        [DONE]
  │── GET  /api/categories ────>│── find({active:true}) ───>│ Categories      [EXISTS]
  │── GET  /api/search ────────>│── text index search ─────>│ Articles        [DONE]
  │── GET  /api/questions/sample│── aggregate sample ──────>│ Questions       [EXISTS]
  │── POST /api/upload ────────>│── save to storage/ ─────>│ [filesystem]    [DONE]
  │── GET  /api/files/[name] ──>│── serve from storage/ ──>│ [filesystem]    [DONE]
  │── POST /api/waitlist ──────>│── create entry ──────────>│ WaitlistEntry   [EXISTS]
  │                            │                            │
```

### Auth Flow (NextAuth v5) — Keep as-is

```
Login Request
    │
    ├── Rate limit check (5 attempts/15min per email)
    ├── Find user by email
    ├── Check account lock (5 failed → 15min lock)
    ├── Verify emailVerified === true
    ├── bcrypt.compare(password, hash)
    ├── JWT callback → add id, role, tier, emailVerified
    └── Session callback → expose JWT claims
```

---

## ARCHITECTURE

### Directory Structure (Revised)

```
physioai/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (Physiopedia-style hero + featured articles)
│   ├── layout.tsx                # Root layout (providers, fonts, header)
│   ├── globals.css               # Tailwind + design tokens
│   ├── (auth)/                   # Auth route group (EXISTING)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── articles/                 # Browse + read articles (DONE)
│   │   └── [slug]/               # Article reader with markdown (DONE)
│   ├── dashboard/                # Protected routes (DONE)
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── contributions/         # My articles + new/edit (DONE)
│   │   └── bookmarks/             # Saved articles (DONE)
│   ├── admin/                    # Admin routes (DONE)
│   │   └── review/               # Review queue (DONE)
│   └── api/                      # API route handlers
│       ├── auth/                 # Auth endpoints (EXISTING, 6 routes)
│       ├── articles/             # Article CRUD + review    [DONE]
│       │   └── [slug]/           # GET/PUT/DELETE by slug  [DONE]
│       ├── categories/           # GET categories (EXISTING)
│       ├── search/               # Full-text search         [DONE]
│       ├── bookmarks/            # GET list, POST save     [DONE]
│       │   └── [articleId]/      # DELETE remove bookmark  [DONE]
│       ├── admin/articles/[slug]/ # PATCH approve/reject   [DONE]
│       ├── history/              # POST/GET reading history [DONE]
│       ├── questions/sample/     # GET sample questions (EXISTING)
│       ├── upload/               # POST image upload      [DONE]
│       ├── files/[name]/         # GET serve image        [DONE]
│       └── waitlist/             # POST waitlist (EXISTING)
├── components/
│   ├── ui/                       # shadcn/ui primitives (EXISTING)
│   ├── auth/                     # Auth form components (EXISTING)
│   ├── features/
│   │   ├── landing/              # Header, Hero, Footer (EXISTING)
│   │   ├── articles/             # ArticleCard, ArticleActions (bookmark)  [DONE]
│   │   ├── search/               # SearchBar, SearchResults  [DONE]
│   │   └── contributions/        # ArticleEditor, ReviewPanel  [PLANNED]
│   └── forms/                    # Waitlist form (EXISTING)
├── models/                       # Mongoose schemas
│   ├── User.ts                   # EXISTING (add contributor fields)
│   ├── Article.ts                # [DONE] title, slug, body, category, author, references, status
│   ├── SavedArticle.ts           # [DONE] userId + articleId bookmark
│   ├── ReadingHistory.ts         # [DONE] userId + articleId + readAt
│   ├── Category.ts               # EXISTING (expand for articles)
│   ├── Question.ts               # EXISTING (keep as secondary feature)
│   ├── UserProgress.ts           # EXISTING (retool for reading history)
│   ├── WaitlistEntry.ts          # EXISTING
│   └── PaymentVerification.ts    # EXISTING
├── storage/                      # Local image uploads   [DONE]
│   └── .gitkeep
├── lib/
│   ├── auth.ts                   # NextAuth config (EXISTING)
│   ├── db.ts                     # MongoDB connection (EXISTING)
│   ├── tokens.ts                 # Token generation (EXISTING)
│   ├── validations.ts            # Zod schemas (EXISTING, article schemas added) [DONE]
│   ├── rate-limiter.ts           # Rate limiting (EXISTING)
│   ├── email.ts                  # [NEW] SMTP email sender — bilingual Arabic/English
│   ├── utils.ts                  # cn(), helpers, API helpers (EXISTING, fixed auth) [DONE]
│   └── seed.ts                   # EXISTING (articles seed data added) [DONE]
├── types/                        # TypeScript type definitions (EXISTING)
├── specs/                        # Feature specs
│   ├── 002-user-auth/            # EXISTING (completed)
│   └── 003-article-system/       # [NEW] Knowledge base feature spec
├── templates/emails/             # Email templates (EXISTING)
├── tests/                        # Test setup (EXISTING)
└── middleware.ts                  # Route protection [DONE]
```

### Data Model Relationships (Revised)

```
User (1) ──── (N) Article (author)
User (1) ──── (N) Article (reviewer)
User (1) ──── (N) Article (author)
User (1) ──── (N) Article (reviewer)
User (1) ──── (N) SavedArticle (bookmarks)
User (1) ──── (N) ReadingHistory
User (1) ──── (N) PaymentVerification
Article (N) ──── (1) Category
Article (N) ──── (N) Article (references — self-ref)
Category (1) ──── (N) Category (self-ref parentCategory)
Category (1) ──── (N) Question (secondary: exam prep)
Category (1) ──── (N) Article (primary: knowledge base)
SavedArticle (N) ──── (1) User
SavedArticle (N) ──── (1) Article
ReadingHistory (N) ──── (1) User
ReadingHistory (N) ──── (1) Article
```

### Article Model Schema (New)

| Field | Type | Notes |
|-------|------|-------|
| title | String | required |
| slug | String | unique, lowercase, SEO-friendly |
| body | String (Markdown) | required |
| excerpt | String | summary for cards |
| category | ObjectId (ref: Category) | required |
| author | ObjectId (ref: User) | required |
| reviewer | ObjectId (ref: User) | nullable, set on approval |
| status | 'draft' \| 'review' \| 'published' \| 'archived' | default: draft |
| references | [String] | external URLs/DOI |
| tags | [String] | for search/discovery |
| imageUrl | String | optional, uploaded via /api/upload |
| viewCount | Number | default: 0 |
| publishedAt | Date | nullable |
| version | Number | default: 1, incremented on edit |

### Tier Constraints (Revised)

| Tier | Articles | Features | Price |
|------|----------|----------|-------|
| Free | Browse + read online | Search, 3 saved articles | Free |
| Premium | Unlimited offline | Bookmark, reading history, no ads | $9/mo |
| Pro | All access + courses | CPD courses, AI assistant, contributor badge | $29/mo |

---

## ORPHANS & PENDING

### ✅ Phase 1: Knowledge Base Foundation (MVP) — COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Middleware (`middleware.ts`) | ✅ DONE | Activated route protection for dashboard/admin |
| 2 | Article model | ✅ DONE | Mongoose schema with slug, body, category, author, status, tags, references |
| 3 | Article browse page | ✅ DONE | Category sidebar, article cards, pagination |
| 4 | Article reader (`/articles/[slug]`) | ✅ DONE | Markdown rendering with react-markdown + remark-gfm |
| 5 | Admin article CRUD | ✅ DONE | POST/PUT/DELETE API routes for admin users |
| 6 | Categories integration | ✅ DONE | Reused existing Category model for article categories |
| 7 | Search (basic) | ✅ DONE | MongoDB text index + search bar + results page |
| 8 | Seed data: 20 articles | ✅ DONE | 20 evidence-based physiotherapy articles |
| 9 | Landing page CTA | ✅ DONE | Knowledge Base section with CTA button |
| — | Header updated | ✅ DONE | "Knowledge Base" link in navigation |

### ✅ Phase 2: Community Contribution — COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 10 | Contributor dashboard | ✅ DONE | `/dashboard/contributions` — My Articles with status, edit, delete |
| 11 | Article submission flow | ✅ DONE | `/dashboard/contributions/new` — Markdown editor, submit for review |
| 12 | Review workflow | ✅ DONE | `/admin/review` — Queue, approve/publish, send back to draft |
| 13 | Article versioning | ✅ DONE | Auto-incremented on every update |
| 14 | Saved articles (bookmarks) | ✅ DONE | Bookmark button on article reader, `/dashboard/bookmarks` page |
| 15 | Reading history | ✅ DONE | Auto-tracked via `/api/history` on article view |
| — | Dashboard layout | ✅ DONE | Sidebar navigation: My Articles, Bookmarks, Review Queue (admin) |
| — | Article edit page | ✅ DONE | Contributors can edit their drafts at `/dashboard/contributions/[slug]/edit` |

### Phase 3: Premium Features

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 16 | Offline article access | Medium | Save full article content for offline reading |
| 17 | CPD courses module | Large | Course structure, progress tracking, certificates |
| 18 | AI assistant integration | Large | GPT-based Q&A over knowledge base content |
| 19 | Payment gateway (Stripe) | Medium | Replace manual payment verification |
| 20 | Mobile app / PWA | Large | React Native or Next PWA wrapper |

### Secondary: Keep Existing Exam Prep Feature

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 21 | Question answering flow | Medium | Reuse existing models, add to dashboard as a section |
| 22 | Progress tracking UI | Medium | Streaks, per-category stats via Recharts |

### ✅ Testing Infrastructure — COMPLETE

| Area | Files | Tests | Status |
|------|-------|-------|--------|
| Vitest config | `vitest.config.ts` | — | ✅ Created with jsdom, global setup |
| Unit: tokens | `tests/unit/tokens.test.ts` | 13 | ✅ Token generation, hashing, expiry |
| Unit: validations | `tests/unit/validations.test.ts` | 12 | ✅ Zod schema validation |
| Unit: utils | `tests/unit/utils.test.ts` | 13 | ✅ String formatting, percentage, slug |
| Unit: rate-limiter | `tests/unit/rate-limiter.test.ts` | 9 | ✅ In-memory rate limiting logic |
| Unit: email | `tests/unit/email.test.ts` | 3 | ✅ Graceful SMTP fallback |
| Component: Alert | `tests/unit/alert.test.tsx` | 3 | ✅ Render, title, description |
| Component: Button | `tests/unit/button.test.tsx` | 6 | ✅ Render, variants, disabled |
| Component: Card | `tests/unit/card.test.tsx` | 1 | ✅ Render with all sub-components |
| **Total** | **8 files** | **70** | ✅ All passing |

Run with: `npm test -- --run` or `npx vitest run`

### Recent Fixes (2026-05-16)

| Fix | Location | Description |
|-----|----------|-------------|
| Import named→default | `reset-password/route.ts` | `import { User }` → `import User` |
| Import named→default | `lib/seed.ts` | `import { User, Question, Category, WaitlistEntry }` → default imports |
| Import named→default | `lib/migration.ts` | `import { User }` → `import User` |
| Import named→default | `lib/auth.ts` | Dynamic `import('@/models/User').default` (already fixed) |
| Redundant cast removed | `lib/auth.ts:115` | `token.emailVerified as boolean` → `token.emailVerified` |
| Env sync | `.env` / `.env.local` | SMTP credentials synced; `EMAIL_FROM` matches auth user |
| Email fallback | `lib/email.ts` | `sendMailSafely()` catches SMTP errors, logs to console, never crashes |

### Recent Additions (2026-05-16)

| Change | Location | Description |
|--------|----------|-------------|
| Image upload API | `app/api/upload/route.ts` | POST endpoint — saves files to `storage/` directory |
| Image serve API | `app/api/files/[name]/route.ts` | GET endpoint — serves files from `storage/` with MIME type + caching |
| Image upload UI | `components/admin/QuestionForm.tsx` | File input with preview + remove for question image |
| Image upload UI | `app/dashboard/contributions/new/page.tsx` | File input with preview + remove for article image |
| Article schema | `lib/validations.ts` | Added `imageUrl` optional field to articleSchema |
| Article model | `models/Article.ts` | Added `imageUrl` field |
| Storage directory | `storage/` | Root-level directory for local image storage |

### Known Technical Debt

| Issue | Location | Severity | Mitigation |
|-------|----------|----------|------------|
| `next-auth` v5 beta | `lib/auth.ts` | Low | Monitor for stable release. Locked at beta.30 |
| Mongoose 8.x outdated | `models/*` | Low | Upgrade 8.9.2 → 8.24.0 (non-breaking) |
| Rate limiter is in-memory | `lib/rate-limiter.ts` | Medium | Will reset on server restart. Consider Redis for production |
| Email templates deprecated | `templates/emails/*.html` | Low | Bilingual content moved to `lib/email.ts` — remove old HTML files |
| `getUserFromSession` removed | `lib/utils.ts` | Low | Replaced with `auth()` calls for NextAuth v5 |
| Type augmentation duplication | `types/` | Low | Two files augment next-auth types — consolidate |
| Tailwind v3 (not v4) | Config files | Low | v4 is major rewrite; no urgency |
| NEXTAUTH_SECRET placeholder | `.env` / `.env.local` | Low | Change to a real secret before production deploy |

---

## SUMMARY: Milestones

| Milestone | Phase | Effort | Verifiable Goal |
|-----------|-------|--------|-----------------|
| M1 | Phase 1: Foundation | Medium | ✅ Users can browse + read 20+ physiotherapy articles with search |
| M2 | Phase 2: Community | Medium | ✅ Contributors can submit articles; admins can review + publish |
| M3 | Phase 3: Premium | Large | Users can purchase Pro tier, access courses + offline reading |
| M4 | Exam Prep (retained) | Medium | Dashboard quiz feature using existing Question model |
