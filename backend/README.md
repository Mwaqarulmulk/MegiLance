# MegiLance Backend (FastAPI)

This is the FastAPI backend for MegiLance. It provides a comprehensive API for the freelancing platform with AI-powered features and blockchain-based payments.

> Updated to 2025 engineering standards. See `../docs/ENGINEERING_STANDARDS_2025.md` for global policies.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: Client and Freelancer profiles with role-based access
- **Projects**: Create, browse, and manage freelance projects
- **Proposals**: Submit and manage project proposals
- **Contracts**: Smart contract-based agreements (blockchain integration ready)
- **Payments**: Transaction tracking and USDC payment support
- **Portfolio**: Freelancer portfolio management
- **AWS Integration**: S3 for file uploads, RDS for database, Secrets Manager for credentials
- **AI & Machine Learning**:
  - **Hybrid Matching Engine**: Combines heuristic scoring with **Turso Native Vector Search** for semantic matching.
  - **Fraud Detection**: ML-based anomaly detection for transactions and behavior.
  - **Content Moderation**: Automated screening of job posts and messages.

## Structure

- `app/core/` — Configuration, security, AWS utilities
- `app/db/` — Database engine, session management, initialization
- `app/models/` — SQLAlchemy models (User, Project, Proposal, Contract, etc.)
- `app/schemas/` — Pydantic schemas for request/response validation
- `app/api/v1/` — API route handlers organized by resource
- `main.py` — Application factory, CORS, routes, startup initialization
- `scripts/maintenance/` — Data maintenance, migration & admin tooling (non-runtime)
- `tests/legacy/` — Historical / superseded test harnesses (kept for audit)

### Layering Model
```
Presentation (Routers) → Services (Business Logic) → Domain / Schemas → Persistence (DB Session / Repos)
```
Rules:
- Routers call services only (no inline business logic beyond orchestration).
- Services never import FastAPI objects (keep pure / testable).
- DB access isolated in repository/helper functions.
- Pydantic schemas split: request / response / internal (avoid leaking internal IDs unintentionally).

## Environment

Copy `.env.example` to `.env` and configure variables:

```bash
# Core Settings
APP_NAME=MegiLance API
ENVIRONMENT=development

# Database (REQUIRED - Turso Cloud Database)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Security
SECRET_KEY=your-secret-key-min-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# AWS (Production)
AWS_REGION=us-east-2
S3_BUCKET_UPLOADS=megilance-prod-uploads
SLOWAPI_ENABLED=true          # Toggle rate limiting
REQUEST_LOG_LEVEL=info        # Adjust verbosity (debug|info|warning|error)
FEATURE_FLAG_AI_MATCHING=true # Example feature flag
```

## Run Locally

**With Python:**
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**With Docker:**
```bash
docker build -t megilance-backend .
docker run --rm -p 8000:8000 --env-file .env megilance-backend
```

**Production (Gunicorn + Uvicorn workers):**
```bash
gunicorn -k uvicorn.workers.UvicornWorker main:app --workers 4 --bind 0.0.0.0:8000
```

## API Endpoints

### Health & Info
- `GET /` — Welcome message
- `GET /api` — API info
- `GET /api/health/live` — Liveness check
- `GET /api/health/ready` — Readiness check
- `GET /api/docs` — Swagger UI documentation
- `GET /api/redoc` — ReDoc documentation
- `GET /api/openapi.json` — OpenAPI 3.x spec (JSON, importable into Postman/Insomnia)
- `GET /api/health/metrics` — Metrics/telemetry (if enabled)

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive tokens
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/me` — Update current user profile

### Users (`/api/users`)
- `GET /api/users` — List all users (admin/authenticated)
- `POST /api/users` — Create user (admin)

### Projects (`/api/projects`)
- `GET /api/projects` — List projects (with filters: status, category, search)
- `GET /api/projects/{id}` — Get project details
- `POST /api/projects` — Create project (clients only)
- `PUT /api/projects/{id}` — Update project (owner only)
- `DELETE /api/projects/{id}` — Delete project (owner only)

### Proposals (`/api/proposals`)
- `GET /api/proposals` — List proposals (filtered by user role)
- `GET /api/proposals/{id}` — Get proposal details
- `POST /api/proposals` — Submit proposal (freelancers only)
- `PUT /api/proposals/{id}` — Update proposal (owner only, if submitted)
- `DELETE /api/proposals/{id}` — Delete proposal (owner only, if submitted)
- `POST /api/proposals/{id}/accept` — Accept proposal (client only)
- `POST /api/proposals/{id}/reject` — Reject proposal (client only)

### Contracts (`/api/contracts`)
- `GET /api/contracts` — List contracts (filtered by user)
- `GET /api/contracts/{id}` — Get contract details
- `POST /api/contracts` — Create contract (client only)
- `PUT /api/contracts/{id}` — Update contract (parties only)
- `DELETE /api/contracts/{id}` — Delete contract (client only)

### Portfolio (`/api/portfolio`)
- `GET /api/portfolio` — List portfolio items (by freelancer)
- `GET /api/portfolio/{id}` — Get portfolio item
- `POST /api/portfolio` — Create portfolio item (freelancers only)
- `PUT /api/portfolio/{id}` — Update portfolio item (owner only)
- `DELETE /api/portfolio/{id}` — Delete portfolio item (owner only)

### Payments (`/api/payments`)
- `GET /api/payments` — List payments (filtered by user)
- `GET /api/payments/{id}` — Get payment details
- `POST /api/payments` — Create payment record

## Testing

Run backend tests:
```bash
python -m pytest tests/
python -m pytest tests/test_auth.py -v
python comprehensive_test.py        # Canonical system smoke
```

## Database

On startup, tables are created automatically (dev only). For production:
- Use Alembic for migrations
- Set up RDS PostgreSQL on AWS
- Configure connection pooling and SSL
- Turso (libSQL) supported for edge deployment; see `../docs/TURSO_SETUP.md`.

## AWS Deployment

See [AWS Deployment Guide](../docs/AWS-Deployment.md) for:
- ECS Fargate setup
- RDS configuration
- S3 bucket policies
- Secrets Manager integration
- CloudWatch monitoring

## Notes

- All endpoints require authentication except `/api/health/*` and `/api/auth/register`
- Use `Authorization: Bearer <token>` header for authenticated requests
- Token refresh every 30 minutes (access) or 7 days (refresh)
- Role-based access: Client vs Freelancer permissions enforced
- AWS credentials managed via IAM roles in production (no hardcoded keys)

## Operational Standards
- **Rate Limiting**: Enabled via `SLOWAPI_ENABLED`; defaults ON in production.
- **Structured Logging**: See `ENGINEERING_STANDARDS_2025.md`; all logs include timestamp, level, module.
- **Observability**: Add Prometheus exporter or OpenTelemetry collector when scaling.
- **Error Format**: `{ "detail": string, "error_type": string }` for unhandled exceptions.

## Maintenance Scripts
Non-runtime scripts (data fixes, migrations, user/password audits) live in `scripts/maintenance/`. Run only with explicit intent and backups available.

Example:
```bash
python scripts/maintenance/verify_turso.py
python scripts/maintenance/create_all_tables.py
```

## Deprecation & Legacy
Legacy tests retained under `tests/legacy/`; new tests must target `tests/` with focused unit or integration coverage.

## Security & Compliance
- JWT secrets rotated every 90 days.
- Auth events logged (login, password reset, role change) — extend to external audit sink when required.
- Threat model updated quarterly (`../docs/ThreatModel.md`).

---
_Last updated: 2025-11-25_
