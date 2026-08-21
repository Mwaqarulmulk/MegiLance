# MegiLance 2.0 — End-to-End Marketplace Specification Report

**Document Date:** August 19, 2026  
**Auditor/Miner:** E2E & Marketplace Spec Miner (`teamwork_preview_spec_miner_survey_e2e`)  
**Target Application:** MegiLance Freelancing Marketplace (`https://megilance.site` / Local Development: Next.js 16 + React 19 Frontend on `localhost:3000`, FastAPI Backend on `localhost:8000`, Turso/LibSQL Database)  
**Authoritative Sources Probed:**
- `e:\MegiLance\backend\app\api\routers.py`
- `e:\MegiLance\backend\app\api\v1\projects_domain\` (`projects.py`, `proposals.py`, `contracts.py`, `milestones.py`, `gigs.py`, `categories.py`, `skills.py`)
- `e:\MegiLance\backend\app\api\v1\payments_domain\` (`escrow.py`, `escrow_pro.py`, `payments.py`, `wallet.py`, `stripe.py`, `invoices.py`, `crypto.py`, `pakistan_payments.py`)
- `e:\MegiLance\backend\app\api\v1\identity\` (`auth.py`, `users.py`, `admin.py`, `verification.py`, `security.py`)
- `e:\MegiLance\backend\app\api\v1\reviews_domain\` (`reviews.py`, `disputes.py`, `user_feedback.py`)
- `e:\MegiLance\backend\app\api\v1\chat\` (`messages.py`, `websocket.py`, `video_communication.py`)
- `e:\MegiLance\backend\app\core\` (`websocket.py`, `security.py`, `config.py`)
- `e:\MegiLance\backend\app\services\` (`proposals_service.py`, `contracts_service.py`, `escrow_service.py`, `disputes_service.py`, `notifications_service.py`, `email_service.py`, `wallet_service.py`)
- `e:\MegiLance\frontend\app\(portal)\` (`client/`, `freelancer/`, `admin/`, `messages/`, `dashboard/`)
- `e:\MegiLance\backend\tests\` (`e2e_complete_flows.py`, `e2e_chain_test.py`, `test_milestone_lifecycle.py`, `test_contracts.py`, `test_projects.py`, `test_auth.py`, `test_wallet.py`)

---

## 1. Executive Summary & Specification Scope

MegiLance is a full-stack, AI-powered freelancing and gig platform featuring comprehensive user journeys across **Client**, **Freelancer**, and **Admin** portals. Core financial transactions are protected via a dual-custody **Milestone Escrow Mechanism** with automated fee tier calculations, real-time Socket.IO WebSocket synchronization, multi-channel transactional notifications, dispute mediation workflows, and full administrative governance.

This specification report documents:
1. Exact lifecycle contracts and state transitions across Client, Freelancer, and Admin journeys.
2. Exhaustive Feature Inventory categorized by domain with inputs, outputs, error behaviors, and acceptance criteria.
3. Edge case catalog capturing boundary behaviors, auth restrictions, concurrency, and validation handling.
4. Comprehensive 4-Tier End-to-End (E2E) Test Plan covering Feature Coverage (>=5/feature), Boundary & Corner Cases (>=5/feature), Cross-Feature Pairwise Interoperability, and Real-World Scenarios.

---

## 2. End-to-End Marketplace Journey Specifications

### 2.1 Complete Client Journey Lifecycle

```
[Post Project / Gig Requirement]
               │
               ▼
[Receive & Review Proposals / Bids]
               │
               ▼
[Accept Proposal -> Auto-generate Contract (Pending) & Escrow Record (Pending)]
               │
               ▼
[Fund Escrow (Wallet / Stripe / Crypto / PK Gateway)]
               │
               ▼
[Escrow Status: Funded / Active -> Freelancer Executes Work]
               │
               ▼
[Freelancer Submits Milestone Work (Deliverables & Notes)]
               │
               ▼
   ┌───────────┴───────────┐
   ▼                       ▼
[Request Revision]   [Approve Milestone]
(Status: Rejected)         │
                           ▼
               [Release Escrow Funds to Freelancer Wallet]
               (Contract Completes when all Milestones Approved)
                           │
                           ▼
               [Leave Feedback & Rating Review (1-5 Stars)]
```

#### Step 1: Project Posting (`POST /api/v1/projects`)
- **Portal View:** `frontend/app/(portal)/client/post-job/` or `frontend/app/(main)/post-project/`
- **Payload:** `title` (str, min 5 chars), `description` (str, min 20 chars), `category` (str), `budget_type` (`fixed` | `hourly`), `budget_min` (float > 0), `budget_max` (float >= budget_min), `experience_level` (`entry` | `intermediate` | `expert`), `estimated_duration` (str), `skills` (comma-separated str).
- **Behavior:** Creates project in `status = 'open'`. Broadcasts real-time alert via WebSocket to matched freelancers; sends email notification to matching talent.
- **State Output:** `Project.status = 'open'`, `Project.client_id = current_user.id`.

#### Step 2: Proposal Reception & Review (`GET /api/v1/proposals?project_id={id}`)
- **Portal View:** `frontend/app/(portal)/client/projects/[id]/` -> Proposals Tab.
- **Behavior:** Client reviews bidder profiles, cover letters, proposed milestone structures, bid amounts, and freelancer reputation (Job Success Score / JSS, badges, reviews).
- **Actions Available:** Shortlist proposal (`POST /proposals/{id}/shortlist`), Send Counter-Offer (`POST /proposals/{id}/counter-offer`), Reject (`POST /proposals/{id}/reject`), Direct Message (`POST /conversations`).

#### Step 3: Hire Freelancer & Contract Inception (`POST /api/v1/proposals/{id}/accept`)
- **Portal View:** `frontend/app/(portal)/client/hire/` or Proposal modal "Hire Freelancer".
- **Atomic Operations:**
  1. Proposal status transitions to `accepted`.
  2. All other pending/submitted proposals for the project transition to `rejected`.
  3. Project status transitions to `in_progress`.
  4. Contract is generated with `status = 'pending'`, `amount = proposal.bid_amount`, and calculated `platform_fee`.
  5. Escrow record is created in `status = 'pending'`, `amount = proposal.bid_amount`, `released_amount = 0`.
  6. Standard 2-Part Milestones are auto-provisioned (Part 1: 50% Kickoff Advance, Part 2: 50% Final Delivery).
  7. In-app and email notifications dispatched to freelancer: `"Your proposal was accepted"`.

#### Step 4: Escrow Funding (`POST /api/v1/escrow/fund` or `POST /api/v1/escrow/create`)
- **Portal View:** `frontend/app/(portal)/client/contracts/[id]/` -> "Fund Escrow" / Wallet modal.
- **Preconditions:** Client must have sufficient wallet balance (`account_balance >= contract_amount`) or execute external checkout (Stripe Payment Intent / EasyPaisa / JazzCash / Crypto USDC).
- **State Transition:**
  - Client balance debited: `account_balance -= amount`.
  - Escrow status transitions to `funded` (or `active`).
  - Contract status transitions to `active`.
  - Wallet transaction recorded: `type = 'escrow_lock'`.

#### Step 5: Milestone Review, Approval & Release (`POST /api/v1/milestones/{id}/approve`)
- **Portal View:** `frontend/app/(portal)/client/contracts/[id]/` -> Deliverable Inspection View.
- **Preconditions:** Milestone status must be `submitted` (or upfront `pending`). Escrow status must be `funded`.
- **Atomic Operations:**
  1. Milestone status transitions: `submitted` -> `approving` -> `approved`.
  2. Escrow released amount incremented: `escrow.released_amount += milestone.amount`.
  3. Freelancer wallet credited: `account_balance += net_payout` (where `net_payout = milestone_amount - platform_fee`).
  4. Platform fee deducted and logged.
  5. Wallet transactions recorded for freelancer (`milestone_payment`) and platform (`platform_fee`).
  6. Check remaining milestones: If all milestones are `approved` or `paid`, Contract status transitions to `completed` and Project status transitions to `completed`.
  7. In-app and email notification dispatched: `"Milestone approved and payment released"`.

#### Step 6: Review & Feedback (`POST /api/v1/reviews`)
- **Portal View:** `frontend/app/(portal)/client/reviews/` or Contract Completion modal.
- **Payload:** `contract_id` (int), `rating` (int 1-5), `comment` (str), `communication_rating` (1-5), `quality_rating` (1-5), `deadline_rating` (1-5), `professionalism_rating` (1-5), `would_recommend` (bool).
- **Impact:** Updates freelancer aggregate rating (`rating_average`), review count (`rating_count`), and re-computes Job Success Score (JSS).

---

### 2.2 Complete Freelancer Journey Lifecycle

```
[Browse / Filter Job Board or Gigs]
               │
               ▼
