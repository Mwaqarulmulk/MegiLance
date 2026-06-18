# @AI-HINT: Wallet endpoint tests — balance, transactions, deposit, withdraw, analytics,
# pending withdrawals, cancel withdrawal. Mocks Turso execute_query at all import sites.
import json
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from main import app

app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)

# ---------------------------------------------------------------------------
# In-memory store simulating the Turso database
# ---------------------------------------------------------------------------
_fake_db: dict = {
    "users": [],
    "wallet_transactions": [],
    "payments": [],
    "next_tx_id": 1,
    "next_payment_id": 1,
}


def _reset_db():
    _fake_db["users"] = [
        {
            "id": 1,
            "email": "client@test.com",
            "account_balance": 500.0,
            "hashed_password": "hashed",
            "is_active": 1,
            "is_verified": 1,
            "name": "Client User",
            "user_type": "client",
            "role": "client",
        }
    ]
    _fake_db["wallet_transactions"] = [
        {
            "id": 1,
            "user_id": 1,
            "type": "deposit",
            "amount": 200.0,
            "currency": "USD",
            "status": "completed",
            "description": "Initial deposit",
            "reference_id": "tx_001",
            "metadata": None,
            "created_at": "2026-01-15T10:00:00Z",
            "completed_at": "2026-01-15T10:05:00Z",
        },
        {
            "id": 2,
            "user_id": 1,
            "type": "withdrawal",
            "amount": 50.0,
            "currency": "USD",
            "status": "pending",
            "description": "Withdrawal via bank_transfer",
            "reference_id": "wd_001",
            "metadata": None,
            "created_at": "2026-01-16T14:00:00Z",
            "completed_at": None,
        },
    ]
    _fake_db["payments"] = []
    _fake_db["next_tx_id"] = 3
    _fake_db["next_payment_id"] = 1


def _col_val(val):
    if val is None:
        return {"type": "null", "value": None}
    if isinstance(val, bool):
        return {"type": "integer", "value": "1" if val else "0"}
    if isinstance(val, int):
        return {"type": "integer", "value": str(val)}
    if isinstance(val, float):
        return {"type": "float", "value": str(val)}
    return {"type": "text", "value": str(val)}


def _extract_col_names(sql: str) -> list[str]:
    import re
    m = re.search(r"SELECT\s+(.+?)\s+FROM", sql, re.IGNORECASE | re.DOTALL)
    if not m:
        return []
    cols_str = m.group(1)
    parts = [p.strip() for p in cols_str.split(",")]
    return [p.split()[-1].split(".")[-1] for p in parts if p]


def _build_result(rows: list[dict], col_names: list[str]) -> dict:
    cols = [{"name": c} for c in col_names]
    result_rows = []
    for row in rows:
        result_rows.append([_col_val(row.get(c)) for c in col_names])
    return {"cols": cols, "rows": result_rows}


