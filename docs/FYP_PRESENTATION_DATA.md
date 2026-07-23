# MegiLance 2.0 — FYP Final Evaluation Presentation Data
## Verified Technical Details from Codebase

---

## Slide 1: Title Slide

**MegiLance — AI-Powered Freelancing Platform**
Final Year Project — BS Software Engineering
COMSATS University Islamabad, Lahore Campus

**Team:**
- Ghulam Mujtaba — FA22-BSE-199
- Muhammad Waqar Ul Mulk — FA22-BSE-153

**Supervisor:** Dr. Junaid Akram
**Co-Supervisor:** Khula Qadeer

**Production URL:** megilance.site
**GitHub:** github.com/ghulam-mujtaba5/MegiLance

---

## Slide 2: Introduction

MegiLance is an **AI and blockchain-powered next-generation freelancing platform** that solves key issues in the freelance ecosystem such as payment limitations, trust gaps, unfair ranking, and pricing confusion.

**Key Facts:**
- Full-stack platform: Next.js 16 (frontend) + FastAPI (backend)
- **750+ API endpoints** across 7 domain packages
- **229 frontend pages** with **522 components**
- **12 AI services** with **65 AI-specific endpoints**
- **Solidity smart contracts** with MetaMask integration
- **80+ database tables** on Turso (libSQL) cloud
- **788 git commits** from 6 contributors
- **Production deployed** on DigitalOcean App Platform

---

## Slide 3: Problem Statement

The freelance economy is growing rapidly, but existing platforms face critical limitations:

**Payment Barriers:**
- Freelancers in Pakistan face payment barriers (Stripe/PayPal restrictions)
- Cross-border payments are expensive and slow
- No native crypto payment support on most platforms

**Trust Gaps:**
- Clients struggle to find reliable freelancers
- No AI-based fraud detection
- Fake reviews and Manipulated ratings

**Pricing Confusion:**
- No AI-powered price estimation
- Freelancers undercharge or overcharge
- No market-rate intelligence

**Our Solution:** A hybrid Web2 + AI + Web3 platform combining marketplace, AI intelligence, and blockchain payments.

---

## Slide 4: Proposed Solution

MegiLance provides a **hybrid AI and blockchain-based freelancing marketplace** combining:

**Web2 Layer:**
- Full-stack marketplace with user accounts, projects, proposals, dashboards, reviews, and admin management
- Built with Next.js 16 + FastAPI + Turso Database

**AI Layer:**
- AI microservices for price estimation, talent matching, sentiment analysis, fraud detection, skill analysis, and chatbot support
- 12 dedicated AI services with 65 AI-specific endpoints

**Web3 Layer:**
- Solidity smart contracts (MockUSDC) on Polygon/Ethereum
- MetaMask wallet integration across 8 EVM chains
- USDC/USDT stablecoin payments

---

## Slide 5: Feature Workflow

1. **Client Posts Project** → AI suggests budget range
2. **AI Match & Price Estimate** → Matching engine scores freelancers (9-factor scoring)
3. **Freelancer Bids & Client Hires** → AI proposal writer assists freelancers
4. **Smart Contract Escrow** → Funds locked via MetaMask/Stripe
5. **Work Submission** → Milestone-based delivery with file uploads
6. **Review & Sentiment Analysis** → VADER sentiment analysis detects fake reviews
7. **Secure Payment Release** → Escrow releases on approval with fraud detection

---

## Slide 6: System Objectives

1. ✅ Build full-stack freelancing marketplace using Next.js and FastAPI
2. ✅ Provide separate portals for clients (28 pages), freelancers (51 pages), and administrators (44 pages)
3. ✅ Use AI for price estimation, freelancer ranking, sentiment analysis, fraud detection, skill analysis, and chatbot assistance
4. ✅ Design blockchain-based smart contract escrow for secure and transparent payment workflows
5. ✅ Improve trust, pricing clarity, and decision-making in freelancing
6. ✅ Pakistan-specific payments (JazzCash, EasyPaisa, USDC)

