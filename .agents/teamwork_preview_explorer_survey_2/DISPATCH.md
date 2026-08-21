## 2026-08-21T04:18:13Z

Mission:
Investigate the client onboarding, project posting, and instant matching architecture in MegiLance:
1. Check current homepage (`frontend/app/(main)/`), client onboarding, client portal (`frontend/app/(portal)/client/`, `frontend/app/(portal)/dashboard/`), and project creation modals/pages.
2. Analyze backend matching services (`backend/app/services/ai/`, smart matching, freelancer search, ranking, recommendation endpoints).
3. Investigate the 60-Second Instant Matching Client Onboarding Wizard requirements:
   - Step 1: 1-sentence need input (UI, UX, suggestions, NLP extraction trigger)
   - Step 2: AI extraction + budget estimation + top 3 instant candidate matches (scoring, real-time preview)
   - Step 3: 1-click invite or instant milestone escrow funding
   - Guest visitor state persistence (localStorage, URL query, session, auth transition with zero data loss).
4. Identify all relevant APIs, schemas, routers, and frontend stores/hooks needed.