def _fake_execute_query(sql: str, params=None):
    sql_upper = sql.strip().upper()
    params = params or []

    # --- CREATE TABLE (wallet tables) ---
    if sql_upper.startswith("CREATE"):
        return {"cols": [], "rows": []}

    # --- SELECT ---
    if sql_upper.startswith("SELECT"):
        col_names = _extract_col_names(sql)

        # wallet_balances queries
        if "WALLET_BALANCES" in sql_upper:
            if "WHERE USER_ID = ?" in sql_upper:
                uid = int(params[0]) if params else -1
                if uid == 1:
                    return _build_result(
                        [{"available": 500.0, "pending": 0.0, "escrow": 0.0, "currency": "USD", "updated_at": "2026-01-16T14:00:00Z"}],
                        col_names,
                    )
                return {"cols": [{"name": c} for c in col_names], "rows": []}
            return {"cols": [{"name": c} for c in col_names], "rows": []}

        # wallet_transactions queries
        if "WALLET_TRANSACTIONS" in sql_upper:
            uid = int(params[0]) if params else -1
            matching = [t for t in _fake_db["wallet_transactions"] if t["user_id"] == uid]

            # Check for type filter
            if "AND TYPE = ?" in sql_upper:
                type_idx = [i for i, p in enumerate(params) if isinstance(p, str) and p.lower() in ("deposit", "withdrawal", "earning", "payment")]
                if type_idx:
                    tx_type = params[type_idx[0]]
                    matching = [t for t in matching if t["type"] == tx_type]

            # Check for status IN filter
            if "STATUS IN (" in sql_upper:
                matching = [t for t in matching if t["status"] in ("pending", "processing")]

            # Check for reference_id
            if "REFERENCE_ID = ?" in sql_upper:
                for p in params:
                    if isinstance(p, str) and (p.startswith("0x") or p.startswith("wd_")):
                        matching = [t for t in _fake_db["wallet_transactions"] if t["reference_id"] == p]
                        break

            # ORDER BY
            if "ORDER BY CREATED_AT DESC" in sql_upper:
                matching.sort(key=lambda t: t.get("created_at", ""), reverse=True)

            # LIMIT / OFFSET
            limit = None
            offset = 0
            for i, p in enumerate(params):
                if isinstance(p, int) and p > 0 and i == len(params) - 2:
                    limit = p
                elif isinstance(p, int) and i == len(params) - 1:
                    offset = p
            if limit is not None:
                matching = matching[offset:offset + limit]

            return _build_result(matching, col_names)

        # users queries
        if "USERS" in sql_upper:
            if "WHERE ID = ?" in sql_upper:
                uid = int(params[0]) if params else -1
                matching = [u for u in _fake_db["users"] if u["id"] == uid]
                return _build_result(matching, col_names) if matching else {"cols": [{"name": c} for c in col_names], "rows": []}
            if "WHERE EMAIL = ?" in sql_upper:
                email = str(params[0]).lower() if params else ""
                matching = [u for u in _fake_db["users"] if u["email"] == email]
                return _build_result(matching, col_names) if matching else {"cols": [{"name": c} for c in col_names], "rows": []}
            return _build_result(_fake_db["users"], col_names)

        # payments queries
        if "PAYMENTS" in sql_upper:
            return _build_result(_fake_db["payments"], col_names)

        # REVOKED_TOKENS
        if "REVOKED_TOKENS" in sql_upper:
            return {"cols": [], "rows": []}

        return {"cols": [], "rows": []}

    # --- INSERT ---
    if sql_upper.startswith("INSERT"):
        if "WALLET_TRANSACTIONS" in sql_upper:
            tx_id = _fake_db["next_tx_id"]
            _fake_db["next_tx_id"] += 1
            # The SQL may have inline literals (e.g. 'withdrawal', 'pending', 'deposit')
            # plus parameterized values. We need to detect which SQL pattern this is.
            # Pattern 1: wallet.py withdraw INSERT with 4 params (user_id, amount, description, now)
            # Pattern 2: crypto.py deposit INSERT with 9 params (user_id, amount, ..., now)
            # Pattern 3: wallet_service.py INSERT with 9 params (user_id, type, amount, currency, status, description, reference_id, metadata, now)
            if len(params) == 4:
                # wallet.py withdraw: INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at)
                # VALUES (?, 'withdrawal', ?, ?, 'pending', ?)
                new_tx = {
                    "id": tx_id,
                    "user_id": params[0],
                    "type": "withdrawal",
                    "amount": float(params[1]),
                    "currency": "USD",
                    "status": "pending",
                    "description": params[2],
                    "reference_id": None,
                    "metadata": None,
                    "created_at": params[3],
                    "completed_at": None,
                }
            elif len(params) == 9:
                # wallet_service.py or crypto.py with full params
                new_tx = {
                    "id": tx_id,
                    "user_id": params[0],
                    "type": params[1],
                    "amount": float(params[2]),
                    "currency": str(params[3]) if params[3] else "USD",
                    "status": str(params[4]) if params[4] else "pending",
                    "description": params[5] or "",
                    "reference_id": params[6],
                    "metadata": params[7],
                    "created_at": params[8] or datetime.now(timezone.utc).isoformat(),
                    "completed_at": None,
                }
            else:
                # Fallback for unknown param count
                new_tx = {
                    "id": tx_id,
                    "user_id": params[0] if len(params) > 0 else 1,
                    "type": "unknown",
                    "amount": 0,
                    "currency": "USD",
                    "status": "pending",
                    "description": "",
                    "reference_id": None,
                    "metadata": None,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "completed_at": None,
                }
            _fake_db["wallet_transactions"].append(new_tx)
            return {"cols": [], "rows": [], "last_insert_rowid": tx_id}

        if "PAYMENTS" in sql_upper:
            pid = _fake_db["next_payment_id"]
            _fake_db["next_payment_id"] += 1
            new_payment = {
                "id": pid,
                "client_id": params[0] if len(params) > 0 else 1,
                "amount": float(params[1]) if len(params) > 1 else 0,
                "currency": params[2] if len(params) > 2 else "USD",
                "payment_method": params[3] if len(params) > 3 else "stripe",
                "status": params[4] if len(params) > 4 else "pending",
                "description": params[5] if len(params) > 5 else "",
            }
            _fake_db["payments"].append(new_payment)
            return {"cols": [], "rows": [], "last_insert_rowid": pid}

        if "WALLET_BALANCES" in sql_upper:
            return {"cols": [], "rows": []}

        return {"cols": [], "rows": []}

    # --- UPDATE ---
    if sql_upper.startswith("UPDATE"):
        rows_affected = 0

        if "WALLET_TRANSACTIONS" in sql_upper:
            # UPDATE wallet_transactions SET status = ? ...
            if "SET STATUS =" in sql_upper:
                new_status = params[0] if params else "pending"
                ref_id = params[-1] if params else None
                for tx in _fake_db["wallet_transactions"]:
                    if tx["reference_id"] == ref_id:
                        tx["status"] = new_status
                        rows_affected += 1
                        break
                # Also handle WHERE id = ? pattern
                if rows_affected == 0 and params:
                    for p in params:
                        if isinstance(p, int):
                            for tx in _fake_db["wallet_transactions"]:
                                if tx["id"] == p:
                                    tx["status"] = new_status
                                    rows_affected += 1
                                    break

            # UPDATE wallet_transactions SET status = 'cancelled' ...
            if "STATUS = 'CANCELLED'" in sql_upper or "STATUS = 'CANCELED'" in sql_upper:
                for tx in _fake_db["wallet_transactions"]:
                    if tx["id"] == params[1] if len(params) > 1 else -1:
                        tx["status"] = "cancelled"
                        rows_affected += 1
                        break

            # UPDATE wallet_transactions SET status = ?, completed_at = ? WHERE reference_id = ?
            if "COMPLETED_AT" in sql_upper and "REFERENCE_ID = ?" in sql_upper:
                new_status = params[0] if params else "completed"
                ref_id = params[-1] if params else None
                for tx in _fake_db["wallet_transactions"]:
                    if tx["reference_id"] == ref_id:
                        tx["status"] = new_status
                        tx["completed_at"] = datetime.now(timezone.utc).isoformat()
                        rows_affected += 1
                        break

            # UPDATE wallet_transactions SET status = 'failed' WHERE id = ?
            if "STATUS = 'FAILED'" in sql_upper:
                tx_id = params[0] if params else -1
                for tx in _fake_db["wallet_transactions"]:
                    if tx["id"] == tx_id:
                        tx["status"] = "failed"
                        rows_affected += 1
                        break

            return {"cols": [], "rows": [], "rows_affected": rows_affected}

        if "WALLET_BALANCES" in sql_upper:
            # UPDATE wallet_balances SET available = available - ? ... WHERE user_id = ? AND available >= ?
            if "AVAILABLE = AVAILABLE -" in sql_upper:
                amount = float(params[0]) if params else 0
                uid = int(params[3]) if len(params) > 3 else -1
                min_balance = float(params[4]) if len(params) > 4 else 0
                for bal in _fake_db.get("wallet_balances", []):
                    if bal["user_id"] == uid and bal["available"] >= min_balance:
                        bal["available"] -= amount
                        bal["pending"] += amount
                        rows_affected = 1
                        break
                # Also check users table balance
                if rows_affected == 0:
                    for u in _fake_db["users"]:
                        if u["id"] == uid and u.get("account_balance", 0) >= min_balance:
                            u["account_balance"] -= amount
                            rows_affected = 1
                            break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            # UPDATE wallet_balances SET pending = MAX(0.0, pending - ?), available = available + ?
            if "PENDING = MAX" in sql_upper or "PENDING = MAX(0.0" in sql_upper:
                amount = float(params[0]) if params else 0
                uid = int(params[3]) if len(params) > 3 else -1
                for u in _fake_db["users"]:
                    if u["id"] == uid:
                        u["account_balance"] = u.get("account_balance", 0) + amount
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            # UPDATE wallet_balances SET available = available + ?
            if "AVAILABLE = AVAILABLE +" in sql_upper:
                amount = float(params[0]) if params else 0
                uid = int(params[2]) if len(params) > 2 else -1
                for u in _fake_db["users"]:
                    if u["id"] == uid:
                        u["account_balance"] = u.get("account_balance", 0) + amount
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            return {"cols": [], "rows": [], "rows_affected": rows_affected}

        if "USERS" in sql_upper:
            # UPDATE users SET account_balance = account_balance - ? WHERE id = ? AND account_balance >= ?
            if "ACCOUNT_BALANCE = ACCOUNT_BALANCE -" in sql_upper:
                amount = float(params[0]) if params else 0
                uid = int(params[1]) if len(params) > 1 else -1
                min_bal = float(params[2]) if len(params) > 2 else 0
                for u in _fake_db["users"]:
                    if u["id"] == uid and u.get("account_balance", 0) >= min_bal:
                        u["account_balance"] -= amount
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            # UPDATE users SET account_balance = COALESCE(account_balance, 0) + ?
            if "COALESCE(ACCOUNT_BALANCE" in sql_upper or "ACCOUNT_BALANCE = COALESCE" in sql_upper:
                amount = float(params[0]) if params else 0
                uid = int(params[1]) if len(params) > 1 else -1
                for u in _fake_db["users"]:
                    if u["id"] == uid:
                        u["account_balance"] = u.get("account_balance", 0) + amount
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            return {"cols": [], "rows": [], "rows_affected": rows_affected}

        return {"cols": [], "rows": [], "rows_affected": rows_affected}

    return {"cols": [], "rows": []}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _mock_turso(monkeypatch):
    _reset_db()
    targets = [
        "app.db.turso_http.execute_query",
        "app.api.v1.payments_domain.wallet.execute_query",
        "app.api.v1.payments_domain.crypto.execute_query",
        "app.services.wallet_service.execute_query",
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


def _auth_headers():
    from app.core.security import create_access_token
    token = create_access_token(
        subject="client@test.com",
        custom_claims={"user_id": 1, "role": "client"},
    )
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Tests: GET /api/wallet
# ---------------------------------------------------------------------------
class TestGetWallet:
    def test_get_wallet_returns_balance(self):
        resp = client.get("/api/wallet", headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "balance" in data
        assert "transactions" in data
        assert "currency" in data
        assert data["currency"] == "USD"

    def test_get_wallet_requires_auth(self):
        resp = client.get("/api/wallet")
        assert resp.status_code in (401, 403)

    def test_get_wallet_returns_transactions_list(self):
        resp = client.get("/api/wallet", headers=_auth_headers())
        data = resp.json()
        assert isinstance(data["transactions"], list)


# ---------------------------------------------------------------------------
# Tests: GET /api/wallet/transactions
# ---------------------------------------------------------------------------
class TestListTransactions:
    def test_list_transactions_returns_paginated(self):
        resp = client.get("/api/wallet/transactions", headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert isinstance(data["items"], list)

    def test_list_transactions_page_param(self):
        resp = client.get("/api/wallet/transactions?page=1&page_size=10", headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert data["page"] == 1

    def test_list_transactions_requires_auth(self):
        resp = client.get("/api/wallet/transactions")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Tests: POST /api/wallet/deposit
# ---------------------------------------------------------------------------
class TestDeposit:
    def test_deposit_positive_amount(self):
        resp = client.post("/api/wallet/deposit", json={"amount": 100, "method": "stripe"}, headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["amount"] == 100

    def test_deposit_rejects_zero(self):
        resp = client.post("/api/wallet/deposit", json={"amount": 0}, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_rejects_negative(self):
        resp = client.post("/api/wallet/deposit", json={"amount": -50}, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_rejects_over_max(self):
        resp = client.post("/api/wallet/deposit", json={"amount": 50000}, headers=_auth_headers())
        assert resp.status_code == 400
        assert "10,000" in resp.json()["detail"]

    def test_deposit_requires_auth(self):
        resp = client.post("/api/wallet/deposit", json={"amount": 100})
        assert resp.status_code in (401, 403)

    def test_deposit_default_method(self):
        resp = client.post("/api/wallet/deposit", json={"amount": 50}, headers=_auth_headers())
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Tests: POST /api/wallet/withdraw
# ---------------------------------------------------------------------------
class TestWithdraw:
    def test_withdraw_sufficient_balance(self):
        resp = client.post("/api/wallet/withdraw", json={"amount": 100, "method": "bank_transfer"}, headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "balance" in data

    def test_withdraw_rejects_zero(self):
        resp = client.post("/api/wallet/withdraw", json={"amount": 0}, headers=_auth_headers())
        assert resp.status_code == 400

    def test_withdraw_rejects_negative(self):
        resp = client.post("/api/wallet/withdraw", json={"amount": -100}, headers=_auth_headers())
        assert resp.status_code == 400

    def test_withdraw_rejects_over_max(self):
        resp = client.post("/api/wallet/withdraw", json={"amount": 50000}, headers=_auth_headers())
        assert resp.status_code == 400

    def test_withdraw_requires_auth(self):
        resp = client.post("/api/wallet/withdraw", json={"amount": 100})
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Tests: GET /api/wallet/analytics
# ---------------------------------------------------------------------------
class TestWalletAnalytics:
    def test_analytics_default_period(self):
        resp = client.get("/api/wallet/analytics", headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "total_income" in data
        assert "total_expenses" in data
        assert "transaction_count" in data

    def test_analytics_7d_period(self):
        resp = client.get("/api/wallet/analytics?period=7d", headers=_auth_headers())
        assert resp.status_code == 200

    def test_analytics_90d_period(self):
        resp = client.get("/api/wallet/analytics?period=90d", headers=_auth_headers())
        assert resp.status_code == 200

    def test_analytics_invalid_period(self):
        resp = client.get("/api/wallet/analytics?period=invalid", headers=_auth_headers())
        assert resp.status_code == 422

    def test_analytics_requires_auth(self):
        resp = client.get("/api/wallet/analytics")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Tests: GET /api/wallet/withdrawals/pending
# ---------------------------------------------------------------------------
class TestPendingWithdrawals:
    def test_pending_withdrawals_empty(self):
        resp = client.get("/api/wallet/withdrawals/pending", headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "withdrawals" in data
        assert "total" in data
        assert isinstance(data["withdrawals"], list)

    def test_pending_withdrawals_requires_auth(self):
        resp = client.get("/api/wallet/withdrawals/pending")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Tests: POST /api/wallet/withdrawals/{reference_id}/cancel
# ---------------------------------------------------------------------------
class TestCancelWithdrawal:
    def test_cancel_nonexistent_withdrawal(self):
        resp = client.post("/api/wallet/withdrawals/wd_nonexistent/cancel", headers=_auth_headers())
        assert resp.status_code == 400

    def test_cancel_requires_auth(self):
        resp = client.post("/api/wallet/withdrawals/wd_001/cancel")
        assert resp.status_code in (401, 403)