---

## Slide 7: Platform Statistics

| Metric | Count |
|--------|-------|
| Backend API Endpoints | **750** |
| Frontend Pages | **229** |
| Frontend Components | **522** |
| Database Tables | **80+** |
| Backend Services | **105** |
| AI Service Endpoints | **65** (56 backend + 9 microservice) |
| AI Service Files | **12** |
| Pydantic Schemas | **31 files, 100+ classes** |
| CSS Module Files | **1,321** |
| Test Files | **22** (11 backend + 7 frontend + 4 E2E) |
| Git Commits | **788** (main branch) |
| Contributors | **6** |
| Docker Services | **3** (frontend, backend, AI) |
| EVM Chains Supported | **8** |
| Backend Dependencies | **27 direct** |
| Frontend Dependencies | **70+ production, 30+ dev** |

---

## Slide 8: Client Workflow

**Client Portal Features (28 pages):**
- Dashboard with spending analytics and project overview
- Post projects with AI-assisted budget estimation
- Find talent with AI-powered freelancer matching
- Manage contracts with e-signatures
- Fund escrow, milestone-based release
- Real-time messaging with Socket.io
- AI-powered invoice generation
- File disputes with evidence upload
- Rate freelancers with sentiment-verified reviews
- Multi-currency wallet (fiat + crypto)

---

## Slide 9: Freelancer Workflow

**Freelancer Portal Features (51 pages):**
- Dashboard with earnings, active contracts, proposal stats
- Submit proposals with AI proposal writer assistance
- Accept/sign/complete contracts
- Portfolio showcase with portfolio builder
- Skill assessment with AI-verified badges
- Track earnings with monthly reports and analytics
- Time tracking for hourly contracts
- Set availability schedule and patterns
- Rate cards for service packages
- Withdraw to JazzCash/EasyPaisa/USDC/Bank
- Create and manage teams
- Referral campaigns and rewards
- Online courses and certifications
- KYC verification with document upload

---

## Slide 10: Admin Workflow

**Admin Portal Features (44 pages):**
- Platform health dashboard with real-time data
- User management (view, edit, ban/unban) - 14 endpoints
- Monitor all projects, categories, skills
- View all transactions, refunds, invoices
- AI-powered fraud alerts and analysis
- Content moderation queue
- Review and resolve disputes
- Revenue trends, user growth, conversion funnel analytics
- Toggle features by user segment (feature flags)
- GDPR compliance, data retention, consent management
- 90-day audit trail with 11 endpoints
- Blog CMS (MongoDB-backed)
- White-label branding configuration
- Email template management
- Webhook configuration
- API key management
- System health monitoring

---

## Slide 11: AI Features

### 12 AI Services Implemented

| # | AI Service | Description | Lines of Code |
|---|-----------|-------------|---------------|
| 1 | AI Chatbot | Intent classification (21 intents), FAQ matching, live agent handoff | 1,582 lines |
| 2 | Price Estimator | Multi-industry market-rate pricing intelligence | 915+ lines |
| 3 | Proposal Writer | AI-generated proposals with project-specific context | Full service |
| 4 | Rate Advisor | Personalized rate recommendations | Full service |
| 5 | Scope Planner | AI scope planning with budget estimation | Full service |
| 6 | Skill Analyzer | Skill gap analysis, career pathing, industry mapping | 6 API endpoints |
| 7 | Income Calculator | Income projection based on skills/market data | Full service |
| 8 | Expense & Tax Calculator | Tax and expense calculation | Full service |
| 9 | Invoice Generator | AI-powered invoice creation with PDF export | Full service |
| 10 | Contract Builder | Smart contract generation with templates | 10 API endpoints |
| 11 | Fraud Detection | Multi-signal fraud detection with velocity tracking | 702 lines |
| 12 | Sentiment Analysis | VADER-based NLP sentiment for reviews with fake detection | 440 lines |

