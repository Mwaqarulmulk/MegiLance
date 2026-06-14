# MegiLance — Functional Audit & Ecosystem Fix Report

**Date:** 2026-06-14
**Scope:** Public marketplace pages (Freelancers, Jobs/Projects, Gigs, AI Tools) and how the
platform connects as a single freelancing ecosystem — *not* a set of standalone screens.
**Author:** Engineering audit (Claude)
**Environment audited:** Local dev — frontend `http://localhost:3000`, backend `http://localhost:8000`,
database Turso `megilance-db-megilance.aws-ap-south-1.turso.io` (production DB; local dev points at it).

> **Focus:** This report deliberately ignores non-functional concerns (perf micro-tuning, SEO copy,
> visual polish) and concentrates on **functional gaps** — things that are broken, empty, or
> disconnected — as requested.

---

## 1. Executive Summary

The marketplace looked empty not because the pages were broken, but because **the database had ~250
automated-test "freelancer" accounts** (empty names like *"Test User"*, `$0` rate, no skills, no bio)
and **essentially one real profile**. The public listing sorted by *newest*, so visitors only ever saw
junk test rows. Gigs were **completely empty (0 rows)**. Several "features" exist as **standalone code
that is never wired to real data or to each other**.

### What was fixed in this pass (verified live on localhost)

| # | Problem | Fix | Verified |
|---|---------|-----|----------|
| 1 | Freelancers page showed empty/junk cards | Added a **quality filter** (hides test/`@example.com`/incomplete profiles) + **quality default sort** (rated, complete, experienced first) | `GET /users/freelancers` → 28 real freelancers (was 251 junk) |
| 2 | No real freelancer data to show | **Seeded 24 realistic freelancers** (skills, rates, avatars, headlines, locations, languages, experience, availability, seller tiers) | Names render on `/freelancers` |
| 3 | Ratings & completion counts were 0 | Seeded **completed contracts + linked reviews** (a demo client "Meridian Studios" as counterparty) | Cards show ⭐4.6–4.9, 6 reviews, 6 projects done |
| 4 | Gigs marketplace empty (0 gigs) | **Seeded 12 active gigs** with 3-tier pricing, images, ratings | `GET /gigs` → 12; `/gigs` page renders |
| 5 | "Free, no sign-up" AI Price Estimator returned **401** for anonymous users | Made `/price-estimator/estimate` **optional-auth** | Anonymous POST no longer 401s |

All seeded data is **clearly tagged and reversible**: every demo account uses the
`@demo.megilance.com` email domain. Remove it any time with:

```bash
cd backend && ./.venv/Scripts/python.exe -m app.db.seed_marketplace purge
```

Re-seed (idempotent; `force` reseeds):

```bash
cd backend && ./.venv/Scripts/python.exe -m app.db.seed_marketplace        # seed if empty
cd backend && ./.venv/Scripts/python.exe -m app.db.seed_marketplace force   # purge + reseed
```

---

## 2. Root-Cause Analysis (why pages looked empty)

### 2.1 Freelancers (`/freelancers`)
- **Active page:** [frontend/app/(main)/freelancers/page.tsx](frontend/app/(main)/freelancers/page.tsx) — a
  server component that fetches `GET /api/v1/users/freelancers`.
- The endpoint [backend/app/api/v1/identity/users.py](backend/app/api/v1/identity/users.py) selected
  **every** `user_type='freelancer'` with **no quality gate**, ordered by **newest**.
- The DB's newest 250+ freelancers are automated-test rows (`Test User`, `test_*@example.com`, `$0`, no skills).
  Result: page filled with blank cards → "showing nothing".
- **There is also a second, orphaned implementation**
  [frontend/app/(main)/freelancers/PublicFreelancers.tsx](frontend/app/(main)/freelancers/PublicFreelancers.tsx)
  (client component using `api.search.freelancers`) that **is never imported by the route**. This is dead
  code and a maintenance trap — exactly the "standalone unit not part of the combined system" pattern.

### 2.2 Gigs (`/gigs`)
- Page [frontend/app/(main)/gigs/page.tsx](frontend/app/(main)/gigs/page.tsx) fetches `GET /api/v1/gigs`.
- The `gigs` table had **0 rows**, so the page was genuinely empty. (Now seeded with 12.)
- **Latent bug:** the page requests `?status=published`, but the backend list endpoint
  [backend/app/api/v1/projects_domain/gigs.py](backend/app/api/v1/projects_domain/gigs.py) hard-codes
  `g.status = 'active'` and ignores the param. It works today only because the param is ignored.
- **Real bug found:** `create_gig` inserts into columns `average_rating, total_reviews, orders_count`
  which **do not exist** in the live `gigs` table (actual columns: `rating_average, rating_count,
  orders_completed`). **Creating a gig via the API will fail.** See §5.

