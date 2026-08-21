# Project: MegiLance High-Growth Marketplace & Growth Engine (Round 3)

## Architecture
MegiLance is a full-stack AI-powered freelance marketplace combining a Next.js 16 + React 19 + TypeScript frontend with a FastAPI + Python 3.11+ backend backed by Turso/LibSQL database, SQLAlchemy 2.0 ORM, and Pydantic validation schemas.

Round 3 introduces the High-Growth Engine spanning four interconnected pillars:
1. **AI Lead Magnet Bridge**: Converts unauthenticated visitors of all 11 free AI productivity tools into paying clients and active proposals via `<HireSpecialistBridge />` and `<ProposalProjectBridge />`.
2. **60-Second Instant Matching Onboarding Wizard**: Frictionless 3-step natural language matching on homepage and client dashboard with real-time candidate ranking and zero-data-loss guest registration persistence.
3. **Trust Engine & Risk Reversal Badges**: Universal trust signals ("100% Milestone Escrow Protection", "0% Client Fees", "Identity Verified", "Skills Score", "Verified Reviews") embedded across profile pages, directory cards, match cards, and escrow checkout workrooms.
4. **Viral Marketplace Referral & Growth Loops**: Two-sided referral economics ($20 welcome credit for referee, $50 milestone bonus for referrer), shareable referral links, milestone success celebration share modals, and embeddable freelancer portfolio badges.

```
                               ┌──────────────────────────────────────────────┐
                               │             MegiLance Marketplace            │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌─────────────────────────┬──────────────────┴──────────────┬─────────────────────────┐
         ▼                         ▼                                 ▼                         ▼
┌───────────────────┐    ┌────────────────────┐            ┌───────────────────┐     ┌───────────────────┐
│ Track 1: AI Lead  │    │ Track 2: 60-Second │            │ Track 3: Trust    │     │ Track 4: Viral    │
│ Magnet Bridge     │    │ Instant Match      │            │ Engine Badges     │     │ Growth Loops      │
├───────────────────┤    ├────────────────────┤            ├───────────────────┤     ├───────────────────┤
│ • 11 AI Tools     │    │ • 1-Sentence Input │            │ • 100% Escrow     │     │ • ?ref= in Auth   │
│ • HireSpecialist  │    │ • AI Extractor     │            │   Protection      │     │ • $20/$50 Credits │
│ • ProposalMatch   │    │ • Top 3 Candidates │            │ • 0% Client Fees  │     │ • Milestone Share │
│ • State Bridges   │    │ • Guest Zero Loss  │            │ • Verified Badges │     │ • Embed Badges    │
└───────────────────┘    └────────────────────┘            └───────────────────┘     └───────────────────┘
```

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 11 AI Tools 1-Click Hiring Bridge | Unified `<HireSpecialistBridge />` on all 11 AI tool result views pre-populating project creation and matching | M1 | survey |
| 2 | Live Proposal Project Matcher | Real-time query of open projects in AI Proposal Writer (`<ProposalProjectBridge />`) with 1-click pre-filled application | M1 | survey |
| 3 | ProjectWizard & SubmitProposal State Persistence | Seamless reading of `megilance_pending_project` and `megilance_pending_proposal` from browser storage | M1 | survey |
| 4 | Instant Match AI Backend (`POST /api/v1/ai/instant-match`) | Natural language requirement parsing, budget/timeline estimation, and top 3 candidate ranking via `MatchingEngine` | M2 | survey |
| 5 | Instant Hire/Invite Backend (`POST /api/v1/ai/instant-hire-invite`) | Authenticated client endpoint creating project and dispatching talent invitations / milestone escrow | M2 | survey |
| 6 | 60-Second Instant Match Frontend Wizard (`<InstantMatchWizard />`) | Interactive 3-step wizard with 5 sample chips, real-time match radar, and candidate selection | M2 | survey |
| 7 | Multi-Surface Wizard Mounting & Guest Bridge | Hero homepage integration, client dashboard integration, and zero-data-loss registration persistence | M2 | survey |
| 8 | Shared Trust Badge Components | Reusable `<TrustBadgeGroup />`, `<RiskReversalGuaranteeBox />`, `<VerifiedReviewBadge />` | M3 | survey |
| 9 | Directory & Profile Trust Integration | Embedding trust signals across `UserProfile.tsx`, `TalentClient.tsx`, `AIMatchCard.tsx`, and `/freelancers/[id]` | M3 | survey |
| 10 | Escrow & Checkout Risk Reversal Banners | "100% Milestone Escrow Protection" & "0% Client Fees" in `MilestoneEscrowManager.tsx` and payment flows | M3 | survey |
| 11 | Two-Sided Referral Signup Hook | Capturing `?ref=` / `?referral_code=` in `auth.py` and `Signup.tsx`, linking users and awarding $20 welcome credit | M4 | survey |
| 12 | Milestone Completion Referral Bonus | Awarding $50 referrer reward in `escrow.py` upon referee's first milestone completion | M4 | survey |
| 13 | Milestone Success Share Celebration Modal | Interactive modal post-milestone release for 1-click sharing to LinkedIn/X/WhatsApp with embedded referral links | M4 | survey |
| 14 | Embeddable Freelancer Credential Badges | `<ShareableCertificateModal />` and embeddable SVG/HTML badge widget for external freelancer portfolios | M4 | survey |
| 15 | Full E2E Test Suite & Hardening | Complete backend Pytest coverage, Jest unit tests, and Next.js production build verification | M5 | survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | AI Tool Lead Magnet & 1-Click Hiring Bridge | 11 AI tool conversion bridges, `<HireSpecialistBridge />`, `<ProposalProjectBridge />`, `SubmitProposal` & `ProjectWizard` state bridges | none | IN_PROGRESS |
| M2 | 60-Second Instant Matching Client Onboarding Wizard | Backend instant match & invite endpoints, `<InstantMatchWizard />`, homepage/dashboard mounting, guest persistence | none | PLANNED |
| M3 | Trust Engine & High-Conversion Risk Reversal Badges | Shared trust badge components, profile/directory/match/escrow embeddings, risk reversal guarantees | none | PLANNED |
| M4 | Viral Marketplace Referral & Growth Loops | Referral code capture in auth, $20/$50 reward triggers in escrow release, milestone share modal, embed badges | M3 | PLANNED |
| M5 | Full System E2E Testing & Hardening | Backend pytest suites, Jest tests, production build verification, end-to-end flow validation | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### AI Tools ↔ Project Creation (`sessionStorage['megilance_pending_project']`)
```typescript
interface SpecialistScopeData {
  title: string;
  description?: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  milestones?: Array<{ name: string; weeks: number; amount: number; description?: string }>;
  deliverables?: string[];
  sourceTool: string;
}
```

