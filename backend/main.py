# @AI-HINT: This is the main entry point for the MegiLance FastAPI backend.

import json
import logging
import mimetypes
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager

from app.api.routers import api_router
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.db.init_db import init_db
from app.db.session import get_engine
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

# Initialize Sentry for error tracking and performance monitoring
settings = get_settings()
if settings.sentry_dsn and settings.sentry_dsn != "":
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration

        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            traces_sample_rate=1.0 if settings.debug else 0.1,
            profiles_sample_rate=0.5,
            integrations=[
                StarletteIntegration(transaction_style="url"),
                FastApiIntegration(transaction_style="url"),
            ],
            send_default_pii=False,
        )
        logging.getLogger("megilance").info("sentry.initialized")
    except Exception as e:
        logging.getLogger("megilance").warning(f"sentry.init_failed: {e}")

# Track application start time for uptime reporting
_APP_START_TIME = time.time()


# Configure logging
class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            base["request_id"] = record.request_id
        if hasattr(record, "path"):
            base["path"] = record.path
        return json.dumps(base)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("megilance")
logger.setLevel(logging.INFO)
logger.handlers = [handler]
logger.propagate = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.turso_http import execute_query
    from app.db.turso_http_async import execute_query_async, AsyncTursoHTTP

    # Startup
    try:
        engine = get_engine()
        if engine is not None:
            init_db(engine)
            logger.info("startup.database_initialized")
        else:
            result = await execute_query_async("SELECT 1")
            if result:
                logger.info("startup.database_initialized via Turso HTTP API")
            else:
                logger.warning("startup.turso_http_test_failed")
        logger.info("startup.mongodb_disabled - using Turso/SQLite only")

        # Initialize persistent token blacklist table and cleanup expired entries
        try:
            from app.services.token_blacklist_service import init_token_blacklist

            init_token_blacklist()
            logger.info("startup.token_blacklist_initialized")
        except Exception as e:
            logger.warning(f"startup.token_blacklist_init_warning: {e}")

        # Ensure database indexes exist for common query patterns
        try:
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
                "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
                "CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)",
                "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)",
                "CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id)",
                "CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)",
                "CREATE INDEX IF NOT EXISTS idx_milestones_contract_id ON milestones(contract_id)",
                "CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)",
                "CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)",
            ]
            for idx_sql in indexes:
                try:
                    execute_query(idx_sql)
                except Exception as e:
                    logger.debug(f"startup.index_skip: {e}")
            logger.info("startup.indexes_ensured")
        except Exception as e:
            logger.warning(f"startup.indexes_warning: {e}")

        # Start background schedulers
        try:
            from app.services.escrow_autodial import start_escrow_scheduler

            start_escrow_scheduler()

            from app.services.milestone_deadline_loop import start_overdue_scheduler

            start_overdue_scheduler()
            logger.info("startup.escrow_scheduler_started")
        except Exception as e:
            logger.warning(f"startup.escrow_scheduler_warning: {e}")

        # Ensure wallet tables are initialized on startup (P0-9 / FIX-6)
        try:
            from app.services.wallet_service import ensure_wallet_tables

            ensure_wallet_tables()
            logger.info("startup.wallet_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.wallet_tables_warning: {e}")

        # Ensure contract acknowledgment columns exist (P0-4 / FIX-3)
        try:
            contract_cols = [
                ("freelancer_acknowledged", "INTEGER DEFAULT 0"),
                ("freelancer_acknowledged_at", "TEXT"),
            ]
            existing_res = execute_query("PRAGMA table_info(contracts)")
            existing_cols = set()
            if existing_res and existing_res.get("rows"):
                for row in existing_res["rows"]:
                    existing_cols.add(row[1]["value"])
            for col_name, col_type in contract_cols:
                if col_name not in existing_cols:
                    execute_query(f"ALTER TABLE contracts ADD COLUMN {col_name} {col_type}")
            logger.info("startup.contract_columns_ensured")
        except Exception as e:
            logger.warning(f"startup.contract_columns_warning: {e}")

        # Ensure milestone columns exist (submission_notes, approval_notes) (P0-3)
        try:
            milestone_cols = [
                ("submission_notes", "TEXT"),
                ("approval_notes", "TEXT"),
                ("rejection_notes", "TEXT"),
                ("deliverables", "TEXT"),
                ("submitted_at", "TEXT"),
                ("approved_at", "TEXT"),
            ]
            existing_res = execute_query("PRAGMA table_info(milestones)")
            existing_cols = set()
            if existing_res and existing_res.get("rows"):
                for row in existing_res["rows"]:
                    existing_cols.add(row[1]["value"])
            for col_name, col_type in milestone_cols:
                if col_name not in existing_cols:
                    execute_query(f"ALTER TABLE milestones ADD COLUMN {col_name} {col_type}")
            logger.info("startup.milestone_columns_ensured")
        except Exception as e:
            logger.warning(f"startup.milestone_columns_warning: {e}")

    except Exception as e:
        logger.error(f"startup.database_failed error={e}")
        # Always fail fast if DB is unreachable to prevent healthy-looking broken app
        raise RuntimeError("Database startup failed. Halting application.")
    yield
    # Shutdown — clean up caches and resources
    try:
        try:
            from app.services.escrow_autodial import stop_escrow_scheduler

            stop_escrow_scheduler()

            from app.services.milestone_deadline_loop import stop_overdue_scheduler

            stop_overdue_scheduler()
            logger.info("shutdown.escrow_scheduler_stopped")
        except Exception:
            pass

        with _idempotency_lock:
            _idempotency_cache.clear()
        from app.core.security import _user_cache, _user_cache_lock

        with _user_cache_lock:
            _user_cache.clear()
        logger.info("shutdown.caches_cleared")
    except Exception as e:
        logger.warning(f"shutdown.cleanup_warning: {e}")
    logger.info("shutdown.complete")


