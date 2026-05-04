# Risk Register

Dynamic register tracking key project & operational risks.

| ID | Risk | Category | Likelihood | Impact | Rating | Mitigation | Owner | Status |
|----|------|----------|------------|--------|--------|------------|-------|--------|
| R1 | Auth endpoint brute force | Security | Medium | High | High | Add rate limiting, Argon2 hashing | Security Lead | Open |
| R2 | Memory exhaustion on micro VM | Performance | Medium | Medium | Medium | Monitor usage, optimize workers | Tech Lead | Open |
| R3 | Secret leakage via misconfig | Security | Low | High | Medium | Review .env handling, permission checks | DevOps | Open |
| R4 | SSH access failure (ops delay) | Operations | Medium | Medium | Medium | Console access fallback docs | DevOps | Mitigated |
| R5 | DB connection saturation | Performance | Low | Medium | Low | Tune pool size, observe metrics | Backend | Open |
| R6 | Incomplete logging for incidents | Observability | Medium | Medium | Medium | Implement structured logs + request_id | Backend | In Progress |
| R7 | Single VM SPOF | Availability | High | High | High | Scale out to second node (future) | Management | Accepted |
| R8 | Unvalidated input edge cases | Integrity | Medium | Medium | Medium | Strengthen Pydantic schemas | Backend | Open |
| R9 | Delay in applying security patches | Compliance | Low | High | Medium | Weekly dependency review | DevOps | Open |
| R10| Missing TLS (initial phase) | Security | High | High | High | Enable HTTPS + HSTS | DevOps | Open |

Rating heuristic: combine likelihood/impact (High if any High with >=Medium opposite).

Review cadence: monthly + on major feature release.

---
Update table row statuses as mitigations land.