### AI Proposal Writer ↔ Proposal Submission (`sessionStorage['megilance_pending_proposal']`)
```typescript
interface PendingProposalData {
  jobId?: string | number;
  coverLetter: string;
  hourlyRate?: number;
  estimatedHours?: number;
  suggestedTimeline?: string;
  sourceTool: 'proposal-writer';
}
```

### Instant Match API (`POST /api/v1/ai/instant-match`)
- **Request**: `{ prompt: string, category?: string, budget_override?: number }`
- **Response**:
```json
{
  "project_title": "Full-Stack Web App",
  "project_description": "...",
  "category": "Web Development",
  "extracted_skills": ["Next.js", "FastAPI", "TypeScript"],
  "estimated_budget_min": 1500.0,
  "estimated_budget_max": 3500.0,
  "estimated_timeline": "2-4 weeks",
  "complexity": "intermediate",
  "candidates": [
    {
      "freelancer_id": 14,
      "display_name": "Alex Rivera",
      "headline": "Senior Full-Stack Engineer",
      "hourly_rate": 65.0,
      "rating": 4.95,
      "review_count": 42,
      "completed_projects": 38,
      "match_score": 96,
      "match_quality": "excellent",
      "why_good_fit": "Strong expertise in Next.js and FastAPI with 99% JSS",
      "matched_skills": ["Next.js", "FastAPI", "TypeScript"],
      "seller_level": "Top Rated Plus"
    }
  ],
  "ai_confidence": 0.95
}
```

### Referral Registration & Escrow Completion
- **Registration**: `POST /api/v1/identity/register` accepts `referral_code: Optional[str]`. Links `referred_user_id` and awards $20 welcome project credit.
- **Milestone Release**: `POST /api/v1/escrow/{id}/release` checks if client/freelancer is referee on first completed milestone >= $50 -> credits $50 to referrer and sets referral status to `'completed'`.

---

## Code Layout

### Backend (`backend/app/`)
- `api/v1/ai/instant_match.py`: New instant match & invite endpoints
- `api/v1/identity/auth.py`: Registration schema and handler updated with `referral_code`
- `api/v1/payments_domain/escrow.py`: Escrow release handler updated with milestone referral reward triggers
- `api/routers.py`: Mounts `instant_match.py` router
- `tests/test_ai_instant_match.py`: Test suite for instant match and talent invitations
- `tests/test_referral_loops.py`: Test suite for two-sided referral rewards and escrow hooks

### Frontend (`frontend/app/`)
- `components/AI/HireSpecialistBridge/`: Reusable `<HireSpecialistBridge />` component
- `components/AI/ProposalProjectBridge/`: Reusable `<ProposalProjectBridge />` component
- `components/Onboarding/InstantMatchWizard/`: Reusable `<InstantMatchWizard />` component
- `components/Trust/`: Reusable `<TrustBadgeGroup />`, `<RiskReversalGuaranteeBox />`, `<VerifiedReviewBadge />`, `<EscrowProtectionBanner />`
- `components/Referrals/`: `<MilestoneSuccessShareModal />`, `<ShareableCertificateModal />`, `<EmbeddableBadgeWidget />`
- `ai/price-estimator/PriceEstimatorPro.tsx`: Integrates `<HireSpecialistBridge />`
- `ai/scope-planner/ScopePlanner.tsx`: Integrates `<HireSpecialistBridge />`
- `ai/proposal-writer/ProposalWriter.tsx`: Integrates `<ProposalProjectBridge />`
- `home/components/Hero/Hero.tsx` & `home/Home.tsx`: Mounts `<InstantMatchWizard />`
- `(portal)/client/dashboard/ClientDashboard.tsx`: Mounts `<InstantMatchWizard compact />`
- `components/Profile/UserProfile/UserProfile.tsx`: Mounts trust badges & guarantee box
- `talent/TalentClient.tsx`: Embeds trust badge pills on talent cards
- `components/organisms/Workroom/MilestoneEscrowManager.tsx`: Integrates escrow guarantee callouts and `<MilestoneSuccessShareModal />`
- `(auth)/signup/Signup.tsx`: Captures `?ref=` query param and handles `megilance_instant_match_state`
