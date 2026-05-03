# Threat Model (Initial Pass)

Methodology: STRIDE-lite focusing on primary user flows & data assets.

## 1. Data Flow (High-Level)
User → (HTTPS planned) → Nginx → FastAPI → Oracle Autonomous DB

## 2. Assets & Entry Points
| Entry Point | Asset Touched | Auth Required |
|-------------|---------------|---------------|
| /auth/login | Credentials | No |
| /projects/* | Project data | Mixed |
| /proposals/* | Proposal data | Yes (role: freelancer) |
| /contracts/* | Contract data | Yes (involved party) |
| /reviews/* | Review data | Yes |

## 3. STRIDE Analysis (Condensed)
| Threat | Example | Impact | Mitigation (Current/Future) |
|--------|---------|--------|----------------------------|
| Spoofing | Fake auth token | Unauthorized access | JWT signature & expiry / add rotation |
| Tampering | Alter proposal payload | Data inconsistency | Pydantic validation / add schema versioning |
| Repudiation | User denies action | Forensic gap | Basic logging / add audit log |
| Information Disclosure | Token leak in logs | Credential misuse | No secret logging / add log scrubbing |
| Denial of Service | Flood auth endpoint | Resource exhaustion | Minimal now / add rate limiting |
| Elevation of Privilege | Role escalation | Data breach | Role check per endpoint / add defense-in-depth claims validation |

## 4. Abuse Cases
| Abuse | Vector | Mitigation |
|-------|--------|-----------|
| Brute force login | Credential stuffing | Add IP rate limit + exponential backoff |
| Spam proposals | Automated posting | Rate limiting per user |
| Review manipulation | Collusive accounts | Anomaly detection (future) |

## 5. Trust Boundaries
| Boundary | Rationale |
|----------|----------|
| Client ↔ Server | Untrusted client input sanitation |
| App ↔ DB | Parameterized queries only |
| Secret storage ↔ Code | Isolation via env + wallet permissions |

## 6. Prioritized Risks
| Risk | Priority | Reason |
|------|---------|--------|
| DoS on auth | High | Public, low complexity |
| Token theft | High | Direct account compromise |
| Brute force password | Medium | Common automated attack |

## 7. Mitigation Roadmap
| Phase | Control |
|-------|---------|
| P1 | HTTPS + HSTS |
| P1 | Argon2 hashing implementation |
| P2 | Rate limit middleware (auth + write endpoints) |
| P2 | Central audit log of security events |
| P3 | Suspicious behavior heuristics (login anomalies) |

## 8. Residual Risks
Certain low probability / low impact vectors deferred until scale (e.g., advanced fraud, large-scale scraping) given resource constraints.

## 9. Review Cadence
Quarterly or after major architectural change (e.g., adding payment subsystem).

---
Iterative model; update when new features or external integrations added.
