# @AI-HINT: Adversarial stress-test suite for Two-Sided Referral Engine & Escrow Milestone Qualification Hooks
# Challenger M1_2 empirical verification tests.

import threading
import sqlite3
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from main import app
import app.db.turso_http as turso_mod
import app.services.referrals_service as ref_svc
import app.api.v1.core_domain.referrals as ref_router
from app.services.referrals_service import (
    ensure_referrals_tables,
    process_registration_referral,
    qualify_referral_on_milestone,
    get_referral_stats,
    list_referrals,
    check_already_invited,
    check_user_exists_by_email,
    create_referral,
)
from app.core.security import create_access_token, get_current_user


class SQLiteMockTurso:
    """Thread-safe SQLite in-memory database conforming to Turso HTTP execute_query contract."""
    def __init__(self):
        self.conn = sqlite3.connect(":memory:", check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self.lock:
            cur = self.conn.cursor()
            cur.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    password_hash TEXT DEFAULT 'hashed_pw',
                    referral_code TEXT,
                    account_balance REAL DEFAULT 0.0,
                    role TEXT DEFAULT 'freelancer',
                    user_type TEXT DEFAULT 'freelancer',
                    profile_image_url TEXT,
                    is_verified INTEGER DEFAULT 0,
                    seller_level TEXT DEFAULT 'level_1',
                    is_active INTEGER DEFAULT 1,
                    email_verified INTEGER DEFAULT 0,
                    email_verification_token TEXT,
                    created_at TEXT DEFAULT '2026-08-21T00:00:00Z',
                    updated_at TEXT DEFAULT '2026-08-21T00:00:00Z'
                )
            """)
            cur.execute("""
                CREATE TABLE referrals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    referrer_id INTEGER NOT NULL,
                    referred_user_id INTEGER,
                    referred_email TEXT,
                    referral_code TEXT,
                    status TEXT DEFAULT 'pending',
                    referee_reward_amount REAL DEFAULT 20.0,
                    reward_amount REAL DEFAULT 50.0,
                    is_paid INTEGER DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT,
                    completed_at TEXT,
                    FOREIGN KEY(referrer_id) REFERENCES users(id),
                    FOREIGN KEY(referred_user_id) REFERENCES users(id)
                )
            """)
            cur.execute("""
                CREATE TABLE referral_credits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    credit_type TEXT NOT NULL,
                    source_referral_id INTEGER,
                    description TEXT,
                    created_at TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            cur.execute("""
                CREATE TABLE wallet_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT DEFAULT 'USD',
                    description TEXT,
                    status TEXT DEFAULT 'completed',
                    reference_id TEXT,
                    created_at TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            cur.execute("""
                CREATE TABLE referral_campaigns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    bonus_amount REAL DEFAULT 0.0,
                    bonus_type TEXT DEFAULT 'fixed',
                    start_date TEXT,
                    end_date TEXT,
                    is_active INTEGER DEFAULT 1,
                    max_referrals INTEGER,
                    created_at TEXT
                )
            """)
            cur.execute("""
                CREATE TABLE referral_milestones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    target_count INTEGER NOT NULL,
                    reward_amount REAL NOT NULL,
                    icon TEXT,
                    created_at TEXT
                )
            """)
            cur.execute("""
                CREATE TABLE referral_milestone_achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    milestone_id INTEGER NOT NULL,
                    achieved_at TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(milestone_id) REFERENCES referral_milestones(id)
                )
            """)
            cur.execute("""
                CREATE TABLE escrow (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contract_id INTEGER,
                    client_id INTEGER NOT NULL,
                    freelancer_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    released_amount REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'funded',
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            cur.execute("""
                CREATE TABLE contracts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id INTEGER NOT NULL,
                    freelancer_id INTEGER NOT NULL,
                    title TEXT,
                    status TEXT DEFAULT 'active',
                    total_amount REAL DEFAULT 0.0,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            cur.execute("""
                CREATE TABLE milestones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contract_id INTEGER NOT NULL,
                    title TEXT,
                    amount REAL NOT NULL,
                    status TEXT DEFAULT 'submitted',
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            self.conn.commit()

    def add_user(self, user_id: int, name: str, email: str, referral_code: str = None, balance: float = 0.0, role: str = "freelancer"):
        with self.lock:
            cur = self.conn.cursor()
            cur.execute(
                "INSERT INTO users (id, name, email, referral_code, account_balance, role, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, name, email, referral_code, balance, role, role),
            )
            self.conn.commit()

    def get_user_balance(self, user_id: int) -> float:
        with self.lock:
            cur = self.conn.cursor()
            cur.execute("SELECT account_balance FROM users WHERE id = ?", (user_id,))
            row = cur.fetchone()
            return float(row[0]) if row else 0.0

    def get_referral_rows(self) -> list:
        with self.lock:
            cur = self.conn.cursor()
            cur.execute("SELECT * FROM referrals")
            return [dict(r) for r in cur.fetchall()]

    def get_credit_rows(self) -> list:
        with self.lock:
            cur = self.conn.cursor()
            cur.execute("SELECT * FROM referral_credits")
            return [dict(r) for r in cur.fetchall()]

    def get_wallet_tx_rows(self) -> list:
        with self.lock:
            cur = self.conn.cursor()
            cur.execute("SELECT * FROM wallet_transactions")
            return [dict(r) for r in cur.fetchall()]

    def execute_query(self, sql: str, params: list = None):
        params = list(params) if params else []
        with self.lock:
            cur = self.conn.cursor()
            try:
                cur.execute(sql, params)
                self.conn.commit()
                if cur.description:
                    columns = [d[0] for d in cur.description]
                    rows_raw = cur.fetchall()
                    cols = [{"name": col} for col in columns]
                    rows = []
                    for r in rows_raw:
                        row_data = []
                        for val in r:
                            if val is None:
                                row_data.append({"type": "null", "value": None})
                            else:
                                row_data.append({"type": "text", "value": str(val) if not isinstance(val, (int, float, str)) else val})
                        rows.append(row_data)
                    return {
                        "cols": cols,
                        "rows": rows,
                        "rows_affected": cur.rowcount,
                        "last_insert_rowid": cur.lastrowid,
                    }
                else:
                    return {
                        "cols": [],
                        "rows": [],
                        "rows_affected": cur.rowcount,
                        "last_insert_rowid": cur.lastrowid,
                    }
            except Exception as e:
                return None


@pytest.fixture
def mock_db(monkeypatch):
    db = SQLiteMockTurso()
    monkeypatch.setattr(turso_mod, "execute_query", db.execute_query)
    monkeypatch.setattr(ref_svc, "execute_query", db.execute_query)
    monkeypatch.setattr(ref_router, "execute_query", db.execute_query)
    return db


# ===========================================================================
# Test Group 1: Referral Registration Edge Cases
# ===========================================================================

def test_referral_registration_whitespace_handling(mock_db):
    """Test leading, trailing, tabs and newlines in referral code are cleaned safely."""
    mock_db.add_user(1, "Alice Referrer", "alice@example.com", "REF-ALICE-100", 0.0)
    mock_db.add_user(2, "Bob Referee", "bob@example.com", None, 0.0)

    result = process_registration_referral(
        new_user_id=2,
        new_user_email="bob@example.com",
        referral_code="  \t REF-ALICE-100 \n ",
    )

    assert result is not None
    assert result["welcome_credit"] == 20.0
    assert result["referrer_id"] == 1
    assert result["referee_user_id"] == 2
    assert mock_db.get_user_balance(2) == 20.0

    credits = mock_db.get_credit_rows()
    assert len(credits) == 1
    assert credits[0]["amount"] == 20.0
    assert credits[0]["credit_type"] == "welcome_credit"
    assert credits[0]["user_id"] == 2

    txs = mock_db.get_wallet_tx_rows()
    assert len(txs) == 1
    assert txs[0]["amount"] == 20.0
    assert txs[0]["type"] == "referral_welcome_credit"


def test_referral_registration_non_existent_code(mock_db):
    """Non-existent referral code must return None and not award any credits."""
    mock_db.add_user(1, "Alice Referrer", "alice@example.com", "REF-ALICE-100", 0.0)
    mock_db.add_user(2, "Bob Referee", "bob@example.com", None, 0.0)

    result = process_registration_referral(
        new_user_id=2,
        new_user_email="bob@example.com",
        referral_code="INVALID-CODE-9999",
    )

    assert result is None
    assert mock_db.get_user_balance(2) == 0.0
    assert len(mock_db.get_credit_rows()) == 0
    assert len(mock_db.get_wallet_tx_rows()) == 0
    assert len(mock_db.get_referral_rows()) == 0


def test_referral_registration_empty_or_none_code(mock_db):
    """Empty, None, or whitespace-only referral code returns None without error."""
    mock_db.add_user(2, "Bob Referee", "bob@example.com", None, 0.0)

    assert process_registration_referral(2, "bob@example.com", None) is None
    assert process_registration_referral(2, "bob@example.com", "") is None
    assert process_registration_referral(2, "bob@example.com", "    ") is None
    assert mock_db.get_user_balance(2) == 0.0


def test_referral_registration_self_referral_attempt(mock_db):
    """User cannot refer themselves (new_user_id == referrer_id)."""
    mock_db.add_user(1, "Alice Referrer", "alice@example.com", "REF-ALICE-100", 0.0)

    # User 1 tries to use User 1's referral code during registration
    result = process_registration_referral(
        new_user_id=1,
        new_user_email="alice@example.com",
        referral_code="REF-ALICE-100",
    )

    assert result is None
    assert mock_db.get_user_balance(1) == 0.0
    assert len(mock_db.get_referral_rows()) == 0


def test_referral_registration_sql_injection_and_special_chars(mock_db):
    """Adversarial SQL injection attempts and special characters are safely handled."""
    mock_db.add_user(1, "Alice Referrer", "alice@example.com", "REF-ALICE-100", 0.0)
    mock_db.add_user(2, "Hacker User", "hacker@example.com", None, 0.0)

    attack_payloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "REF-ALICE-100' OR 1=1 --",
        "<script>alert(1)</script>",
        "REF-🚀-100",
        "../../etc/passwd",
        "\x00\x01\x02",
    ]

    for payload in attack_payloads:
        res = process_registration_referral(
            new_user_id=2,
            new_user_email="hacker@example.com",
            referral_code=payload,
        )
        assert res is None, f"Payload {payload} should have returned None"

    assert mock_db.get_user_balance(2) == 0.0
    assert len(mock_db.get_referral_rows()) == 0


# ===========================================================================
# Test Group 2: Escrow Milestone Release Qualification Idempotency
# ===========================================================================

def test_milestone_qualification_idempotency_multiple_approvals(mock_db):
    """
    Test milestone qualification idempotency:
    - First milestone release awards $50 to referrer.
    - Second and subsequent milestone releases on the same or different contracts MUST NOT award additional credits.
    """
    mock_db.add_user(1, "Referrer Roy", "roy@example.com", "REF-ROY-777", 0.0)
    mock_db.add_user(2, "Referee Rita", "rita@example.com", None, 0.0)

    # 1. Register referee with referral code
    reg = process_registration_referral(2, "rita@example.com", "REF-ROY-777")
    assert reg is not None
    assert mock_db.get_user_balance(2) == 20.0
    assert mock_db.get_user_balance(1) == 0.0

    # 2. Release 1st Milestone (Milestone #101 on Contract #50)
    qual1 = qualify_referral_on_milestone(client_id=2, contract_id=50, milestone_id=101)
    assert qual1 is not None
    assert qual1["status"] == "completed"
    assert qual1["reward_amount"] == 50.0
    assert mock_db.get_user_balance(1) == 50.0

    # 3. Release 2nd Milestone (Milestone #102 on Contract #50)
    qual2 = qualify_referral_on_milestone(client_id=2, contract_id=50, milestone_id=102)
    assert qual2 is None, "2nd milestone approval must return None (already qualified)"
    assert mock_db.get_user_balance(1) == 50.0, "Referrer balance must remain exactly $50.00"

    # 4. Release 3rd Milestone on a different Contract #51
    qual3 = qualify_referral_on_milestone(client_id=2, contract_id=51, milestone_id=103)
    assert qual3 is None, "Milestone on subsequent contract must return None (already qualified)"
    assert mock_db.get_user_balance(1) == 50.0, "Referrer balance must NOT be double credited"

    # Verify ledger entries: Exactly 1 welcome credit, 1 milestone reward credit
    credits = mock_db.get_credit_rows()
    assert len(credits) == 2
    assert credits[0]["amount"] == 20.0
    assert credits[0]["user_id"] == 2
    assert credits[1]["amount"] == 50.0
    assert credits[1]["user_id"] == 1


def test_milestone_qualification_missing_referee_or_unreferred_client(mock_db):
    """
    Test milestone qualification when client has no referral record:
    - Graceful no-op, returns None without exceptions.
    """
    mock_db.add_user(10, "Organic Client", "organic@example.com", None, 0.0)

    # Client #10 was never referred
    res = qualify_referral_on_milestone(client_id=10, contract_id=99, milestone_id=199)
    assert res is None
    assert len(mock_db.get_credit_rows()) == 0
    assert len(mock_db.get_wallet_tx_rows()) == 0

    # Client ID does not even exist in DB
    res_nonexistent = qualify_referral_on_milestone(client_id=99999, contract_id=99, milestone_id=199)
    assert res_nonexistent is None


def test_milestone_qualification_concurrent_race_condition(mock_db):
    """
    Stress test concurrent milestone release calls:
    Simulate 10 concurrent threads simultaneously calling qualify_referral_on_milestone for the same referee.
    Result: Exactly ONE thread must succeed and credit $50.00.
    """
    mock_db.add_user(1, "Referrer Roy", "roy@example.com", "REF-ROY-777", 0.0)
    mock_db.add_user(2, "Referee Rita", "rita@example.com", None, 0.0)

    # Register referee
    process_registration_referral(2, "rita@example.com", "REF-ROY-777")

    results = []
    def run_qualify(milestone_id):
        res = qualify_referral_on_milestone(client_id=2, contract_id=100, milestone_id=milestone_id)
        results.append(res)

    threads = []
    for i in range(10):
        t = threading.Thread(target=run_qualify, args=(200 + i,))
        threads.append(t)

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    successful_qualifications = [r for r in results if r is not None]
    assert len(successful_qualifications) == 1, f"Expected exactly 1 successful qualification, got {len(successful_qualifications)}"
    assert mock_db.get_user_balance(1) == 50.0, f"Referrer balance must be $50.00, got {mock_db.get_user_balance(1)}"
    milestone_credits = [c for c in mock_db.get_credit_rows() if c["credit_type"] == "milestone_reward"]
    assert len(milestone_credits) == 1


# ===========================================================================
# Test Group 3: Referral Stats, Invites, and Edge Cases
# ===========================================================================

def test_referral_stats_and_listing(mock_db):
    """Verify stats aggregation: total referrals, paid earnings, pending earnings."""
    mock_db.add_user(1, "Referrer Roy", "roy@example.com", "REF-ROY-777", 0.0)
    mock_db.add_user(2, "Referee Rita", "rita@example.com", None, 0.0)
    mock_db.add_user(3, "Referee Sam", "sam@example.com", None, 0.0)

    # Register 2 referees
    process_registration_referral(2, "rita@example.com", "REF-ROY-777")
    process_registration_referral(3, "sam@example.com", "REF-ROY-777")

    # Before milestone completion: 2 referrals, $0 earnings, $100 pending earnings
    stats1 = get_referral_stats(1)
    assert stats1["total_referrals"] == 2
    assert stats1["total_earnings"] == 0.0
    assert stats1["pending_earnings"] == 100.0

    # Qualify Rita's milestone
    qualify_referral_on_milestone(client_id=2, contract_id=1, milestone_id=1)

    # After milestone completion: 2 referrals, $50 paid earnings, $50 pending earnings
    stats2 = get_referral_stats(1)
    assert stats2["total_referrals"] == 2
    assert stats2["total_earnings"] == 50.0
    assert stats2["pending_earnings"] == 50.0

    # Check referral listing
    ref_list = list_referrals(1)
    assert len(ref_list) == 2
    emails = {r["referred_email"] for r in ref_list}
    assert "rita@example.com" in emails
    assert "sam@example.com" in emails


def test_invite_deduplication_and_user_existence(mock_db):
    """Verify check_already_invited and check_user_exists_by_email."""
    mock_db.add_user(1, "Referrer Roy", "roy@example.com", "REF-ROY-777", 0.0)
    mock_db.add_user(2, "Existing User", "existing@example.com", None, 0.0)

    # Check user existence
    assert check_user_exists_by_email("existing@example.com") is True
    assert check_user_exists_by_email("EXISTING@EXAMPLE.COM") is True
    assert check_user_exists_by_email("unknown@example.com") is False

    # Create invite
    create_referral(1, "invitee@example.com", "REF-ROY-777")
    assert check_already_invited(1, "invitee@example.com") is True
    assert check_already_invited(1, "INVITEE@EXAMPLE.COM") is True
    assert check_already_invited(1, "other@example.com") is False


# ===========================================================================
# Test Group 4: FastApi Router Endpoints Integration Testing
# ===========================================================================

def test_referrals_me_endpoint(mock_db):
    """Test GET /api/v1/referrals/me returns referral code, stats, and total earned."""
    mock_db.add_user(10, "Referrer Rachel", "rachel@example.com", "REF-10-ABCD", 0.0)

    from types import SimpleNamespace
    mock_user = SimpleNamespace(id=10, email="rachel@example.com", role="freelancer")
    app.dependency_overrides[get_current_user] = lambda: mock_user

    try:
        client = TestClient(app)
        response = client.get("/api/v1/referrals/me")

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["referral_code"] == "REF-10-ABCD"
        assert "https://megilance.site/signup?ref=REF-10-ABCD" in data["referral_url"]
        assert "stats" in data
        assert data["stats"]["total_referrals"] == 0
        assert data["total_earned"] == 0.0
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_referrals_invite_endpoint_and_deduplication(mock_db):
    """Test POST /api/v1/referrals/invite sends invite and rejects duplicate invites."""
    mock_db.add_user(10, "Referrer Rachel", "rachel@example.com", "REF-10-ABCD", 0.0)

    from types import SimpleNamespace
    mock_user = SimpleNamespace(id=10, email="rachel@example.com", role="freelancer")
    app.dependency_overrides[get_current_user] = lambda: mock_user

    try:
        client = TestClient(app)
        
        # 1. Send first invitation
        res1 = client.post("/api/v1/referrals/invite", json={"email": "colleague@example.com", "message": "Join MegiLance!"})
        assert res1.status_code == 200, res1.text
        assert res1.json()["email"] == "colleague@example.com"
        assert res1.json()["referral_code"] == "REF-10-ABCD"

        # 2. Send duplicate invitation to same email (must reject with 400)
        res2 = client.post("/api/v1/referrals/invite", json={"email": "COLLEAGUE@example.com"})
        assert res2.status_code == 400
        assert "already been invited" in res2.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_referrals_milestones_and_leaderboard_endpoints(mock_db):
    """Test GET /api/v1/referrals/milestones and GET /api/v1/referrals/leaderboard."""
    mock_db.add_user(10, "Leader Top", "top@example.com", "REF-10-LEAD", 0.0)

    # Add milestone tier
    mock_db.conn.cursor().execute(
        "INSERT INTO referral_milestones (id, name, description, target_count, reward_amount, icon, created_at) "
        "VALUES (1, 'Bronze Pioneer', 'Refer 3 active users', 3, 25.0, 'award', '2026-08-21T00:00:00Z')"
    )
    mock_db.conn.commit()

    from types import SimpleNamespace
    mock_user = SimpleNamespace(id=10, email="top@example.com", role="freelancer")
    app.dependency_overrides[get_current_user] = lambda: mock_user

    try:
        client = TestClient(app)

        # 1. Milestones endpoint
        res_m = client.get("/api/v1/referrals/milestones")
        assert res_m.status_code == 200
        data_m = res_m.json()
        assert "milestones" in data_m
        assert len(data_m["milestones"]) == 1
        assert data_m["milestones"][0]["name"] == "Bronze Pioneer"
        assert data_m["milestones"][0]["remaining"] == 3

        # 2. Leaderboard endpoint (monthly & all_time)
        res_lb_month = client.get("/api/v1/referrals/leaderboard?period=monthly")
        assert res_lb_month.status_code == 200
        assert "items" in res_lb_month.json()

        res_lb_all = client.get("/api/v1/referrals/leaderboard?period=all_time")
        assert res_lb_all.status_code == 200
        assert "items" in res_lb_all.json()
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_referrals_history_and_stats_endpoints(mock_db):
    """Test GET /api/v1/referrals/history and GET /api/v1/referrals/stats."""
    mock_db.add_user(10, "Referrer Rachel", "rachel@example.com", "REF-10-ABCD", 0.0)

    from types import SimpleNamespace
    mock_user = SimpleNamespace(id=10, email="rachel@example.com", role="freelancer")
    app.dependency_overrides[get_current_user] = lambda: mock_user

    try:
        client = TestClient(app)

        # Stats
        res_stats = client.get("/api/v1/referrals/stats")
        assert res_stats.status_code == 200
        data_s = res_stats.json()
        assert data_s["total_referrals"] == 0
        assert data_s["total_earned"] == 0.0

        # History
        res_hist = client.get("/api/v1/referrals/history")
        assert res_hist.status_code == 200
        data_h = res_hist.json()
        assert data_h["items"] == []
        assert data_h["total"] == 0
    finally:
        app.dependency_overrides.pop(get_current_user, None)
