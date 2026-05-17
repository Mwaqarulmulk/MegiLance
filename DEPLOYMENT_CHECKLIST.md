# MegiLance 2.0 — Deployment Checklist

> **Last Updated**: May 17, 2026
> **Status**: Production Ready (pending migrations + credential rotation)

---

## 🚨 CRITICAL: Rotate Exposed Credentials

**`backend/.env` was committed to git history with live keys.** You MUST:

1. **Turso**: Regenerate auth token at https://app.turso.io
2. **JWT Secret**: Generate new `JWT_SECRET_KEY` (min 32 chars)
3. **SMTP**: Rotate email credentials
4. **Any other keys**: GitHub, Stripe, etc.
5. **Scrub git history** (or start fresh repo):
   ```bash
   git filter-repo --invert-paths --path backend/.env --force
   git push origin main --force
   ```

---

## 📦 Pre-Deployment Steps

### 1. Database Migrations

Two migrations must be applied to the live Turso database:

| Migration | Purpose | File |
|-----------|---------|------|
| `003_enhance_portfolio.py` | 14 new portfolio columns (featured, likes, stats, categories) | `backend/scripts/migrations/` |
| `004_gig_marketplace.py` | 6 new tables (gigs, orders, reviews, revisions, deliveries, faqs) | `backend/scripts/migrations/` |

**Apply via Turso HTTP API:**
```bash
cd backend
python scripts/apply_migration.py scripts/migrations/003_enhance_portfolio.py
python scripts/apply_migration.py scripts/migrations/004_gig_marketplace.py
```

**Verify:**
```bash
curl -H "Authorization: Bearer $TURSO_AUTH_TOKEN" \
  "https://$TURSO_DB_NAME.turso.io/v2/query" \
  -d '{"statements": ["SELECT name FROM sqlite_master WHERE type=\"table\" ORDER BY name"]}'
```

Expected new tables: `gigs`, `gig_orders`, `gig_reviews`, `gig_revisions`, `gig_deliveries`, `gig_faqs`

### 2. Environment Variables

**Backend (`backend/.env`):**
```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<new-token>
JWT_SECRET_KEY=<new-32-char-secret>
JWT_ALGORITHM=HS256
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-password>
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

### 3. Backend Deployment (DigitalOcean)

```bash
# 1. Ensure .env is NOT committed
git check-ignore backend/.env  # Should output: backend/.env

# 2. Push latest code
git push origin main

# 3. Deploy to DigitalOcean App Platform
#    - Source: GitHub repo
#    - Build command: pip install -r requirements.txt
#    - Run command: uvicorn main:app --host 0.0.0.0 --port $PORT
#    - Set env vars in DO dashboard

# 4. Verify health
curl https://your-backend-url.com/health
```

### 4. Frontend Deployment (Vercel)

```bash
# 1. Push latest code
git push origin main

# 2. Deploy to Vercel
#    - Connect GitHub repo
#    - Root directory: frontend
#    - Build command: next build
#    - Set env vars: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL

# 3. Verify
curl https://your-frontend-url.com
```

---

## ✅ Post-Deployment Verification

### Backend Checks
- [ ] `GET /health` returns 200
- [ ] `GET /docs` shows Swagger UI
- [ ] `GET /api/v1/gigs` returns 200 (even if empty)
- [ ] `GET /api/v1/users/freelancers` returns 200
- [ ] `GET /api/v1/search/global?q=test` returns 200
- [ ] User signup flow works
- [ ] Login returns JWT token
- [ ] File upload endpoint responds

### Frontend Checks
- [ ] Homepage loads without errors
- [ ] `/gigs` page displays (empty state OK)
- [ ] `/freelancers` page displays (empty state OK)
- [ ] `/login` page works
- [ ] `/signup` page works
- [ ] `/dashboard` redirects to auth if not logged in
- [ ] Client profile page (`/client/profile`) loads
- [ ] Freelancer profile page (`/freelancer/profile`) loads
- [ ] Portfolio page (`/freelancer/portfolio`) loads

### End-to-End Flow Tests
1. **Client Flow**: Signup → Post Project → View Proposals
2. **Freelancer Flow**: Signup → Browse Projects → Submit Proposal
3. **Gig Flow**: Freelancer creates gig → Client browses → Client orders
4. **Profile Flow**: Edit profile → Save → View public profile

---

## 📊 Build Status

| Check | Status |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ 0 errors |
| Next.js Build (`next build`) | ✅ 315 pages, 0 errors |
| Python Syntax | ✅ All files pass |
| Git | ✅ Pushed to `origin/main` |

---

## 🔧 Known Issues / TODOs

1. **`sqlalchemy-libsql` not installed** — ORM models are dead code; runtime uses HTTP API
2. **Alembic online migrations don't work** — Use offline mode + `apply_migration.py`
3. **Middleware deprecation** — Next.js 16 recommends `proxy.ts` over `middleware.ts`
4. **Gig edit page** (`/freelancer/gigs/[id]/edit`) — Route referenced but may not exist
5. **Checkout flow** — `/checkout/gig/[id]` referenced but needs implementation

---

## 📞 Emergency Rollback

```bash
# Rollback to last known good commit
git checkout 363c3775  # fix(functional): fix 7 broken user flows
git push origin main --force

# Or revert specific commit
git revert ef87b921  # gig URL fix
git revert 72f528b7  # marketplace APIs
```
