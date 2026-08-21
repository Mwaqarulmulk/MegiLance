## 2026-08-21T04:57:49Z

You are Worker M2 for Milestone 2 (60-Second Instant Matching Wizard & Guest Bridge).
Your Working Directory: e:\MegiLance\.agents\teamwork_preview_worker_m2
Original Request: e:\MegiLance\.agents\ORIGINAL_REQUEST.md
Master Plan: e:\MegiLance\.agents\PROJECT.md
Project Root: e:\MegiLance

Read ORIGINAL_REQUEST.md and PROJECT.md before doing anything.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission:
Implement all frontend components, bridges, mounting points, and tests for Milestone 2:

1. Create `frontend/app/lib/bridges/useGuestStateBridge.ts`:
   - Full TypeScript hook with dual storage sync (`localStorage['megilance_instant_match_draft']` and `sessionStorage['megilance_pending_project']`).
   - Frictionless guest-to-registered redirect (`/signup?role=client&redirect=instant-match&returnTo=...`).
   - Post-auth auto-hydration and project creation & candidate invitation execution (`projectsApi.create` and `talentInvitationsApi.create`).

2. Create `frontend/app/components/AI/InstantMatchingWizard/`:
   - `InstantMatchingWizard.tsx`
   - `InstantMatchingWizard.common.module.css` (or CSS modules / Tailwind)
   - `InstantMatchingWizard.light.module.css`
   - `InstantMatchingWizard.dark.module.css`
   - `types.ts`
   - Implement the complete 3-step high-converting onboarding wizard:
     - Step 1: 1-sentence prompt input, 8 quick-select chips, expandable category & budget hints, and instant match trigger.
     - Step 2: Multi-phase AI extraction animation, extracted project brief display, and top 3 candidate cards (circular match score gauge 0–100%, hourly rate, verified trust badges ["100% Escrow Protection", "0% Client Fees", "ID Verified", "Top Rated Plus"], fit explanation, and 1-click select).
     - Step 3: Milestone escrow setup & 1-click direct invite (pre-filled milestone 1 budget, deliverables summary, invite notes, and instant fund CTA).

3. Mount `InstantMatchingWizard`:
   - Homepage Hero: `frontend/app/home/components/Hero/Hero.tsx`
   - Client Dashboard: `frontend/app/(portal)/client/dashboard/ClientDashboard.tsx` (with resume instant match banner)
   - Client Find Talent: `frontend/app/(portal)/client/find-talent/page.tsx` (with instant match tab/mode)

4. Tests & Build:
   - Create `frontend/tests/instant_matching_wizard.test.tsx`.
   - Run `npm run test:unit` in `frontend/` to verify tests pass.
   - Run `npm run build` in `frontend/` to verify production build succeeds with 0 TypeScript/compilation errors.

Deliverable:
Write a comprehensive completion report with full test command logs to `e:\MegiLance\.agents\teamwork_preview_worker_m2\handoff.md` and update `progress.md`. Send a completion message to your orchestrator when done.
