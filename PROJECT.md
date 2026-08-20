# Project: MegiLance 2.0 Freelancing Platform (Phase 2)

## Architecture
MegiLance is a modern full-stack freelancing and gig marketplace built with:
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Radix UI + CSS Modules (`frontend/`)
- **Backend**: FastAPI + Python 3.11+ + SQLAlchemy 2.0 + Turso/LibSQL (`backend/`)
- **AI Hiring Assistant & Intelligence**: Multi-model DO AI LLM gateway (`deepseek-v4-pro`, `llama3.3-70b`), 9-factor talent matching engine, multi-dataset price estimation engine, intent classifier, and propose-then-confirm action executor (`backend/app/services/ai/`, `backend/app/api/v1/ai/`)
- **Real-Time Communication**: Socket.io ASGI server for presence, real-time messaging, typing, room channels (`backend/app/core/websocket.py`)
- **Transactional Notifications**: Multi-channel notification pipeline (In-app alerts + SMTP / Resend email triggers)
- **Database & Storage**: Turso cloud SQLite with double-checked locking singleton connection pool and LRU+TTL read query cache

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Auth & Onboarding | JWT login, registration, password hashing, role selection (Client/Freelancer/Admin) | M1, M3 | Survey |
| 2 | Role Switching | Portal layout authorization, seamless persona toggle in profile navbar | M2, M3 | Survey |
| 3 | Project & Job Posting | Multi-step job wizard, budget, skills, category, instant broadcast | M1, M2, M3 | Survey |
| 4 | Job Search & Filtering | Category, budget type, experience level, query parameters | M1, M3 | Survey |
| 5 | Proposal Submission | 3-step proposal wizard, milestone structuring, bid validation | M2, M3 | Survey |
| 6 | Proposal Comparison & Bidding | Client proposal matrix, AI fraud check, counter-offers, shortlisting | M2, M3 | Survey |
| 7 | Atomic Contract Inception | Accept proposal -> create contract, create pending escrow, auto-reject rivals | M1, M3 | Survey |
| 8 | Escrow Custody & Funding | Wallet debit, escrow lock, support for Stripe/Crypto/Pakistan gateways | M1, M3 | Survey |
| 9 | Milestone Lifecycle | Client creation, freelancer delivery submission, client review/approval | M1, M3 | Survey |
| 10 | Escrow Fund Release | Atomic balance release, platform fee deduction, wallet credit | M1, M3 | Survey |
| 11 | Deliverables & Signatures | Route prefix normalization, file attachment submission, e-signatures | M1, M2 | Survey |
| 12 | Real-Time Chat & Rooms | Socket.io room joins, message delivery, typing indicator, live presence | M3 | Survey |
| 13 | Notification Pipeline | In-app alerts and transactional email event triggers across key milestones | M3 | Survey |
| 14 | Two-Way Reviews & Ratings | 5-star rating breakdown, comment sentiment, JSS re-calculation | M3 | Survey |
| 15 | Dispute Resolution | Client/Freelancer dispute filing, evidence submission, admin arbitration | M1, M3 | Survey |
| 16 | Admin User & Platform Oversight | User moderation, status toggling, support ticket visibility, platform metrics | M1, M3 | Survey |
| 17 | Talent Invitations Router | Direct invitation endpoints for client inviting freelancers to jobs | M1 | Survey |
| 18 | Toast & Feedback Polish | Migration of native alert dialogs to unified Toast system across 9 views | M2 | Survey |
| 19 | AI Hiring Assistant Natural NLP | Conversational project requirement extraction, intent parsing, skill inference | M6 (Phase 2) | Survey Phase 2 |
| 20 | AI Talent Directory Matching | 9-factor ranking engine, verified skill matching, rich talent cards with action buttons | M6 (Phase 2) | Survey Phase 2 |
| 21 | AI Market-Rate Price Estimation | Multi-tier complexity pricing, historical DB aggregations, regional PPP adjustment | M6 (Phase 2) | Survey Phase 2 |
| 22 | AI Agentic Actions & Workflows | Propose-then-confirm project drafting, talent invitations, account status checks | M6 (Phase 2) | Survey Phase 2 |
| 23 | Multi-Tier E2E Test Suite | 195 backend pytest tests & 63 Jest frontend unit tests validating all flows | M7 (Phase 2) | Survey Phase 2 |
| 24 | Forensic Victory Audit Certification | Static analysis, runtime tracing, and zero-compromise integrity verification | M8 (Phase 2) | Survey Phase 2 |

## Milestones (Phase 2)
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M6 | AI Chatbot Hiring Assistant Refinements & Integration | Fix action button URLs, fix welcome API method, add `/ai/estimate-price` compatibility, upgrade `FreelancerCards` to rich interactive cards with avatar/match score/actions, align `/ai/chatbot` | None | DONE |
| M7 | Multi-Tier Test Suite & Adversarial Validation | Run full backend pytest suites (195 tests) including AI hiring assistant flows, frontend Jest tests (63 tests), and Next.js production build (`npm run build`) | M6 | DONE |
| M8 | Forensic Victory Audit & Integrity Certification | Forensic auditor verification of all AI and marketplace implementations | M7 | DONE |

## Interface Contracts
### AI Hiring Assistant Endpoints
- `POST /api/v1/ai/client-assistant/chat` -> `{ reply, suggestions, tool_results, action_buttons, conversation_id }`
- `GET /api/v1/ai/client-assistant/welcome` -> `{ message, suggestions, quick_actions, role }`
- `POST /api/v1/ai/client-assistant/actions/post-project` -> `{ success, project_id, message }`
- `POST /api/v1/ai/smart-match` -> `{ matches: [{ freelancer_id, full_name, match_score, why_good_fit, skills, rating, hourly_rate }] }`
- `POST /api/v1/price-estimator/estimate` -> `{ estimated_min_budget, estimated_max_budget, recommended_rate, duration_days, phase_breakdown }`

## Code Layout
- `backend/app/api/v1/ai/`: AI feature routers (`client_assistant.py`, `ai_matching.py`, `project_brief.py`, `ai_services.py`, `chatbot.py`)
- `backend/app/services/ai/` & `services/`: AI business logic (`matching_engine.py`, `price_estimator_engine.py`, `ai_chatbot.py`, `llm_gateway.py`)
- `frontend/app/components/AI/`: UI components (`ChatbotAgent/`, `AIMatchCard/`, `AIPriceEstimator/`, `AIRateEstimator/`, `AIProposalAssistant/`)
- `frontend/app/ai/chatbot/`: Dedicated full-page AI assistant (`ChatbotEnhanced.tsx`)
- `frontend/lib/api/ai.ts`: Typed API client for all AI assistant operations
