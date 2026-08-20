"""Unit and integration tests for Talent Invitations API router."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient

from main import app
from app.core.security import get_current_user
from app.api.v1.core_domain import talent_invitations

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
def mock_talent_db(monkeypatch):
    queries = []
    notifications = []

    def fake_execute(sql: str, params=None):
        params = params or []
        queries.append((sql, params))
        sql_u = sql.upper()

        if "CREATE TABLE" in sql_u or "CREATE INDEX" in sql_u:
            return {"columns": [], "rows": [], "rows_affected": 0}

        if "SELECT ID, TITLE, CLIENT_ID, STATUS FROM PROJECTS WHERE ID = ?" in sql_u:
            if params and params[0] == 10:
                return _result(["id", "title", "client_id", "status"], [[10, "Build AI App", 1, "open"]])
            elif params and params[0] == 99:
                return _result(["id", "title", "client_id", "status"], [])
            return _result(["id", "title", "client_id", "status"], [[params[0], "Test Project", 1, "open"]])

        if "SELECT ID, TITLE, CLIENT_ID FROM PROJECTS WHERE ID = ?" in sql_u:
            if params and params[0] == 10:
                return _result(["id", "title", "client_id"], [[10, "Build AI App", 1]])
            return _result(["id", "title", "client_id"], [])

        if "SELECT ID, NAME, EMAIL, ROLE, USER_TYPE FROM USERS WHERE ID = ?" in sql_u:
            if params and params[0] == 2:
                return _result(["id", "name", "email", "role", "user_type"], [[2, "Freelancer Jane", "jane@example.com", "freelancer", "freelancer"]])
            elif params and params[0] == 99:
                return _result(["id", "name", "email", "role", "user_type"], [])
            return _result(["id", "name", "email", "role", "user_type"], [[params[0], "User", "user@example.com", "freelancer", "freelancer"]])

        if "SELECT ID, STATUS FROM TALENT_INVITATIONS WHERE PROJECT_ID = ? AND FREELANCER_ID = ?" in sql_u:
            if params and params[0] == 10 and params[1] == 2:
                return _result(["id", "status"], [])
            if params and params[1] == 5:
                return _result(["id", "status"], [[50, "pending"]])
            return _result(["id", "status"], [])

        if "SELECT ID FROM TALENT_INVITATIONS WHERE PROJECT_ID = ? AND FREELANCER_ID = ?" in sql_u:
            return _result(["id"], [])

        if "COUNT(*) AS TOTAL" in sql_u:
            return _result(["total", "pending_count", "accepted_count", "declined_count"], [[1, 1, 0, 0]])

        if "FROM TALENT_INVITATIONS TI" in sql_u and ("LEFT JOIN PROJECTS P" in sql_u or "LEFT JOIN USERS" in sql_u):
            now_iso = datetime.now(timezone.utc).isoformat()
            exp_iso = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            return _result(
                [
                    "id", "project_id", "client_id", "freelancer_id",
                    "message", "suggested_rate", "status", "response_message",
                    "responded_at", "proposal_id", "viewed", "viewed_at",
                    "expires_at", "created_at", "updated_at",
                    "project_title", "project_description", "project_budget_min", "project_budget_max",
                    "project_category", "project_skills", "client_name", "client_image",
                    "freelancer_name", "freelancer_image"
                ],
                [
                    [
                        100, 10, 1, 2,
                        "Join my project", 50.0, "pending", None,
                        None, None, 0, None,
                        exp_iso, now_iso, now_iso,
                        "Build AI App", "Description", 500, 1000,
                        "AI", "python", "Client Bob", None,
                        "Jane", None
                    ]
                ]
            )

        if "SELECT TI.*, P.TITLE AS PROJECT_TITLE FROM TALENT_INVITATIONS" in sql_u:
            exp_iso = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            now_iso = datetime.now(timezone.utc).isoformat()
            return _result(
                ["id", "project_id", "client_id", "freelancer_id", "status", "expires_at", "created_at", "updated_at", "project_title"],
                [[100, 10, 1, 2, "pending", exp_iso, now_iso, now_iso, "Build AI App"]]
            )

        if "SELECT * FROM TALENT_INVITATIONS WHERE ID = ?" in sql_u:
            now_iso = datetime.now(timezone.utc).isoformat()
            exp_iso = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            return _result(
                ["id", "project_id", "client_id", "freelancer_id", "message", "suggested_rate", "status", "expires_at", "created_at", "updated_at"],
                [[100, 10, 1, 2, "Invite note", 50.0, "pending", exp_iso, now_iso, now_iso]]
            )

        if "SELECT TI.*, P.TITLE AS PROJECT_TITLE" in sql_u:
            now_iso = datetime.now(timezone.utc).isoformat()
            exp_iso = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            return _result(
                ["id", "project_id", "client_id", "freelancer_id", "message", "suggested_rate", "status", "expires_at", "created_at", "updated_at", "project_title"],
                [[100, 10, 1, 2, "Invite note", 50.0, "pending", exp_iso, now_iso, now_iso, "Build AI App"]]
            )

        return {"columns": [], "rows": [], "rows_affected": 1, "last_insert_rowid": 100}

    monkeypatch.setattr(talent_invitations, "execute_query", fake_execute)
    monkeypatch.setattr(talent_invitations, "send_notification", lambda *args, **kwargs: notifications.append((args, kwargs)))

    return queries, notifications


def test_send_invitation_success(mock_talent_db):
    queries, notifications = mock_talent_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

    resp = client.post(
        "/api/invitations",
        json={"project_id": 10, "freelancer_id": 2, "message": "Would love your help", "suggested_rate": 75.0},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["invitation_id"] == 100
    assert any("INSERT INTO TALENT_INVITATIONS" in q[0].upper() for q in queries)


def test_send_invitation_non_owner_forbidden(mock_talent_db):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=999, role="client", user_type="client")

    resp = client.post(
        "/api/invitations",
        json={"project_id": 10, "freelancer_id": 2, "message": "Inviting you"},
    )
    assert resp.status_code == 403


def test_send_invitation_self_invite_rejected(mock_talent_db):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

    resp = client.post(
        "/api/invitations",
        json={"project_id": 10, "freelancer_id": 1, "message": "Inviting myself"},
    )
    assert resp.status_code == 400


def test_list_invitations_for_freelancer(mock_talent_db):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=2, role="freelancer", user_type="freelancer")

    resp = client.get("/api/invitations")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert data["total"] >= 1
    assert len(data["items"]) == 1
    assert data["items"][0]["project_title"] == "Build AI App"


def test_freelancer_respond_accept(mock_talent_db):
    queries, notifications = mock_talent_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=2, role="freelancer", user_type="freelancer")

    resp = client.post(
        "/api/invitations/100/respond",
        json={"accept": True, "response_message": "Glad to join!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "accepted"
    assert any("UPDATE TALENT_INVITATIONS SET STATUS = ?" in q[0].upper() for q in queries)


def test_freelancer_respond_decline(mock_talent_db):
    queries, notifications = mock_talent_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=2, role="freelancer", user_type="freelancer")

    resp = client.put(
        "/api/invitations/100/respond",
        json={"accept": False, "response_message": "Too busy unfortunately."},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "declined"


def test_client_cancel_invitation(mock_talent_db):
    queries, notifications = mock_talent_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

    resp = client.delete("/api/invitations/100")
    assert resp.status_code == 200
    data = resp.json()
    assert "cancelled successfully" in data["message"]
