"""Unit tests for Support Tickets API router and admin oversight."""

from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient

from main import app
from app.core.security import get_current_user
from app.api.v1.core_domain import support_tickets

app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)


def _result(columns: list[str], rows: list[list[object]], last_id=1, affected=1) -> dict:
    return {
        "cols": [{"name": column} for column in columns],
        "rows": [
            [
                {"type": "null", "value": None}
                if value is None
                else {
                    "type": "integer" if isinstance(value, int) else "float" if isinstance(value, float) else "text",
                    "value": str(value),
                }
                for value in row
            ]
            for row in rows
        ],
        "last_insert_rowid": last_id,
        "rows_affected": affected,
    }


@pytest.fixture
def mock_support_db(monkeypatch):
    queries = []

    def fake_execute(sql: str, params=None):
        params = params or []
        queries.append((sql, params))
        sql_u = sql.upper()

        if "SELECT ID, USER_ID, SUBJECT, DESCRIPTION, CATEGORY, PRIORITY, STATUS" in sql_u:
            if "WHERE ID = ?" in sql_u and "AND USER_ID = ?" not in sql_u:
                # Admin get ticket
                return _result(
                    ["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                    [[params[0], 5, "Payment issue", "Payment stuck in escrow", "billing", "high", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"]],
                )
            if "WHERE ID = ? AND USER_ID = ?" in sql_u:
                ticket_id = params[0]
                user_id = params[1]
                if user_id == 5:
                    return _result(
                        ["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                        [[ticket_id, 5, "Payment issue", "Payment stuck in escrow", "billing", "high", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"]],
                    )
                return _result(["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"], [])

            # List tickets query
            if "WHERE USER_ID = ?" in sql_u:
                return _result(
                    ["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                    [[1, params[0], "User Ticket", "Details", "general", "medium", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"]],
                )
            else:
                # Admin list query without user_id filter
                return _result(
                    ["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                    [
                        [1, 5, "Ticket 1 from User 5", "Details 1", "general", "medium", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"],
                        [2, 9, "Ticket 2 from User 9", "Details 2", "billing", "high", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"],
                    ],
                )

        if "SELECT ID, TICKET_ID, SENDER_ID, MESSAGE, CREATED_AT FROM SUPPORT_MESSAGES" in sql_u:
            return _result(
                ["id", "ticket_id", "sender_id", "message", "created_at"],
                [[1, params[0], 5, "Initial support inquiry", "2026-08-19T00:00:00Z"]],
            )

        if "SELECT ID FROM SUPPORT_TICKETS WHERE ID = ?" in sql_u:
            if "AND USER_ID = ?" in sql_u:
                if params[1] == 5:
                    return _result(["id"], [[params[0]]])
                return _result(["id"], [])
            return _result(["id"], [[params[0]]])

        return {"columns": [], "rows": [], "rows_affected": 1, "last_insert_rowid": 10}

    monkeypatch.setattr(support_tickets, "execute_query", fake_execute)
    return queries


def test_client_list_tickets_filtered_by_user_id(mock_support_db):
    queries = mock_support_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=5, role="client", user_type="client")

    resp = client.get("/api/support-tickets")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 1
    assert any("WHERE USER_ID = ?" in q[0].upper() for q in queries)


def test_admin_list_tickets_unfiltered_by_user_id(mock_support_db):
    queries = mock_support_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="admin", user_type="admin")

    resp = client.get("/api/support-tickets")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2
    # Verify no "WHERE user_id = ?" in admin list query
    admin_list_queries = [q[0] for q in queries if "FROM SUPPORT_TICKETS" in q[0].upper()]
    assert any("WHERE USER_ID = ?" not in q.upper() for q in admin_list_queries)


def test_admin_can_view_any_user_ticket(mock_support_db):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="admin", user_type="admin")

    resp = client.get("/api/support-tickets/1")
    assert resp.status_code == 200
    data = resp.json()
    assert str(data["id"]) == "1"
    assert str(data["user_id"]) == "5"


def test_user_cannot_view_other_user_ticket(mock_support_db):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=999, role="client", user_type="client")

    resp = client.get("/api/support-tickets/1")
    assert resp.status_code == 404
