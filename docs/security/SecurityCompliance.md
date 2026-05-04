---
title: Security & Compliance Overview
doc_version: 1.0.0
last_updated: 2025-11-24
status: active
owners: ["security", "backend"]
related: ["Architecture.md", "API_Overview.md", "Observability.md"]
description: Summarizes security posture, mapped controls, threat surface, policies, and prioritized roadmap aligned to OWASP & future ISO governance.
---

# Security & Compliance Overview

> @AI-HINT: Captures current security controls, gaps, and roadmap aligned with OWASP ASVS and Top 10; guides incremental hardening and compliance evolution.

Baseline aligned with OWASP ASVS (selected controls), OWASP Top 10 2021, and preparation for future ISO 27001 style governance.

## 1. Scope & Assets
| Asset | Classification | Notes |
|-------|---------------|-------|
| Source Code | Internal | Public portions (frontend) distinct from backend private logic |
| User Accounts (PII: email) | Confidential | Minimal PII stored |
| Credentials (JWT secrets, DB password) | Secret | Rotate & never commit |
| Turso Auth Token | Secret | Stored in env var; rotate & restrict scope |

## 2. Threat Surface Summary
| Vector | Risk | Current Control | Roadmap |
|--------|------|----------------|---------|
| Auth endpoints | Credential stuffing | Rate limit (future), strong hashing | Add IP based throttling |
| JWT theft | Session hijack | HTTPS (future), httpOnly tokens if cookies used | Token binding / rotation |
| SQL access | Injection | Parameterized queries via ORM | Static analysis |
| Config secrets | Leakage | .env excluded from VCS | Sealed secret store |
| DoS (resource exhaustion) | Availability | Single worker limit | Add proxy rate limits |
| XSS (frontend) | Data integrity | React auto-escaping | CSP headers |

## 3. Control Mapping (Sample)
| OWASP ASVS Area | Implemented | Gap Action |
|-----------------|------------|-----------|
| V2 Auth | Password hashing planned (Argon2) | Add brute force delay |
| V3 Session Mgmt | JWT stateless tokens | Add refresh rotation strategy |
| V5 Validation | Pydantic schema validation | Centralize custom sanitizers |
| V9 Data Protection | Wallet secured, secrets external | Add secret rotation guide |
| V10 Communications | Planned HTTPS | Enforce HSTS once TLS live |

## 4. Password & Credential Policy
| Item | Policy |
|------|--------|
| Hashing | Argon2id (memory cost tuned for 1GB) |
| Minimum length | 12 characters (enforced client & server) |
| Secret rotation | Manual on compromise; future scheduled rotation |

## 5. Logging & Privacy
| Aspect | Approach |
|--------|---------|
| PII logging | Avoid storing email in error contexts |
| Sensitive tokens | Never logged; filter middleware (planned) |
| Audit trail | Minimal (auth events) – extend later |

## 6. Secure Configuration Checklist (Backend Container)
| Check | Command / Verification |
|-------|-----------------------|
| Turso token scope | Validate token permissions (read/write) |
| No secrets in image | `docker history` review build layers |
| Running user (future) | Use non-root base image |

## 7. API Hardening (Planned)
| Control | Rationale |
|---------|-----------|
| Rate limiting | Prevent brute force & abuse |
| Input size caps | Prevent payload exhaustion |
| CORS strict allowlist | Limit origin access |
| Security headers | X-Content-Type-Options, X-Frame-Options, CSP |

## 8. Incident Response (Initial Playbook)
| Phase | Action |
|-------|--------|
| Detect | Monitor logs for anomalies (error spikes) |
| Contain | Revoke suspect credentials, block IP range |
| Eradicate | Patch vulnerability and redeploy |
| Recover | Validate health endpoints + manual functional test |
| Post-mortem | Document root cause & corrective actions |

## 9. Data Protection & Retention
| Data | Protection | Retention |
|------|-----------|-----------|
| Credentials | Strong hashing / env secrets | Until user deletion |
| Reviews | Non-sensitive | Indefinite (soft delete future) |

## 10. Roadmap Priorities
| Priority | Control |
|----------|---------|
| P1 | Enforce HTTPS & HSTS |
| P1 | Argon2 password hashing integration |
| P2 | Rate limiting middleware |
| P2 | Security headers via Nginx |
| P3 | Centralized secret rotation doc |
| P3 | Basic WAF/CDN front layer |

## 11. Environment Variable Governance
| Category | Example | Policy |
|----------|---------|--------|
| Secrets | `JWT_SECRET`, DB password | Never committed; rotate on compromise |
| Feature flags | `FEATURE_FLAG_AI_MATCHING` | Default off; documented before enable |
| Security toggles | `SLOWAPI_ENABLED` | Must default to secure posture (enabled) |

## 12. Rate Limiting Status
App-level rate limiting middleware present (auth endpoints priority). Nginx layer limits PLANNED for defense-in-depth.

## 13. Review Cadence
Security posture review monthly; full threat model revision quarterly or post major feature (payments, messaging) deployment.

---
Living document – update after each security-relevant change. Cross-check with `Observability.md` for logging hygiene and `Architecture.md` for container isolation strategy.
