# @AI-HINT: Health endpoint tests - verify /api/health and /api/health/ready
import pytest
from fastapi.testclient import TestClient
from main import app

app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)


def test_health_live():
    """Live health endpoint returns 200."""
    resp = client.get("/api/health/live")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") in ("healthy", "ok", True)


def test_health_ready():
    """Readiness endpoint returns 200 (ready) or 503 (degraded without DB)."""
    resp = client.get("/api/health/ready")
    assert resp.status_code in (200, 503)
