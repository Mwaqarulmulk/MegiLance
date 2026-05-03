---
title: Testing Strategy
doc_version: 1.0.0
last_updated: 2025-11-24
status: active
owners: ["qa", "backend"]
related: ["Architecture.md", "API_Overview.md", "PerformanceScalability.md", "SecurityCompliance.md"]
description: Defines multi-layer test approach, tooling, coverage targets, release exit criteria, and future rigor enhancements.
---

# Testing Strategy

> @AI-HINT: Establishes the test layering model, coverage goals, tooling, quality gates, and planned improvements (mutation testing, performance validation).

Balanced approach focused on fast feedback in constrained resource environment.

## 1. Test Pyramid Allocation (Target %)
| Layer | Purpose | Tools | Target Share |
|-------|---------|-------|--------------|
| Unit | Function/module correctness | pytest, FastAPI dependency overrides | 60% |
| Service (integration) | DB + app logic | pytest + transient test schema | 25% |
| API (contract) | External behavior & schema | HTTPX / requests + OpenAPI validation | 10% |
| End-to-End (smoke) | Critical flows | Minimal Playwright (future) | 5% |

## 2. Unit Tests
| Aspect | Guideline |
|--------|----------|
| Isolation | Mock external services (DB, network) |
| Coverage goals | 80% lines; focus branches on auth & proposals |
| Naming | `test_<module>_<behavior>` |

## 3. Integration Tests
| Strategy | Use dedicated transient Oracle schema or SQLite fallback (logic-only) where feasible |
| Setup | Alembic migration (future) or metadata create_all |
| Teardown | Drop schema / clean tables |

## 4. API Contract Tests
| Check | Method |
|-------|-------|
| Status codes | Assert expected codes |
| Schema shape | Compare to OpenAPI spec fragment |
| Error payload | Validate `error.code` taxonomy |

## 5. Test Data Management
| Principle | Implementation |
|-----------|---------------|
| Deterministic | Factory functions with explicit values |
| Minimal fixtures | Avoid deep fixture nesting; prefer factory pattern |
| No real secrets | Use dummy env values |

## 6. Performance / Load (Planned)
| Stage | Tool | Goal |
|-------|------|------|
| Early smoke | Locust / k6 (light) | 20 concurrent baseline |
| Pre-scale | Scenario tests | Identify latency > 500ms p95 |

## 7. Static Analysis & Type Safety
| Tool | Purpose |
|------|--------|
| Ruff | Fast linting |
| flake8 (optional) | Legacy style rules |
| mypy | Static type checking |
| pyright | Supplemental type analysis (config in repo) |
| Bandit | Security scanning |
| Coverage.py | Coverage metrics |

## 8. Local Pre-Push (CI Substitute in Webhook Context)
Local pre-push script (optional):
```
pytest -q && ruff check . && mypy backend/
```

## 9. Mutation Testing (Future)
| Tool | Target | Benefit |
|------|--------|---------|
| mutmut / cosmic-ray | Core business rules | Increase test rigor |

## 10. Regression Handling
- Tag tests by marker: @unit, @integration, @api
- Fast suite: run @unit on each local iteration
- Full suite: nightly or pre-release

## 11. Flakiness Mitigation
| Cause | Mitigation |
|-------|-----------|
| Timing with async | Explicit await & timeouts |
| External dependency | Mock or containerized local service |

## 12. Reporting
| Metric | Collection |
|--------|-----------|
| Coverage | `pytest --cov` |
| Duration | Pytest timing plugin |

## 13. Exit Criteria for Release
| Criterion | Threshold |
|----------|-----------|
| Unit + integration passing | 100% required |
| Coverage | >=80% lines overall |
| Critical path E2E | Pass smoke scenario |
| High severity Bandit issues | 0 |

## 14. Canonical Test Runner
`comprehensive_test.py` orchestrates layered execution (unit → integration → API) locally; ensure it remains green before architectural changes.

## 15. Test Artifact Hygiene
| Artifact Type | Policy |
|---------------|--------|
| Legacy scripts | Quarantined under `backend/tests/legacy/` |
| Large fixtures | Avoid; prefer factories |
| External services | Mock unless behavior critical |

## 16. Review Cadence
Quarterly review of coverage focus areas: auth, proposals, payments (future), security edge cases.

---
Testing strategy evolves with feature complexity; revisit quarterly. Align with `ENGINEERING_STANDARDS_2025.md` quality and coverage mandates.
