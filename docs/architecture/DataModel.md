---
title: Data Model Specification
doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["backend", "architecture"]
related: ["Architecture.md", "SecurityCompliance.md", "TestingStrategy.md"]
description: Conceptual, logical, and integrity definitions for core platform entities with indexing and migration guidelines.
---

# Data Model Specification

> @AI-HINT: Defines core entities, relational schema, constraints, indexing, integrity rules, and planned extensions.

Conforms to conceptual → logical → physical layering. Aligns with ISO/IEC 11179 naming clarity, and domain‑driven boundaries.

## 1. Conceptual Entities
| Entity | Description | Key Relationships |
|--------|-------------|------------------|
| User | Platform account (Client or Freelancer) | 1..* Projects (as owner), 1..* Proposals, 1..* Reviews |
| Project | Work posted by Client | 1..* Proposals, 0..1 Contract |
| Proposal | Freelancer bid on Project | Belongs to User & Project |
| Contract | Accepted proposal → execution agreement | Links Project + Proposal + Parties |
| Review | Post‑contract feedback | References Contract + target User |
| Skill | Taxonomy tag associated to Users | Many-to-many Users |
| PortfolioItem | Evidence of past work | Belongs to User |
| Message (Future) | Communication unit | User ↔ User via Conversation |
| Payment (Future) | Monetary record | Linked to Contract |

## 2. Logical Relational Model (Simplified)
```
User (id PK, email UNIQUE, role ENUM[client,freelancer], password_hash, created_at)
Project (id PK, owner_user_id FK→User.id, title, description, status ENUM[draft,open,closed], budget_min, budget_max, created_at)
Proposal (id PK, project_id FK→Project.id, freelancer_user_id FK→User.id, cover_letter, bid_amount, status ENUM[pending,accepted,rejected], created_at)
Contract (id PK, proposal_id FK→Proposal.id UNIQUE, project_id FK→Project.id, client_user_id FK→User.id, freelancer_user_id FK→User.id, start_date, end_date NULLABLE, status ENUM[active,completed,cancelled])
Review (id PK, contract_id FK→Contract.id, reviewer_user_id FK→User.id, reviewee_user_id FK→User.id, rating INT 1..5, comment, created_at)
Skill (id PK, name UNIQUE)
UserSkill (user_id FK→User.id, skill_id FK→Skill.id, PRIMARY KEY (user_id, skill_id))
PortfolioItem (id PK, user_id FK→User.id, title, summary, link_url, created_at)
```

## 3. Integrity Rules
| Rule | Type | Enforcement |
|------|------|------------|
| A proposal must reference an open project | Business | API validation + DB check |
| Only project owner can accept proposal | Authorization | Service layer policy |
| One active contract per project | Constraint | UNIQUE(proposal_id) + status logic |
| Review allowed only after contract completion | Business | Status & existence check |
| Skill name case-insensitive unique | Data quality | DB unique index + lower() guard |

## 4. Indexing Strategy (Initial)
| Table | Index | Purpose |
|-------|-------|---------|
| User | email_unique | Auth lookup |
| Project | owner_user_id_idx | Filter by owner dashboard |
| Proposal | project_id_status_idx | Fast listing & status filters |
| Contract | freelancer_user_id_idx | Active contract lists |
| Review | reviewee_user_id_idx | Reputation aggregation |

## 5. Enumerations
| Enum | Values | Notes |
|------|--------|------|
| User.role | client, freelancer | Extendable (admin) |
| Project.status | draft, open, closed | Draft not visible to others |
| Proposal.status | pending, accepted, rejected | Mutually exclusive terminal states |
| Contract.status | active, completed, cancelled | Completed enables review |

## 6. Derived / Aggregated Data (Future Optimization)
| Metric | Source | Strategy |
|--------|--------|----------|
| Freelancer rating | Reviews.reviewee_user_id AVG(rating) | Materialized view / cache |
| Proposal count per project | Proposal.project_id COUNT(*) | Cached counter field |
| Skill popularity | UserSkill.skill_id COUNT(*) | Periodic batch job |

## 7. Data Quality & Validation
| Aspect | Control |
|--------|--------|
| Email format | Regex + canonical lowercasing |
| Monetary values | Non-negative numeric, currency assumption (future multi‑currency) |
| Text length | Max lengths enforced (title, cover_letter) |
| Rating bounds | 1 ≤ rating ≤ 5 |

## 8. Security & Privacy Considerations
| Data | Concern | Mitigation |
|------|---------|-----------|
| Password hash | Credential theft | Argon2 / strong hashing + salt |
| Email | PII | Minimal exposure in API responses |
| Review comments | Abuse | Moderation filters (future) |

## 9. Migration Strategy (Planned)
- Introduce Alembic baseline snapshot
- One migration file per semantic change (naming standard: YYYYMMDDHHMM_<short_description>.py)
- Down migrations supported for non-destructive structure changes

## 10. Future Extensions
| Feature | Impact on Model |
|---------|-----------------|
| Messaging | Add Conversation + Message tables + indexing |
| Payment | Payment, TransactionLedger tables with double-entry design |
| AI Tagging | Add InferredSkill & confidence metric |
| Analytics | Event table (append-only) for engagement metrics |

## 11. Sample Entity Lifecycle (Proposal)
```
create → pending → (accepted ⇒ contract created) OR (rejected) → immutable terminal
```

## 12. Referential Integrity Summary
All foreign keys enforce ON DELETE RESTRICT (avoid accidental cascades). Application orchestrates safe archival steps before deletion.

## 13. Data Retention & Archival (Future Policy)
| Data Class | Retention | Archive Strategy |
|------------|----------|------------------|
| Active contracts | Lifetime | None until termination |
| Completed contracts | 5 years | Cold storage / export (future) |
| Reviews | Permanent | Soft delete flag (future) |

---
Prepared under relational modeling best practices (normalization to 3NF initial; selective denormalization deferred to performance tuning phase).