[AI Proposal Assistant / Submit Detailed Bid]
               │
               ▼
[Receive Contract Offer / Invitation -> Acknowledge / Accept]
               │
               ▼
[Execute Project & Collaborate in Workroom / Chat]
               │
               ▼
[Submit Milestone Deliverables & Proof of Work]
               │
               ▼
   ┌───────────┴───────────┐
   ▼                       ▼
[Revisions Requested]   [Milestone Approved & Paid]
(Amend Deliverable)        │
                           ▼
               [Instant Wallet Credit & Invoice Generation]
                           │
                           ▼
               [Withdraw Funds (Bank / Wise / JazzCash / Crypto)]
                           │
                           ▼
               [Rate Client (1-5 Stars Counter-Review)]
```

#### Step 1: Discover & Filter Opportunities (`GET /api/v1/projects` & `GET /api/v1/gigs`)
- **Portal View:** `frontend/app/(portal)/freelancer/my-jobs/` & `frontend/app/(main)/jobs/`
- **Filtering Capabilities:** Keyword query (`q`), Category (`category_id`), Budget range (`budget_min`, `budget_max`), Experience level (`entry`, `intermediate`, `expert`), Duration, Project type (`fixed`, `hourly`), External scraped jobs aggregator.

#### Step 2: Detailed Proposal Submission (`POST /api/v1/proposals`)
- **Portal View:** `frontend/app/(portal)/freelancer/submit-proposal/`
- **Payload:** `project_id` (int), `cover_letter` (str, min 30 chars), `bid_amount` (float), `estimated_hours` (float), `hourly_rate` (float), `availability` (str), `attachments` (file URLs), `is_draft` (bool).
- **Rules:** One active proposal per freelancer per project. If `is_draft=true`, saved under `/proposals/drafts` without notifying client.

#### Step 3: Contract Acknowledgment (`POST /api/v1/contracts/{id}/acknowledge`)
- **Portal View:** `frontend/app/(portal)/freelancer/contracts/[id]/`
- **Behavior:** Freelancer acknowledges contract terms, milestones, and start date. Contract shifts to `active`.

#### Step 4: Milestone Deliverable Submission (`POST /api/v1/milestones/{id}/submit`)
- **Portal View:** `frontend/app/(portal)/freelancer/contracts/[id]/` -> "Submit Work" modal.
- **Payload:** `deliverables` (text / download URLs / GitHub link), `submission_notes` (detailed description of work delivered).
- **State Transition:** Milestone status transitions from `pending`/`in_progress`/`rejected` -> `submitted`. Client is notified immediately via Socket.io and email.

#### Step 5: Receive Payout & Withdraw (`POST /api/v1/wallet/withdraw` or `POST /api/v1/pk-payments/withdraw`)
- **Portal View:** `frontend/app/(portal)/freelancer/wallet/` & `/withdraw`
- **Payout Channels:** Bank Wire Transfer, Stripe Connect Payout, PayPal/Payoneer, Local PK methods (JazzCash, EasyPaisa, Raast), Crypto (USDC / Solana / Polygon).
- **Ledger Verification:** Payout reduces freelancer available balance and records `status = 'pending'` -> `'completed'` with transaction hash/reference.

#### Step 6: Counter-Review Client (`POST /api/v1/reviews`)
- **Portal View:** `frontend/app/(portal)/freelancer/reviews/`
- **Behavior:** Freelancer rates client on payment promptness, communication clarity, requirement accuracy, and cooperation.

---

### 2.3 Complete Admin Journey Lifecycle

```
[Admin Authentication & Role Verification]
                    │
                    ▼
[Admin Dashboard: Metrics, Analytics, System Health]
                    │
   ┌────────────────┼────────────────┬────────────────┐
   ▼                ▼                ▼                ▼
