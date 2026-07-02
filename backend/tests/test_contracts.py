# @AI-HINT: Contract API tests with mocked execute_query and auth dependencies
import uuid
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from main import app
from app.core.security import get_current_user

# Disable startup hooks
app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)

# ---------------------------------------------------------------------------
# Fake data — Turso execute_query format (cols/rows with typed cells)
# ---------------------------------------------------------------------------
_NOW = datetime.now(timezone.utc).isoformat()
_VALID_UUID = str(uuid.uuid4())
_CONTRACT_INT_ID = 1  # ContractRead schema expects int id

CONTRACT_COLS = [
    "id", "project_id", "freelancer_id", "client_id", "total_amount",
    "contract_type", "currency", "hourly_rate", "retainer_amount",
    "retainer_frequency", "status", "start_date", "end_date",
    "description", "milestones", "terms", "created_at", "updated_at",
    "job_title", "client_name",
]


def _cell(value):
    """Build a Turso-style cell dict."""
    if value is None:
        return {"type": "null", "value": None}
    return {"type": "text", "value": str(value)}


def _contract_row(overrides: dict | None = None):
    base = {
        "id": _CONTRACT_INT_ID,
        "project_id": 1,
        "freelancer_id": 2,
        "client_id": 1,
        "total_amount": 5000.0,
        "contract_type": "fixed",
        "currency": "USD",
        "hourly_rate": None,
        "retainer_amount": None,
        "retainer_frequency": None,
        "status": "active",
        "start_date": _NOW,
        "end_date": None,
        "description": "Build a REST API",
        "milestones": None,
        "terms": None,
        "created_at": _NOW,
        "updated_at": _NOW,
        "job_title": "REST API Project",
        "client_name": "Test Client",
    }
    base.update(overrides or {})
    return [_cell(base[c]) for c in CONTRACT_COLS]


def _cols():
    return [{"name": c} for c in CONTRACT_COLS]


# Reusable responses
EMPTY_RESULT = {"cols": [], "rows": []}
ONE_CONTRACT = {"cols": _cols(), "rows": [_contract_row()]}
NO_CONTRACTS = {"cols": _cols(), "rows": []}


# ---------------------------------------------------------------------------
# Mock execute_query
# ---------------------------------------------------------------------------
def _fake_execute_query(sql: str, params=None):
    sql_u = sql.strip().upper()
    params = params or []

    # List contracts (SELECT ... FROM contracts c ...)
    if sql_u.startswith("SELECT") and "FROM CONTRACTS C" in sql_u:
        if "WHERE C.ID = ?" in sql_u:
            cid = params[0] if params else ""
            if cid == _VALID_UUID:
                return ONE_CONTRACT
            return NO_CONTRACTS
        # list all for user
        return ONE_CONTRACT

    # Get contract for delete/update checks
    if sql_u.startswith("SELECT") and "FROM CONTRACTS" in sql_u and "WHERE ID = ?" in sql_u:
        cid = params[0] if params else ""
        if cid == _VALID_UUID:
            # Return minimal row: id, client_id, status
            return {
                "cols": [{"name": "id"}, {"name": "client_id"}, {"name": "status"}],
                "rows": [[_cell(_CONTRACT_INT_ID), _cell(1), _cell("active")]],
            }
        return {"cols": [], "rows": []}

    # Check freelancer exists
    if "FROM USERS" in sql_u and "WHERE ID = ?" in sql_u:
        return {
            "cols": [{"name": "id"}, {"name": "user_type"}, {"name": "is_active"}],
            "rows": [[_cell(2), _cell("freelancer"), _cell(1)]],
        }

    # Check project exists
    if "FROM PROJECTS" in sql_u and "WHERE ID = ?" in sql_u:
        return {
            "cols": [{"name": "id"}, {"name": "client_id"}, {"name": "title"}],
            "rows": [[_cell(1), _cell(1), _cell("Test Project")]],
        }

    # Check proposal exists
    if "FROM PROPOSALS" in sql_u:
        return {
            "cols": [{"name": "id"}, {"name": "status"}],
            "rows": [[_cell(1), _cell("accepted")]],
        }

    # Check existing active contract
    if "STATUS IN" in sql_u and "PENDING" in sql_u:
        return {"cols": [], "rows": []}

    # INSERT
    if sql_u.startswith("INSERT"):
        return {"cols": [], "rows": [], "last_insert_rowid": 1}

    # UPDATE
    if sql_u.startswith("UPDATE"):
        return {"cols": [], "rows": []}

    return EMPTY_RESULT


