# E2E Test Infra: MegiLance Growth Engine & AI Lead Magnet Transformation

## Test Philosophy
- Opaque-box, requirement-driven.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory & Test Mapping
| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (E2E Scenario) |
|---|---------|-------------------|:-----------------:|:-----------------:|:-----------------:|:---------------------:|
| 1 | Instant Match API | ORIGINAL_REQUEST §R2 | 5 cases | 5 cases | ✓ | ✓ |
| 2 | Two-Sided Referral Credits | ORIGINAL_REQUEST §R4 | 5 cases | 5 cases | ✓ | ✓ |
| 3 | Escrow Referral Hook | ORIGINAL_REQUEST §R4 | 5 cases | 5 cases | ✓ | ✓ |
| 4 | Trust Signals Aggregator | ORIGINAL_REQUEST §R3 | 5 cases | 5 cases | ✓ | ✓ |
| 5 | Instant Matching Wizard UI | ORIGINAL_REQUEST §R2 | 5 cases | 5 cases | ✓ | ✓ |
| 6 | Guest Bridge & Auth Transition | ORIGINAL_REQUEST §R2 | 5 cases | 5 cases | ✓ | ✓ |
| 7 | 11 AI Tools 1-Click Hire Bridge | ORIGINAL_REQUEST §R1 | 5 cases | 5 cases | ✓ | ✓ |
| 8 | Proposal Writer Live Projects Feed | ORIGINAL_REQUEST §R1 | 5 cases | 5 cases | ✓ | ✓ |
| 9 | Trust Badges & Guarantee Seals | ORIGINAL_REQUEST §R3 | 5 cases | 5 cases | ✓ | ✓ |
| 10 | Milestone Celebration & Certificate Share | ORIGINAL_REQUEST §R4 | 5 cases | 5 cases | ✓ | ✓ |

## Test Execution Commands
- **Backend Test Suite**: `cd backend && python -m pytest tests/ -v`
- **Frontend Unit & Component Suite**: `cd frontend && npm run test:unit`
- **Frontend Production Build**: `cd frontend && npm run build`
- **Frontend CSS & Linting**: `cd frontend && npm run test:css`
