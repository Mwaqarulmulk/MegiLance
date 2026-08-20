"""Unit tests for Deliverables, Signatures, and PDF route registration and operation."""

from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient

from main import app
from app.core.security import get_current_user
from app.api.v1.core_domain import signature_routes

app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)


def _result(columns: list[str], rows: list[list[object]]) -> dict:
    return {
        "cols": [{"name": column} for column in columns],
        "rows": [
            [
                {"type": "null", "value": None}
                if value is None
                else {
                    "type": "text",
                    "value": str(value),
                }
                for value in row
            ]
            for row in rows
        ],
    }


def test_deliverable_submit_route_prefix():
    """Verify deliverables route is accessible at /api/deliverables/submit (no double prefix)."""
    resp = client.post(
        "/api/deliverables/submit",
        json={
            "milestone_id": "m123",
            "contract_id": "c456",
            "title": "Deliverable 1",
            "description": "Completed frontend UI",
            "files": [{"name": "bundle.zip", "url": "https://example.com/bundle.zip"}],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "submitted"
    assert data["milestone_id"] == "m123"


def test_signatures_route_prefix(monkeypatch):
    """Verify signatures route is accessible at /api/signatures/me (no double prefix)."""
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

    def fake_execute(sql: str, params=None):
        if "SELECT SIGNATURE_IMAGE" in sql.upper():
            return _result(["signature_image"], [["data:image/png;base64,sample"]])
        return {"columns": [], "rows": [], "rows_affected": 0}

    monkeypatch.setattr(signature_routes, "execute_query", fake_execute)

    resp = client.get("/api/signatures/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["signature_image"] == "data:image/png;base64,sample"


def test_pdf_route_prefix():
    """Verify pdf routes are mounted at /api/pdf (no double prefix)."""
    # Check OpenAPI routes include /api/pdf/invoice, /api/signatures/me, /api/deliverables/submit
    routes = [r.path for r in app.routes]
    assert "/api/deliverables/submit" in routes
    assert "/api/signatures/me" in routes
    assert "/api/pdf/invoice" in routes
