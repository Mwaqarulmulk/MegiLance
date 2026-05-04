# Deployment Runbook

> MegiLance Platform — Step-by-step deployment guide

## Prerequisites

- **Turso CLI** installed and authenticated (`turso auth login`)
- **Node.js 20+** and npm
- **Python 3.11+** with pip
- **Docker & Docker Compose** (for containerized deployment)
- Domain DNS configured for your deployment target

## Environment Variables

### Backend (`backend/.env`)
```env
# Database (required)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Security (required — generate unique values)
SECRET_KEY=<generate-with: python -c "import secrets; print(secrets.token_urlsafe(64))">
JWT_SECRET_KEY=<same-or-different-from-SECRET_KEY>

# Email (for verification, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@megilance.com

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=10

# Frontend URL (for email links)
FRONTEND_URL=https://megilance.com

# Optional
SLOWAPI_ENABLED=true
CORS_ORIGINS=https://megilance.com
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.megilance.com
NEXT_PUBLIC_WS_URL=wss://api.megilance.com/ws
```

## Deployment Steps

### 1. Database Setup
```bash
# Create Turso database
turso db create megilance-prod

# Get connection URL and token
turso db show megilance-prod --url
turso db tokens create megilance-prod

# Apply schema (run from backend/)
cd backend
alembic upgrade head
```

### 2. Backend Deployment

#### Option A: Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d backend
docker compose logs -f backend   # Verify startup
```

#### Option B: Direct (systemd)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Verify
```bash
curl https://api.megilance.com/api/health/ready
# Expected: {"status": "healthy", "database": "connected"}
```

### 3. Frontend Deployment

#### Option A: Docker
```bash
docker compose -f docker-compose.prod.yml up -d frontend
```

#### Option B: Standalone build
```bash
cd frontend
npm ci
npm run build
npm start
```

#### Option C: Vercel/DigitalOcean App Platform
Push to main branch → auto-deploy via CI/CD

### 4. Post-Deployment Checks

1. **Health check**: `GET /api/health/ready` returns 200
2. **Auth flow**: Register → verify email → login → access protected route
3. **API docs**: Visit `/api/docs` (Swagger UI)
4. **Frontend**: Visit homepage, login page, dashboard

## Rollback Procedure

### Backend
```bash
# Docker
docker compose -f docker-compose.prod.yml down backend
docker compose -f docker-compose.prod.yml up -d backend --tag previous-version

# Direct
pip install -r requirements.txt  # Re-install previous deps
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Rebuild from previous commit
git checkout <previous-commit>
npm ci && npm run build && npm start
```

### Database
```bash
# Alembic rollback
cd backend
alembic downgrade -1
```

## Monitoring Checklist

- [ ] `/api/health/ready` returns 200
- [ ] Error rate < 1% (check application logs)
- [ ] Response times < 500ms p95
- [ ] No 500 errors in last 10 minutes
- [ ] Memory usage stable (no leaks)