[User Governance] [Dispute Resolution] [Financial Ledger] [Content & AI]
- Ban / Unban     - Inspect Evidence   - Audit Escrows   - Moderate Gigs
- KYC Verify      - Arbitrate Payout   - Process Refunds - Monitor Errors
- Role Elevation  - Close Contract     - Platform Fees   - AI Fraud Alerts
```

#### Step 1: User Governance & KYC Moderation (`/api/v1/admin/users`)
- **Endpoints:** `GET /admin/users`, `PUT /admin/users/{id}`, `POST /admin/users/{id}/toggle-status`, `DELETE /admin/users/{id}`.
- **Capabilities:** Search/filter by role/status; suspend/activate accounts; verify KYC badges; soft-delete with automated cascade cancellation of active contracts, open proposals, and disputes.

#### Step 2: Dispute Mediation & Arbitration (`/api/v1/disputes` & `/api/v1/admin/disputes`)
- **Endpoints:** `GET /disputes`, `POST /disputes/{id}/assign`, `POST /disputes/{id}/resolve`, `POST /disputes/{id}/evidence`.
- **Arbitration Workflow:**
  1. Either client or freelancer raises dispute (`dispute_type`: `quality`, `deadline`, `payment`, `scope`).
  2. Both parties upload supporting evidence documents / work files.
  3. Admin inspects evidence and assigns ticket to staff.
  4. Admin issues resolution ruling (`resolution` text, `resolution_amount`, contract status update: `cancelled` / `completed` / `refunded`).
  5. Funds released or refunded accordingly; both parties notified.

#### Step 3: Platform Financial Ledger & Oversight (`GET /api/v1/admin/payments`)
- **Endpoints:** `GET /admin/payments`, `GET /admin/stats`, `GET /escrow`, `GET /invoices`.
- **Data Points:** Real-time platform Gross Merchandise Value (GMV), net platform fee revenues, pending escrow liabilities, payment method breakdown, transaction audit logs.

#### Step 4: System Health, Metrics & Error Reporting (`/api/v1/metrics`, `/api/v1/error-reports`)
- **Endpoints:** `GET /health/ready`, `GET /health/metrics`, `GET /metrics/system`, `GET /error-reports`.
- **Capabilities:** Tracks server memory/CPU, Turso DB query health, auto-captured frontend/backend exception stack traces, and AI fraud triggers.

---

### 2.4 Real-Time & Asynchronous Events Architecture

#### A. Socket.IO Real-Time Channel (`/socket.io`)
- **Connection Security:** Handshake JWT Bearer validation against blacklisted tokens and user role claims.
- **Event Catalog:**
  | Event Name | Direction | Payload | Description |
  |---|---|---|---|
  | `join_chat` | Client -> Server | `{ "chat_id": str }` | Joins private conversation room |
  | `leave_chat` | Client -> Server | `{ "chat_id": str }` | Exits conversation room |
  | `send_message` | Client -> Server | `{ "chat_id": str, "message": str, ... }` | Sends instant message to peer |
  | `new_message` | Server -> Broadcast | `{ "chat_id": str, "message": str, "sender_id": int, "timestamp": str }` | Delivers real-time message |
  | `typing_start` / `stop` | Client -> Server | `{ "chat_id": str }` | Emits live typing status |
  | `user_typing` | Server -> Broadcast | `{ "user_id": str, "typing": bool }` | Displays typing indicator |
  | `user_status` | Server -> Broadcast | `{ "user_id": str, "status": "online"\|"offline" }` | Live presence sync |
  | `code_change` / `draw_change`| Client -> Server | `{ "contract_id": int, "code"\|"drawing": any }` | Real-time workroom collaboration |

#### B. In-App Notification Center (`/api/v1/notifications`)
- **Lifecycle Events Dispatched:** `proposal_received`, `proposal_accepted`, `proposal_rejected`, `contract_created`, `milestone_created`, `milestone_submitted`, `milestone_approved`, `milestone_rejected`, `payment_received`, `dispute_opened`, `dispute_resolved`, `review_received`.
- **Storage:** Persisted in `notifications` table with `is_read=0/1`, `action_url`, `priority`, and metadata payload.

#### C. Email Notification Dispatch Triggers (`app/services/email_service.py`)
- **Provider:** Resend 2.0 API with automated SMTP fallback.
- **Templates:** Jinja2-rendered HTML/Plain-text templates for:
  - `send_welcome_email` (Onboarding confirmation)
  - `send_verification_email` & `send_password_reset_email` (Auth security)
  - `send_project_posted_notification` (Job live confirmation)
  - `send_proposal_received_notification` & `send_proposal_accepted_notification`
  - `send_milestone_submitted_notification` & `send_milestone_approved_notification`
  - `send_payment_received_notification` & `send_invoice_paid_notification`
  - `send_dispute_opened_notification` & `send_review_received_notification`

---

## 3. Exhaustive Feature Inventory

| Requirement ID | Domain | Feature Name | Description | Inputs | Outputs | Acceptance Criteria |
|---|---|---|---|---|---|---|
| **REQ-AUTH-01** | Auth | User Registration | Multi-role registration (Client, Freelancer) | `email`, `password`, `name`, `user_type` | `access_token`, `refresh_token`, `user` object | Validates password complexity, enforces unique email, hashes password with bcrypt. |
| **REQ-AUTH-02** | Auth | User Authentication | JWT token issuance with cookie management | `email`, `password` | `access_token`, `refresh_token`, `user` info | Returns 401 on bad credentials; rate limits brute-force attempts to 5 req/min. |
| **REQ-AUTH-03** | Auth | Persistent Token Revocation | Logout and token blacklisting | JWT `Authorization` header | `200 OK` ("Logged out successfully") | Revoked tokens saved to `token_blacklist` table in Turso and immediately denied on subsequent requests. |
| **REQ-AUTH-04** | Auth | MFA / 2FA Security | TOTP / Authenticator app setup & verification | `secret_code`, `totp_token` | `backup_codes`, `is_enabled` | Requires valid 6-digit TOTP for login when 2FA is activated. |
| **REQ-AUTH-05** | Auth | Social Login (OAuth2) | Google / GitHub authentication | `provider`, `code`, `state` | `access_token`, redirect URL | Safely verifies CSRF state token; auto-provisions user account if not previously registered. |
| **REQ-JOB-01** | Projects | Job Posting Engine | Post fixed/hourly projects with skills | `title`, `description`, `category`, `budget_min`, `budget_max`, `skills` | `project_id`, `status: 'open'` | Rejects invalid budget ranges; tags project for search indexing; broadcasts notification. |
| **REQ-JOB-02** | Projects | Public Job Directory & Filtering | Search and faceted filter for projects | `q`, `category`, `budget_min`, `budget_max`, `page`, `page_size` | List of projects with pagination metadata | Orders by relevance/recency; returns only open projects; supports FTS5 keyword indexing. |
| **REQ-JOB-03** | Projects | Job Editing & Lifecycle Management | Edit, close, or archive posted jobs | `project_id`, patch payload | Updated project object | Client can only edit their own open projects; cannot edit or delete projects with active contracts. |
| **REQ-PROP-01** | Proposals | Detailed Proposal Submission | Submit bids with cover letter & milestone plan | `project_id`, `cover_letter`, `bid_amount`, `milestones` | `proposal_id`, `status: 'submitted'` | Prevents duplicate submissions per freelancer; validates project is currently 'open'. |
| **REQ-PROP-02** | Proposals | Proposal Drafts | Save work-in-progress bids | `project_id`, `cover_letter`, `is_draft=true` | `proposal_id`, `status: 'draft'` | Draft proposals visible only to freelancer author; does not notify client until explicit submit. |
| **REQ-PROP-03** | Proposals | Proposal Acceptance & Auto-Hire | Client accepts proposal -> contract & escrow | `proposal_id` | `contract_id`, `proposal_id`, `message` | Single atomic workflow creating contract (pending), escrow (pending), 2-part milestones, and rejecting rival bids. |
| **REQ-PROP-04** | Proposals | Counter-Offers & Shortlisting | Negotiate rates before formal contract | `proposal_id`, `bid_amount`, `cover_letter` | `status: 'shortlisted'`, updated counter payload | Client can shortlist and propose alternative rate; freelancer receives notification. |
| **REQ-PROP-05** | Proposals | Proposal Withdrawal | Freelancer cancels submitted proposal | `proposal_id` | `status: 'withdrawn'` | Freelancer can withdraw proposal anytime before client acceptance. |
| **REQ-CONT-01** | Contracts | Contract Lifecycle Engine | Manage contract lifecycle (pending -> active -> completed) | `contract_id`, action endpoint | Updated contract state | Requires party authorization; updates project and milestone linkages upon completion. |
| **REQ-CONT-02** | Contracts | Freelancer Contract Acknowledgment | Freelancer signs/acknowledges client contract | `contract_id` | `status: 'active'`, `acknowledged_at` | Marks contract ready for execution once escrow is confirmed. |
| **REQ-CONT-03** | Contracts | Contract Cancellation | Cancel contract before/during work | `contract_id`, `reason` | `status: 'cancelled'` | Rejects cancellation of completed contracts; triggers escrow refund if funds are unreleased. |
| **REQ-MILE-01** | Milestones | Milestone CRUD | Create and configure milestone deliverables | `contract_id`, `title`, `amount`, `due_date` | `milestone_id`, `status: 'pending'` | Only client can create/edit; total milestone amounts cannot exceed contract total. |
| **REQ-MILE-02** | Milestones | Milestone Work Submission | Submit code, files, deliverables for review | `milestone_id`, `deliverables`, `submission_notes` | `status: 'submitted'`, `submitted_at` | Only contracted freelancer can submit; notifies client for review. |
| **REQ-MILE-03** | Milestones | Milestone Approval & Escrow Release | Approve milestone deliverables and release funds | `milestone_id`, `approval_notes` | `status: 'approved'`, `released_amount` | Releases exact milestone amount from escrow to freelancer wallet; auto-completes contract if final milestone. |
| **REQ-MILE-04** | Milestones | Milestone Revision Request (Rejection) | Request changes on submitted milestone | `milestone_id`, `rejection_notes` | `status: 'rejected'`, `rejection_notes` | Resets milestone to rejected so freelancer can amend deliverable and resubmit. |
| **REQ-ESCR-01** | Escrow | Escrow Fund Locking | Lock client funds in platform escrow custody | `contract_id`, `amount` | `escrow_id`, `status: 'funded'` | Checks client wallet balance; deducts balance atomically; locks funds until milestone approval. |
| **REQ-ESCR-02** | Escrow | Partial / Incremental Escrow Release | Release tranche of escrow funds | `escrow_id`, `release_amount` | `gross_amount`, `net_amount`, `platform_fee` | Calculates platform fee percentage; credits net payout to freelancer; logs fee revenue. |
| **REQ-ESCR-03** | Escrow | Escrow Refund Processing | Refund unreleased escrow back to client | `escrow_id` | `refunded_amount`, `status: 'refunded'` | Verifies no open disputes; returns unreleased funds to client wallet balance. |
| **REQ-REV-01** | Reviews | 2-Way Rating & Review System | Post-contract rating and feedback | `contract_id`, `rating` (1-5), category scores, `comment` | `review_id`, `created_at` | Only parties of completed contract can submit; exactly one review per party per contract. |
| **REQ-REV-02** | Reviews | JSS & Reputation Algorithm | Update Job Success Score based on reviews | Review trigger | Updated user `seller_stats`, `tier` | Updates Bronze/Silver/Gold/Platinum seller tier and recalculates JSS percentage. |
| **REQ-DISP-01** | Disputes | Dispute Filing | Raise dispute on troubled contract | `contract_id`, `dispute_type`, `description` | `dispute_id`, `status: 'open'` | Freezes contract and escrow releases until resolution; alerts platform admin. |
| **REQ-DISP-02** | Disputes | Dispute Evidence Locker | Upload supporting files and logs | `dispute_id`, `file` upload | Evidence record, secure storage URL | Parties can upload receipts, chat logs, code screenshots. |
| **REQ-DISP-03** | Disputes | Admin Dispute Arbitration | Admin resolution of dispute claims | `dispute_id`, `resolution`, `contract_status` | `status: 'resolved'`, `resolved_at` | Enforces final binding decision; disburses funds according to resolution ruling. |
| **REQ-ADM-01** | Admin | User Moderation & Status Toggle | Ban, unban, suspend, or activate users | `user_id` | `is_active: bool`, log entry | Immediately invalidates active sessions; blocks login of suspended accounts. |
| **REQ-ADM-02** | Admin | Platform Transaction Ledger | View platform-wide payments and escrows | Query filters (`status`, `page`, `page_size`) | Paginated ledger with counterparty names | Categorizes transactions (Deposit, Payout, Refund, Platform Fee). |
| **REQ-ADM-03** | Admin | Platform Analytics & Metrics | Real-time platform KPI monitoring | Metric time ranges | GMV, active contracts, user growth, conversion | Aggregates database counts and financial volumes. |
| **REQ-CHAT-01** | Chat | Real-Time Messaging & Chatrooms | WebSocket messaging between parties | `chat_id`, `message`, `attachment_url` | Instant message broadcast, message persistence | Persists in `messages` table; delivers via Socket.IO room; sends push/email if recipient offline. |
| **REQ-NOTIF-01**| Notifications | Multi-Channel Notifications | In-app alerts, push, and email synchronization | Event payload | In-app badge increment, email dispatch | Granular notification preferences respected (user can toggle email/push alerts). |

---

## 4. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | User Registration | Register Client/Freelancer account | `email`, `password`, `name`, `user_type` | `access_token`, `refresh_token` | 409 if email exists, 422 if weak password | `backend/app/api/v1/identity/auth.py` |
| 2 | Auth | JWT Authentication | Login and token generation | `email`, `password` | `access_token`, `refresh_token` | 401 on invalid credentials, 429 on rate limit | `backend/app/api/v1/identity/auth.py` |
| 3 | Auth | Token Revocation (Logout) | Blacklist tokens in Turso DB | `Authorization: Bearer <token>` | `200 OK` | 401 if token invalid or expired | `backend/app/services/token_blacklist_service.py` |
| 4 | Auth | Current User Profile | Fetch authenticated user data | Auth Header | User profile JSON | 401 if unauthenticated | `backend/app/api/v1/identity/users.py` |
| 5 | Projects | Create Project | Client posts new project listing | `title`, `description`, `budget_min`, `budget_max`, `skills` | `project_id`, `status: 'open'` | 403 if user is freelancer, 422 if budget invalid | `backend/app/api/v1/projects_domain/projects.py` |
| 6 | Projects | List Projects | Public and authenticated job search | `q`, `category`, `status`, `page` | Paginated project list | 200 with empty list on no matches | `backend/app/api/v1/projects_domain/projects.py` |
| 7 | Projects | Get Project Details | Fetch single project by ID | `project_id` | Full project details | 404 if not found | `backend/app/api/v1/projects_domain/projects.py` |
| 8 | Proposals | Submit Proposal | Freelancer submits bid on open project | `project_id`, `cover_letter`, `bid_amount` | `proposal_id`, `status: 'submitted'` | 409 if already submitted, 400 if project not open | `backend/app/api/v1/projects_domain/proposals.py` |
| 9 | Proposals | Save Proposal Draft | Freelancer saves unfinished bid | `project_id`, `cover_letter`, `is_draft=true` | `proposal_id`, `status: 'draft'` | 404 if project not found | `backend/app/api/v1/projects_domain/proposals.py` |
| 10 | Proposals | Accept Proposal | Client accepts proposal -> triggers contract/escrow | `proposal_id` | Contract ID, Escrow ID, accepted status | 403 if not project owner, 400 if not submitted | `backend/app/services/proposals_service.py` |
| 11 | Proposals | Shortlist Proposal | Client flags proposal for review | `proposal_id` | `status: 'shortlisted'` | 403 if not project owner | `backend/app/api/v1/projects_domain/proposals.py` |
| 12 | Proposals | Counter-Offer | Client sends counter bid to freelancer | `proposal_id`, `bid_amount`, `cover_letter` | Updated proposal counter payload | 400 if missing counter fields | `backend/app/api/v1/projects_domain/proposals.py` |
| 13 | Contracts | List Contracts | View user contracts | `status_filter`, `page`, `page_size` | Paginated contract list | Returns empty list if no contracts | `backend/app/api/v1/projects_domain/contracts.py` |
| 14 | Contracts | Freelancer Acknowledge | Freelancer signs pending contract | `contract_id` | `status: 'active'` | 403 if not contracted freelancer, 400 if not pending | `backend/app/api/v1/projects_domain/contracts.py` |
| 15 | Contracts | Complete Contract | Finalize active contract | `contract_id`, `completion_notes` | `status: 'completed'` | 400 if contract not active | `backend/app/api/v1/projects_domain/contracts.py` |
| 16 | Milestones | Create Milestone | Client adds milestone to contract | `contract_id`, `title`, `amount`, `due_date` | `milestone_id`, `status: 'pending'` | 400 if sum exceeds contract amount | `backend/app/api/v1/projects_domain/milestones.py` |
| 17 | Milestones | Submit Milestone Work | Freelancer delivers milestone artifacts | `milestone_id`, `deliverables`, `notes` | `status: 'submitted'` | 403 if not assigned freelancer | `backend/app/api/v1/projects_domain/milestones.py` |
| 18 | Milestones | Approve Milestone | Client approves & releases payment | `milestone_id`, `approval_notes` | `status: 'approved'`, `released_amount` | 400 if escrow not funded or balance exceeded | `backend/app/api/v1/projects_domain/milestones.py` |
| 19 | Milestones | Reject Milestone | Client requests milestone rework | `milestone_id`, `rejection_notes` | `status: 'rejected'` | 400 if not currently in 'submitted' status | `backend/app/api/v1/projects_domain/milestones.py` |
| 20 | Escrow | Fund Contract Escrow | Client deposits funds into escrow | `contract_id`, `amount` | `escrow_id`, `status: 'funded'` | 400 if client balance insufficient | `backend/app/api/v1/payments_domain/escrow.py` |
| 21 | Escrow | Release Escrow Tranche | Release funds to freelancer wallet | `escrow_id`, `amount` | Payout details and platform fee deduction | 400 if release amount > remaining escrow | `backend/app/api/v1/payments_domain/escrow.py` |
| 22 | Escrow | Refund Escrow | Refund unreleased escrow to client | `escrow_id` | `refunded_amount`, `status: 'refunded'` | 400 if escrow already released or disputed | `backend/app/services/escrow_service.py` |
| 23 | Reviews | Create Review | 2-way rating and feedback submission | `contract_id`, `rating` (1-5), `comment` | `review_id`, `created_at` | 409 if already reviewed, 403 if not party | `backend/app/api/v1/reviews_domain/reviews.py` |
| 24 | Disputes | Open Dispute | Party disputes project/milestone | `contract_id`, `dispute_type`, `description` | `dispute_id`, `status: 'open'` | 403 if not contract party, 404 if not found | `backend/app/api/v1/reviews_domain/disputes.py` |
| 25 | Disputes | Upload Evidence | Submit documentation/screenshots | `dispute_id`, multipart file | Evidence metadata | 403 if unauthorized | `backend/app/api/v1/reviews_domain/disputes.py` |
| 26 | Disputes | Admin Resolve Dispute | Admin ruling and fund distribution | `dispute_id`, `resolution`, `contract_status` | `message: 'Dispute resolved'` | 403 if non-admin caller | `backend/app/api/v1/reviews_domain/disputes.py` |
| 27 | Admin | List & Filter Users | Admin view of all platform accounts | `role`, `search`, `status`, `page` | Paginated user accounts | 403 if non-admin caller | `backend/app/api/v1/identity/admin.py` |
| 28 | Admin | Toggle User Status | Suspend or activate user account | `user_id` | `is_active: bool` | 400 if admin attempts to suspend self | `backend/app/api/v1/identity/admin.py` |
| 29 | Admin | Platform Payments Ledger | Platform-wide transaction history | `status_filter`, `page`, `page_size` | All deposit/payout/refund records | 403 if non-admin caller | `backend/app/api/v1/identity/admin.py` |
| 30 | Admin | Platform Statistics | Global user, project, contract KPIs | None | Counts of users, projects, contracts, GMV | 403 if non-admin caller | `backend/app/api/v1/identity/admin.py` |
| 31 | Chat | Real-Time Messaging | Socket.IO room messaging & persistence | `chat_id`, `message` | Instant socket broadcast & DB row | Refuses connection if JWT revoked/invalid | `backend/app/core/websocket.py` |
| 32 | Chat | Typing & Presence Indicators | Live typing and online status sync | `typing_start`, `typing_stop` | `user_typing`, `user_status` broadcasts | None (silent drop if disconnected) | `backend/app/core/websocket.py` |
| 33 | Notifications | In-App Notification Center | List, mark read, unread counts | `page`, `page_size`, `is_read` filter | Notification feed | 401 if unauthenticated | `backend/app/services/notifications_service.py` |
| 34 | Email | Transactional Email Dispatch | Automated Resend/SMTP email alerts | Event triggers and variables | Dispatch status boolean | Logs error and falls back to SMTP on Resend error | `backend/app/services/email_service.py` |
| 35 | Gigs | Gig Marketplace Catalog | 3-tier pricing service packages | `category`, `search`, `page` | 12 active seeded gigs | 200 with empty list on no match | `backend/app/api/v1/projects_domain/gigs.py` |
| 36 | Public Tools| AI Price Estimator | Market rate intelligence tool | `skill_slug`, `complexity`, `industry` | Estimated price min/max range | 422 on invalid complexity enum | `backend/app/api/v1/core_domain/price_estimator.py` |

---

## 5. Edge Cases & Boundary Conditions

| # | Feature | Input / Condition | Observed & Expected Behavior |
|---|---------|-------------------|------------------------------|
| 1 | Auth Registration | Duplicate email registration (`email` already in DB) | Returns `409 Conflict` (or `400 Bad Request`) with error message `"Email already registered"`. |
| 2 | Auth Registration | Weak password (`"123"` or `< 8` chars) | Returns `422 Unprocessable Entity` with validation detail `"Password must be at least 8 characters"`. |
| 3 | Auth Token Security | Revoked / blacklisted JWT used in `Authorization` header | Returns `401 Unauthorized` ("Token has been revoked") due to persistent `token_blacklist` check. |
| 4 | RBAC Authorization | Freelancer attempts to post project (`POST /projects`) | Returns `403 Forbidden` ("Only clients can create projects"). |
| 5 | RBAC Authorization | Client attempts to publish a gig (`POST /gigs`) | Returns `403 Forbidden` ("Only freelancers can create gigs"). |
| 6 | Project Creation | `budget_max < budget_min` (`min=1000, max=500`) | Returns `422 Unprocessable Entity` ("budget_max must be greater than or equal to budget_min"). |
| 7 | Project Lifecycle | Attempt to submit proposal to non-open project (`status='in_progress'`) | Returns `400 Bad Request` ("Project is not accepting proposals"). |
| 8 | Proposal Submission | Duplicate proposal submitted by same freelancer for same project | Returns `409 Conflict` ("You already submitted a proposal for this project"). |
| 9 | Proposal Lifecycle | Client attempts to accept already accepted / cancelled proposal | Returns `400 Bad Request` ("Cannot accept proposal with status 'accepted'"). |
| 10 | Contract Milestones | Total milestone amounts exceed contract total (`contract=1000, milestones=600+500`) | Returns `400 Bad Request` ("Milestone totals cannot exceed the contract amount"). |
| 11 | Milestone Submission | Client attempts to submit milestone work on behalf of freelancer | Returns `403 Forbidden` ("Only the assigned freelancer can submit milestones"). |
| 12 | Milestone Approval | Client attempts to approve milestone when contract escrow is unfunded | Returns `400 Bad Request` ("Fund the contract escrow before approving this milestone"). |
| 13 | Escrow Funding | Client wallet balance lower than required escrow amount | Returns `400 Bad Request` ("Insufficient balance. Please deposit funds"). |
| 14 | Escrow Release | Release amount requested exceeds remaining available escrow balance | Returns `400 Bad Request` ("Release amount exceeds available escrow balance"). |
| 15 | Escrow Concurrent Release | Concurrent double-release request on same milestone | Idempotency lock & status transition to `'approving'` prevents double debit/credit. |
| 16 | Dispute Filing | Non-party user attempts to file dispute on another user's contract | Returns `403 Forbidden` ("Only contract parties can file disputes"). |
| 17 | Dispute Resolution | Non-admin user calls dispute resolve endpoint (`POST /disputes/{id}/resolve`) | Returns `403 Forbidden` ("Only admins can resolve disputes"). |
| 18 | Review Submission | User submits second review on same contract | Returns `409 Conflict` ("You already reviewed this contract"). |
| 19 | Review Submission | Review rating outside 1-5 boundary (`rating=0` or `rating=6`) | Returns `400 Bad Request` ("Rating must be between 1 and 5"). |
| 20 | Admin Self-Action | Admin attempts to suspend or delete their own admin account | Returns `400 Bad Request` ("Cannot suspend/delete your own account"). |
| 21 | WebSocket Auth | Socket connection handshake without JWT or with expired token | Socket.IO server raises `ConnectionRefusedError` and disconnects client session. |
| 22 | XSS Payload Sanitization | Malicious script tags in project description / messages (`<script>alert(1)</script>`) | Sanitized by backend DOMPurify/stripping logic; rendered safely by React without execution. |
| 23 | SQL Injection Attack | Malicious search string (`' OR 1=1 --`) in project / freelancer search | Parameterized SQL query ensures literal matching; returns 200 with 0 matches or valid syntax. |
| 24 | High-Frequency Rate Limit | Rapid repeated login attempts (>100 req/min) | Returns `429 Too Many Requests` via SlowAPI rate limiter. |
| 25 | Large Payload Upload | Deliverable file upload exceeding 10MB limit | Returns `413 Payload Too Large` from `RequestSizeLimitMiddleware`. |