### AI Microservice (Separate FastAPI Service)
- Semantic embedding generation (sentence-transformers)
- Text generation via DigitalOcean AI (llama3.3-70b-instruct)
- VADER sentiment analysis
- Review-specific sentiment with fake detection
- Batch sentiment analysis
- Skill extraction from text
- Professional proposal generation

### AI Matching Engine (9-Factor Scoring)
1. Skill graph matching with synonym resolution
2. Experience level alignment
3. Budget compatibility
4. Availability match
5. Historical success rate
6. Response time
7. Client satisfaction score
8. Portfolio relevance
9. Behavioral signals

---

## Slide 12: Blockchain & Web3 Features

### Smart Contract
- File: `contracts/MockUSDC.sol` (69 lines)
- Compiler: Solidity ^0.8.20
- Testnet stablecoin mimicking real USDC (6 decimals)
- Functions: `mint()`, `faucet()` (1000 USDC), `transfer()`, `approve()`, `transferFrom()`
- Target Networks: Polygon Amoy / Sepolia testnets

### MetaMask Integration
- Frontend: `lib/web3/metamask.ts` (dependency-free EIP-1193 helper)
- Features: connectWallet, switchChain, sendTransaction, addTokenToWallet

### Supported EVM Chains (8)
1. Ethereum Mainnet
2. OP Mainnet (Optimism)
3. Base
4. Arbitrum One
5. Linea
6. Polygon
7. BSC (BNB Smart Chain)
8. Sepolia Testnet

### Pakistan Payment Methods
- JazzCash (mobile wallet)
- EasyPaisa (mobile wallet)
- USDC on Polygon (lower fees)
- USDC on Ethereum (more liquidity)
- AirTM, Wise, Payoneer

---

## Slide 13: Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.3 | React framework with App Router |
| React | 19.2.5 | UI library |
| TypeScript | 5.7.2 | Type safety (strict mode) |
| Tailwind CSS | 4.1.11 | Utility-first styling |
| Radix UI | Multiple | Accessible component primitives |
| Framer Motion | 12.38.0 | Animations |
| Three.js | 0.183.2 | 3D graphics (globe, particles) |
| Socket.io Client | 4.8.1 | Real-time communication |
| React Hook Form | 7.54.2 | Form management |
| Zod | 3.24.1 | Schema validation |
| Chart.js | 4.5.1 | Data visualization |
| TipTap | 3.26.1 | Rich text editor |
| Stripe.js | 8.4.0 | Payment integration |
| jsPDF | 2.5.2 | PDF generation |
| Lottie React | 2.4.1 | Animated icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115.6 | Python web framework |
| Uvicorn | 0.34.0 | ASGI server (with uvloop) |
| Pydantic | 2.10.6 | Data validation |
| SQLAlchemy | 2.0.36 | ORM (schema reference only) |
| Alembic | 1.17.1 | Database migrations |
| Turso HTTP Client | Custom | Database access (libSQL cloud) |
| Stripe | 11.5.0 | Payment processing |
| Socket.io | 5.14.3 | Real-time server |
| python-jose | 3.3.0 | JWT tokens |
| passlib + bcrypt | 1.7.4 + 4.0.1 | Password hashing |
| pyotp | 2.9.0 | TOTP 2FA |
| httpx | 0.28.1 | HTTP client |
| litellm | ≥1.0.0 | LLM gateway |
| OpenAI | ≥1.0.0 | AI API |
| boto3 | 1.42.4 | AWS S3 storage |
| pymongo | 4.10.1 | MongoDB (blog CMS) |
| sentry-sdk | ≥1.40.0 | Error monitoring |
| slowapi | 0.1.9 | Rate limiting |

### Database
- Turso (libSQL) - Primary database (cloud-hosted, 80+ tables)
- MongoDB - Blog CMS (articles collection)
- Redis - Optional caching layer

