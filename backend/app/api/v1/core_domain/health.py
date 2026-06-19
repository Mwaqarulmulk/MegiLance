# @AI-HINT: Health check router — system health, readiness, metrics
from fastapi import APIRouter
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query

router = APIRouter()


@router.get("/ready")
def health_ready():
    try:
        result = execute_query("SELECT 1 as ok", [])
        if result and result.get("rows"):
            return {"status": "healthy", "database": "connected", "timestamp": datetime.now(timezone.utc).isoformat()}
        return {"status": "degraded", "database": "disconnected", "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        return {"status": "unhealthy", "database": "error", "error": str(e), "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/metrics")
def health_metrics():
    try:
        users = execute_query("SELECT COUNT(*) as count FROM users", [])
        projects = execute_query("SELECT COUNT(*) as count FROM projects", [])
        proposals = execute_query("SELECT COUNT(*) as count FROM proposals", [])

        from app.db.turso_http import parse_rows
        return {
            "status": "healthy",
            "metrics": {
                "users": parse_rows(users)[0]["count"] if parse_rows(users) else 0,
                "projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
                "proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}
