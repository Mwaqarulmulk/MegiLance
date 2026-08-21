# MegiLance Backend Architecture & API Survey Report

**Author**: Backend APIs Explorer  
**Date**: August 19, 2026  
**Repository**: `e:\MegiLance\backend`  
**Environment**: Python 3.11.9, FastAPI 0.115.0+, Turso (libSQL Cloud Database), Socket.io, Sentry, Resend 2.0 / SMTP  

---

## 1. Executive Summary & System Architecture

The MegiLance backend is a production-grade FastAPI web service designed for an AI-powered full-stack freelancing marketplace. It serves both the web frontend (Next.js 16) and mobile/external clients via REST and WebSocket/Socket.io interfaces.

### Core Technology Stack:
- **Framework**: FastAPI with Pydantic v2 data models and dependency injection.
- **Database Engine**: Turso (remote libSQL via HTTP API). Runtime data access is handled synchronously via `TursoHTTP` (`app/db/turso_http.py`) and asynchronously via `AsyncTursoHTTP` (`app/db/turso_http_async.py`). SQLAlchemy models are preserved for metadata, migrations, and Alembic compatibility.
- **Authentication & Security**: JWT (HS256) with dual token storage (access token + refresh token), persistent database-backed token blacklisting (`token_blacklist`), bcrypt password hashing (cost=12), per-endpoint rate limiting via `slowapi`, and sliding-window account lockout protection.
- **Real-Time Communication**: Dual-mode WebSockets (native FastAPI `/ws` + python-socketio mounted at `/socket.io`).
- **Email Delivery**: Resend 2.0 API with fallback to SMTP, integrated with Jinja2 HTML templates.
- **AI Integrations**: DigitalOcean AI / LLM Gateway with agentic tool-calling assistant for clients and freelancers, AI project briefs, smart matching, review sentiment analysis, and rate estimation.

---

## 2. Database Schema & Persistence Strategy

### Data Access Architecture
Because Turso is cloud-hosted (libSQL), all production requests communicate directly with Turso's HTTP endpoints:
1. `TursoHTTP` (`backend/app/db/turso_http.py`):
   - Connection-pooled `requests.Session` with automatic retry on 502/503/504 errors.
   - Bounded thread-safe LRU+TTL cache (`_LRUTTLCache`, max 500 items, TTL 30s) for `SELECT` queries. Any write statement (`INSERT`, `UPDATE`, `DELETE`) immediately purges the cache.
   - For `INSERT` statements, automatically appends `SELECT last_insert_rowid()` in the same batch to return `last_insert_rowid` reliably.
2. `AsyncTursoHTTP` (`backend/app/db/turso_http_async.py`):
   - `httpx.AsyncClient` with connection pooling for async FastAPI endpoints.
3. Schema Management & Migrations:
   - `backend/main.py` lifespan handler ensures critical indexes and schema alterations (`freelancer_acknowledged` columns on `contracts`, `onboarding_completed` on `users`, `submission_notes` on `milestones`, badges, achievements, community hubs, and fraud alerts).
   - `backend/alembic/`: Alembic migrations for relational schema tracking.