### AI Service
- sentence-transformers - Semantic embeddings
- VADER Sentiment - NLP sentiment analysis
- DigitalOcean AI - LLM inference (llama3.3-70b-instruct)

### Infrastructure
- Docker - Containerization (3 services)
- Docker Compose - Multi-service orchestration
- Nginx - Reverse proxy (production)
- Certbot - SSL certificate auto-renewal
- DigitalOcean App Platform - Cloud hosting
- GitHub - Version control & CI/CD

---

## Slide 14: System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS      │
│  229 Pages │ 522 Components │ 1,321 CSS Modules         │
│  PWA Support │ Socket.io │ WebRTC Video Calls            │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API + WebSocket
┌─────────────────────┴───────────────────────────────────┐
│                   API LAYER                              │
│  FastAPI + Python 3.12 │ 750 Endpoints                  │
│  JWT Auth + 2FA + OAuth │ Rate Limiting (60 req/min)     │
│  97+ Router Modules │ 5 Middleware Layers                │
└────────┬──────────────────┬─────────────────────────────┘
         │                  │
┌────────┴────────┐  ┌─────┴──────────────────────────────┐
│  BUSINESS LOGIC  │  │         AI MICROSERVICE             │
│  105 Services    │  │  FastAPI + sentence-transformers    │
│  12 AI Services  │  │  9 Endpoints │ Port 8001            │
│  Payments/Stripe │  │  Embeddings + Sentiment + NLP       │
│  Escrow/Web3     │  └────────────────────────────────────┘
└────────┬────────┘
         │
