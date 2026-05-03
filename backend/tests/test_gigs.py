# @AI-HINT: Gig marketplace API tests with mocked Turso database and auth
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from main import app
from app.core.security import get_current_active_user

# Disable startup hooks
app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)

# ---------------------------------------------------------------------------
# Fake data
# ---------------------------------------------------------------------------
_NOW = datetime.now(timezone.utc).isoformat()

LIST_COLUMNS = [
    "id", "title", "slug", "short_description", "thumbnail_url",
    "basic_price", "rating_average", "rating_count", "orders_completed",
    "seller_id", "category_id", "status", "is_featured",
    "seller_name", "seller_avatar",
]

SAMPLE_GIG_LIST_ROW = [
    1, "I will build a REST API", "build-rest-api-abc123",
    "Professional API development", "https://img.test/thumb.jpg",
    50.0, 4.8, 12, 25,
    2, 1, "active", 0,
    "Alice Dev", "https://img.test/alice.jpg",
]

# For the detail endpoint (SELECT g.*)
DETAIL_COLUMNS = [
    "id", "seller_id", "title", "slug", "description", "short_description",
    "category_id", "tags", "search_tags",
    "basic_title", "basic_description", "basic_price",
    "basic_delivery_days", "basic_revisions", "basic_features",
    "standard_title", "standard_description", "standard_price",
    "standard_delivery_days", "standard_revisions", "standard_features",
    "premium_title", "premium_description", "premium_price",
    "premium_delivery_days", "premium_revisions", "premium_features",
    "extras", "requirements", "images", "video_url", "thumbnail_url",
    "status", "rating_average", "rating_count", "orders_completed",
    "orders_in_progress", "impressions", "clicks",
    "is_featured", "published_at", "created_at", "updated_at",
    "seller_name", "seller_avatar", "seller_member_since",
]

SAMPLE_GIG_DETAIL_ROW = [
    1, 2, "I will build a REST API", "build-rest-api-abc123",
    "Full description of the gig with enough detail to satisfy tests.",
    "Professional API development", 1, '["python","api"]', '["fastapi"]',
    "Basic", "Simple API", 50.0, 3, 1, '["Endpoint design"]',
    "Standard", "Standard API", 100.0, 5, 3, '["Endpoint design","Auth"]',
    "Premium", "Full API", 200.0, 7, 5, '["Full stack","Auth","Docs"]',
    None, None, None, None, "https://img.test/thumb.jpg",
    "active", 4.8, 12, 25, 2, 100, 50,
    0, _NOW, _NOW, _NOW,
    "Alice Dev", "https://img.test/alice.jpg", "2024-01-01",
]


# ---------------------------------------------------------------------------
# Fake Turso
# ---------------------------------------------------------------------------
class FakeTurso:
    def __init__(self):
        self._gig_exists = True

    def execute(self, sql: str, params=None):
        sql_u = sql.strip().upper()
        params = params or []

        # LIST gigs
        if sql_u.startswith("SELECT") and "FROM GIGS G" in sql_u and "WHERE G.ID" not in sql_u:
            return {"columns": LIST_COLUMNS, "rows": [SAMPLE_GIG_LIST_ROW]}

        # GET gig detail (SELECT g.* ... WHERE g.id = ?)
        if sql_u.startswith("SELECT") and "WHERE G.ID = ?" in sql_u:
            if not self._gig_exists:
                return {"columns": DETAIL_COLUMNS, "rows": []}
            pid = params[0] if params else -1
            if pid == 1:
                return {"columns": DETAIL_COLUMNS, "rows": [SAMPLE_GIG_DETAIL_ROW]}
            return {"columns": DETAIL_COLUMNS, "rows": []}

        # FAQs for gig
        if "GIG_FAQS" in sql_u:
            return {"columns": ["id", "question", "answer", "display_order"], "rows": []}

        # Reviews for gig
        if "GIG_REVIEWS" in sql_u and "WHERE R.GIG_ID" in sql_u:
            return {"columns": ["id", "rating_overall", "review_text", "created_at",
                                "reviewer_name", "reviewer_avatar"], "rows": []}

        # Slug lookup
        if "WHERE SLUG = ?" in sql_u:
            return {"columns": ["id"], "rows": [[1]]}

        # INSERT gig
        if sql_u.startswith("INSERT INTO GIGS"):
            return {"columns": [], "rows": []}

        # SELECT id FROM gigs WHERE slug = ? (after insert)
        if sql_u.startswith("SELECT") and "FROM GIGS" in sql_u and "WHERE SLUG = ?" in sql_u:
            return {"columns": ["id"], "rows": [[42]]}

        # Seller gigs
        if "WHERE SELLER_ID = ?" in sql_u:
            return {"columns": LIST_COLUMNS, "rows": [SAMPLE_GIG_LIST_ROW]}

        return {"columns": [], "rows": []}

    def fetch_one(self, sql, params=None):
        result = self.execute(sql, params)
        rows = result.get("rows", [])
        return rows[0] if rows else None


