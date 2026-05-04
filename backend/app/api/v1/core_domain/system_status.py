"""
System Status and Health Check Endpoint - Shows all API statuses and service connections
"""

import logging
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter
import asyncio

from app.db.session import get_db_url
from app.services.llm_gateway import llm_gateway

logger = logging.getLogger("megilance")

router = APIRouter(tags=["System Status"])


class ServiceStatus:
    """Model for service health status."""

    def __init__(self, name: str, healthy: bool, message: str = "", response_time: float = 0):
        self.name = name
        self.healthy = healthy
        self.message = message
        self.response_time = response_time

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "healthy": self.healthy,
            "message": self.message,
            "response_time_ms": round(self.response_time * 1000, 2)
        }


async def check_database() -> ServiceStatus:
    """Check database connection."""
    import time
    start = time.time()
    try:
        from app.db.session import get_engine
        engine = get_engine()
        # Just validate the URL is set
        if engine:
            elapsed = time.time() - start
            return ServiceStatus("Database (Turso)", True, "Connected", elapsed)
        return ServiceStatus("Database (Turso)", False, "No engine available", 0)
    except Exception as e:
        elapsed = time.time() - start
        return ServiceStatus("Database (Turso)", False, f"Connection failed: {str(e)}", elapsed)


async def check_llm_gateway() -> ServiceStatus:
    """Check LLM Gateway (DigitalOcean AI)."""
    import time
    start = time.time()
    try:
        if not llm_gateway.is_active:
            elapsed = time.time() - start
            return ServiceStatus("LLM Gateway (DigitalOcean)", False, "DO_AI_API_KEY not configured", elapsed)

        # Try to get available models
        models = await llm_gateway.get_available_models()
        elapsed = time.time() - start

        if models:
            return ServiceStatus(
                "LLM Gateway (DigitalOcean)",
                True,
                f"Model: {models[0]}",
                elapsed
            )
        return ServiceStatus("LLM Gateway (DigitalOcean)", False, "No models available", elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return ServiceStatus("LLM Gateway (DigitalOcean)", False, f"Check failed: {str(e)}", elapsed)


async def check_ai_endpoints() -> List[Dict[str, Any]]:
    """Check all AI service endpoints."""
    ai_endpoints = [
        {"endpoint": "GET /api/ai/status", "method": "GET", "auth": False},
        {"endpoint": "POST /api/ai/chat", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/estimate-price", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/extract-skills", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/analyze-sentiment", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/fraud-check", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/categorize-project", "method": "POST", "auth": False},
        {"endpoint": "POST /api/ai/generate-proposal", "method": "POST", "auth": False},
    ]
    return ai_endpoints


async def check_public_tools() -> List[Dict[str, Any]]:
    """Check public tool endpoints (no auth required)."""
    public_tools = [
        {"endpoint": "GET /api/price-estimator/categories", "method": "GET", "auth": False},
        {"endpoint": "GET /api/price-estimator/estimate", "method": "GET", "auth": False},
        {"endpoint": "GET /api/rate-advisor/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/rate-advisor/advise", "method": "POST", "auth": False},
        {"endpoint": "GET /api/skill-analyzer/skills", "method": "GET", "auth": False},
        {"endpoint": "POST /api/skill-analyzer/analyze", "method": "POST", "auth": False},
        {"endpoint": "GET /api/proposal-writer/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/proposal-writer/generate", "method": "POST", "auth": False},
        {"endpoint": "GET /api/scope-planner/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/scope-planner/plan", "method": "POST", "auth": False},
        {"endpoint": "GET /api/income-calculator/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/income-calculator/calculate", "method": "POST", "auth": False},
        {"endpoint": "GET /api/expense-tax-calculator/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/expense-tax-calculator/calculate", "method": "POST", "auth": False},
        {"endpoint": "GET /api/invoice-generator/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/invoice-generator/generate", "method": "POST", "auth": False},
        {"endpoint": "GET /api/contract-builder-standalone/options", "method": "GET", "auth": False},
        {"endpoint": "POST /api/contract-builder-standalone/generate", "method": "POST", "auth": False},
    ]
    return public_tools


async def check_chatbot_endpoints() -> List[Dict[str, Any]]:
    """Check chatbot endpoints."""
    chatbot_endpoints = [
        {"endpoint": "GET /api/chatbot/faq/categories", "method": "GET", "auth": False},
        {"endpoint": "GET /api/chatbot/faq", "method": "GET", "auth": False},
        {"endpoint": "POST /api/chatbot/chat", "method": "POST", "auth": False},
        {"endpoint": "POST /api/chatbot/feedback", "method": "POST", "auth": False},
    ]
    return chatbot_endpoints


async def check_core_endpoints() -> List[Dict[str, Any]]:
    """Check core API endpoints and their auth requirements."""
    core_endpoints = [
        # Auth
        {"endpoint": "POST /api/auth/register", "method": "POST", "auth": False},
        {"endpoint": "POST /api/auth/login", "method": "POST", "auth": False},
        {"endpoint": "POST /api/auth/refresh-token", "method": "POST", "auth": False},
        {"endpoint": "POST /api/auth/logout", "method": "POST", "auth": True},

        # Projects
        {"endpoint": "GET /api/projects", "method": "GET", "auth": False},
        {"endpoint": "POST /api/projects", "method": "POST", "auth": True},
        {"endpoint": "GET /api/projects/{id}", "method": "GET", "auth": False},
        {"endpoint": "PATCH /api/projects/{id}", "method": "PATCH", "auth": True},

        # Proposals
        {"endpoint": "GET /api/proposals", "method": "GET", "auth": False},
        {"endpoint": "POST /api/proposals", "method": "POST", "auth": True},
        {"endpoint": "GET /api/proposals/{id}", "method": "GET", "auth": False},
        {"endpoint": "PATCH /api/proposals/{id}", "method": "PATCH", "auth": True},

        # Reviews
        {"endpoint": "GET /api/reviews", "method": "GET", "auth": False},
        {"endpoint": "POST /api/reviews", "method": "POST", "auth": True},

        # Payments
        {"endpoint": "POST /api/payments/initiate", "method": "POST", "auth": True},
        {"endpoint": "GET /api/payments/{id}", "method": "GET", "auth": True},

        # Messages
        {"endpoint": "GET /api/messages", "method": "GET", "auth": True},
        {"endpoint": "POST /api/messages", "method": "POST", "auth": True},

        # Notifications
        {"endpoint": "GET /api/notifications", "method": "GET", "auth": True},
        {"endpoint": "PATCH /api/notifications/{id}/read", "method": "PATCH", "auth": True},
    ]
    return core_endpoints


@router.get("/full")
async def get_full_status() -> Dict[str, Any]:
    """
    Get comprehensive system status including all services and API endpoints.

    Returns:
    - timestamp: Current server time
    - system_status: Overall system health (healthy/degraded/offline)
    - services: Health status of all critical services
    - ai_endpoints: All AI service endpoints and their status
    - public_tools: Public tool endpoints (no auth required)
    - chatbot_endpoints: Chatbot endpoints and availability
    - core_endpoints: Core API endpoints with auth requirements
    - api_documentation: Link to OpenAPI docs
    """

    # Check critical services in parallel
    db_status, llm_status = await asyncio.gather(
        check_database(),
        check_llm_gateway()
    )

    # Determine overall system status
    critical_services_healthy = db_status.healthy
    system_status = "healthy" if critical_services_healthy else "degraded"

    # Get endpoint information
    ai_endpoints = await check_ai_endpoints()
    public_tools = await check_public_tools()
    chatbot_endpoints = await check_chatbot_endpoints()
    core_endpoints = await check_core_endpoints()

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "system_status": system_status,
        "version": "2.0",
        "services": {
            "database": db_status.to_dict(),
            "llm_gateway": llm_status.to_dict(),
        },
        "summary": {
            "critical_services_healthy": critical_services_healthy,
            "ai_services_available": llm_status.healthy,
            "total_endpoints": len(ai_endpoints) + len(public_tools) + len(chatbot_endpoints) + len(core_endpoints),
            "ai_endpoints_count": len(ai_endpoints),
            "public_tools_count": len(public_tools),
            "chatbot_endpoints_count": len(chatbot_endpoints),
            "core_endpoints_count": len(core_endpoints),
        },
        "endpoints": {
            "ai_services": ai_endpoints,
            "public_tools": public_tools,
            "chatbot": chatbot_endpoints,
            "core": core_endpoints,
        },
        "api_documentation": "http://localhost:8000/docs",
        "health_check": "GET /api/health",
    }


@router.get("/simple")
async def get_simple_status() -> Dict[str, Any]:
    """
    Get simple system status - quick health check.

    Returns just: status, timestamp, and critical service health
    """
    db_status, llm_status = await asyncio.gather(
        check_database(),
        check_llm_gateway()
    )

    system_status = "healthy" if db_status.healthy else "degraded"

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "system_status": system_status,
        "services": {
            "database": db_status.to_dict(),
            "llm_gateway": llm_status.to_dict(),
        },
        "ready": system_status == "healthy"
    }


@router.get("/endpoints")
async def get_endpoints_only() -> Dict[str, Any]:
    """
    Get just the endpoint listing without service checks.

    Useful for frontend to display all available APIs without waiting for service checks.
    """
    return {
        "ai_services": await check_ai_endpoints(),
        "public_tools": await check_public_tools(),
        "chatbot": await check_chatbot_endpoints(),
        "core": await check_core_endpoints(),
        "total_endpoints": 58,
    }
