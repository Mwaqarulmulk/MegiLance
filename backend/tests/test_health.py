# @AI-HINT: Health endpoint tests - verify /api/health and /api/health/ready
import pytest
from fastapi.testclient import TestClient
from main import app

app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)


def test_health_basic():
    """Basic health endpoint returns 200."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") in ("healthy", "ok", True)


def test_health_ready():
    """Readiness endpoint returns 200."""
    resp = client.get("/api/v1/health/ready")
    assert resp.status_code == 200