# ---------------------------------------------------------------------------
# Fake users
# ---------------------------------------------------------------------------
class _FakeUser:
    def __init__(self, **kw):
        self.id = kw.get("id", 1)
        self.email = kw.get("email", "user@test.com")
        self.user_type = kw.get("user_type", "freelancer")
        self.role = kw.get("role", "User")
        self.name = kw.get("name", "Test User")
        self.bio = kw.get("bio", "Experienced developer with years of work.")
        self.location = kw.get("location", "London")
        self.skills = kw.get("skills", "python,fastapi")
        self.is_active = True
        self.is_verified = True
        self.hourly_rate = 50
        self.profile_image_url = None
        self.profile_data = None
        self.two_factor_enabled = False
        self.first_name = None
        self.last_name = None
        self.joined_at = _NOW


_freelancer = _FakeUser(id=2, user_type="freelancer")
_client_user = _FakeUser(id=3, user_type="client", email="client@test.com")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _mock_turso(monkeypatch):
    fake = FakeTurso()
    monkeypatch.setattr("app.api.v1.gigs.get_turso_http", lambda: fake)
    yield
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_list_gigs():
    """GET /api/gigs returns a list of gigs."""
    resp = client.get("/api/gigs")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == "I will build a REST API"


def test_list_gigs_with_filters():
    """GET /api/gigs with query params returns 200."""
    resp = client.get("/api/gigs", params={"search": "API", "limit": 5})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_gig_by_id():
    """GET /api/gigs/1 returns gig details."""
    resp = client.get("/api/gigs/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "I will build a REST API"
    assert "faqs" in data
    assert "recent_reviews" in data


def test_get_gig_not_found():
    """GET /api/gigs/999 returns 404."""
    resp = client.get("/api/gigs/999")
    assert resp.status_code == 404


def test_create_gig_as_freelancer():
    """POST /api/gigs as freelancer creates a gig."""
    app.dependency_overrides[get_current_active_user] = lambda: _freelancer
    payload = {
        "title": "I will design your website professionally",
        "description": "A" * 100,  # min 100 chars
        "basic_package": {
            "title": "Basic",
            "price": 25.0,
            "delivery_days": 3,
            "revisions": 1,
        },
    }
    resp = client.post("/api/gigs", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "slug" in data
    assert data["message"] == "Gig created successfully"


def test_create_gig_no_auth():
    """POST /api/gigs without auth returns 401 or 403."""
    payload = {
        "title": "No auth gig that should be rejected",
        "description": "A" * 100,
        "basic_package": {"title": "Basic", "price": 10.0, "delivery_days": 1, "revisions": 0},
    }
    resp = client.post("/api/gigs", json=payload)
    assert resp.status_code in (401, 403)


def test_create_gig_as_client_forbidden():
    """POST /api/gigs as client returns 403."""
    app.dependency_overrides[get_current_active_user] = lambda: _client_user
    payload = {
        "title": "Client cannot create gig at all",
        "description": "A" * 100,
        "basic_package": {"title": "Basic", "price": 10.0, "delivery_days": 1, "revisions": 0},
    }
    resp = client.post("/api/gigs", json=payload)
    assert resp.status_code == 403
