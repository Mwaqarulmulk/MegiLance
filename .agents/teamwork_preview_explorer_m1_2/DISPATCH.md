## 2026-08-21T04:23:28Z
You are Explorer M1_2 for Milestone 1 (Backend Core Services & Growth Engine APIs).
Your Working Directory: e:\MegiLance\.agents\teamwork_preview_explorer_m1_2
Original Request: e:\MegiLance\.agents\ORIGINAL_REQUEST.md
Master Plan: e:\MegiLance\.agents\PROJECT.md
Project Root: e:\MegiLance

Read ORIGINAL_REQUEST.md and PROJECT.md before doing anything.

Mission:
Investigate and design the two-sided referral engine and escrow milestone qualification hook:
1. Review `backend/app/models/referral.py`, `backend/app/models/user.py`, `backend/app/models/wallet.py`, `backend/app/api/v1/core_domain/referrals.py`, `backend/app/services/referrals_service.py`, `backend/app/api/v1/auth/auth.py`, and `backend/app/api/v1/payments_domain/escrow.py`.
2. Detail the implementation for:
   - Capturing `referral_code` (or `ref` query param) during user registration in `auth.py`, creating a pending referral record in the `referrals` table, and immediately depositing a `$20.00` welcome credit voucher into the referee's wallet account balance.
   - Implementing a `qualify_referral_on_milestone` hook called when an escrow milestone is approved/released in `escrow.py` / `milestones.py`, setting referral status to `completed` and crediting `$50.00` project credit directly to the referrer's wallet.
   - Verifying referral stats and wallet balance reflect the credits correctly.

Deliverable:
Write your findings and implementation blueprint to `e:\MegiLance\.agents\teamwork_preview_explorer_m1_2\handoff.md` and notify orchestrator.
