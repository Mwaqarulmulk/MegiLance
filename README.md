<div align="center">

<img src="frontend/public/images/logo.png" alt="MegiLance Logo" width="120" height="120" />

# MegiLance 2.0

### AI-Powered Freelancing Platform

**Next.js 16 · FastAPI · Turso · LLM AI · MetaMask Web3**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Deployed on DigitalOcean](https://img.shields.io/badge/Deployed-DigitalOcean-0080FF?logo=digitalocean&logoColor=white)](https://megilance.site)

**[Live Demo](https://megilance.site) · [API Docs](https://megilance.site/api/docs) · [FYP Report](docs/FYP_COMPLETE_REPORT.md)**

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [FYP Context](#fyp-context)
- [Problem & Solution](#problem--solution)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Team](#team)
- [License](#license)

---

## Project Overview

MegiLance is a **production-grade, full-stack freelancing marketplace** that combines a traditional Web2 platform with AI intelligence and Web3 blockchain payments. It was designed to address real problems faced by freelancers in the Global South — particularly payment access barriers, pricing opacity, and trust deficits — and to demonstrate what a modern AI-era platform looks like in practice.

| Metric | Value |
|--------|-------|
| Frontend Pages | 229 |
| Frontend Components | 522 |
| Backend API Endpoints | 750+ |
| AI Services | 12 |
| Database Tables | 80+ |
| Git Commits | 788 |
| CSS Module Files | 1,321 |
| Domain Packages | 7 |

**Live at:** [megilance.site](https://megilance.site)

---

## FYP Context

> **Final Year Project — BS Software Engineering (Session 2022–2026)**
> COMSATS University Islamabad, Lahore Campus
> Supervisor: **Dr. Junaid Akram** | Co-Supervisor: **Khula Qadeer**

This project was submitted as a capstone demonstrating full software engineering competencies: system design, full-stack implementation, AI integration, blockchain, security, testing, and production deployment.

**Academic documentation:**
- [FYP Complete Report](docs/FYP_COMPLETE_REPORT.md)
- [FYP Report Summary](docs/FYP_REPORT_SUMMARY.md)
- [Test Cases (28 acceptance tests)](docs/TEST_CASES.md)
- [Architecture Decision Records](docs/adr/)
- [Presentation Data](FYP_PRESENTATION_DATA.md)

---

## Problem & Solution

### The Problems

The global freelance economy (projected to surpass **$455 billion**) suffers from:

| Problem | Impact |
|---------|--------|
| **Payment Barriers** | Pakistani freelancers blocked from Stripe/PayPal — no viable gateway |
| **Financial Friction** | Platform fees of 10–20%; expensive cross-border transfers |
| **Trust Deficit** | Opaque ranking algorithms; no fraud detection; fake reviews |
| **Pricing Opacity** | No market intelligence for new freelancers — leads to undercharging |
| **Communication Gap** | Video calls, collaboration, and messaging all require third-party tools |

### Our Solution: Hybrid Web2 + AI + Web3

MegiLance solves these problems with three integrated layers:

```
┌──────────────────────────────────────────────────────────┐
│  WEB2 LAYER — Marketplace Foundation                     │
│  Next.js 16 frontend + FastAPI backend + Turso database  │
│  Profiles, proposals, contracts, payments, messaging     │
├──────────────────────────────────────────────────────────┤
│  AI LAYER — Intelligence Services                        │
│  12 AI services · 65 AI endpoints · LLM via DO AI       │
│  Price estimation, fraud detection, matching, chatbot    │
├──────────────────────────────────────────────────────────┤
│  WEB3 LAYER — Blockchain Payments                        │
│  Solidity smart contracts (MockUSDC) on Polygon/ETH      │
│  MetaMask integration · 8 EVM chains · stablecoins       │
└──────────────────────────────────────────────────────────┘
```

---

## Architecture

### System Architecture Diagram

```
                     ┌────────────────────────────────────┐
                     │        Next.js 16 Frontend         │
                     │   TypeScript · Tailwind · 229 pg   │
                     │   App Router · Dark/Light Themes   │
                     └─────────────────┬──────────────────┘
                                       │  HTTPS / REST / WebSocket
                     ┌─────────────────▼──────────────────┐
                     │          FastAPI Backend            │
                     │  750+ endpoints · 7 domain pkgs    │
                     │  ┌──────────┐  ┌──────────────┐    │
                     │  │  Auth &  │  │  AI Services │    │
                     │  │ Security │  │  12 modules  │    │
                     │  └──────────┘  └──────────────┘    │
                     │  ┌──────────┐  ┌──────────────┐    │
                     │  │Payments  │  │ Real-Time    │    │
                     │  │ Wallet   │  │ WebSocket    │    │
                     │  └──────────┘  └──────────────┘    │
                     └────┬──────────────────┬────────────┘
                          │                  │
           ┌──────────────▼───┐   ┌──────────▼──────────┐
           │   Turso (libSQL) │   │   External Services  │
           │   Cloud Edge DB  │   │  DigitalOcean AI LLM │
           │   80+ tables     │   │  Stripe · Socket.io  │
           │   Edge replicas  │   │  MetaMask · Web3.py  │
           └──────────────────┘   └─────────────────────┘
```

### Domain Package Structure (Backend)

| Domain | Endpoints | Key Routers |
|--------|-----------|-------------|
| **Auth** | 17 | auth, OAuth, 2FA, passwordless |
| **Core** | 460+ | portal, workroom, admin, analytics, notifications |
| **AI** | 65 | chatbot, fraud-detection, matching, price-estimator |
| **Payments** | 66 | wallet, invoices, escrow, stripe, crypto, JazzCash |
| **Chat** | 21 | messages, video-comms, WebSocket, comments |
| **Reviews** | 18 | disputes, reviews, user-feedback |
| **Marketplace** | — | gigs, freelancers, projects, proposals |

### Frontend Route Architecture (229 Pages)

| Route Group | Pages | Description |
|------------|-------|-------------|
| `(auth)/` | 9 | Login, signup, password reset, 2FA |
| `(main)/` | 26 | Landing, about, pricing, features |
| `(portal)/admin/` | 44 | Admin management, audit, moderation |
| `(portal)/freelancer/` | 51 | Dashboard, portfolio, proposals |
| `(portal)/client/` | 28 | Projects, hiring, contracts |
| `ai/` | 12 | AI tool suite for all users |
| Root | 38 | Blog, hire, compare, support |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.115.6 | Web framework |
| Uvicorn | 0.34.0 | ASGI server |
| SQLAlchemy | 2.0.36 | ORM |
| Turso (libSQL) | latest | Primary database (edge SQLite) |
| MongoDB (pymongo) | 4.10.1 | Blog CMS |
| Pydantic | 2.10.6 | Data validation |
| python-jose | 3.3.0 | JWT tokens |
| bcrypt | 4.0.1 | Password hashing |
| pyotp | 2.9.0 | TOTP 2FA |
| SlowAPI | 0.1.9 | Rate limiting |
| Stripe | 11.5.0 | Payment processing |
| python-socketio | 5.14.3 | WebSocket / real-time |
| boto3 | 1.42.4 | Cloudflare R2 / S3 storage |
| litellm | ≥1.0.0 | LLM abstraction (DO AI gateway) |
| httpx | 0.28.1 | Async HTTP client |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | Strict | Type safety |
| Tailwind CSS | 4.x | Utility styling |
| CSS Modules | — | Component-scoped styles (3-file pattern) |
| Framer Motion | 12.x | Animations |
| Radix UI | — | Accessible primitives |
| @react-three/fiber | 9.x | 3D scenes (Three.js) |
| Tiptap | 3.x | Rich text editor |
| Recharts / Chart.js | — | Data visualization |
| Stripe.js | 8.x | Payment UI |
| @monaco-editor/react | — | In-browser code editor |
| Playwright | 1.58 | E2E testing |
| Jest | 30.x | Unit testing |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Hosting | DigitalOcean App Platform |
| Frontend CDN | Vercel (optional) |
| Database | Turso cloud (edge-replicated libSQL) |
| File Storage | Cloudflare R2 (S3-compatible) |
| AI/LLM | DigitalOcean AI Gateway (llama3.3-70b) |
| Reverse Proxy | Nginx with SSL termination |
| SSL | Certbot (auto-renewing) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub (manual deploy trigger) |

---

## Features

### AI Services (12 Modules · 65 Endpoints)

| Service | Description |
|---------|-------------|
| **Price Estimator** | Category + hours → detailed cost breakdown with PPP cross-border analysis |
| **Rate Advisor** | Analyzes real freelancer profile; grounded LLM advice for competitive pricing |
| **Talent Matching** | Multi-factor scoring to match freelancers to projects |
| **Fraud Detection** | ML narrative reports on users, disputes, invoices |
| **Sentiment Analysis** | Review quality assessment to catch malicious ratings |
| **AI Chatbot** | Portal-aware assistant; knows platform context |
| **Skill Analyzer** | Profile skill gap analysis and recommendations |
| **Client Assistant** | Guided project scoping and brief generation |
| **AI Writing Tools** | Blog, proposal, cover letter generators via DO LLM |
| **Quality Assessment** | Code, design, and content quality scoring |
| **Job Description AI** | Generate optimized job postings |
| **Contract AI** | Smart contract clause suggestions |

### Authentication & Security

- **6 Auth Methods**: Email/Password · Google OAuth · GitHub OAuth · TOTP 2FA · Email magic links · Phone verification
- **JWT**: 30-min access tokens + 7-day refresh tokens (HS256)
- **Rate Limiting**: 60 req/min per IP (SlowAPI)
- **Account lockout**: After 5 failed attempts (15-min cooldown)
- **5-layer middleware**: RequestID · CORS · Security Headers (CSP/HSTS) · GZip · Request Size Limit
- **Audit logging**: 90-day retention, 14 action types
- **Parameterized queries**: SQL injection prevention via Turso HTTP client
- **Pydantic schemas**: Input validation on all endpoints

### Payment System

- **Fiat**: Stripe integration with 150+ currencies
- **Crypto**: MetaMask wallet · USDC/USDT stablecoins · 8 EVM chains (Polygon, Ethereum, BSC…)
- **Pakistan-local**: JazzCash, EasyPaisa (addressing local payment barrier)
- **Escrow**: Milestone-based fund release with dispute resolution
- **Invoicing**: PDF invoice generation via backend renderer
- **Wallet**: In-platform balance, withdraw, deposit, transaction history

### Freelancer Portal (51 Pages)

Profile & portfolio · Proposal builder · Contract management · Invoice creator · Earnings dashboard · Skill badges · Rate advisor · Workroom · Time tracker · Reviews · Learning center

### Client Portal (28 Pages)

Project posting · Talent search · Proposal review · Contract signing · Milestone management · Payment release · Dispute filing · Analytics dashboard · Saved freelancers · Messaging

### Admin Panel (44 Pages)

User management · Content moderation · Dispute resolution · Analytics · Feature flags · Audit logs · Issue reporting · System health · Fraud reports · Platform settings

### Real-Time Features

- **WebSocket messaging**: Socket.io powered live chat
- **Video calls**: WebRTC peer-to-peer (STUN/TURN)
- **Notifications**: Live badge updates without polling
- **Workroom**: Collaborative project space

---

## Project Structure

```
MegiLance/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Route definitions (97+ routers)
│   │   ├── core/             # Config, security, dependencies
│   │   ├── db/               # Database connection & migrations
│   │   ├── domains/          # 7 domain packages
│   │   ├── models/           # SQLAlchemy ORM models (80+ tables)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (AI, payments, storage)
│   │   └── templates/        # Jinja2 email/PDF templates
│   ├── tests/                # pytest unit + integration tests
│   ├── alembic/              # Database migration scripts
│   ├── requirements.txt
│   ├── main.py               # FastAPI entry point
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # 9 authentication pages
│   │   ├── (main)/           # 26 public pages
│   │   ├── (portal)/         # 123 portal pages (admin/client/freelancer)
│   │   ├── ai/               # 12 AI tool pages
│   │   ├── components/       # 522 shared components
│   │   │   ├── AI/           # AI UI kit (aurora, particles, confetti)
│   │   │   ├── Button/       # Atom components
│   │   │   └── ...
│   │   └── globals.css
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities, API client, formatters
│   ├── services/             # Frontend API service layer
│   ├── e2e/                  # Playwright E2E tests
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docs/                     # 41+ documentation files
│   ├── Architecture.md
│   ├── API_Overview.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_RUNBOOK.md
│   ├── adr/                  # Architecture Decision Records
│   └── ...
│
├── nginx/                    # Nginx reverse proxy config
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Development (hot reload)
├── do-spec.yaml              # DigitalOcean App Platform spec
└── FYP_PRESENTATION_DATA.md  # Verified technical metrics
```

### CSS Module Convention

Every component follows the **3-file pattern**:

```
Button/
  Button.tsx
  Button.common.module.css   ← layout, structure, motion
  Button.light.module.css    ← light-mode colors
  Button.dark.module.css     ← dark-mode colors
```

This produces 1,321 CSS files across the project — ensuring true theme isolation with zero global CSS leakage.

---

## Getting Started

### Prerequisites

| Requirement | Minimum |
|-------------|---------|
| Node.js | 18+ |
| Python | 3.11+ |
| Docker Desktop | latest |
| Turso account | free tier |

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/ghulam-mujtaba5/MegiLance.git
cd MegiLance

# 2. Copy environment file and fill in values
cp .env.example .env

# 3. Start with hot reloading (development)
docker compose -f docker-compose.dev.yml up --build

# 4. Open in browser
#    Frontend:   http://localhost:3000
#    API Docs:   http://localhost:8000/api/docs
#    API Health: http://localhost:8000/api/health/ready
```

### Option B — Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev                        # http://localhost:3000
```

### Seed Demo Data

```bash
cd backend
python seed_data.py
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@megilance.com | demo123 |
| Freelancer | freelancer@demo.com | demo123 |
| Client | client@demo.com | demo123 |

> Demo login is also available directly on the home page hero section.

---

## Environment Variables

Create a `.env` file in the project root (or `backend/.env`):

```env
# ── Database ──────────────────────────────────────────────
TURSO_DATABASE_URL=libsql://<db-name>-<org>.turso.io
TURSO_AUTH_TOKEN=sk_turso_...

# ── Auth ──────────────────────────────────────────────────
SECRET_KEY=your-256-bit-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── AI / LLM ──────────────────────────────────────────────
DO_AI_API_KEY=doa_...                  # DigitalOcean AI Gateway
# Model: llama3.3-70b (only DO open models supported on this key)

# ── Payments ──────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Storage ───────────────────────────────────────────────
R2_ACCOUNT_ID=...                      # Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=megilance-media
# Leave R2_* empty to fall back to local /uploads storage

# ── Blog Database (MongoDB) ───────────────────────────────
MONGODB_URI=mongodb+srv://...

# ── Email ─────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app-password

# ── Frontend ──────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

See [docs/TURSO_SETUP.md](docs/TURSO_SETUP.md) for Turso database provisioning.

---

## API Reference

Interactive API documentation is auto-generated by FastAPI:

- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`
- **OpenAPI JSON**: `/api/openapi.json`

### Core Endpoint Groups

| Group | Base Path | Description |
|-------|-----------|-------------|
| Auth | `/auth/*` | Login, signup, refresh, 2FA |
| Users | `/users/*` | Profile, avatar, settings |
| Projects | `/projects/*` | CRUD, proposals, milestones |
| Contracts | `/contracts/*` | Builder, sign, PDF export |
| Payments | `/payments/*` | Wallet, invoices, stripe, crypto |
| AI Tools | `/ai/*` | All 12 AI service endpoints |
| Admin | `/admin/*` | Moderation, analytics, system |
| Portal | `/portal/*` | Dashboard aggregation endpoints |
| Health | `/api/health/*` | `/live` (liveness) · `/ready` (readiness) |

### Example Requests

```bash
# Health check
curl http://localhost:8000/api/health/ready

# Get AI price estimate
curl -X POST http://localhost:8000/api/v1/price-estimator/estimate \
  -H "Content-Type: application/json" \
  -d '{"category": "web-development", "hours": 40, "complexity": "medium"}'

# Get freelancer match score
curl -X POST http://localhost:8000/api/v1/matching/match \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "proj_123"}'

# List supported currencies
curl http://localhost:8000/api/v1/payments/currencies
```

Full documentation: [docs/API_Overview.md](docs/API_Overview.md)

---

## Testing

### Run All Tests

```bash
# Backend
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing

# Frontend unit
cd frontend
npm run test:unit

# E2E (requires running app)
npm run test:e2e

# Accessibility audit
npm run test:a11y

# Lighthouse CI performance
npm run test:lighthouse
```

### Test Coverage Summary

| Layer | Framework | Tests |
|-------|-----------|-------|
| Backend Unit | pytest + pytest-asyncio | 9 files |
| Backend Integration | pytest + httpx | 2 files |
| Frontend Unit | Jest + @testing-library/react | 7 files |
| E2E | Playwright 1.58 | 4 files |
| Accessibility | axe-core + Playwright | 1 file |
| CSS Compliance | Custom validator | 1 file |
| Performance | Lighthouse CI | 1 config |

### Core API Pass Rate

| Domain | Tests | Status |
|--------|-------|--------|
| Authentication | 5/5 | ✅ 100% |
| Contracts | 8/8 | ✅ 100% |
| Projects | 6/6 | ✅ 100% |
| Health Checks | 2/2 | ✅ 100% |

---

## Deployment

### Production Stack

```
GitHub → DigitalOcean App Platform
         ├── Frontend container (Next.js, port 3000)
         ├── Backend container (FastAPI, port 8000, 2 CPU / 1 GB RAM)
         └── Nginx (reverse proxy + SSL via Certbot)
         
Turso ──── Cloud database (edge replicated globally)
R2    ──── Media storage (images, uploads)
MongoDB ── Blog CMS data
```

### Deploy to DigitalOcean

```bash
# Deploy using the App Platform spec
doctl apps create --spec do-spec.yaml

# Or update an existing app
doctl apps update <APP_ID> --spec do-spec.yaml
```

### Docker Production Build

```bash
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down
```

### Security Hardening (Production)

- All containers run as **non-root users**
- All Linux capabilities **dropped** (`cap_drop: ALL`)
- `no-new-privileges` flag **enabled**
- Health checks on every service (30-second interval)
- HTTPS-only with HSTS headers
- CSP headers via middleware

---

## Challenges & Limitations

| Challenge | Solution |
|-----------|----------|
| Stripe/PayPal blocked in Pakistan | Added JazzCash, EasyPaisa, USDC via MetaMask |
| Event-loop blocking with Turso sync client | Converted all 552 async handlers to sync `def` |
| AI model hosting costs | DigitalOcean AI gateway (llama3.3-70b) with template fallbacks |
| Real-time communication | Socket.io for messaging; WebRTC for video |
| Blockchain gas fees | Used Polygon (low fees) for USDC |
| 750+ endpoints organization | 7 domain packages, 97+ routers |
| Dark mode CSS | 3-file CSS module system per component |

**Current Limitations:**
- Smart contracts deployed on testnet only (not mainnet yet)
- Redis cache is optional — deployed only when env vars present
- No automated CI/CD pipeline committed to repo

---

## Roadmap

| Area | Planned |
|------|---------|
| Blockchain | Deploy contracts to Polygon mainnet; full on-chain escrow |
| Mobile | React Native app (iOS/Android) |
| AI | Fine-tune models on freelancing data; voice chatbot |
| Analytics | Real-time predictive dashboard |
| Learning | Full LMS with video courses and certifications |
| API | Public developer portal with API keys |
| Performance | CDN edge caching; database read replicas |
| Security | Penetration testing; SOC 2 compliance |

---

## Team

| Name | Role | Student ID |
|------|------|------------|
| **Ghulam Mujtaba** | Team Lead — Architecture, AI Integration, Full-Stack | FA22-BSE-199 |
| **Muhammad Waqar Ul Mulk** | Backend Development, Database Design, Security | FA22-BSE-153 |

**Supervisor:** Dr. Junaid Akram
**Co-Supervisor:** Khula Qadeer
**Department:** Computer Science, COMSATS University Islamabad, Lahore Campus

---

## Acknowledgments

- **FastAPI** and **Next.js** communities for excellent frameworks
- **Turso** for edge-replicated SQLite that made global low-latency feasible
- **DigitalOcean** for App Platform hosting and AI gateway
- **Cloudflare** for R2 media storage
- **Radix UI** and **Framer Motion** for accessible, animated components
- Upwork, Fiverr, and Toptal for inspiration on freelancing platform patterns

---

## License

MIT License — see [LICENSE](LICENSE) for full text.

---

<div align="center">

**MegiLance 2.0** — *Built for the AI era. Deployed for the world.*

[Live Demo](https://megilance.site) · [API Docs](https://megilance.site/api/docs) · [GitHub](https://github.com/ghulam-mujtaba5/MegiLance)

</div>
