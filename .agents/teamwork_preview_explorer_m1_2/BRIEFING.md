# BRIEFING — 2026-08-21T04:28:00Z

## Mission
Investigate and design the two-sided referral engine and escrow milestone qualification hook for MegiLance Milestone 1.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: e:\MegiLance\.agents\teamwork_preview_explorer_m1_2
- Original parent: 5b0dcdca-fbca-4497-8a74-dd135bd40196
- Milestone: Milestone 1 (Backend Core Services & Growth Engine APIs)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Capture `referral_code` in registration, create pending referral, immediately deposit $20 welcome voucher into referee's wallet
- Hook escrow milestone release to qualify referral (mark completed, credit $50 to referrer)
- Provide exact file paths, schemas, services, and integration hooks

## Current Parent
- Conversation ID: 5b0dcdca-fbca-4497-8a74-dd135bd40196
- Updated: 2026-08-21T04:28:00Z

## Investigation State
- **Explored paths**:
  - `backend/app/models/referral.py`: SQLAlchemy `Referral` model & enum statuses (`pending`, `accepted`, `completed`, `expired`).
  - `backend/app/models/user.py`: `User.account_balance` (Numeric 12,2) and `User.referral_code` (String 50).
  - `backend/app/models/payment.py`, `escrow.py`, `milestone.py`, `contract.py`: Financial structures and relationships.
  - `backend/app/api/v1/identity/auth.py`: `RegisterRequest`, `login`, `register` endpoints and token management.
  - `backend/app/services/auth_service.py`: `insert_user`, `get_user_by_email`, `check_email_exists`.
  - `backend/app/api/v1/core_domain/referrals.py`: `/me`, `/stats`, `/invite`, `/history`, `/leaderboard`, `_ensure_referral_code_column`.
  - `backend/app/services/referrals_service.py`: stats, list, create referral functions.
  - `backend/app/api/v1/payments_domain/escrow.py` & `escrow_service.py`: `release_escrow` and atomic wallet updates.
  - `backend/app/api/v1/projects_domain/milestones.py`: `approve_milestone` and milestone status transitions.
  - `backend/app/api/v1/payments_domain/wallet.py` & `wallet_service.py`: `wallet_balances`, `wallet_transactions`, atomic balance mutations.
- **Key findings**:
  - `RegisterRequest` in `auth.py` lacks `referral_code` / `ref` fields and does not process referral linkage or welcome vouchers.
  - `referrals_service.py` lacks a `qualify_referral_on_milestone` hook for completing referrals and releasing the $50 referrer payout.
  - `escrow.py` and `milestones.py` release freelancer funds but do not notify or trigger the referral service upon completion.
  - The `referrals` table self-healing DDL is needed to ensure table existence when using Turso HTTP.
- **Unexplored areas**: None. Code analysis complete.

## Key Decisions Made
- Designed unified registration flow that captures both body parameter (`referral_code` / `ref`) and query parameter (`?ref=...`), preventing self-referral, linking pending referral, generating unique user code, and immediately crediting $20 to referee's balance with double-entry transaction record.
- Designed idempotent `qualify_referral_on_milestone` hook executed on milestone approval/release that marks `referrals.status = 'completed'`, `reward_amount = 50.0`, `is_paid = 1`, and credits $50.00 to referrer with transaction record and notifications.

## Artifact Index
- e:\MegiLance\.agents\teamwork_preview_explorer_m1_2\handoff.md — Complete 5-Component Architectural Blueprint & Implementation Specification
