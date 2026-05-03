---
title: Observability & Logging
doc_version: 1.0.0
last_updated: 2025-11-24
status: active
owners: ["backend", "ops"]
related: ["PerformanceScalability.md", "Architecture.md", "SecurityCompliance.md"]
description: Defines logging, metrics, and tracing foundations plus phased instrumentation and alert seeding roadmap.
---

# Observability & Logging

> @AI-HINT: Establishes baseline structured logging, correlation fields, planned metrics and tracing integration schedule, and alert conditions.

Establishes foundation for logs + metrics; tracing optional future.

## 1. Pillars
| Pillar | Current | Roadmap |
|--------|--------|---------|
| Logs | Structured JSON stdout | Central aggregation (future) |
| Metrics | Basic counters (custom) | OTEL exporter |
| Traces | None | OTEL spans (selected endpoints) |

## 2. Logging Format (JSON)
```json
{
  "ts":"2025-01-01T12:00:00Z",
  "level":"INFO",
  "msg":"proposal.created",
  "request_id":"uuid",
  "user_id":"uuid",
  "latency_ms":123
}
```

## 3. Correlation
| Field | Source | Notes |
|-------|--------|------|
| request_id | Middleware (uuid4) | Propagated in response header `X-Request-Id` |
| user_id | Auth context | Omit if anonymous |

## 4. Log Levels
| Level | Usage |
|-------|-------|
| DEBUG | Local only verbose detail |
| INFO | High-level lifecycle events |
| WARNING | Recoverable anomalies |
| ERROR | Failed operations needing attention |
| CRITICAL | Outage / data loss risk |

## 5. Sensitive Data Policy
Never log: passwords, raw tokens, wallet contents.

## 6. Metrics (Initial Set)
| Metric | Type | Description |
|--------|------|-------------|
| request_duration_seconds | Histogram | Endpoint latency |
| request_count_total | Counter | Requests per endpoint + status |
| db_query_time_ms | Histogram | (Wrap queries) |
| auth_failures_total | Counter | Failed authentication attempts |

## 7. Export Path
| Layer | Approach |
|-------|---------|
| Local dev | Console summary |
| Production minimal | `/metrics` internal (future) |
| Future external | OTLP to collector |

## 8. Alert Seeds (Future)
| Condition | Threshold |
|----------|-----------|
| Error rate | >2% of last 5m requests |
| Latency p95 | >800ms sustained 10m |
| Auth failures spike | >50 in 5m |

## 9. Time Synchronization
Rely on host NTP to ensure coherent timestamps.

## 10. Instrumentation Plan
| Phase | Action |
|-------|-------|
| P1 | Request timing middleware |
| P2 | DB query timing decorator |
| P3 | OTEL integration (export spans) |

## 11. Log Rotation (If File-Based Future)
| Concern | Mitigation |
|---------|-----------|
| Disk fill | Size-based rotate + compression |

## 12. Review Cadence
Monthly check: validate latency distribution & error rate anomaly detection thresholds still appropriate.

## 13. Cross References
| Topic | Doc |
|-------|-----|
| Performance budgets | `PerformanceScalability.md` |
| Security logging hygiene | `SecurityCompliance.md` |
| Architecture container boundaries | `Architecture.md` |

---
Observability evolves with scale; expand once baseline traffic justifies. Align additions with security and performance budgets.
