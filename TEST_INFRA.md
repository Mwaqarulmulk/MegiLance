# E2E Test Infra: MegiLance 2.0

## Test Philosophy
- Opaque-box, requirement-driven testing mapped against authoritative user journeys in `ORIGINAL_REQUEST.md`.
- Systematic 4-tier methodology: Category-Partition + Boundary Value Analysis + Pairwise Interaction + Real-World Workload Scenarios.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Source (Requirement) | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|---------|----------------------|:----------------:|:-----------------:|:----------------------:|:-------------------:|
| 1 | Auth & Onboarding | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 2 | Job Posting & Filtering | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 3 | Proposals & Bidding | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 4 | Contract Inception & Escrow | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 5 | Milestone Submission & Approval | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 6 | Real-time Chat & Notifications | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 7 | Reviews & Ratings | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | Disputes & Admin Moderation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Backend Test Runner**: Pytest (`backend/tests/`)
  - Command: `python -m pytest tests/ -v`
  - Integration/E2E: `python tests/e2e_complete_flows.py`
- **Frontend Test Runner**: Jest / Playwright (`frontend/tests/` & `frontend/e2e/`)
  - Command: `npm run test:unit`
  - E2E Command: `npx playwright test e2e/all-workflows-complete.spec.ts`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| 1 | The Golden Path Marketplace Lifecycle | Auth -> Job Post -> Proposal -> Accept -> Fund Escrow -> Milestone Deliver -> Approve -> Payout -> Review | 100% completion with accurate wallet balances and 5-star review |
| 2 | The Milestone Dispute & Admin Arbitration | Job Post -> Proposal -> Accept -> Milestone Delivery -> Scope Dispute -> Admin Arbitrates 50/50 Split | Partial refund to client wallet, partial payout to freelancer |
| 3 | Fraud & Integrity Quarantine Flow | Suspicious bid / proposal -> AI fraud check flag -> Admin quarantine & user status suspension | Malicious activity blocked, notification dispatched |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 test cases per feature domain (Total ≥ 40 cases)
- **Tier 2 (Boundary & Corner Cases)**: ≥5 test cases per boundary domain (Total ≥ 40 cases)
- **Tier 3 (Cross-Feature Combinations)**: ≥10 integration tests validating state handoffs
- **Tier 4 (Real-World Application Scenarios)**: Complete multi-actor journey tests (Golden Path, Dispute, Fraud)
- **Tier 5 (Adversarial Hardening)**: White-box adversarial edge case hardening