---

## 6. Comprehensive 4-Tier E2E Test Plan

### Tier 1: Feature Coverage Test Matrix (>=5 tests per feature group)

```
========================================================================================
TIER 1: FEATURE COVERAGE (Core Functionality)
========================================================================================
```

#### Group 1: Authentication & Identity (Auth)
1. **TC-T1-AUTH-01 (Register Client):** Register client account with valid credentials -> 201 Created with JWT tokens.
2. **TC-T1-AUTH-02 (Register Freelancer):** Register freelancer account with valid credentials -> 201 Created with JWT tokens.
3. **TC-T1-AUTH-03 (Login Success):** Authenticate with valid email/password -> 200 OK with access + refresh token.
4. **TC-T1-AUTH-04 (Token Refresh):** Call `/api/v1/auth/refresh` with valid refresh token -> 200 OK with new access token.
5. **TC-T1-AUTH-05 (User Profile Me):** Query `/api/v1/auth/me` with Bearer token -> 200 OK with correct user profile data.
6. **TC-T1-AUTH-06 (Logout & Revocation):** Call `/api/v1/auth/logout` -> 200 OK; subsequent `/auth/me` returns 401 Unauthorized.

#### Group 2: Project Management
7. **TC-T1-PROJ-01 (Create Fixed Project):** Client creates fixed-price project -> 201 Created with valid ID.
8. **TC-T1-PROJ-02 (Create Hourly Project):** Client creates hourly project with hourly limits -> 201 Created.
9. **TC-T1-PROJ-03 (Public Project Search):** Query `/api/v1/projects?q=python` -> 200 OK with matching project items.
10. **TC-T1-PROJ-04 (Category Filter):** Query `/api/v1/projects?category=web-development` -> 200 OK with category filtered results.
11. **TC-T1-PROJ-05 (Get Project By ID):** Fetch `/api/v1/projects/{id}` -> 200 OK with full project specifications.

