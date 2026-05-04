# Services Layer

> @AI-HINT: Business logic layer — pure Python, no FastAPI imports

## Pattern

- **Routers** (`api/v1/`) handle HTTP concerns (request parsing, auth dependencies, responses)
- **Services** (`services/`) contain **pure business logic** — no `Request`, `Response`, or `Depends`
- Services receive plain Python arguments and return dicts / raise exceptions
- Routers call services; services call the database via `turso_http`

## Key Services

| Service | Purpose |
|---------|---------|
| `auth_service.py` | Registration, login, token management, 2FA |
| `users_service.py` | Profile CRUD, search, notification preferences |
| `contracts_service.py` | Contract lifecycle, status transitions |
| `proposals_service.py` | Proposal CRUD, accept/reject flow |
| `escrow_service.py` | Escrow holds, releases, refunds |
| `invoices_service.py` | Invoice generation and management |
| `wallet_service.py` | Balance operations, transaction history |
| `db_utils.py` | Shared DB helpers (`get_user_role`, `execute_query`) |

## Conventions

- One service file per domain (mirrors the router file)
- Service functions are `def` (sync) — Turso HTTP client is synchronous
- Errors are raised as `HTTPException` or plain `ValueError` (routers catch and map)
- Database access uses `execute_query()` from `db_utils.py` (raw SQL via Turso HTTP)