### Core Database Tables:
| Table Name | Primary Role | Key Columns |
|---|---|---|
| `users` | User accounts & profiles | `id`, `email`, `hashed_password`, `role`, `user_type`, `name`, `is_active`, `is_verified`, `account_balance`, `hourly_rate`, `skills`, `profile_image_url`, `onboarding_completed` |
| `projects` | Client job listings | `id`, `client_id`, `title`, `description`, `category`, `budget_min`, `budget_max`, `budget_type`, `skills`, `status`, `created_at` |
| `proposals` | Freelancer bids | `id`, `project_id`, `freelancer_id`, `bid_amount`, `cover_letter`, `status`, `is_draft`, `estimated_hours`, `created_at` |
| `contracts` | Active agreements | `id`, `project_id`, `client_id`, `freelancer_id`, `amount`, `contract_type`, `status`, `start_date`, `end_date`, `freelancer_acknowledged` |
| `milestones` | Deliverable milestones | `id`, `contract_id`, `title`, `description`, `amount`, `status`, `due_date`, `deliverables`, `submission_notes`, `approval_notes`, `rejection_notes` |
| `escrow` | Locked contract funds | `id`, `contract_id`, `client_id`, `amount`, `released_amount`, `status`, `created_at` |
| `payments` | Financial ledger | `id`, `contract_id`, `from_user_id`, `to_user_id`, `amount`, `payment_type`, `payment_method`, `status`, `platform_fee`, `freelancer_amount` |
| `wallet_transactions` | User balance history | `id`, `user_id`, `type`, `amount`, `currency`, `description`, `status`, `reference_id`, `created_at` |
| `conversations` & `messages` | Chat & communication | `id`, `client_id`, `freelancer_id`, `project_id`, `sender_id`, `receiver_id`, `content`, `is_read`, `message_type`, `created_at` |
| `reviews` | Two-way feedback | `id`, `contract_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `communication_rating`, `quality_rating`, `deadline_rating`, `response` |
| `disputes` | Contract conflict resolution | `id`, `contract_id`, `raised_by`, `dispute_type`, `description`, `status`, `resolution`, `assigned_admin_id`, `evidence` |
| `notifications` | In-app notifications | `id`, `user_id`, `notification_type`, `title`, `content`, `action_url`, `is_read`, `priority`, `created_at` |
| `gigs` & `gig_orders` | Service marketplace | `id`, `seller_id`, `title`, `category_id`, `basic_price`, `standard_price`, `premium_price`, `status`, `orders_completed`, `rating_average` |

---

## 3. Detailed Audit by Functional Marketplace Domain

### 3.1 Authentication, Identity & RBAC (`app/api/v1/identity/`)
- **Endpoints**:
  - `POST /api/v1/auth/register`: Strong password validation, conflict detection, automatic hash generation, JWT access & refresh cookie creation, and verification email trigger.
  - `POST /api/v1/auth/login`: Email normalization, 15-minute sliding window failed-attempt lockout (max 5 failed tries), token creation, and dual cookie issuance (`auth_token` and `refresh_token`).
  - `POST /api/v1/auth/logout`: Persistent token blacklisting in database + cookie removal.
  - `POST /api/v1/auth/refresh`: Validates refresh token and issues fresh access token.
  - `GET /api/v1/auth/me` & `PUT /api/v1/auth/me`: Comprehensive profile fetch and sanitized multi-field profile update.
  - `POST /api/v1/auth/2fa/*`: TOTP generation with QR code and backup codes verification.
  - `POST /api/v1/auth/reset-password/*`: Rate-limited tokenized password reset.
  - `POST /api/v1/auth/verify-email/*`: Email verification token confirmation.
  - `POST /api/v1/auth/change-password` & `POST /api/v1/auth/change-email`.
- **Role-Based Access Control (RBAC)**:
  - `UserProxy` encapsulates user records from Turso lookups with an in-memory LRU cache (`_USER_CACHE_TTL = 300s`).
  - `require_admin` dependency enforces strict administrative privileges.
  - Role normalization handles both `role` and `user_type` attributes.

### 3.2 Jobs & Projects Lifecycle (`app/api/v1/projects_domain/`)
- **Endpoints**:
  - `GET /api/v1/projects`: Public project listing with category, status, search, and pagination. Includes dynamic proposal count subquery and quality filtering.
  - `GET /api/v1/projects/my-projects`: Client-specific project portfolio.
  - `GET /api/v1/projects/{project_id}`: Detailed project information.
  - `POST /api/v1/projects`: Client-restricted project creation (`role in ("client", "admin")`).
  - `PUT /api/v1/projects/{project_id}` & `DELETE /api/v1/projects/{project_id}`: Owner-guarded modifications.
- **Data Integrity**: All create/update actions sanitize skill arrays into comma-separated text, maintain timestamps, and cascade status transitions.

### 3.3 Proposals & Bidding Engine (`app/api/v1/projects_domain/proposals.py`)
- **Endpoints**:
  - `GET /api/v1/proposals`: User-aware proposal listing with status filtering.
  - `GET /api/v1/proposals/drafts`: Freelancer draft proposal retrieval.
  - `GET /api/v1/proposals/project/{project_id}`: Project-scoped proposals for clients.
  - `POST /api/v1/proposals` & `POST /api/v1/proposals/draft`: Submission with project status checks (`open` only) and duplicate submission prevention.
  - `PUT /api/v1/proposals/{proposal_id}` & `DELETE /api/v1/proposals/{proposal_id}`.
  - `POST /api/v1/proposals/{proposal_id}/submit`: Draft submission transition.
  - `POST /api/v1/proposals/{proposal_id}/accept`: Client-only atomic contract creation and pending escrow initialization. Triggers in-app notification to the freelancer.
  - `POST /api/v1/proposals/{proposal_id}/reject`, `shortlist`, `counter-offer`, and `withdraw`.

### 3.4 Contracts & Milestones Workflow (`contracts.py` & `milestones.py`)
- **Endpoints**:
  - `GET /api/v1/contracts` & `GET /api/v1/contracts/{id}`: Participant-verified listing.
  - `POST /api/v1/contracts`: Client contract generation.
  - `POST /api/v1/contracts/propose`: Freelancer-initiated contract proposal.
  - `POST /api/v1/contracts/{id}/sign`: Client signing transition to `active`.
  - `POST /api/v1/contracts/{id}/acknowledge`: Freelancer acknowledgment.
  - `POST /api/v1/contracts/{id}/complete`: Explicit contract completion.
  - `GET /api/v1/milestones` & `POST /api/v1/milestones`: Milestone allocation with contract total sum validation.
  - `POST /api/v1/milestones/{id}/submit`: Freelancer submission with deliverable notes and URLs.
  - `POST /api/v1/milestones/{id}/approve`: Client release of milestone escrow funds directly into freelancer wallet balance, logging wallet transaction, deducting 8% platform fee, and auto-completing contract & project if all milestones are finalized.
  - `POST /api/v1/milestones/{id}/reject`: Client revision request.

### 3.5 Escrow, Payments, Invoicing & Wallet (`app/api/v1/payments_domain/`)
- **Endpoints**:
  - `GET /api/v1/escrow` & `GET /api/v1/escrow/balance`.
  - `POST /api/v1/escrow/create` & `POST /api/v1/escrow/fund`: Atomic balance locking from client wallet.
  - `POST /api/v1/escrow/{id}/release`: Release funds with tiered platform fee deduction (8% standard, 5% subscriber).
  - `POST /api/v1/escrow/{id}/refund`: Restores escrow balance to client account.
  - `GET /api/v1/wallet`, `GET /api/v1/wallet/transactions`, `GET /api/v1/wallet/analytics`.
  - `POST /api/v1/wallet/deposit` & `POST /api/v1/wallet/withdraw` (with atomic SQL deduction to prevent TOCTOU race conditions).
  - `POST /api/v1/stripe/create-payment-intent` & `/create-checkout-session`: Real Stripe integration with graceful mock fallbacks when API keys are absent.
  - `POST /api/v1/stripe/webhook`: Webhook handler with signature verification.
  - `GET /api/v1/pk-payments/*`: Dedicated regional payment alternatives (JazzCash, EasyPaisa, USDC, AirTM, Payoneer, Wise).

### 3.6 Reviews, Ratings & Dispute Resolution (`app/api/v1/reviews_domain/`)
- **Endpoints**:
  - `GET /api/v1/reviews` & `POST /api/v1/reviews`: Contract-verified 1-5 star ratings across communication, quality, deadline, and professionalism. Enforces single review per contract party.
  - `POST /api/v1/reviews/{id}/respond`: Reviewee response mechanism.
  - `GET /api/v1/disputes` & `POST /api/v1/disputes`: Contract-participant dispute filing.
  - `POST /api/v1/disputes/{id}/assign`: Admin dispute assignment.
  - `POST /api/v1/disputes/{id}/resolve`: Admin dispute resolution with automated notifications and contract status updates.
  - `POST /api/v1/disputes/{id}/evidence`: File attachment for dispute cases.

### 3.7 Chat, Real-Time Messaging & Notifications (`chat/` & `core_domain/`)
- **Endpoints**:
  - `GET /api/v1/conversations`, `GET /api/v1/conversations/contacts`, `POST /api/v1/conversations`.
  - `GET /api/v1/conversations/{id}/messages` & `POST /api/v1/conversations/{id}/messages`.
  - Real-time broadcasting via `websocket_manager.broadcast_to_chat` and `websocket_manager.send_message_notification`.
  - `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `POST /api/v1/notifications/{id}/read`.
  - `GET /api/v1/notifications/preferences` & `PUT /api/v1/notifications/preferences`.

### 3.8 Admin Moderation, Metrics & Platform Operations (`identity/admin.py`, `metrics.py`)
- **Endpoints**:
  - `GET /api/v1/admin/stats`: Platform overview metrics (total users, active jobs, contracts, revenue).
  - `GET /api/v1/admin/users`: Filterable user directory with role and status filters.
  - `PUT /api/v1/admin/users/{id}` & `POST /api/v1/admin/users/{id}/toggle-status`: User suspension/activation with cache invalidation.
  - `DELETE /api/v1/admin/users/{id}`: Soft delete with cascade cancellation of active contracts, proposals, and disputes.
  - `GET /api/v1/admin/settings` & `PUT /api/v1/admin/settings`: Persisted global platform settings.
  - `GET /api/v1/admin/fraud-alerts`: AI fraud alert queue.

### 3.9 AI Services & Conversational Agents (`app/api/v1/ai/`)
- **Endpoints**:
  - `POST /api/v1/chatbot/start` & `POST /api/v1/chatbot/message`: Support chatbot with guest rate limiting.
  - `POST /api/v1/ai/client-assistant/chat` & `POST /api/v1/ai/client-assistant/stream`: Full LLM tool-calling agent with SSE streaming for Client, Freelancer, and Admin roles.
  - `POST /api/v1/ai/project-brief`: Interactive project brief creator with cost/timeline estimation.
  - `POST /api/v1/matching/recommend-freelancers`: Embedding/skill-based freelancer match scorer.
  - `POST /api/v1/ai-writing/*`: AI proposal writer and job description generator.

---

## 4. Test Suite Execution & Verification Results

The test suite was executed against the local backend virtual environment:
- **Command**: `.venv\Scripts\python.exe -m pytest tests/ -q`
- **Total Tests Collected**: 125 items
- **Passed**: 124 items (99.2% pass rate)
- **Failed**: 1 item (`tests/test_milestone_lifecycle.py::test_approval_releases_exact_milestone_amount`)
- **Warnings**: 15 deprecation warnings (FastAPI `Query(regex=...)` usage) + 2 OpenAPI duplicate operation ID warnings.

### Breakdown of Test Files:
| Test File | Test Count | Status | Notes |
|---|---|---|---|
| `tests/integration/test_ai_api.py` | 5 | PASSED | AI endpoints & rate limits |
| `tests/integration/test_security_api.py` | 17 | PASSED | JWT tokens, lockout, blacklist |
| `tests/test_ai_invitation_lifecycle.py` | 3 | PASSED | AI hire & invitation lifecycle |
| `tests/test_auth.py` | 5 | PASSED | Registration, login, profile flows |
| `tests/test_backend.py` | 8 | PASSED | Health, OpenAPI schema, docs |
| `tests/test_chatbot_flows.py` | 4 | PASSED | Chatbot intent & suggestions |
| `tests/test_compliance.py` | 6 | PASSED | GDPR export, audit trail |
| `tests/test_contracts.py` | 9 | PASSED | Contract propose, sign, acknowledge |
| `tests/test_crypto.py` | 15 | PASSED | Web3, wallet deposits, crypto escrow |
| `tests/test_e2e_two_part_payments_flow.py` | 1 | PASSED | Two-part milestone release flow |
| `tests/test_health.py` | 2 | PASSED | Live and ready probes |
| `tests/test_milestone_lifecycle.py` | 4 | 1 FAILED, 3 PASSED | Mock DB missing `status` column |
| `tests/test_profiles.py` | 4 | PASSED | Profile updates, cover images |
| `tests/test_projects.py` | 8 | PASSED | Project CRUD, filtering, pagination |
| `tests/test_refunds_invoices.py` | 4 | PASSED | Refund requests & invoice generation |
| `tests/test_se_ranking.py` | 4 | PASSED | SEO ranking intelligence |
| `tests/test_wallet.py` | 26 | PASSED | Wallet balance, deposits, withdrawals |

---

## 5. Identified Bugs, Inconsistencies & Recommended Fixes

### 1. Routing Bug: Double Route Prefixes
- **Observation**:
  - `app/api/v1/core_domain/deliverable_routes.py` declares `router = APIRouter(prefix="/deliverables", ...)` and is included in `app/api/routers.py` as `api_router.include_router(deliverable_router, prefix="/deliverables", ...)`. Resulting path: `/api/deliverables/deliverables/submit`.
  - `app/api/v1/core_domain/signature_routes.py` declares `router = APIRouter(prefix="/signatures", ...)` and is included with `prefix="/signatures"`. Resulting path: `/api/signatures/signatures/me`.
  - `app/api/v1/core_domain/pdf_routes.py` declares `router = APIRouter(prefix="/pdf", ...)` and is included with `prefix="/pdf"`. Resulting path: `/api/pdf/pdf/invoice`.
- **Impact**: Frontend clients calling `/api/deliverables/submit`, `/api/signatures/me`, or `/api/pdf/invoice` will receive a 404 Not Found error.
- **Recommended Fix**: Remove `prefix="/deliverables"`, `prefix="/signatures"`, and `prefix="/pdf"` from the individual router file definitions so the central mounting in `app/api/routers.py` controls the base prefix cleanly.

### 2. Incomplete Router: Talent Invitations Placeholder
- **Observation**:
  - `app/api/v1/core_domain/talent_invitations.py` contains only an empty router definition (`router = APIRouter()`).
  - Meanwhile, `app/models/talent_invitation.py`, `app/schemas/talent_invitation.py`, and `app/api/v1/ai/project_brief.py` implement invitation logic for the AI flow.
- **Impact**: Standard non-AI talent invitations (`POST /api/invitations`, `GET /api/invitations`, `POST /api/invitations/{id}/respond`) are unavailable if invoked directly from the Upwork-style invite modal.
- **Recommended Fix**: Implement standard CRUD endpoints in `talent_invitations.py` for client invitations to bid and freelancer response handling.

### 3. Missing Admin Access in Support Tickets
- **Observation**:
  - `app/api/v1/core_domain/support_tickets.py` strictly restricts `list_tickets` and `get_ticket` with `WHERE user_id = ? [current_user.id]`.
- **Impact**: Admins cannot view or reply to platform-wide user support tickets through `/api/v1/support-tickets`.
- **Recommended Fix**: Allow users with role `admin` to list all tickets (`WHERE 1=1`) and reply as administrative support.

### 4. Test Mock Defect in `test_milestone_lifecycle.py`
- **Observation**:
  - `tests/test_milestone_lifecycle.py:76` fails because the mock DB query for `SELECT ... FROM ESCROW` only returns `["id", "amount", "released_amount"]` without the `status` column, triggering `milestones.py:261`'s check:
    ```python
    if not escrow_rows or escrow_rows[0].get("status") not in ('funded', 'active'):
        raise HTTPException(status_code=400, detail="Fund the contract escrow before approving this milestone")
    ```
- **Recommended Fix**: Update `test_milestone_lifecycle.py` line 45 to return `["id", "amount", "released_amount", "status"]` and values `[20, 1000, 200, "funded"]`.

### 5. Pydantic / FastAPI Deprecation Warnings
- **Observation**: 15 warning instances across `analytics_dashboard.py`, `analytics_pro.py`, `community.py`, `external_projects.py`, `gamification.py`, `referrals.py`, `wallet.py`, and `favorites.py` where `Query(..., regex="...")` is used instead of `Query(..., pattern="...")`.
- **Recommended Fix**: Replace `regex=` with `pattern=` in `Query()` calls.

### 6. Duplicate OpenAPI Operation IDs
- **Observation**: Duplicate Operation IDs `health_ready_api_v1_health_ready_get` and `health_metrics_api_v1_health_metrics_get` in `app/api/v1/core_domain/health.py` clash with root health handlers in `main.py`.
- **Recommended Fix**: Set explicit unique `operation_id`s or remove duplicate route declarations.

### 7. Legacy Column Discrepancy in `seed_data.py`
- **Observation**: `seed_data.py` lines 26-27 insert into `password_hash` and `full_name` on `users` rather than the canonical `hashed_password` and `name` used across the active codebase. Note that `app/db/seed_marketplace.py` is the canonical, active marketplace seeder and uses the correct schema.
- **Recommended Fix**: Align `seed_data.py` with canonical schema columns.

---

## 6. Conclusion

The MegiLance FastAPI backend exhibits a robust, highly modular architecture with strong transaction integrity, extensive error guarding, persistent token blacklisting, and deep feature coverage across all user journeys. Addressing the double-prefix routing anomalies, completing the talent invitation router, adding admin support ticket oversight, and aligning the single test mock will bring the backend to 100% operational excellence.