#### Group 3: Proposal Workflows
12. **TC-T1-PROP-01 (Submit Fixed Proposal):** Freelancer submits fixed bid proposal on open project -> 201 Created.
13. **TC-T1-PROP-02 (Save Draft Proposal):** Freelancer saves proposal as draft (`is_draft=true`) -> 200 OK.
14. **TC-T1-PROP-03 (List Project Proposals):** Client queries `/api/v1/proposals?project_id={id}` -> 200 OK listing all bids.
15. **TC-T1-PROP-04 (Shortlist Proposal):** Client shortlists top candidate bid -> 200 OK with status `shortlisted`.
16. **TC-T1-PROP-05 (Withdraw Proposal):** Freelancer withdraws proposal before acceptance -> 200 OK with status `withdrawn`.

#### Group 4: Contracts & Milestones
17. **TC-T1-CONT-01 (Accept Proposal Contract):** Client accepts proposal -> 200 OK generating Contract, Escrow, and 2-part Milestones.
18. **TC-T1-CONT-02 (Freelancer Acknowledge):** Freelancer acknowledges contract terms -> 200 OK with status `active`.
19. **TC-T1-CONT-03 (Add Custom Milestone):** Client adds milestone 3 to pending contract within budget cap -> 200 OK.
20. **TC-T1-CONT-04 (Submit Milestone Work):** Freelancer submits deliverables on milestone 1 -> 200 OK with status `submitted`.
21. **TC-T1-CONT-05 (Approve Milestone):** Client approves milestone 1 -> 200 OK releasing payment to freelancer.

