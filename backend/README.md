# MegiLance Backend (FastAPI)

This is the FastAPI backend for MegiLance. It provides a comprehensive API for the freelancing platform with AI-powered features and blockchain-based payments.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: Client and Freelancer profiles with role-based access
- **Projects**: Create, browse, and manage freelance projects
- **Proposals**: Submit and manage project proposals
- **Contracts**: Smart contract-based agreements (blockchain integration ready)
- **Payments**: Transaction tracking and USDC payment support
- **Portfolio**: Freelancer portfolio management
- **AWS Integration**: S3 for file uploads, RDS for database, Secrets Manager for credentials

## Structure

- `app/core/` — Configuration, security, AWS utilities
- `app/db/` — Database engine, session management, initialization
- `app/models/` — SQLAlchemy models (User, Project, Proposal, Contract, etc.)
- `app/schemas/` — Pydantic schemas for request/response validation
- `app/api/v1/` — API route handlers organized by resource
- `main.py` — Application factory, CORS, routes, startup initialization

## Environment

Copy `.env.example` to `.env` and configure variables:

```bash
# Core Settings
APP_NAME=MegiLance API
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/megilance_db

# Security
SECRET_KEY=your-secret-key-min-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# AWS (Production)
AWS_REGION=eu-central-1
S3_BUCKET_UPLOADS=megilance-prod-uploads
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
```

## Database

On startup, tables are created automatically (dev only). For production:
- Use Alembic for migrations
- Set up RDS PostgreSQL on AWS
- Configure connection pooling and SSL

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