app = FastAPI(
    title="MegiLance API",
    description="""
    MegiLance Backend API

    AI-Powered Freelancing Platform connecting top talent with global opportunities.

    Key Features:
    - AI-Powered Freelancer Matching
    - Blockchain-Based Escrow Payments
    - Secure Authentication & Role Management
    - Real-time Messaging & Notifications
    - Gig Marketplace & Seller Tiers
    - Multi-Currency Payment Support
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    redirect_slashes=False,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# Bounded idempotency cache using OrderedDict for O(1) LRU eviction
import threading
from collections import OrderedDict

_IDEMPOTENCY_TTL = 3600  # 1 hour
_IDEMPOTENCY_MAX_SIZE = 5000
_idempotency_cache: OrderedDict[str, tuple[int, bytes, float]] = OrderedDict()
_idempotency_lock = threading.Lock()
_idempotency_evict_counter = [0]  # Mutable container for thread-safe atomic increment


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        start = time.time()

        # Idempotency key support for mutating requests
        idempotency_key = request.headers.get("X-Idempotency-Key")
        cache_key = None
        if idempotency_key and request.method in ("POST", "PUT", "PATCH"):
            cache_key = f"{request.method}:{request.url.path}:{idempotency_key}"
            with _idempotency_lock:
                cached = _idempotency_cache.get(cache_key)
                if cached:
                    cached_status, body_bytes, cached_at = cached
                    if time.time() - cached_at < _IDEMPOTENCY_TTL:
                        _idempotency_cache.move_to_end(cache_key)
                        response = Response(
                            content=body_bytes,
                            status_code=cached_status,
                            media_type="application/json",
                        )
                        response.headers["X-Request-Id"] = request_id
                        response.headers["X-Idempotent-Replayed"] = "true"
                        return response
                    else:
                        del _idempotency_cache[cache_key]

        response = None
        try:
            response = await call_next(request)

            # Idempotency write-back: cache response body so duplicate requests get the same reply
            if cache_key is not None:
                chunks = []
                async for chunk in response.body_iterator:
                    chunks.append(chunk)
                body_bytes = b"".join(chunks)
                with _idempotency_lock:
                    _idempotency_cache[cache_key] = (
                        response.status_code,
                        body_bytes,
                        time.time(),
                    )
                    _idempotency_cache.move_to_end(cache_key)
                # Rebuild the response since we fully consumed body_iterator
                orig_headers = {
                    k: v
                    for k, v in response.headers.items()
                    if k.lower() not in ("content-length", "transfer-encoding")
                }
                response = Response(
                    content=body_bytes,
                    status_code=response.status_code,
                    headers=orig_headers,
                )

            return response
        finally:
            duration_ms = int((time.time() - start) * 1000)
            client_ip = request.headers.get("X-Forwarded-For", "").split(",")[
                0
            ].strip() or (request.client.host if request.client else "unknown")
            extra = logging.LoggerAdapter(
                logger, {"request_id": request_id, "path": request.url.path}
            )
            status_code = response.status_code if response else "error"
            extra.info(
                f"request.complete method={request.method} path={request.url.path} duration_ms={duration_ms} status={status_code} client_ip={client_ip}"
            )
            if response is not None:
                response.headers["X-Request-Id"] = request_id
                response.headers["X-Response-Time"] = f"{duration_ms}ms"

            # Periodic eviction (thread-safe): every 100 requests
            with _idempotency_lock:
                _idempotency_evict_counter[0] += 1
                if _idempotency_evict_counter[0] >= 100:
                    _idempotency_evict_counter[0] = 0
                    now = time.time()
                    # Remove expired from front (oldest first in OrderedDict)
                    while _idempotency_cache:
                        key, (_, _, ts) = next(iter(_idempotency_cache.items()))
                        if now - ts > _IDEMPOTENCY_TTL:
                            _idempotency_cache.popitem(last=False)
                        else:
                            break
                    # Hard cap
                    while len(_idempotency_cache) > _IDEMPOTENCY_MAX_SIZE:
                        _idempotency_cache.popitem(last=False)


app.add_middleware(RequestIDMiddleware)

# Configure CORS - restrict in production
cors_origins = settings.backend_cors_origins
if settings.environment == "production":
    if "*" in cors_origins:
        logger.warning(
            "SECURITY: CORS wildcard (*) detected in production - restricting to localhost only"
        )
        cors_origins = ["http://localhost:3000"]  # Force safe default
    elif not cors_origins:
        logger.error("CRITICAL: No CORS origins configured in production")
        raise ValueError("CORS origins must be explicitly configured in production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Idempotency-Key",
        "X-Request-Id",
    ],  # Restrict headers
    expose_headers=[
        "X-Request-Id",
        "X-Total-Count",
        "X-Response-Time",
        "X-Idempotent-Replayed",
    ],
    max_age=3600,
)


# Add security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # Allow Swagger UI CDN resources for API docs
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastapi.tiangolo.com"
        )
        # Note: Cookie security flags (Secure, HttpOnly, SameSite) should be set
        # on individual set_cookie() calls, not as a blanket header override.
        return response


app.add_middleware(SecurityHeadersMiddleware)

# GZip compression for responses > 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)


# Request body size limit middleware (10MB default)
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    MAX_BODY_SIZE = 10 * 1024 * 1024  # 10MB

    async def dispatch(self, request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={
                    "detail": "Request body too large. Maximum size is 10MB.",
                    "error_type": "PayloadTooLarge",
                },
            )
        return await call_next(request)


app.add_middleware(RequestSizeLimitMiddleware)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    request_id = request.headers.get("X-Request-Id", "")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_type": "HTTPException",
            "status_code": exc.status_code,
            "request_id": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Return human-readable validation errors with field paths."""
    request_id = request.headers.get("X-Request-Id", "")
    errors = []
    for err in exc.errors():
        field = " → ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        errors.append(
            {
                "field": field or "unknown",
                "message": err.get("msg", "Validation error"),
                "type": err.get("type", "value_error"),
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "detail": f"{len(errors)} validation error(s)",
            "error_type": "ValidationError",
            "errors": errors,
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    import traceback

    request_id = request.headers.get("X-Request-Id", "")
    error_details = traceback.format_exc()
    logger.error(
        f"unhandled_exception type={type(exc).__name__} message={str(exc)} request_id={request_id} traceback={error_details.replace(chr(10), ' | ')}"
    )

    # SECURITY: Never expose internal error details in production
    if settings.environment == "production":
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal server error occurred. Please try again later.",
                "error_type": "InternalError",
                "request_id": request_id,
            },
        )

    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc)[:200],  # Limit error detail length even in dev
            "error_type": type(exc).__name__,
            "request_id": request_id,
        },
    )