#### Group 5: Escrow & Payments
22. **TC-T1-ESCR-01 (Fund Contract Escrow):** Client deposits contract funds into escrow -> 200 OK with status `funded`.
23. **TC-T1-ESCR-02 (Check Wallet Balance):** Query `/api/v1/wallet/balance` -> 200 OK returning exact balance breakdown.
24. **TC-T1-ESCR-03 (Tranche Release Calculation):** Release $500 milestone -> Freelancer credited $450 (net 10% fee), platform fee logged $50.
25. **TC-T1-ESCR-04 (Escrow Status Audit):** Query `/api/v1/escrow/{id}` -> 200 OK showing released vs remaining balance.
26. **TC-T1-ESCR-05 (Transaction History):** Query `/api/v1/wallet/transactions` -> 200 OK listing all ledger events.

#### Group 6: Reviews, Disputes & Admin
27. **TC-T1-REV-01 (Submit Client Review):** Client rates completed contract 5 stars -> 200 OK, updating freelancer rating.
28. **TC-T1-REV-02 (Submit Freelancer Review):** Freelancer rates client 5 stars -> 200 OK, counter-review recorded.
29. **TC-T1-DISP-01 (Raise Dispute):** Client opens dispute on milestone 2 -> 201 Created, freezing contract payouts.
30. **TC-T1-DISP-02 (Admin Resolve Dispute):** Admin arbitrates dispute with 50/50 fund split -> 200 OK, unfreezing escrow.
31. **TC-T1-ADM-01 (Admin User Moderation):** Admin suspends abusive user account -> 200 OK, user session terminated.

