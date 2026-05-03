---
title: Configuration & Environment Variables
+doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["backend", "ops"]
related: ["Architecture.md", "SecurityCompliance.md", "TURSO_SETUP.md"]
description: Canonical list of required and optional environment variables for all services.
---

# Configuration & Environment Variables

> @AI-HINT: Central source for environment-driven configuration (backend & frontend) with required/optional flags.

## 1. Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| TURSO_DATABASE_URL | Turso libSQL endpoint | libsql://megilance-xyz.turso.io |
| TURSO_AUTH_TOKEN | Auth token for Turso | sk_turso_... |
| JWT_SECRET | HMAC secret for JWT signing | (32+ chars) |
| LOG_LEVEL | Logging verbosity | INFO |

## 2. Backend Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| SLOWAPI_ENABLED | Enable rate limiting | true |
| FEATURE_FLAG_AI_MATCHING | Toggle AI matching features | false |
| FILE_STORAGE_MODE | local or object (future) | local |
| REQUEST_ID_HEADER | Custom request id header name | X-Request-Id |

## 3. Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_BACKEND_URL | Base URL for API calls | https://api.megilance.com |
| NEXT_PUBLIC_ENABLE_ANALYTICS | Toggle analytics code | false |
| NEXT_PUBLIC_ENV_NAME | Display environment badge | dev |

## 4. Local Dev `.env` Sample
```
TURSO_DATABASE_URL=libsql://megilance-dev.turso.io
TURSO_AUTH_TOKEN=sk_turso_dev_...
JWT_SECRET=local_dev_secret_change_me
LOG_LEVEL=DEBUG
SLOWAPI_ENABLED=true
FEATURE_FLAG_AI_MATCHING=false
FILE_STORAGE_MODE=local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ENV_NAME=dev
```

## 5. Security Notes
| Concern | Control |
|---------|---------|
| Secret leakage | `.env` excluded from git; use vault/secret manager in prod |
| Token rotation | Rotate Turso & JWT secrets every 90 days |
| Principle of least privilege | Limit Turso token scope to required operations |

## 6. Migration Cleanup
Oracle wallet & related env vars removed post Turso migration. AWS RDS variables retained only in deprecated AWS guide.

## 7. Update Process
1. Add variable with clear name & purpose.
2. Update this file and reference in relevant docs (Architecture, SecurityCompliance).
3. Provide fallback defaults in config module (do not hardcode secrets).
4. Re-run comprehensive tests.

---
Align variable usage with Security & Engineering Standards. Keep this file in sync with runtime config.