@app.get("/api")
def api_root():
    return {
        "message": "MegiLance API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
    }


@app.get("/api/v1/health")
@app.head("/api/v1/health")
@app.get("/health")
@app.head("/health")
async def do_health_check():
    return {"status": "ok"}


@app.get("/api/v1/health/live")
def health_live():
    return {
        "status": "ok",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.get("/api/v1/health/ready")
def health_ready():
    engine = get_engine()
    uptime_seconds = int(time.time() - _APP_START_TIME)
    base_info = {
        "version": "2.0.0",
        "environment": settings.environment,
        "uptime_seconds": uptime_seconds,
        "python_version": sys.version.split()[0],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    status_dict = {"status": "ready", "db": "ok", "components": {}}

    try:
        # Check Database
        if engine is not None:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            status_dict["components"]["db"] = "ok"
            status_dict["driver"] = "sqlalchemy"
        else:
            # Using Turso HTTP API
            from app.db.turso_http import execute_query

            result = execute_query("SELECT 1")
            if result is not None:
                status_dict["components"]["db"] = "ok"
                status_dict["driver"] = "turso_http"
            else:
                raise Exception("Turso HTTP query returned None")

        # Check External Storage Integration (S3/Cloudflare R2)
        if getattr(settings, "aws_access_key_id", None) and getattr(
            settings, "aws_bucket_name", None
        ):
            status_dict["components"]["storage"] = "configured"
        elif getattr(settings, "upload_dir", None):
            status_dict["components"]["storage"] = "local"
        else:
            status_dict["components"]["storage"] = "missing_configuration"

        # Check SMTP configuration
        if getattr(settings, "SMTP_USER", None) or getattr(settings, "RESEND_API_KEY", None):
            status_dict["components"]["email"] = "configured"
        else:
            status_dict["components"]["email"] = "missing_configuration"

        status_dict.update(base_info)
        return status_dict

    except Exception as e:
        logger.error(f"health.ready_failed error={e}")
        # SECURITY: Don't leak database error details in production
        error_detail = (
            str(e)
            if settings.environment != "production"
            else "Database connection failed"
        )
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "db_error": error_detail, **base_info},
        )