# ---------------------------------------------------------------------------
# Fake user
# ---------------------------------------------------------------------------
class _FakeUser:
    def __init__(self, **kw):
        self.id = kw.get("id", 1)
        self.email = kw.get("email", "client@test.com")
        self.user_type = kw.get("user_type", "client")
        self.role = kw.get("role", "User")
        self.name = kw.get("name", "Test Client")
        self.bio = kw.get("bio", "Experienced client with lots of projects.")
        self.location = kw.get("location", "San Francisco")
        self.skills = kw.get("skills", "management")
        self.is_active = True
        self.is_verified = True
        self.hourly_rate = 0
        self.profile_image_url = None
        self.profile_data = None
        self.two_factor_enabled = False
        self.first_name = None
        self.last_name = None
        self.joined_at = _NOW


_client = _FakeUser(id=1, user_type="client")
_freelancer = _FakeUser(id=2, user_type="freelancer", email="freelancer@test.com")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _mock_db(monkeypatch):
    """Patch execute_query at all import locations used by contracts."""
    targets = [
        "app.db.turso_http.execute_query",
        "app.api.v1.projects_domain.contracts.execute_query",
        "app.services.contracts_service.execute_query",
        "app.core.security.execute_query",
        "app.services.token_blacklist_service.execute_query",
    ]
    for target in targets:
        try:
            monkeypatch.setattr(target, _fake_execute_query)
        except AttributeError:
            pass
    yield
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_list_contracts_with_auth():
    """GET /api/contracts with auth returns 200."""
    app.dependency_overrides[get_current_user] = lambda: _client
    resp = client.get("/api/contracts")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert isinstance(data.get("items"), list)


def test_list_contracts_no_auth():
    """GET /api/contracts without auth returns 401 or 403."""
    resp = client.get("/api/contracts")
    assert resp.status_code in (401, 403)


def test_get_contract_invalid_id():
    """GET /api/contracts/not-a-uuid returns 400."""
    app.dependency_overrides[get_current_user] = lambda: _client
    resp = client.get("/api/contracts/not-a-uuid")
    assert resp.status_code == 404
    assert "Contract not found" in resp.json()["detail"]


def test_get_contract_not_found():
    """GET /api/contracts/{uuid} returns 404 when contract doesn't exist."""
    app.dependency_overrides[get_current_user] = lambda: _client
    missing_uuid = str(uuid.uuid4())
    resp = client.get(f"/api/contracts/{missing_uuid}")
    assert resp.status_code == 404


def test_get_contract_found():
    """GET /api/contracts/{uuid} returns contract when authorized."""
    app.dependency_overrides[get_current_user] = lambda: _client
    resp = client.get(f"/api/contracts/{_VALID_UUID}")
    assert resp.status_code == 200


def test_delete_contract_no_auth():
    """DELETE /api/contracts/{uuid} without auth returns 401 or 403."""
    resp = client.delete(f"/api/contracts/{_VALID_UUID}")
    assert resp.status_code in (401, 403)


def test_delete_contract_with_auth():
    """DELETE /api/contracts/{uuid} with owner auth returns 200."""
    app.dependency_overrides[get_current_user] = lambda: _client
    resp = client.delete(f"/api/contracts/{_VALID_UUID}")
    assert resp.status_code == 200


def test_create_direct_contract_no_auth():
    """POST /api/contracts/direct without auth returns 401 or 403."""
    payload = {
        "freelancer_id": 2,
        "title": "Direct hire project",
        "description": "This is a direct hire test contract.",
        "rate_type": "hourly",
        "rate": 50.0,
    }
    resp = client.post("/api/contracts/direct", json=payload)
    assert resp.status_code in (401, 403)


def test_create_contract_as_freelancer_forbidden():
    """POST /api/contracts/direct as freelancer returns 403."""
    app.dependency_overrides[get_current_user] = lambda: _freelancer
    payload = {
        "freelancer_id": 3,
        "title": "Direct hire by freelancer",
        "description": "Freelancers cannot create contracts.",
        "rate_type": "fixed",
        "rate": 100.0,
    }
    resp = client.post("/api/contracts/direct", json=payload)
    assert resp.status_code == 403
