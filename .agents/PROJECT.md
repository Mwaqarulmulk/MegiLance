# Project: MegiLance Growth Engine & AI Lead Magnet Transformation

## Architecture
- **Overview**: Transform MegiLance from a standard freelancing platform into an AI-powered client acquisition and instant matching marketplace.
- **Frontend Architecture**: Next.js 16 + React 19 + TypeScript + Tailwind CSS.
  - `frontend/app/components/AI/InstantMatchingWizard/`: 3-step instant matching wizard component.
  - `frontend/app/components/AI/TrustEngine/`: Unified `TrustBadge` and `RiskReversalBanner` components.
  - `frontend/app/components/AI/GrowthLoops/`: Milestone celebration modal & certificate sharing card.
  - `frontend/app/lib/bridges/`: Universal lead magnet conversion bridge utilities (`pendingProjectBridge.ts`, `useGuestStateBridge.ts`).
  - AI Tools integration across `frontend/app/ai/` and `frontend/app/(main)/tools/`.
- **Backend Architecture**: FastAPI + Python 3.11+ + SQLAlchemy 2.0 + Turso.
  - `backend/app/api/v1/ai/instant_match.py`: Instant matching endpoint (`POST /api/v1/ai/instant-match`).
  - `backend/app/services/matching_engine.py`: 9-factor multi-dimensional ranking and fit generation.
  - `backend/app/api/v1/core_domain/referrals.py` & `auth.py`: Two-sided referral reward credits ($20 referee / $50 referrer).
  - `backend/app/api/v1/payments_domain/escrow.py`: Escrow milestone release referral qualification trigger.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Unified Instant Match API | `POST /api/v1/ai/instant-match` endpoint with NLP extraction + 9-factor ranking + fit reason | M1 | ORIGINAL_REQUEST §R2 |
| 2 | Two-Sided Referral Credits API | Backend support for $20 referee signup credit and $50 referrer milestone release reward | M1 | ORIGINAL_REQUEST §R4 |
| 3 | Milestone Escrow Referral Hook | Automatic referral qualification on escrow milestone completion | M1 | ORIGINAL_REQUEST §R4 |
| 4 | Trust Signals Aggregator API | Enrich profile and talent search endpoints with verified trust metrics | M1 | ORIGINAL_REQUEST §R3 |
| 5 | 60-Second Instant Matching Wizard UI | 3-step interactive onboarding wizard (need -> instant top 3 matches -> 1-click invite/escrow) | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Guest State Persistence & Auth Bridge | `useGuestStateBridge` with zero data loss on registration/login redirect | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Homepage & Dashboard Wizard Mount | Mount `InstantMatchingWizard` on Homepage hero, Client Dashboard, and Find Talent page | M2 | ORIGINAL_REQUEST §R2 |
| 8 | 11 AI Tools "1-Click Hire" Bridge | Universal bridge action pre-populating project creation and matching across all 11 AI tools | M3 | ORIGINAL_REQUEST §R1 |
| 9 | Proposal Writer Live Matching Projects Feed | Live project feed under Proposal Writer with 1-click submission and guest draft persistence | M3 | ORIGINAL_REQUEST §R1 |
| 10 | Unified TrustBadge & Risk Reversal Components | Reusable `TrustBadge` & `RiskReversalBanner` (Escrow Protection, 0% Client Fee, Verified ID/Skills) | M4 | ORIGINAL_REQUEST §R3 |
| 11 | Trust Signals Embedded Across Funnel | Embed trust badges on candidate cards, profile headers, proposal cards, and checkout modals | M4 | ORIGINAL_REQUEST §R3 |
| 12 | Milestone Social Share & Certificate Card | Social sharing celebration modal upon milestone release + verified skill test certificate card | M4 | ORIGINAL_REQUEST §R4 |
| 13 | Two-Sided Referral UI in Dashboard | Referral dashboard displaying shareable link, social buttons, and earned project credits | M4 | ORIGINAL_REQUEST §R4 |
| 14 | E2E Regression Verification & Integrity Audit | Full backend pytest (100% pass), frontend build (100% pass), and zero-defect forensic audit | M5 | ORIGINAL_REQUEST §5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Backend Core Services & Growth Engine APIs | Instant match endpoint, referral credits, escrow hook, trust signal aggregation, pytests | none | DONE |
| 2 | M2: 60-Second Instant Matching Wizard & Guest Bridge | 3-step wizard UI, guest state hook, homepage hero, client dashboard, auth transition | M1 | DONE |
| 3 | M3: 11 AI Tools Lead Magnet & Proposal Writer Bridge | 1-click hire bridge across 11 AI tools, proposal writer live project feed & 1-click bid | M1, M2 | PLANNED |
| 4 | M4: Trust Engine Badges & Viral Growth Sharing UI | TrustBadge component, cards/checkout placement, milestone celebration modal, certificate card | M1 | PLANNED |
| 5 | M5: E2E Test Verification & Hardening | Full backend pytest suite, frontend production build, and forensic integrity audit | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### 1. Instant Match API (`backend/app/api/v1/ai/instant_match.py`)
- **Route**: `POST /api/v1/ai/instant-match`
- **Request Body**:
  ```json
  {
    "prompt": "Build a Next.js SaaS app with Stripe payments",
    "category": "WEB_DEVELOPMENT", // optional
    "budget_hint": 1500.0 // optional
  }
  ```