### 2.3 Jobs / Projects (`/jobs`)
- Page [frontend/app/(main)/jobs/page.tsx](frontend/app/(main)/jobs/page.tsx) fetches
  `GET /api/v1/projects?status=open`. This **works** — there are 11 real projects. Jobs board is healthy.
- The external-jobs aggregator (`/external-projects`) **also works** and returns real scraped roles
  (RemoteOK/Jobicy/Arbeitnow). It is a good, functional differentiator that is currently under-surfaced.

### 2.4 AI Tools (`/tools`, `/ai/*`)
- `/tools` and `/ai` index pages are **static, well-built, and fully linked** to the 11 tool routes. Good.
- **But the tools are only loosely connected to the backend.** Two distinct problems:
  1. **Auth mismatch:** Public tools advertise *"100% free, no account needed"*, yet several backend
     endpoints required a logged-in user (`/price-estimator/estimate`, `/compare`, `/suggest`, `/range`).
     Anonymous calls returned **401**, so the UI silently fell back to a **client-side approximation** —
     the "AI/market-data" promise wasn't actually being delivered to logged-out visitors. (Fixed for
     `estimate`; the other three are listed in §4.)
  2. **Schema mismatch (disconnected units):** The frontend
     [PriceEstimator.tsx](frontend/app/ai/price-estimator/PriceEstimator.tsx) POSTs
     `{category, service_type, scope, urgency, quality_tier, experience_level}`, but the backend
     `EstimateRequest` expects `{skill_slug, complexity, industry, project_type}`. The two were built
     independently and **never speak the same language**, so even an authenticated call falls back to the
     local stub. This is the clearest example of "standalone chunks, not a combined system."

---

## 3. Ecosystem Connectivity Map (standalone vs. wired)

Legend: ✅ wired & working · ⚠️ works but disconnected/partial · ❌ broken/dead

| Area | Frontend | Backend | Data | Status | Note |
|------|----------|---------|------|--------|------|
| Freelancer directory | `freelancers/page.tsx` | `/users/freelancers` | seeded | ✅ | Fixed this pass |
| Freelancer (alt impl) | `PublicFreelancers.tsx` | `api.search.freelancers` | — | ❌ | **Orphaned/dead code** |
| Freelancer profile | `freelancers/[id]` | `/freelancers/{id}` (public_profiles) | seeded | ⚠️ | Verify slug vs id linkage (cards link `profileSlug || id`) |
| Jobs board | `jobs/page.tsx` | `/projects` | real (11) | ✅ | Healthy |
| External jobs | `external-projects` | `/external-projects` | real scrape | ⚠️ | Works, under-promoted |
| Gigs directory | `gigs/page.tsx` | `/gigs` | seeded (12) | ✅ | Fixed this pass |
| Gig create | portal | `/gigs` POST | — | ❌ | **Insert hits non-existent columns** |
| Gig detail | `gigs/[slug]` | `/gigs/slug/{slug}` | seeded | ⚠️ | Verify slug rendering end-to-end |
| AI Price Estimator | `ai/price-estimator` | `/price-estimator/estimate` | rates table | ⚠️ | Auth fixed; **request schema still mismatched** |
| AI tools (rate/proposal/skill) | `ai/*` | `/rate-advisor`,`/proposal-writer`,`/skill-analyzer` | — | ⚠️ | Reachable; confirm public + schema parity |
| Post a project | `post-project` | `/projects` POST | real | ✅ | Feeds the jobs board |
| Marketplace stats | (home/landing) | `/marketplace/stats` | live counts | ✅ | Now reflects seeded data |

---

## 4. Prioritized Functional Recommendations

### P0 — Do before the next deploy
1. **Fix `create_gig` column mismatch** in `projects_domain/gigs.py` — change the INSERT to use
   `rating_average, rating_count, orders_completed` (the real columns). Without this, **no freelancer
   can publish a gig.** (§5 has the exact diff.)
2. **Align the AI Price Estimator request schema.** Either (a) map the frontend payload to
   `{skill_slug, complexity, industry, project_type}` before POSTing, or (b) extend `EstimateRequest`
   to accept the `category/service_type/scope/urgency` shape the UI already sends. Until then the
   flagship "AI" tool is a client-side stub.
3. **Make the remaining public AI tools anonymous-capable** like `estimate` now is:
   `/price-estimator/compare`, `/suggest`, `/range` → switch `Depends(get_current_user)` to
   `Depends(get_current_user_optional)` and guard `current_user.id`.

### P1 — Ecosystem cohesion
4. **Delete or adopt `PublicFreelancers.tsx`.** It's a richer UI (filters, JSS bars, top-rated badges)
   than the active `page.tsx`. Recommended: **port its UX into the route** and delete the duplicate, so
   the better experience actually ships instead of rotting unused.