---

### Tier 2: Boundary & Corner Cases Test Matrix (>=5 tests per feature group)

```
========================================================================================
TIER 2: BOUNDARY & CORNER CASES (Stress & Input Limits)
========================================================================================
```

#### Group 1: Auth & Session Boundaries
1. **TC-T2-AUTH-01 (Duplicate Email):** Registering email already present -> 409 Conflict.
2. **TC-T2-AUTH-02 (Special Characters in Name):** Register with unicode/accents (`"Jöhn Døe-O'Connor"`) -> 201 Created, stored safely.
3. **TC-T2-AUTH-03 (Max Length Email):** Register with 254-character valid RFC-compliant email -> Handled properly without truncate error.
4. **TC-T2-AUTH-04 (Brute Force Rate Limiting):** 20 rapid bad logins -> 429 Too Many Requests triggered.
5. **TC-T2-AUTH-05 (Tampered JWT Token):** Modify JWT payload signature -> 401 Unauthorized.

#### Group 2: Project & Proposal Boundaries
6. **TC-T2-PROJ-01 (Inverted Budget):** `budget_min = 5000, budget_max = 100` -> 422 Validation Error.
7. **TC-T2-PROJ-02 (Zero Budget):** `budget_min = 0, budget_max = 0` -> 422 Validation Error (must be > 0).
8. **TC-T2-PROJ-03 (Ultra Long Description):** 50,000 character project brief -> 422 or handled cleanly without DB buffer overflow.
9. **TC-T2-PROP-01 (Bid Over Max Budget):** Proposal bid amount 10x higher than project budget -> Allowed by marketplace policy (client negotiates).
10. **TC-T2-PROP-02 (Empty Cover Letter):** Submit proposal with empty cover letter -> 422 Validation Error.

#### Group 3: Financial & Milestone Boundaries
11. **TC-T2-MILE-01 (Milestone Over-allocation):** Add $600 milestone to contract with only $400 unallocated budget -> 400 Bad Request.
12. **TC-T2-MILE-02 (Zero Amount Milestone):** Create milestone with amount $0.00 -> 400 Bad Request.
13. **TC-T2-MILE-03 (Duplicate Milestone Approval):** Calling approve on already approved milestone -> 400 Bad Request.
14. **TC-T2-ESCR-01 (Zero Balance Escrow Funding):** Client with $0.00 balance funds $1,000 escrow -> 400 Bad Request ("Insufficient balance").
15. **TC-T2-ESCR-02 (Floating Point Precision):** 3 tranches of $333.33 + $333.33 + $333.34 on $1,000.00 contract -> Exact precision without 1-cent drift.

#### Group 4: Dispute & Moderation Boundaries
16. **TC-T2-DISP-01 (Dispute on Completed Contract):** Raising dispute 90 days post-completion -> Handled per policy window.
17. **TC-T2-DISP-02 (Excessive File Size Evidence):** Uploading 50MB file to dispute evidence -> 413 Payload Too Large.
18. **TC-T2-ADM-01 (Admin Self-Ban Protection):** Superadmin calling toggle-status on own user ID -> 400 Bad Request.
19. **TC-T2-ADM-02 (Non-Existent User ID):** Admin actions on user ID 99999999 -> 404 Not Found.
20. **TC-T2-REV-01 (Out-of-Bounds Star Rating):** Submit rating of 0 or 6 stars -> 400 Bad Request.

---

### Tier 3: Cross-Feature Pairwise Interoperability Matrix

```
========================================================================================
TIER 3: CROSS-FEATURE PAIRWISE INTERACTION MATRIX
========================================================================================
```