- **Response Body**:
  ```json
  {
    "extracted_brief": {
      "title": "Full-Stack Next.js SaaS Development with Stripe",
      "description": "Comprehensive development scope...",
      "category": "WEB_DEVELOPMENT",
      "skills": ["Next.js", "React", "TypeScript", "Stripe", "Tailwind CSS"],
      "budget_min": 1000.0,
      "budget_max": 2500.0,
      "budget_type": "fixed",
      "estimated_days": 21
    },
    "matches": [
      {
        "freelancer_id": "usr_123",
        "name": "Sarah Jenkins",
        "title": "Senior Full-Stack Architect",
        "avatar_url": "/avatars/sarah.jpg",
        "hourly_rate": 65.0,
        "match_score": 96,
        "match_quality": "excellent",
        "why_good_fit": "Exact match for Next.js and Stripe; 100% Job Success Score; 24 completed projects",
        "top_skills": ["Next.js", "React", "Stripe", "TypeScript"],
        "trust_signals": {
          "identity_verified": true,
          "payment_verified": true,
          "jss_score": 100,
          "verified_badge": "Top Rated Plus",
          "review_count": 28,
          "average_rating": 4.98
        }
      }
    ]
  }
  ```

### 2. Universal Bridge State (`frontend/app/lib/bridges/pendingProjectBridge.ts`)
- **Storage Keys**:
  - `megilance_pending_project` (in `sessionStorage` & `localStorage`)
  - `megilance_instant_match_draft` (in `localStorage`)
  - `megilance_pending_proposal` (in `sessionStorage`)
- **Schema**:
  ```typescript
  interface PendingProjectPayload {
    title: string;
    description: string;
    category: string;
    skills: string[];
    budgetMin: string | number;
    budgetMax: string | number;
    budgetType: 'fixed' | 'hourly';
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    duration: 'less_than_1_month' | '1_to_3_months' | '3_to_6_months' | 'more_than_6_months';
    sourceTool?: string;
    instantMatchFreelancerId?: string;
  }
  ```

### 3. Referral Credits Contract (`backend/app/api/v1/core_domain/referrals.py`)
- Referee receives `$20.00` project credit voucher on registration.
- Referrer receives `$50.00` project credit when referee completes their first milestone escrow release.

## Code Layout & Write Ownership
- **Milestone 1**:
  - `backend/app/api/v1/ai/instant_match.py` (New)
  - `backend/app/api/v1/ai/__init__.py` / `backend/app/api/routers.py`
  - `backend/app/api/v1/core_domain/referrals.py`
  - `backend/app/api/v1/auth/auth.py`
  - `backend/app/api/v1/payments_domain/escrow.py`
  - `backend/tests/test_instant_matching_and_growth.py` (New)
- **Milestone 2**:
  - `frontend/app/components/AI/InstantMatchingWizard/InstantMatchingWizard.tsx` (New)
  - `frontend/app/components/AI/InstantMatchingWizard/InstantMatchingWizard.module.css` (New)
  - `frontend/app/lib/bridges/useGuestStateBridge.ts` (New)
  - `frontend/app/home/Home.tsx` / `frontend/app/home/components/Hero/Hero.tsx`
  - `frontend/app/(portal)/client/dashboard/ClientDashboard.tsx`
  - `frontend/app/(portal)/client/find-talent/page.tsx`
- **Milestone 3**:
  - `frontend/app/lib/bridges/pendingProjectBridge.ts` (New)
  - `frontend/app/ai/price-estimator/PriceEstimatorPro.tsx`
  - `frontend/app/ai/scope-planner/ScopePlanner.tsx`
  - `frontend/app/ai/rate-advisor/RateAdvisor.tsx`
  - `frontend/app/ai/proposal-writer/ProposalWriter.tsx`
  - `frontend/app/ai/skill-analyzer/SkillAnalyzer.tsx`
  - `frontend/app/ai/invoice-generator/InvoiceGenerator.tsx`
  - `frontend/app/ai/contract-builder/ContractBuilder.tsx`
  - `frontend/app/ai/fraud-check/FraudCheck.tsx`
  - `frontend/app/(main)/tools/*/page.tsx`
- **Milestone 4**:
  - `frontend/app/components/AI/TrustEngine/TrustBadge.tsx` (New)
  - `frontend/app/components/AI/TrustEngine/RiskReversalBanner.tsx` (New)
  - `frontend/app/components/AI/GrowthLoops/MilestoneCelebrationModal.tsx` (New)
  - `frontend/app/components/AI/GrowthLoops/VerifiedCertificateShare.tsx` (New)
  - `frontend/app/talent/TalentClient.tsx`
  - `frontend/app/(main)/freelancers/PublicFreelancers.tsx`
  - `frontend/app/components/Profile/UserProfile/UserProfile.tsx`
  - `frontend/app/(portal)/projects/[id]/proposals/page.tsx`
  - `frontend/app/(portal)/freelancer/referrals/page.tsx`