@app.get("/api/v1/health/metrics")
def health_metrics():
    """Operational metrics endpoint for monitoring."""
    uptime_seconds = int(time.time() - _APP_START_TIME)
    with _idempotency_lock:
        idempotency_cache_size = len(_idempotency_cache)
    try:
        from app.core.security import _user_cache, _user_cache_lock

        with _user_cache_lock:
            user_cache_size = len(_user_cache)
    except Exception:
        user_cache_size = -1
    return {
        "uptime_seconds": uptime_seconds,
        "idempotency_cache_size": idempotency_cache_size,
        "user_cache_size": user_cache_size,
        "inflight_requests_dedup": 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


from pathlib import Path

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Backward compatibility: expose endpoints on both /api and /api/v1.
# Many existing clients/tests (and some frontend paths) still call /api/*.
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")

# Mount Socket.IO ASGI app for real-time features (chat, notifications, presence)
# IMPORTANT: Must be mounted AFTER include_router so HTTP routes take priority.
try:
    from app.core.websocket import socket_app

    app.mount("/socket.io", socket_app)
    logger.info("startup.socketio_mounted at /socket.io")
except Exception as _sio_err:
    logger.warning(f"startup.socketio_mount_failed: {_sio_err}")
    logger.warning("Real-time WebSocket features will not work until this is resolved")

# Upload directory setup
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

_UPLOADS_BASE = Path(uploads_dir).resolve()
_INLINE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.get("/uploads/{file_path:path}")
async def serve_upload(file_path: str):
    """Serve uploaded files with proper Content-Disposition and security headers."""
    resolved = (_UPLOADS_BASE / file_path).resolve()
    # Prevent path traversal — use is_relative_to for cross-platform safety
    try:
        resolved.relative_to(_UPLOADS_BASE)
    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
    if not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    content_type, _ = mimetypes.guess_type(str(resolved))
    content_type = content_type or "application/octet-stream"

    # Images render inline; everything else forces download
    if content_type in _INLINE_MIME_TYPES:
        disposition = "inline"
    else:
        disposition = "attachment"

    return FileResponse(
        path=str(resolved),
        media_type=content_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{resolved.name}"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
