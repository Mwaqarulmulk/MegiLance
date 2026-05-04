---
title: Engineering Standards (2025)
doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["architecture", "backend", "frontend"]
related: ["Architecture.md", "API_Overview.md", "TestingStrategy.md", "SecurityCompliance.md", "PerformanceScalability.md", "Observability.md", "DataModel.md"]
description: Mandatory engineering practices ensuring reliability, maintainability, scalability, security, and auditability across all services.
---

# MegiLance Engineering Standards (2025)

> @AI-HINT: Canonical set of engineering rules for architecture, coding, testing, performance, security, AI integration, and documentation governance.

## Purpose
Defines mandatory software & AI engineering practices ensuring reliability, maintainability, scalability, and auditability across frontend, backend, and AI services.

## Architectural Principles
- **Layered + Modular**: Presentation → API → Services → Domain Models → Persistence.
- **Dependency Direction**: Inner layers never import outer layers; enforce via folder boundaries.
- **Configuration Isolation**: All runtime tunables (rate limits, feature flags, cache TTLs) sourced from environment variables or a single config module.
- **Stateless API Layer**: Business state stored only in DB / cache / queue systems.
- **Observability First**: Standardized logging (JSON optional), metrics (request count, latency, error ratio), and structured error responses.

## Backend (FastAPI)
- **Routers**: Group endpoints by bounded context (auth, users, projects, proposals, payments).
- **Schemas**: Pydantic models separated into request/response and internal domain models; never expose internal IDs unintentionally.
- **Services**: Pure business logic functions/classes, no HTTP or framework code.
- **DB Layer**: SQLAlchemy models + CRUD repository methods; no raw SQL in services unless optimized & documented.
- **Validation**: All input validated through Pydantic; custom validators for complex constraints.
- **Security**: JWT (access 30 min, refresh 7 days), role + permission checks in service layer.
- **Rate Limiting**: Enabled via `SLOWAPI_ENABLED` flag; defaults to ON in production.
- **Error Handling**: Unified exception mapping → structured `{detail, error_type}` JSON.
- **Performance**: Index critical columns, use eager loading for relation-heavy endpoints, batch queries where feasible.

## Frontend (Next.js 14)
- **App Router** with segment folders for `(auth)`, `(main)`, `(portal)`.
- **Component Styling**: Mandatory 3-file pattern: `Component.common.module.css`, `Component.light.module.css`, `Component.dark.module.css`.
- **Theming**: `useTheme()` + class merge utility; no global color overrides.
- **Type Safety**: Strict TypeScript (`noImplicitAny`, `strictNullChecks`).
- **Accessibility**: ARIA roles, alt text, keyboard nav, focus rings.
- **State Management**: Local component state first; Context only for cross-cutting concerns (auth, theme, notifications).
- **Performance**: Avoid unnecessary client-side rendering; prefer server components where static.
- **Assets**: Only optimized images (PNG/WebP/SVG); remove unused placeholders.

## AI Service
- **Isolation**: Calls proxied through backend service boundary; never expose raw provider keys to frontend.
- **Prompt Logging**: Store anonymized prompt+response for audit when compliance required.
- **Rate Guard**: Per-user + global concurrency caps.
- **Fallback**: Degrade gracefully to static suggestions if AI unavailable.

## Testing Strategy
- **Canonical Runner**: `comprehensive_test.py` for integrated smoke/system tests.
- **Unit Tests**: In `backend/tests/` (non-legacy). Legacy or experimental tests moved under `backend/tests/legacy/`.
- **Frontend Tests**: Must use Jest + Testing Library; mock network calls with MSW.
- **Coverage Targets**: 70% statement minimum backend/frontend; critical modules (auth, payments, projects) ≥85%.
- **Regression Protection**: Add tests for every production bug fix.

## Logging & Monitoring
- **Format**: `timestamp | level | module | message | context` (optionally JSON in containerized prod).
- **Correlation**: Inject `request_id` via middleware; propagate to logs & downstream calls.
- **Metrics**: Export Prometheus-style counters (requests, errors), histograms (latency), gauges (queue depth, active tasks).
- **Alerts**: Trigger on 5xx error rate >2% over 5m, latency p95 > 750ms, auth failures spike.

## Configuration & Secrets
- **Env-First**: `.env` for development only; never commit production secrets.
- **Secret Rotation**: Keys rotated every 90 days; document process in `SecurityCompliance.md`.
- **Feature Flags**: Single source file mapping env vars to strongly typed flag objects.

## Performance Optimization Guidelines
- **Database**: Prefer pagination (`limit/offset` or keyset); avoid `SELECT *`; index high-cardinality filters.
- **API**: Cache read-heavy endpoints with short TTL where stale tolerance exists.
- **Frontend**: Code-splitting for dashboard heavy components; avoid unnecessary client hooks in static routes.

## Code Review Checklist
1. Separation of concerns preserved.
2. No direct framework calls inside service/domain logic.
3. All new endpoints documented in API spec.
4. Input validated; errors mapped cleanly.
5. Logging includes context (user id, request id when relevant).
6. No hardcoded secrets or magic numbers.
7. Tests added/updated (unit + integration where needed).
8. Performance impact considered (N+1 queries avoided).

## Documentation Requirements
- Every public API route: summary + request + response + error cases.
- New modules: top-level `@AI-HINT` comment (frontend & backend services).
- Architectural changes: update `Architecture.md` + index file.

## Deprecation Policy
- Mark deprecated modules with header banner; move to `legacy/` folder before removal.
- Minimum 1 release cycle notice (tagged in `ChangelogPolicy.md`).

## Compliance & Security
- **Data Protection**: Encrypt sensitive at rest when migrating off Turso (future multi-region RDS).
- **Audit Trail**: Record auth events (login, role change, password reset).
- **Threat Modeling**: Updated quarterly (`ThreatModel.md`).

---
_Last updated: 2025-11-25_