┌────────┴──────────────────────────────────────────────┐
│                  DATA LAYER                            │
│  Turso (libSQL Cloud) │ 80+ Tables │ Custom HTTP Client│
│  MongoDB (Blog CMS) │ Redis (Optional Cache)           │
│  Stripe (Payments) │ Blockchain (USDC/Polygon)         │
└──────────────────────────────────────────────────────┘
```

### Service Ports
- Frontend: port 3000 (https://megilance.site)
- Backend API: port 8000 (https://api.megilance.site)
- AI Service: port 8001 (https://api.megilance.site/ai-api)

---

## Slide 15: Database Schema

### Total Tables: 80+

**Core Tables (37 ORM Models):**
- users, user_sessions, user_verifications, audit_logs
- projects, proposals, contracts, milestones
- payments, escrow, invoices, refunds, time_entries
- skills, user_skills, categories, tags, project_tags
- conversations, messages, notifications
- reviews, disputes, support_tickets
- portfolio_items, favorites
- analytics_events, project_embeddings, user_embeddings
- referrals, invitations
- milestone_deliverables, deliverable_files, deliverable_comments
- signature_requests, document_signatures
- scope_change_requests

**Additional Runtime Tables (50+):**
- Gamification: badges, user_badges, achievements
- Community: community_hubs, community_posts
- Referrals: referral_campaigns, referral_milestones
- Security: fraud_alerts, api_keys, webhooks
- Availability: availability_settings, weekly_pattern
- Teams: teams, team_members, team_invitations
- Video: video_calls, participants
- Workflows: workflows, workflow_logs
- Legal: legal_documents, legal_acceptances
- Subscriptions: subscriptions, subscription_invoices
- Chatbot: chatbot_conversations, chatbot_messages
- Organizations: organizations, organization_members

---

## Slide 16: API Endpoints Summary (750)

| Domain | Endpoints | Key Routers |
|--------|-----------|-------------|
| Identity | 62 | auth (17), admin (14), verification (12), users (8), social-auth (7), api-keys (4) |
| Projects | 65 | proposals (14), contracts (10), skills (8), milestones (8), projects (7), freelancers (6) |
| AI | 56 | chatbot (9), client-assistant (9), fraud-detection (9), skill-analyzer (6), matching (5), writing (5) |
| Chat | 21 | messages (7), video-comms (6), websocket (4), comments (4) |
| Payments | 66 | wallet (7), subscriptions (7), invoices (7), escrow (6), stripe (5), crypto (3), pk-payments (5) |
| Reviews | 18 | disputes (7), reviews (6), user-feedback (5) |
| Core | 460+ | portal (21), workroom (15), learning-center (12), notifications-pro (12), audit (11), branding (11), compliance (11), feature-flags (11), analytics (10), price-estimator (10), workflows (10) + 60 more routers |

### Top 15 Endpoint-Heavy Routers
1. portal_endpoints.py — 21 endpoints
2. auth.py — 17 endpoints
3. workroom.py — 15 endpoints
4. admin.py — 14 endpoints
5. proposals.py — 14 endpoints
6. notifications_pro.py — 12 endpoints
7. learning_center.py — 12 endpoints
8. branding.py — 11 endpoints
9. audit.py — 11 endpoints
10. compliance.py — 11 endpoints
11. feature_flags.py — 11 endpoints
12. analytics_pro.py — 10 endpoints
13. contract_builder.py — 10 endpoints
14. price_estimator.py — 10 endpoints
15. workflow_automation.py — 10 endpoints

---

## Slide 17: Authentication & Security

### 6 Authentication Methods
1. Email/Password — bcrypt hashing (cost=12)
2. OAuth — Google, GitHub, LinkedIn
3. TOTP 2FA — pyotp + QR code
4. Passwordless — Email magic links
5. Phone Verification — SMS
6. Email Verification — Account activation

### Security Features
- JWT Tokens: Access (30 min) + Refresh (7 days), HS256
- Rate Limiting: 60 req/min per IP (SlowAPI)
- Account Lockout: After 5 failed attempts (15 min)
- CSRF Protection: SameSite=Lax cookies
- Audit Logging: 90-day retention, 14 action types
- HTTPS: HSTS headers in production
- Content Security Policy: CSP headers via middleware
- Request Size Limit: 10MB max body size
- Input Validation: Pydantic schemas for all inputs
- SQL Injection Prevention: Parameterized queries via Turso HTTP

### Middleware Stack (5 layers)
1. RequestIDMiddleware — X-Request-Id, idempotency, logging
2. CORSMiddleware — Cross-origin request handling
3. SecurityHeadersMiddleware — CSP, HSTS, X-Frame-Options
4. GZipMiddleware — Response compression
5. RequestSizeLimitMiddleware — 10MB body limit

---

## Slide 18: Deployment Architecture

### Docker Configuration (3 services)
- Frontend: Next.js on port 3000
- Backend: FastAPI on port 8000, 2 CPU / 1GB RAM limits
- AI: Python service on port 8001, read-only filesystem

### Production Stack
- Nginx — Reverse proxy with SSL termination
- Certbot — Auto-renewing SSL certificates
- DigitalOcean App Platform — Cloud hosting
- GitHub — Source control and deployment

### Security in Production
- All containers run as non-root users
- All capabilities dropped (cap_drop: ALL)
- No-new-privileges flag enabled
- Health checks on all services (30s interval)

---

## Slide 19: Frontend Architecture

### Route Groups (229 pages)
- (auth)/ — 9 pages (login, signup, forgot-password, etc.)
- (main)/ — 26 pages (landing, about, pricing, categories, features)
- (portal)/ — 174 pages (dashboard, projects, contracts, payments, settings)
- ai/ — 12 pages (AI tools)
- Root-level — 38 pages (blog, hire, compare, support, onboarding)

### Portal Breakdown
- Admin: 44 pages
- Freelancer: 51 pages
- Client: 28 pages
- Shared: 40 pages

### Component Categories (522 files)
- Atoms (16+): Button, Input, Badge, Checkbox, Toggle, Tooltip
- Organisms (30+): Header, Sidebar, Modal, DataTable, PaymentCard
- Templates (6): DashboardLayout, PublicHeader, PublicFooter
- AI Components (12): PriceEstimator, SentimentAnalyzer, Chatbot
- Payment (4): MetaMaskDeposit, PakistanPaymentOptions
- PWA (3): InstallAppBanner, OfflineIndicator, UpdateNotification
- Animations (14): GlobeBackground, GlassCard, LottieAnimation
- 3D (5): Three.js scene, Globe, Particles, Meteors
- Editor (2): RichTextEditor, ContractBuilder
- Charts (2): LineChart, AnalyticsDashboard

### CSS Architecture
- 1,321 CSS module files
- 3-file pattern per component: .common.module.css, .light.module.css, .dark.module.css
- Dark mode via class toggle
- Custom fonts: Poppins (headings), Inter (body), JetBrains Mono (code)

---

## Slide 20: Testing

### Test Coverage
| Category | Files | Framework |
|----------|-------|-----------|
| Backend Unit | 9 | pytest + pytest-asyncio + pytest-cov |
| Backend Integration | 2 | pytest + httpx |
| Frontend Unit | 7 | Jest + @testing-library/react |
| E2E | 4 | Playwright |
| A11y | 1 | axe-core + Playwright |
| CSS Compliance | 1 | Custom validator |

### Testing Tools
- Unit: Jest 30.2.0, @testing-library/react 16.3.2
- E2E: Playwright 1.58.2
- A11y: axe-core 4.11.1
- Performance: Lighthouse CI (@lhci/cli 0.15.1)
- Mocking: MSW 2.7.0 (Mock Service Worker)

---

## Slide 21: Documentation

### 41+ Documentation Files
- DEPLOYMENT_RUNBOOK.md
- PRODUCTION_DEPLOYMENT_CHECKLIST.md
- PRODUCTION_CHECKLIST.md
- PRODUCTION_READY_CHANGES.md
- DATABASE_SCHEMA.md
- INCIDENT_RESPONSE.md
- PROJECT_ISSUES_AUDIT.md
- SYSTEM_STATUS.md
- ARCHIVE.md
- adr/README.md (Architecture Decision Records)
- 26 frontend-specific docs (design system, components, UI/UX, testing)

---

## Slide 22: Challenges & Limitations

### Challenges Faced
1. Stripe unavailable in Pakistan → Added JazzCash, EasyPaisa, USDC crypto payments
2. Database scaling (Turso) → Custom HTTP client with LRU+TTL caching, retry logic
3. AI model hosting costs → DigitalOcean AI (llama3.3-70b) with fallback to templates
4. Real-time communication → Socket.io for messaging, WebRTC for video calls
5. Blockchain gas fees → Used Polygon (low fees) for USDC transactions
6. Type safety across stack → TypeScript strict mode + Pydantic schemas
7. 750+ API endpoints → Organized into 7 domain packages with 97+ routers
8. Dark mode support → 3-file CSS module system per component

### Current Limitations
1. Smart contracts deployed on testnet only (not mainnet)
2. AI chatbot requires live LLM endpoint for full functionality
3. No CI/CD workflows committed to repository
4. Redis caching optional (not always deployed)
5. Some placeholder router files (11 empty)

---

## Slide 23: Future Work

| Area | Planned Improvements |
|------|---------------------|
| Blockchain | Deploy smart contracts to Polygon mainnet, full on-chain escrow |
| AI | Fine-tune models on freelancing data, voice-based chatbot |
| Mobile | React Native mobile app for iOS/Android |
| Analytics | Real-time analytics dashboard with predictive insights |
| Learning | Full LMS with video courses and certifications |
| Marketplace | Gig marketplace (Fiverr-style) with packages |
| API | Public API with developer portal and documentation |
| Performance | CDN integration, edge caching, database read replicas |
| Security | Penetration testing, SOC 2 compliance |
| Monetization | Subscription tiers with Stripe billing |

---

## Slide 24: Q&A

**Thank you!**

MegiLance 2.0 — Where AI meets Blockchain for the future of freelancing.

Live: https://megilance.site
Repository: https://github.com/ghulam-mujtaba5/MegiLance

---

*Data verified from codebase on June 18, 2026*
