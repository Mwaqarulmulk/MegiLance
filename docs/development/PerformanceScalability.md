---
title: Performance & Scalability
doc_version: 1.0.0
last_updated: 2025-11-24
status: active
owners: ["backend", "ops"]
related: ["Observability.md", "Architecture.md", "TestingStrategy.md"]
description: Baseline performance targets, optimization tactics, scaling path, and monitoring roadmap for constrained initial environment.
---

# Performance & Scalability

> @AI-HINT: Documents current performance budgets, optimization status, planned scaling milestones, and monitoring triggers under micro VM resource constraints.

Initial constraints: 1 OCPU / 1 GB RAM micro VM. Strategy focuses on lean footprint + graceful evolution.

## 1. Baseline Targets
| Metric | Initial Target |
|--------|---------------|
| p95 latency (simple GET) | < 300ms |
| p95 latency (DB write) | < 600ms |
| Error rate (5xx) | < 1% |
| Memory footprint backend | < 300MB steady |

## 2. Optimizations (Current Phase)
| Layer | Tactic | Status |
|-------|--------|--------|
| Python runtime | Single worker, no gunicorn overhead | Active |
| DB access | Direct Turso libSQL connections (no wallet) | Active |
| Serialization | Pydantic models only, avoid heavy ORMs | Active |
| Logging | INFO only in prod | Active |
| Dependencies | Avoid large AI libs in main image | Active |

## 3. Future Scaling Path
| Stage | Trigger | Action |
|-------|--------|--------|
| S1 Vertical | Sustained 80% CPU | Move to larger VM |
| S2 Horizontal read | High read load low write | Add read replica service (cache) |
| S3 Service split | Hot endpoints contending | Extract proposals service |
| S4 Async jobs | Long-running tasks | Introduce queue + worker |

## 4. Caching Strategy (Planned)
| Item | Type | TTL | Notes |
|------|------|-----|------|
| Skill list | In-memory | 10m | Low churn |
| User rating aggregates | Lazy compute | 30m | Invalidate on new review |

## 5. Query Efficiency
| Pattern | Guideline |
|---------|----------|
| N+1 prevention | Preload related aggregates where needed |
| Pagination | Always apply limit/offset with cap |
| Counting | Approximate counters for large sets (future) |

## 6. Load Test Scenarios (Planned)
| Scenario | Steps | Success Criteria |
|----------|-------|------------------|
| Browse projects | List → paginate | p95 < 400ms |
| Submit proposal | Auth → create | p95 < 700ms |
| Auth burst | 20 concurrent logins | < 2 failures |

## 7. Resource Monitoring
| Resource | Check |
|----------|------|
| CPU saturation | >85% sustained triggers profile |
| Memory growth | Continuous upward trend indicates leak |
| Open connections | Cap within pool size |

## 8. Profiling Toolchain (Future)
| Tool | Focus |
|------|------|
| cProfile | Hot spots |
| py-spy | Sampling in prod window |
| SQLAlchemy echo | Query debug (dev only) |

## 9. Resilience Measures
| Concern | Control |
|---------|---------|
| Crash recovery | Docker restart policy |
| DB transient failures | Retry wrapper (exponential) |
| Memory pressure | Limit & log before OOM |

## 10. Performance Budget
| Category | Budget |
|----------|--------|
| DB roundtrip simple read | < 80ms |
| JSON serialization medium object | < 10ms |
| Network overhead (no TLS) | < 50ms |

## 11. Planned Metrics
| Metric | Source |
|--------|--------|
| request_duration_seconds | Middleware histogram |
| db_query_time_ms | Manual instrumentation wrapper |
| active_sessions | Connection pool stats |

## 12. Degradation Playbook
| Symptom | Immediate Action |
|---------|------------------|
| High latency | Capture thread dump / profiling snapshot |
| Memory nearing limit | Restart after capturing heap (future tool) |
| DB saturation | Throttle heavy endpoints |

## 13. Review Cadence
Monthly quick review of latency vs budgets; quarterly deep profiling; trigger immediate review if p95 exceeds budget for 3 consecutive days.

## 14. Cross-References
| Concern | Doc |
|---------|-----|
| Metrics definitions | `Observability.md` |
| Architecture scaling context | `Architecture.md` |
| Load test integration | `TestingStrategy.md` |

---
Baseline plus iterative roadmap; refine post real traffic observations. Ensure consistency with Observability instrumentation plan.