5. **Promote external jobs into the main jobs board.** Merge `/external-projects` results into `/jobs`
   (clearly labeled "External") so the board never looks thin and the aggregator stops being a dead-end page.
6. **Verify profile deep-links.** Cards link to `/freelancers/{profileSlug || id}`. Seeded users have
   slugs (e.g. `aisha-khan`); confirm `/freelancers/[id]` resolves both slug and numeric id.
7. **Unify the gig status vocabulary.** Frontend asks `status=published`; backend stores/filters
   `active`. Pick one (`active`) and make the param actually filter.

### P2 — Data lifecycle & trust
8. **Quarantine test accounts permanently.** The quality filter hides them, but consider a periodic job
   that purges `@example.com` / `test_*` rows, or flag them with `profile_visibility='private'` so they
   never leak into counts (`/marketplace/stats` still counts all 251 — see §6).
9. **Make `/marketplace/stats` honest.** It currently returns raw `COUNT(*)` of all freelancers (251),
   not the *presentable* ones (28). Apply the same quality gate so public stats match what users can see.
10. **Seed a few real-looking open projects** for category coverage so `/jobs` category filters always
    return something (currently fine at 11, thin in some categories).

---

## 5. Exact fixes applied (and the one-line diffs still needed)

### Applied this pass
- **`backend/app/api/v1/identity/users.py`** — `list_freelancers` now adds:
  `is_active=1`, excludes `@example.com` & `test_%`, requires public visibility, and requires a
  non-empty rate **or** skills **or** bio. Default sort changed `newest → relevance`.
- **`backend/app/services/search_service.py`** — added a `relevance` sort:
  rate-present → rating → reviews → completions → recency.
- **`backend/app/api/v1/core_domain/price_estimator.py`** — `/estimate` now uses
  `get_current_user_optional` and tolerates anonymous users.
- **`backend/app/db/seed_marketplace.py`** *(new)* — idempotent, reversible seeder for 24 freelancers,
  12 gigs, a demo client, completed contracts, and reviews.

### Still needed (P0 #1) — `create_gig` INSERT
```python
# projects_domain/gigs.py  (create_gig)
# BEFORE: ... status, average_rating, total_reviews, orders_count) VALUES (...)
# AFTER:  ... status, rating_average, rating_count, orders_completed) VALUES (...)
```

---

## 6. Data snapshot (live, at audit time)

```
users (freelancers, raw COUNT):        251   (mostly automated-test junk)
freelancers passing quality filter:     28   ← what the public now sees
  └─ seeded demo (@demo.megilance.com): 24
  └─ pre-existing real:                  ~4
gigs (status='active'):                  12   (all seeded)
projects (open):                         11   (real)
external scraped jobs:                 100s   (live aggregator)
reviews / completed contracts:        seeded so ratings + JSS render
```

---

## 7. Live website & deployment notes

- **Live site could not be reached from this audit sandbox** (`https://megilance.com` and the
  DigitalOcean app URL both returned no connection — the sandbox has no outbound internet beyond
  localhost). The fixes above were verified against **local dev**, which points at the **same production
  Turso DB**, so the seeded data and filter behavior are already live at the data layer.
- **Turso:** local `.env` already points at the production database, so the seed is in production data.
  No migration needed for the seed (it only inserts rows). The P0 `create_gig` fix is code-only.
- **Backend deploy (DigitalOcean):** redeploy `backend/` after applying the P0 code fixes; the quality
  filter + relevance sort + optional-auth estimator are pure code changes (no schema change).
- **Frontend (Vercel):** the freelancers/gigs pages use ISR (`revalidate: 60`/`300`), so seeded data
  appears within 1–5 min of a request; a redeploy or on-demand revalidation makes it instant.
- **To roll back all demo data:** `python -m app.db.seed_marketplace purge` (removes only
  `@demo.megilance.com` rows and their gigs/contracts/reviews).

---

## 8. How to re-verify locally

```bash
# Freelancers — should list real, rated profiles (not "Test User")
curl "http://localhost:8000/api/v1/users/freelancers?page_size=5"

# Gigs — should return 12
curl "http://localhost:8000/api/v1/gigs?page_size=5"

# Price estimator — should NOT return 401 when logged out
curl -X POST "http://localhost:8000/api/v1/price-estimator/estimate" \
  -H "Content-Type: application/json" \
  -d '{"skill_slug":"web_development","complexity":"medium","industry":"technology","project_type":"website","currency":"USD"}'

# Pages
open http://localhost:3000/freelancers
open http://localhost:3000/gigs
open http://localhost:3000/jobs
```
