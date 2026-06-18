# @AI-HINT: System Status router — real-time health and API endpoint status for /system-status page
import time
from datetime import datetime, timezone

from fastapi import APIRouter

from app.db.turso_http import execute_query

router = APIRouter()


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

    critical_healthy = database["healthy"]
    ai_available = llm_gateway["healthy"]

    if critical_healthy and ai_available:
        system_status = "healthy"
    elif critical_healthy:
        system_status = "degraded"
    else:
        system_status = "offline"

    endpoints = {
        "ai_services": AI_SERVICE_ENDPOINTS,
        "public_tools": PUBLIC_TOOL_ENDPOINTS,
        "chatbot": CHATBOT_ENDPOINTS,
        "core": CORE_ENDPOINTS,
    }

    total = sum(len(v) for v in endpoints.values())

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "system_status": system_status,
        "version": "2.0",
        "services": {
            "database": database,
            "llm_gateway": llm_gateway,
        },
        "summary": {
            "critical_services_healthy": critical_healthy,
            "ai_services_available": ai_available,
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
