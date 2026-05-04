# Environment & Configuration Guide

Covers development, staging (future), and production (Oracle VM + DigitalOcean Frontend). Emphasizes 12‑Factor App principles.

## 1. Environment Matrix
| Aspect | Development | Production Backend (Oracle VM) | Production Frontend (DigitalOcean) |
|--------|------------|--------------------------------|------------------------------------|
| Source sync | Local git | Git pull via webhook | Git repo auto-build |
| Python runtime | 3.11 local | 3.11 container | N/A (Node 18 build → static) |
| Node runtime | 18+ local | Build step only (CI disabled) | DigitalOcean build image |
| DB | Autonomous DB 23ai (shared) | Same instance (separate schema/user optional) | API consumption only |
| Logging | Console verbose | Structured JSON (stdout) | Browser console + DO logs |
| Secrets | .env (excluded from VCS) | Injected via .env.production (secure copy) | DO App vars panel |
| TLS | Optional (localhost) | Nginx reverse proxy + future certbot | Managed cert (DO) |

## 2. Configuration Variable Catalog
| Key | Scope | Description | Example | Secret |
|-----|-------|-------------|---------|--------|
| APP_ENV | all | Environment label | development | No |
| API_PORT | backend | Uvicorn listen port | 8000 | No |
| ORACLE_DSN | backend | EZConnect or TNS alias | mlprod_high | No |
| ORACLE_USER | backend | DB username | ML_APP | Yes |
| ORACLE_PASSWORD | backend | DB password | (redacted) | Yes |
| JWT_SECRET | backend | Signing key | (redacted) | Yes |
| JWT_ACCESS_TTL_MIN | backend | Access token minutes | 30 | No |
| JWT_REFRESH_TTL_DAYS | backend | Refresh token days | 7 | No |
| LOG_LEVEL | backend | Logging verbosity | INFO | No |
| FRONTEND_ORIGIN | backend | CORS allowlist | https://app.example.com | No |
| WALLET_DIR | backend | Oracle wallet path | /wallet | No |
| NEXT_PUBLIC_API_BASE | frontend | Browser API base path | /backend | No |

## 3. Secrets Handling Policy
| Principle | Implementation |
|-----------|----------------|
| No secrets in VCS | .env*, wallet excluded / gitignore (verify) |
| Principle of least privilege | Separate DB user with minimal grants |
| Rotation readiness | Centralize secrets in one mounted file |
| Transport security | SSH + (future) HTTPS for all endpoints |

## 4. File Layout (Backend Container)
```
/app
  backend/
  wallet/ (mounted, read-only perms 500)
  .env.runtime (combined resolved vars)
```

## 5. Configuration Resolution Order
1. Container runtime environment variables
2. `.env.production` (loaded if present)
3. Defaults embedded in `settings.py` (add this module)

Later sources override earlier ones.

## 6. Local Development Workflow
| Step | Action |
|------|--------|
| Install | `pip install -r requirements.txt` |
| Run backend | `uvicorn main:app --reload` |
| Run frontend | `npm run dev` |
| Use wallet | Copy wallet dir under `backend/wallet/` (avoid commit) |

## 7. Production Deployment Variable Injection
| Phase | Method |
|-------|-------|
| Initial provisioning | Secure copy `.env.production` + wallet to VM |
| Update secret | Edit local encrypted store → re‑scp file → restart container |
| Webhook redeploy | Pulls code only; secrets persist |

## 8. Planned Staging Environment
| Goal | Detail |
|------|-------|
| Isolation | Separate Oracle schema or free-tier clone |
| Data | Synthetic anonymized fixtures |
| Testing | Load & regression prior to prod redeploy |

## 9. Observability Config (Preview)
| Variable | Purpose | Planned Values |
|----------|---------|----------------|
| OTEL_EXPORTER_OTLP_ENDPOINT | Traces export | Future collector URL |
| METRICS_ENABLED | Toggle metrics | true/false |
| LOG_FORMAT | Log layout | json/text |

## 10. Risk & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Secret leakage via logs | High | Never log raw credentials |
| Wallet permission mis-set | Medium | Enforce chmod 500 + owner root |
| Inconsistent CORS | Medium | Explicit allowlist FRONTEND_ORIGIN |
| Clock drift | Token invalidation | NTP package / host sync |

## 11. Change Management
- Every new variable documented here (PR checklist item)
- Semantic version bump when config breaking changes occur

## 12. Hardening Roadmap
| Stage | Control |
|-------|---------|
| Short term | Enforce HTTPS, restrict SSH by IP |
| Mid term | Vault-managed secrets (HashiCorp / OCI Vault) |
| Long term | Dynamic short-lived DB credentials via proxy |

---
Prepared under 12‑Factor App and OWASP ASVS configuration management guidance.
