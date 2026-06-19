# @AI-HINT: System Status router — real-time health and API endpoint status for /system-status page
import os
import time
from datetime import datetime, timezone

from fastapi import APIRouter

from app.db.turso_http import execute_query

router = APIRouter()

# Track app start time for uptime calculation
_APP_START_TIME = time.time()


def _check_storage() -> dict:
    """Check external storage (S3/R2) or local storage configuration."""
    try:
        from app.core.config import settings

        if getattr(settings, "aws_access_key_id", None) and getattr(
            settings, "aws_bucket_name", None
        ):
            return {
                "name": "File Storage (S3/R2)",
                "healthy": True,
                "message": "Cloud storage configured",
                "response_time_ms": 0,
            }
        elif getattr(settings, "upload_dir", None):
            return {
                "name": "File Storage (Local)",
                "healthy": True,
                "message": "Local storage configured",
                "response_time_ms": 0,
            }
        else:
            return {
                "name": "File Storage",
                "healthy": False,
                "message": "Not configured",
                "response_time_ms": 0,
            }
    except Exception as exc:
        return {
            "name": "File Storage",
            "healthy": False,
            "message": f"Check failed: {type(exc).__name__}",
            "response_time_ms": 0,
        }


def _check_email() -> dict:
    """Check email service (SMTP or Resend) configuration."""
    try:
        from app.core.config import settings

        if getattr(settings, "RESEND_API_KEY", None):
            return {
                "name": "Email Service (Resend)",
                "healthy": True,
                "message": "Resend API configured",
                "response_time_ms": 0,
            }
        elif getattr(settings, "SMTP_USER", None):
            return {
                "name": "Email Service (SMTP)",
                "healthy": True,
                "message": "SMTP configured",
                "response_time_ms": 0,
            }
        else:
            return {
                "name": "Email Service",
                "healthy": False,
                "message": "Not configured",
                "response_time_ms": 0,
            }
    except Exception as exc:
        return {
            "name": "Email Service",
            "healthy": False,
            "message": f"Check failed: {type(exc).__name__}",
            "response_time_ms": 0,
        }


def _check_database() -> dict:
    start = time.perf_counter()
    try:
        execute_query("SELECT 1 as ok", [])
        elapsed = round((time.perf_counter() - start) * 1000, 1)
        return {
            "name": "Database (Turso)",
            "healthy": True,
            "message": "Connected",
            "response_time_ms": elapsed,
        }
    except Exception as exc:  # pragma: no cover - defensive
        elapsed = round((time.perf_counter() - start) * 1000, 1)
        return {
            "name": "Database (Turso)",
            "healthy": False,
            "message": f"Unavailable: {type(exc).__name__}",
            "response_time_ms": elapsed,
        }


def _check_llm_gateway() -> dict:
    import os

    configured = bool(
        os.getenv("DO_AI_API_KEY")
        or os.getenv("ANTHROPIC_API_KEY")
        or os.getenv("OPENAI_API_KEY")
    )
    return {
        "name": "LLM Gateway",
        "healthy": configured,
        "message": "Configured" if configured else "Not configured",
        "response_time_ms": 0,
    }


AI_SERVICE_ENDPOINTS = [
    {"endpoint": "/api/v1/ai/chat", "method": "POST", "auth": True},
    {"endpoint": "/api/v1/matching/advise-me", "method": "POST", "auth": True},
    {"endpoint": "/api/v1/fraud-detection/analyze", "method": "POST", "auth": True},
    {"endpoint": "/api/v1/ai-matching/recommend", "method": "GET", "auth": True},
]

PUBLIC_TOOL_ENDPOINTS = [
    {"endpoint": "/api/v1/price-estimator/estimate", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/invoice-generator", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/income-calculator", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/expense-tax-calculator", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/ai-writing/cover-letter", "method": "POST", "auth": False},
]

CHATBOT_ENDPOINTS = [
    {"endpoint": "/api/v1/ai/chat", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/ai/chat/{conversation_id}/feedback", "method": "POST", "auth": True},
]

CORE_ENDPOINTS = [
    {"endpoint": "/api/v1/auth/login", "method": "POST", "auth": False},
    {"endpoint": "/api/v1/projects", "method": "GET", "auth": False},
    {"endpoint": "/api/v1/contracts", "method": "GET", "auth": True},
    {"endpoint": "/api/v1/invoices", "method": "GET", "auth": True},
    {"endpoint": "/api/v1/health/ready", "method": "GET", "auth": False},
]


@router.get("/full")
async def status_full():
    """Aggregate health snapshot consumed by the public /system-status page."""
    database = _check_database()
    llm_gateway = _check_llm_gateway()
    storage = _check_storage()
    email = _check_email()

    critical_healthy = database["healthy"]
    ai_available = llm_gateway["healthy"]
    storage_healthy = storage["healthy"]
    email_healthy = email["healthy"]

    # System is healthy only if all critical services are up
    # Degraded if non-critical services (storage/email) are down
    # Offline if database is down
    if not critical_healthy:
        system_status = "offline"
    elif not ai_available or not storage_healthy or not email_healthy:
        system_status = "degraded"
    else:
        system_status = "healthy"

    # Calculate uptime
    uptime_seconds = int(time.time() - _APP_START_TIME)
    days = uptime_seconds // 86400
    hours = (uptime_seconds % 86400) // 3600
    minutes = (uptime_seconds % 3600) // 60
    if days > 0:
        uptime_display = f"{days}d {hours}h {minutes}m"
    elif hours > 0:
        uptime_display = f"{hours}h {minutes}m"
    else:
        uptime_display = f"{minutes}m"

    endpoints = {
        "ai_services": AI_SERVICE_ENDPOINTS,
        "public_tools": PUBLIC_TOOL_ENDPOINTS,
        "chatbot": CHATBOT_ENDPOINTS,
        "core": CORE_ENDPOINTS,
    }

    total = sum(len(v) for v in endpoints.values())

    # Get environment info
    try:
        from app.core.config import settings
        environment = getattr(settings, "environment", "unknown")
    except Exception:
        environment = "unknown"

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "system_status": system_status,
        "version": "2.0",
        "environment": environment,
        "uptime": {
            "seconds": uptime_seconds,
            "display": uptime_display,
        },
        "services": {
            "database": database,
            "llm_gateway": llm_gateway,
            "storage": storage,
            "email": email,
        },
        "summary": {
            "critical_services_healthy": critical_healthy,
            "ai_services_available": ai_available,
            "storage_available": storage_healthy,
            "email_available": email_healthy,
            "total_endpoints": total,
            "ai_endpoints_count": len(AI_SERVICE_ENDPOINTS),
            "public_tools_count": len(PUBLIC_TOOL_ENDPOINTS),
            "chatbot_endpoints_count": len(CHATBOT_ENDPOINTS),
            "core_endpoints_count": len(CORE_ENDPOINTS),
        },
        "endpoints": endpoints,
        "api_documentation": "/docs",
        "health_check": "/api/v1/health/ready",
    }
