## 2026-08-21T04:51:58Z
You are Explorer M2_2 for Milestone 2 (60-Second Instant Matching Wizard & Guest Bridge).
Your Working Directory: e:\MegiLance\.agents\teamwork_preview_explorer_m2_2
Original Request: e:\MegiLance\.agents\ORIGINAL_REQUEST.md
Master Plan: e:\MegiLance\.agents\PROJECT.md
Project Root: e:\MegiLance

Read ORIGINAL_REQUEST.md and PROJECT.md before doing anything.

Mission:
Investigate and design the Guest State Bridge and Mounting Points for Milestone 2:
1. Design `frontend/app/lib/bridges/useGuestStateBridge.ts`:
   - Dual storage management (`localStorage` key `megilance_instant_match_draft` + `sessionStorage` key `megilance_pending_project`).
   - Frictionless guest-to-registered auth handoff (`/signup?role=client&redirect=instant-match`).
   - Post-login / post-signup hydration and automatic project creation & candidate invitation.
2. Investigate mounting points:
   - Homepage Hero: `frontend/app/home/Home.tsx` and `frontend/app/home/components/Hero/Hero.tsx`.
   - Client Dashboard: `frontend/app/(portal)/client/dashboard/ClientDashboard.tsx`.
   - Client Find Talent: `frontend/app/(portal)/client/find-talent/page.tsx`.
3. Design Jest unit tests in `frontend/tests/instant_matching_wizard.test.tsx`.

Deliverable:
Write a comprehensive implementation blueprint to `e:\MegiLance\.agents\teamwork_preview_explorer_m2_2\handoff.md` and notify orchestrator.
