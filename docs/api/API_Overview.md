---
title: API Overview & Versioning
doc_version: 1.0.0
last_updated: 2025-11-24
status: active
owners: ["backend", "api"]
related: ["Architecture.md", "TestingStrategy.md", "SecurityCompliance.md"]
description: Canonical reference for public API surface, versioning, envelopes, error taxonomy, and evolution policies.
---

# API Overview & Versioning

> @AI-HINT: Defines current public API organization, versioning strategy, response envelope, error taxonomy, stability zones, and lifecycle policies.

Current stack: FastAPI backend, JSON/REST style. Future evolution may introduce GraphQL or gRPC for internal services.

## 1. Versioning Strategy
| Aspect | Policy |
|--------|-------|
| Path prefix | `/api/v1/...` (prepare for `/v2`) |
| Deprecated endpoints | Mark in OpenAPI description + sunset date |
| Breaking change cadence | Bundle; max quarterly in early phase |
| SemVer mapping | Major = breaking endpoint/contract change |

## 2. Endpoint Categories (Planned Baseline)
| Domain | Purpose | Examples |
|--------|---------|----------|
| Auth | Account lifecycle & tokens | POST /auth/register, POST /auth/login |
| Health | Liveness/readiness | GET /health/live, /health/ready |
| Users | Profile & skills | GET /users/{id}, PATCH /users/me |
| Projects | Project posting & browsing | POST /projects, GET /projects |
| Proposals | Freelancer bids | POST /projects/{id}/proposals |
| Contracts | Accepted engagements | GET /contracts/{id} |
| Reviews | Reputation data | POST /contracts/{id}/reviews |
| Skills | Taxonomy listing | GET /skills |

## 3. Standard Response Envelope (Status: IN_PROGRESS)
```json
{
  "data": { /* resource or collection */ },
  "error": null,
  "meta": { "request_id": "uuid", "pagination": {"page":1,"page_size":20,"total":42} }
}
```
Errors:
```json
{
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "Field X required", "details": [{"field":"email","issue":"missing"}] },
  "meta": { "request_id": "uuid" }
}
```

## 4. Error Code Catalog (Initial)
| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Invalid request payload |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Role lacks permission |
| NOT_FOUND | 404 | Resource absent |
| CONFLICT | 409 | State conflict (duplicate) |
| RATE_LIMITED | 429 | Too many requests (future) |
| SERVER_ERROR | 500 | Unhandled exception |

## 5. Pagination Contract
| Param | Default | Notes |
|-------|---------|-------|
| page | 1 | 1-based |
| page_size | 20 | Max 100 |
| sort | created_at:desc | field:direction pairs |

Response pagination meta includes: page, page_size, total, total_pages.

## 6. Filtering & Query
- Whitelist filterable fields per resource (server-side enforcement)
- Disallow arbitrary field injection (prevent mass assignment)

## 7. Rate Limiting (Status: IN_PROGRESS)
| Scope | Limit | Window |
|-------|-------|--------|
| Auth login | 5 attempts | 5 min |
| Auth register | 10 attempts | 1 hour |
| General GET | 100 req | 1 min |

## 8. OpenAPI / Documentation
| Tool | Usage |
|------|-------|
| FastAPI built-in | `/api/docs` (Swagger UI) |
| Redoc | `/api/redoc` |
| Generated schema | `/api/openapi.json` for client generation |

## 9. CORS Policy
| Setting | Rule |
|---------|------|
| Allowed origins | Frontend domain only (prod) |
| Methods | Standard CRUD + OPTIONS |
| Credentials | Optional (depends on auth token transport) |

## 10. Idempotency (Future Consideration)
- Provide `Idempotency-Key` header for POST operations with at-least-once semantics (payments etc.)

## 11. Stability Guarantees
| Zone | Stability |
|------|----------|
| v1 public endpoints | Stable (additive changes only) |
| Experimental endpoints | `/api/v1/exp/*` resettable |

## 12. Deprecation Lifecycle
| Stage | Indicator | Duration |
|-------|-----------|----------|
| Announce | Changelog entry | 0 weeks |
| Deprecated | OpenAPI deprecation flag | 4–8 weeks |
| Removal | 410 Gone if accessed | After window |

## 13. Naming & Consistency Guidelines
| Element | Guideline |
|---------|-----------|
| Resource names | Plural nouns (`projects`, `users`) |
| Path nesting | Depth <= 3; use sub-resources (`/projects/{id}/proposals`) |
| IDs | UUID v4 (string) |
| Timestamps | ISO 8601 UTC (suffix Z) |
| Booleans | `is_` prefix (e.g. `is_active`) |
| Sorting | `field:direction` pairs, direction in {asc,desc} |

## 14. Pagination & Filtering Enforcement
All pagination params validated centrally. Reject page_size > 100 with 400. Filtering uses allowlist per model to prevent mass assignment.

## 15. Envelope Adoption Plan
| Phase | Scope | Status |
|-------|-------|--------|
| P1 | Auth & Projects endpoints | IN_PROGRESS |
| P2 | Remaining core resources | PLANNED |
| P3 | Error normalization (details array) | PLANNED |

## 16. Change Management Workflow
1. Draft change proposal referencing endpoint(s).
2. Update OpenAPI schema & regenerate client stubs if any.
3. Update relevant examples here.
4. Add changelog entry (deprecation if applicable).
5. Bump SemVer major if breaking; otherwise minor/patch.

---
Canonical API contract reference; update alongside any schema or semantics change. Cross-check with `SecurityCompliance.md` for auth & hardening controls and `TestingStrategy.md` for contract test coverage.
