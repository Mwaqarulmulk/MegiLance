# MegiLance Backend (FastAPI)

This is the FastAPI backend for MegiLance. It provides APIs for health checks and users (seed endpoints), with PostgreSQL via SQLAlchemy.

## Structure

- `app/core/config.py` — settings via pydantic-settings
- `app/db/` — engine/session, base, and init_db
- `app/models/` — SQLAlchemy models (e.g., `User`)
- `app/schemas/` — Pydantic schemas
- `app/api/` — routers (health, users)
- `main.py` — app factory, CORS, routes, startup init

## Environment

Copy `.env.example` to `.env` and adjust variables as needed.

## Run (local)

- With Python:
  - Install deps: `pip install -r requirements.txt`
  - Start: `uvicorn main:app --reload --port 8000`

- With Docker:
  - `docker build -t megilance-backend .`
  - `docker run --rm -p 8000:8000 --env-file .env megilance-backend`

## Endpoints

- `GET /api/health/live` — liveness
- `GET /api/health/ready` — readiness
- `GET /api/users` — list users
- `POST /api/users` — create user `{ email: string, is_active?: boolean }`

## Notes

- On startup, tables are created automatically (dev only). For prod, consider Alembic migrations.