| Pair ID | Feature A | Feature B | Interaction Scenario | Expected Outcome |
|---|---|---|---|---|
| **PW-01** | Job Posting | Real-time Search | Client posts new project; Freelancer performs instant FTS5 search | Newly created job appears immediately in freelancer search results without server restart. |
| **PW-02** | Proposal Acceptance | Real-time Chat | Client accepts proposal -> Contract created | Automated system greeting message posted to shared conversation room; Socket.IO notifies freelancer. |
| **PW-03** | Proposal Acceptance | Escrow System | Client accepts proposal | Escrow record initialized in `status='pending'` linked to new contract with exact bid amount. |
| **PW-04** | Milestone Approval | Freelancer Wallet | Client approves milestone deliverable | Freelancer wallet immediately credited with net amount; transaction logged in `wallet_transactions`. |
| **PW-05** | Final Milestone Approval | Project Lifecycle | Client approves final outstanding milestone | Both Contract and Project statuses atomically transition to `completed`. |
| **PW-06** | Contract Completion | Review System | Contract completes | Both Client and Freelancer receive in-app prompt and email invite to submit 2-way reviews. |
| **PW-07** | Review Submission | Seller Tier Algorithm | Client leaves 5-star review | Freelancer Job Success Score (JSS) recalculated; Freelancer promoted to higher tier (e.g. Silver -> Gold). |
| **PW-08** | Dispute Filing | Milestone Escrow | Dispute raised on active contract | Escrow release endpoints locked for that contract; release attempts rejected with 400. |
| **PW-09** | Admin User Ban | Active Contracts | Admin bans fraudulent freelancer account | All active contracts associated with user transitioned to `cancelled`; unreleased escrows refunded to clients. |
| **PW-10** | Socket.IO Chat | Token Revocation | User logs out (blacklists token) while connected to WebSocket | Subsequent socket event emissions rejected with `"Token revoked"`; session severed. |

---

### Tier 4: Real-World Complex Scenarios Matrix

```
========================================================================================
TIER 4: REAL-WORLD END-TO-END SCENARIOS
========================================================================================
```

#### Scenario 1: The Golden Marketplace Path (Full Contract Lifecycle)
- **Persona:** Client "Acme Corp" and Freelancer "Elena Rostova".
- **Workflow Steps:**
  1. Client registers, verifies email, tops up wallet with $2,000.
  2. Client posts "Next.js Web Portal Development" ($1,500 budget).
  3. Freelancer browses job board, generates tailored bid via AI Proposal Writer, submits bid for $1,500 with 2 milestones ($750 Advance, $750 Delivery).
  4. Client receives real-time notification, reviews Elena's profile and reviews, accepts proposal.
  5. Contract and Escrow initialized ($1,500). Client funds escrow from wallet balance.
  6. Freelancer acknowledges contract terms.
  7. Client releases Milestone 1 ($750) as kickoff advance -> Freelancer receives $675 net ($75 fee).
  8. Freelancer executes code, collaborates via WebSocket workroom, submits Milestone 2 with GitHub repo and deployment URL.
  9. Client inspects work, approves Milestone 2 ($750) -> Contract and Project auto-complete.
  10. Client leaves 5-star review; Freelancer leaves 5-star review.
- **Verification:** Both wallets balance correctly; platform fee revenue logged ($150 total); freelancer tier updated; contract marked `completed`.

#### Scenario 2: Scope Dispute & Administrative Arbitration
- **Persona:** Client "TechStart Inc", Freelancer "Marcus Vance", Admin "Platform Arbitrator".
- **Workflow Steps:**
  1. Contract active with $1,000 in escrow.
  2. Freelancer delivers milestone 1, client rejects claiming missing features outside initial brief.
  3. Freelancer files Dispute (`dispute_type='scope'`) with attached original specification and chat logs.
  4. Escrow releases immediately frozen.
  5. Admin receives alert in Admin Disputes Portal, inspects submitted evidence.
  6. Admin rules 50% compromise: $500 released to freelancer, $500 refunded to client wallet.
  7. Admin executes arbitration ruling (`POST /api/v1/disputes/{id}/resolve`).
- **Verification:** Dispute marked `resolved`; client wallet credited $500; freelancer wallet credited $450 (net fee); contract closed.

#### Scenario 3: Fraud Detection & Multi-Party Account Quarantine
- **Persona:** Fraudulent Actor attempting phishing in chat.
- **Workflow Steps:**
  1. Suspicious account sends external off-platform payment links in messages.
  2. AI Fraud Detection regex & heuristics trigger high-severity alert to `/api/v1/admin/fraud-alerts`.
  3. Admin inspects user activity feed and triggers `POST /api/v1/admin/users/{id}/toggle-status` (suspend).
  4. Suspended user's active socket severed; ongoing open proposals withdrawn.
  5. Clean counterparties notified of security action.
- **Verification:** Account unable to authenticate; token blacklisted; no financial loss incurred.

---

## 7. State Transition & Lifecycle State Machines

### 7.1 Project State Machine
```
[open] ──(Client Accepts Proposal)──> [in_progress] ──(All Milestones Approved)──> [completed]
  │                                           │
  └──(Client Cancels / Admin Deletes)         └──(Dispute / Cancellation)
                 │                                           │
                 ▼                                           ▼
            [cancelled]                                 [cancelled]
```

### 7.2 Proposal State Machine
```
[draft] ──(Freelancer Submits)──> [submitted] ──(Client Shortlists)──> [shortlisted]
                                      │                                      │
               ┌──────────────────────┼──────────────────────────────────────┘
               ▼                      ▼
     (Client Accepts)        (Client Rejects / Rival Accepted)
               │                      │
               ▼                      ▼
          [accepted]             [rejected]
               ▲
               │
     (Freelancer Withdraws) ──> [withdrawn]
```

### 7.3 Contract & Escrow State Machine
```
Contract: [pending] ──(Escrow Funded & Freelancer Ack)──> [active] ──(Milestones Done)──> [completed]
             │                                               │
             └──(Cancel / Terminate)                         └──(Dispute Resolved / Refund)
                        │                                                   │
                        ▼                                                   ▼
                   [cancelled]                                         [cancelled]

Escrow:   [pending] ──(Client Funds Escrow)──> [funded] ──(Tranche Releases)──> [partially_released]
                                                  │                                  │
                                                  │                                  ▼
                                                  └──(Full Tranches Released)──> [released]
                                                  │
                                                  └──(Dispute / Refund Executed)──> [refunded]
```

---

## 8. Verification Commands & Test Reproduction

To execute the authoritative test suites covering these marketplace specifications:

```bash
# 1. Start FastAPI Backend (Terminal 1)
cd e:\MegiLance\backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# 2. Run Comprehensive Live E2E Workflow Verification
cd e:\MegiLance\backend
.\.venv\Scripts\python.exe tests/e2e_complete_flows.py

# 3. Run Milestone Lifecycle & Contract Authorization Tests
cd e:\MegiLance\backend
.\.venv\Scripts\pytest.exe tests/test_milestone_lifecycle.py tests/test_contracts.py tests/test_projects.py tests/test_auth.py -v

# 4. Run Two-Part Escrow & Payment Flow Tests
cd e:\MegiLance\backend
.\.venv\Scripts\python.exe tests/test_e2e_two_part_payments_flow.py
```

---
*Report compiled and verified by E2E & Marketplace Spec Miner for MegiLance 2.0.*
