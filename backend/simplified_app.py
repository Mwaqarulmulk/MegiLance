# Simplified FastAPI application for MegiLance Backend
import logging
import json
import time
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

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
        return json.dumps(base)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("megilance")
logger.setLevel(logging.INFO)
logger.handlers = [handler]
logger.propagate = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("startup.complete")
    yield
    # Shutdown
    logger.info("shutdown.complete")

app = FastAPI(
    title="MegiLance API",
    description="MegiLance Backend API - AI-Powered Freelancing Platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    redirect_slashes=False
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Idempotency-Key", "X-Request-Id"],
    expose_headers=["X-Request-Id", "X-Total-Count", "X-Response-Time", "X-Idempotent-Replayed"],
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
        # Allow Swagger UI CDN resources for API docs
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastapi.tiangolo.com"
        return response

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=500)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_type": "HTTPException",
            "status_code": exc.status_code,
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Return human-readable validation errors with field paths."""
    errors = []
    for err in exc.errors():
        field = " → ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        errors.append({
            "field": field or "unknown",
            "message": err.get("msg", "Validation error"),
            "type": err.get("type", "value_error"),
        })

    return JSONResponse(
        status_code=422,
        content={
            "detail": f"{len(errors)} validation error(s)",
            "error_type": "ValidationError",
            "errors": errors,
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    import traceback
    error_details = traceback.format_exc()
    logger.error(f"unhandled_exception type={type(exc).__name__} message={str(exc)} traceback={error_details.replace(chr(10), ' | ')}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "error_type": type(exc).__name__,
        }
    )

@app.get("/")
def root():
    return {"message": "Welcome to the MegiLance API!", "version": "2.0.0"}

@app.get("/api")
def api_root():
    return {
        "message": "MegiLance API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }

@app.get("/api/health/live")
def health_live():
    return {"status": "ok", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}

@app.get("/api/health/ready")
def health_ready():
    uptime_seconds = int(time.time() - _APP_START_TIME)
    base_info = {
        "version": "2.0.0",
        "environment": "development",
        "uptime_seconds": uptime_seconds,
        "python_version": sys.version.split()[0],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    
    status_dict = {"status": "ready", "db": "ok", "components": {}}
    status_dict["components"]["db"] = "ok (using SQLite for development)"
    status_dict.update(base_info)
    return status_dict

@app.get("/api/health/metrics")
def health_metrics():
    """Operational metrics endpoint for monitoring."""
    uptime_seconds = int(time.time() - _APP_START_TIME)
    return {
        "uptime_seconds": uptime_seconds,
        "idempotency_cache_size": 0,
        "user_cache_size": 0,
        "inflight_requests_dedup": 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

# Sample API endpoints for testing
@app.get("/api/v1/users")
def get_users():
    """Sample endpoint - returns mock users data"""
    return [
        {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "client"},
        {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "freelancer"}
    ]

@app.get("/api/v1/projects")
def get_projects():
    """Sample endpoint - returns mock projects data"""
    return [
        {"id": 1, "title": "Website Redesign", "status": "open", "client_id": 1},
        {"id": 2, "title": "Mobile App Development", "status": "in_progress", "client_id": 1}
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")