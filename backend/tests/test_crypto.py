# @AI-HINT: Crypto (MetaMask) endpoint tests — config, deposit, verify.
# Tests the EVM chain registry, deposit flow, idempotency, and verification logic.
import json
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

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
    "next_tx_id": 1,
}


def _reset_db():
    _fake_db["users"] = [
        {
            "id": 1,
            "email": "client@test.com",
            "account_balance": 100.0,
            "hashed_password": "hashed",
            "is_active": 1,
            "is_verified": 1,
            "name": "Client User",
            "user_type": "client",
            "role": "client",
        }
    ]
    _fake_db["wallet_transactions"] = []
    _fake_db["next_tx_id"] = 1


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

    if sql_upper.startswith("CREATE"):
        return {"cols": [], "rows": []}

    if sql_upper.startswith("SELECT"):
        col_names = _extract_col_names(sql)

        if "WALLET_TRANSACTIONS" in sql_upper:
            if "REFERENCE_ID = ?" in sql_upper and "TYPE = 'DEPOSIT'" in sql_upper:
                ref_id = params[0] if params else None
                uid = params[1] if len(params) > 1 else None
                matching = [t for t in _fake_db["wallet_transactions"]
                           if t.get("reference_id") == ref_id
                           and (uid is None or t.get("user_id") == uid)]
                return _build_result(matching, col_names) if matching else {"cols": [{"name": c} for c in col_names], "rows": []}

            if "REFERENCE_ID = ?" in sql_upper:
                ref_id = params[0] if params else None
                matching = [t for t in _fake_db["wallet_transactions"] if t.get("reference_id") == ref_id]
                return _build_result(matching, col_names) if matching else {"cols": [{"name": c} for c in col_names], "rows": []}

            return {"cols": [{"name": c} for c in col_names], "rows": []}

        if "USERS" in sql_upper:
            if "WHERE ID = ?" in sql_upper:
                uid = int(params[0]) if params else -1
                matching = [u for u in _fake_db["users"] if u["id"] == uid]
                return _build_result(matching, col_names) if matching else {"cols": [{"name": c} for c in col_names], "rows": []}
            return _build_result(_fake_db["users"], col_names)

        if "REVOKED_TOKENS" in sql_upper:
            return {"cols": [], "rows": []}

        return {"cols": [], "rows": []}

    if sql_upper.startswith("INSERT"):
        if "WALLET_TRANSACTIONS" in sql_upper:
            tx_id = _fake_db["next_tx_id"]
            _fake_db["next_tx_id"] += 1
            # crypto.py deposit INSERT has 6 params: (user_id, amount_usd, label, tx_hash, meta, now)
            # with inline literals: 'deposit', 'USD', 'pending'
            if len(params) == 6:
                new_tx = {
                    "id": tx_id,
                    "user_id": params[0],
                    "type": "deposit",
                    "amount": float(params[1]),
                    "currency": "USD",
                    "status": "pending",
                    "description": params[2] or "",
                    "reference_id": params[3],
                    "metadata": params[4],
                    "created_at": params[5] or datetime.now(timezone.utc).isoformat(),
                    "completed_at": None,
                }
            elif len(params) == 9:
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
                new_tx = {
                    "id": tx_id,
                    "user_id": params[0] if len(params) > 0 else 1,
                    "type": "deposit",
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
        return {"cols": [], "rows": []}

    if sql_upper.startswith("UPDATE"):
        rows_affected = 0

        if "WALLET_TRANSACTIONS" in sql_upper:
            # UPDATE wallet_transactions SET status = 'completed', amount = ?, completed_at = ? WHERE id = ? AND status != 'completed'
            if "COMPLETED_AT" in sql_upper and "STATUS != 'COMPLETED'" in sql_upper:
                amount = float(params[0]) if params else 0
                tx_id = params[2] if len(params) > 2 else -1
                for tx in _fake_db["wallet_transactions"]:
                    if tx["id"] == tx_id and tx["status"] != "completed":
                        tx["status"] = "completed"
                        tx["amount"] = amount
                        tx["completed_at"] = datetime.now(timezone.utc).isoformat()
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            # UPDATE wallet_transactions SET status = 'failed' WHERE id = ?
            if "STATUS = 'FAILED'" in sql_upper:
                tx_id = params[0] if params else -1
                for tx in _fake_db["wallet_transactions"]:
                    if tx["id"] == tx_id:
                        tx["status"] = "failed"
                        rows_affected = 1
                        break
                return {"cols": [], "rows": [], "rows_affected": rows_affected}

            return {"cols": [], "rows": [], "rows_affected": rows_affected}

        if "USERS" in sql_upper:
            # UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?
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


@pytest.fixture(autouse=True)
def _mock_turso(monkeypatch):
    _reset_db()
    targets = [
        "app.db.turso_http.execute_query",
        "app.api.v1.payments_domain.crypto.execute_query",
        "app.api.v1.payments_domain.wallet.execute_query",
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
# Tests: GET /api/crypto/config
# ---------------------------------------------------------------------------
class TestCryptoConfig:
    def test_config_returns_chains(self):
        resp = client.get("/api/crypto/config")
        assert resp.status_code == 200
        data = resp.json()
        assert "supported_chains" in data
        assert isinstance(data["supported_chains"], list)
        assert len(data["supported_chains"]) > 0

    def test_config_has_required_fields(self):
        resp = client.get("/api/crypto/config")
        data = resp.json()
        chain = data["supported_chains"][0]
        assert "chain_id" in chain
        assert "chain_name" in chain
        assert "rpc_url" in chain
        assert "block_explorer" in chain
        assert "receiving_address" in chain

    def test_config_default_chain(self):
        resp = client.get("/api/crypto/config")
        data = resp.json()
        assert "chain_id" in data
        assert "chain_name" in data
        assert "rpc_url" in data

    def test_config_includes_testnets(self):
        resp = client.get("/api/crypto/config")
        data = resp.json()
        chain_names = [c["chain_name"] for c in data["supported_chains"]]
        assert any("testnet" in name.lower() or "sepolia" in name.lower() or "amoy" in name.lower() for name in chain_names)

    def test_config_no_auth_required(self):
        resp = client.get("/api/crypto/config")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Tests: POST /api/crypto/deposit
# ---------------------------------------------------------------------------
class TestCryptoDeposit:
    def test_deposit_valid_native(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0x" + "a" * 64,
            "amount_usd": 100,
            "amount_crypto": 0.05,
            "chain_id": 1,
            "from_address": "0x1234567890abcdef1234567890abcdef12345678",
            "currency": "ETH",
            "asset_type": "native",
        }, headers=_auth_headers())
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data

    def test_deposit_rejects_zero_amount(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0x" + "a" * 64,
            "amount_usd": 0,
            "amount_crypto": 0,
            "chain_id": 1,
        }, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_rejects_over_max(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0x" + "a" * 64,
            "amount_usd": 50000,
            "amount_crypto": 25,
            "chain_id": 1,
        }, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_rejects_invalid_hash_short(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0xabc",
            "amount_usd": 100,
            "amount_crypto": 0.05,
            "chain_id": 1,
        }, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_rejects_invalid_hash_no_prefix(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "a" * 64,
            "amount_usd": 100,
            "amount_crypto": 0.05,
            "chain_id": 1,
        }, headers=_auth_headers())
        assert resp.status_code == 400

    def test_deposit_idempotent(self):
        payload = {
            "tx_hash": "0x" + "b" * 64,
            "amount_usd": 200,
            "amount_crypto": 0.1,
            "chain_id": 1,
            "currency": "ETH",
            "asset_type": "native",
        }
        resp1 = client.post("/api/crypto/deposit", json=payload, headers=_auth_headers())
        assert resp1.status_code == 200

        resp2 = client.post("/api/crypto/deposit", json=payload, headers=_auth_headers())
        assert resp2.status_code == 200

    def test_deposit_requires_auth(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0x" + "a" * 64,
            "amount_usd": 100,
            "amount_crypto": 0.05,
            "chain_id": 1,
        })
        assert resp.status_code in (401, 403)

    def test_deposit_token_transfer(self):
        resp = client.post("/api/crypto/deposit", json={
            "tx_hash": "0x" + "c" * 64,
            "amount_usd": 50,
            "amount_crypto": 50,
            "chain_id": 1,
            "currency": "USDC",
            "asset_type": "token",
            "token_address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "token_decimals": 6,
        }, headers=_auth_headers())
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Tests: GET /api/crypto/verify/{tx_hash}
# ---------------------------------------------------------------------------
class TestCryptoVerify:
    def test_verify_nonexistent_tx(self):
        resp = client.get("/api/crypto/verify/0x" + "f" * 64, headers=_auth_headers())
        assert resp.status_code == 404

    def test_verify_requires_auth(self):
        resp = client.get("/api/crypto/verify/0x" + "f" * 64)
        assert resp.status_code in (401, 403)
