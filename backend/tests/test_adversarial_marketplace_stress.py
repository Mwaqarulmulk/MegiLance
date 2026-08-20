# @AI-HINT: Comprehensive Adversarial Stress Test Suite for MegiLance 2.0 Marketplace Endpoints
# Tests: Currency boundaries, Escrow integrity, RBAC authorization, SQL/XSS resilience, Multi-tenant isolation.

import uuid
from types import SimpleNamespace
from datetime import datetime, timezone
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import app
from app.core.security import get_current_user
from app.api.v1.projects_domain import milestones, proposals, contracts
from app.api.v1.payments_domain import escrow, wallet
from app.api.v1.reviews_domain import reviews, disputes
from app.api.v1.core_domain import support_tickets
from app.services import escrow_service, wallet_service, disputes_service

# Disable startup/shutdown background hooks for deterministic unit testing
app.router.on_startup.clear()
app.router.on_shutdown.clear()

client = TestClient(app)


@pytest.fixture(autouse=True)
def _cleanup_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


def _build_result(columns: list[str], rows: list[list[object]], last_id=1, affected=1) -> dict:
    """Build a Turso-compliant cols/rows response structure."""
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


# ============================================================================
# 1. CURRENCY & BUDGET BOUNDARY STRESS TESTS
# ============================================================================

class TestCurrencyAndBudgetBoundaries:
    """Stress tests for budget limits, zero/negative amounts, and overdrafts."""

    def test_milestone_zero_amount_rejected(self, monkeypatch):
        """Milestone creation with zero amount must be rejected with 400."""
        def fake_execute(sql, params=None):
            return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000]])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.create_milestone(
                milestones.MilestoneCreate(contract_id=10, title="Zero milestone", amount=0.0),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "positive" in exc.value.detail.lower()

    def test_milestone_negative_amount_rejected(self, monkeypatch):
        """Milestone creation with negative amount must be rejected with 400."""
        def fake_execute(sql, params=None):
            return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000]])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.create_milestone(
                milestones.MilestoneCreate(contract_id=10, title="Negative milestone", amount=-250.0),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "positive" in exc.value.detail.lower()

    def test_milestone_overallocation_beyond_contract_rejected(self, monkeypatch):
        """Milestone amounts summing beyond contract amount must be rejected with 400."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            if "COALESCE(SUM(AMOUNT)" in sql_u:
                return _build_result(["allocated"], [[700.0]])  # $700 already allocated
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        # Attempting to allocate $400 ($700 + $400 = $1,100 > $1,000)
        with pytest.raises(HTTPException) as exc:
            milestones.create_milestone(
                milestones.MilestoneCreate(contract_id=10, title="Overallocated chunk", amount=400.0),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "exceed the contract amount" in exc.value.detail

    def test_milestone_update_overallocation_rejected(self, monkeypatch):
        """Editing an existing milestone to exceed contract total must fail with 400."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM MILESTONES WHERE ID = ?" in sql_u:
                return _build_result(["contract_id", "status"], [[10, "pending"]])
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            if "COALESCE(SUM(AMOUNT)" in sql_u:
                return _build_result(["allocated"], [[500.0]])  # Other milestones total $500
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        # Updating milestone to $600 ($500 + $600 = $1100 > $1000)
        with pytest.raises(HTTPException) as exc:
            milestones.update_milestone(
                milestone_id=30,
                request=milestones.MilestoneUpdate(amount=600.0),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "exceed the contract amount" in exc.value.detail

    def test_wallet_deposit_negative_and_zero_amount(self):
        """Wallet deposit with <= 0 amount must be rejected with 400."""
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp_zero = client.post("/api/v1/wallet/deposit", json={"amount": 0.0, "method": "stripe"})
        assert resp_zero.status_code == 400
        assert "positive" in resp_zero.json()["detail"].lower()

        resp_neg = client.post("/api/v1/wallet/deposit", json={"amount": -100.0, "method": "stripe"})
        assert resp_neg.status_code == 400
        assert "positive" in resp_neg.json()["detail"].lower()

    def test_wallet_deposit_exceeding_max_limit(self):
        """Wallet deposit > $10,000 limit must be rejected with 400."""
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp = client.post("/api/v1/wallet/deposit", json={"amount": 10000.01, "method": "stripe"})
        assert resp.status_code == 400
        assert "maximum" in resp.json()["detail"].lower()

    def test_wallet_withdraw_negative_and_zero_amount(self):
        """Wallet withdrawal with <= 0 amount must be rejected with 400."""
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp_zero = client.post("/api/v1/wallet/withdraw", json={"amount": 0.0, "method": "bank_transfer"})
        assert resp_zero.status_code == 400
        assert "positive" in resp_zero.json()["detail"].lower()

        resp_neg = client.post("/api/v1/wallet/withdraw", json={"amount": -50.0, "method": "bank_transfer"})
        assert resp_neg.status_code == 400
        assert "positive" in resp_neg.json()["detail"].lower()

    def test_wallet_withdraw_overdraft_prevention(self, monkeypatch):
        """Wallet withdrawal exceeding available balance must fail atomically without balance overdraft."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "UPDATE USERS SET ACCOUNT_BALANCE" in sql_u:
                return {"rows_affected": 0, "rows": []}
            return {"rows_affected": 0, "rows": []}
        monkeypatch.setattr(wallet, "execute_query", fake_execute)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="freelancer", user_type="freelancer")
        resp = client.post("/api/v1/wallet/withdraw", json={"amount": 500.0, "method": "bank_transfer"})
        assert resp.status_code == 400
        assert "insufficient balance" in resp.json()["detail"].lower()

    def test_escrow_create_insufficient_balance_overdraft(self, monkeypatch):
        """Escrow creation when client balance is insufficient must fail with 400."""
        monkeypatch.setattr(escrow, "get_contract_parties", lambda cid: {"id": 10, "client_id": 1, "freelancer_id": 2})
        monkeypatch.setattr(escrow, "get_user_balance", lambda uid: 150.0)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp = client.post("/api/v1/escrow/create", json={"contract_id": 10, "amount": 500.0})
        assert resp.status_code == 400
        assert "insufficient balance" in resp.json()["detail"].lower()

    def test_escrow_fund_insufficient_balance_overdraft(self, monkeypatch):
        """Funding a pending escrow with insufficient client wallet balance must fail with 400."""
        monkeypatch.setattr(escrow, "get_contract_parties", lambda cid: {"id": 10, "client_id": 1, "freelancer_id": 2})
        monkeypatch.setattr(escrow, "get_user_balance", lambda uid: 50.0)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp = client.post("/api/v1/escrow/fund", json={"contract_id": 10, "amount": 1000.0})
        assert resp.status_code == 400
        assert "insufficient balance" in resp.json()["detail"].lower()


# ============================================================================
# 2. ESCROW INTEGRITY & DOUBLE-SPEND DEFENSE TESTS
# ============================================================================

class TestEscrowIntegrityAndAccessControl:
    """Stress tests for milestone status gates, duplicate approvals, and RBAC."""

    def test_unapproved_rejected_milestone_cannot_be_approved(self, monkeypatch):
        """Milestones in 'rejected' status cannot be approved (must fail with 400)."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM MILESTONES WHERE ID = ?" in sql_u:
                return _build_result(["contract_id", "status", "amount"], [[10, "rejected", 500.0]])
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.approve_milestone(
                milestone_id=30,
                request=milestones.MilestoneApprove(approval_notes="Accept rejected"),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "cannot approve milestone in 'rejected' status" in exc.value.detail.lower()

    def test_duplicate_milestone_approval_double_spend_prevention(self, monkeypatch):
        """Re-approving an already approved milestone must fail with 400 to prevent double payout."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM MILESTONES WHERE ID = ?" in sql_u:
                return _build_result(["contract_id", "status", "amount"], [[10, "approved", 500.0]])
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.approve_milestone(
                milestone_id=30,
                request=milestones.MilestoneApprove(approval_notes="Duplicate approval invocation"),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 400
        assert "cannot approve milestone in 'approved' status" in exc.value.detail.lower()

    def test_freelancer_cannot_approve_own_milestone(self, monkeypatch):
        """Freelancer attempting to approve their own milestone must be rejected with 403 Forbidden."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM MILESTONES WHERE ID = ?" in sql_u:
                return _build_result(["contract_id", "status", "amount"], [[10, "submitted", 500.0]])
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.approve_milestone(
                milestone_id=30,
                request=milestones.MilestoneApprove(approval_notes="Freelancer self-approval"),
                current_user=SimpleNamespace(id=2),
            )
        assert exc.value.status_code == 403
        assert "only the client can approve milestones" in exc.value.detail.lower()

    def test_client_cannot_submit_freelancer_deliverable(self, monkeypatch):
        """Client attempting to submit freelancer deliverables must be rejected with 403 Forbidden."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM MILESTONES WHERE ID = ?" in sql_u:
                return _build_result(["contract_id", "status"], [[10, "pending"]])
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones.submit_milestone(
                milestone_id=30,
                request=milestones.MilestoneSubmit(deliverables="https://spoofed.url"),
                current_user=SimpleNamespace(id=1),
            )
        assert exc.value.status_code == 403
        assert "only the assigned freelancer can submit milestones" in exc.value.detail.lower()

    def test_unrelated_third_party_contract_access_denied(self, monkeypatch):
        """A user who is neither client nor freelancer on a contract gets 403 Access Denied."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)

        with pytest.raises(HTTPException) as exc:
            milestones._verify_contract_access(contract_id=10, user_id=99)
        assert exc.value.status_code == 403
        assert "access denied" in exc.value.detail.lower()

    def test_escrow_release_duplicate_or_over_release_rejected(self, monkeypatch):
        """Releasing more than available escrow balance or from released escrow must fail with 400."""
        monkeypatch.setattr(escrow, "get_escrow_core", lambda eid: {
            "id": eid, "contract_id": 10, "client_id": 1, "amount": 1000.0, "released_amount": 1000.0, "status": "released"
        })
        monkeypatch.setattr(escrow, "get_contract_parties", lambda cid: {"id": 10, "client_id": 1, "freelancer_id": 2})

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp = client.post("/api/v1/escrow/10/release", json={"escrow_id": 10, "amount": 100.0})
        assert resp.status_code == 400
        assert "status: released" in resp.json()["detail"].lower()

    def test_escrow_refund_already_released_rejected(self, monkeypatch):
        """Attempting to refund an already released or empty escrow must fail with 400."""
        monkeypatch.setattr(escrow, "get_escrow_core", lambda eid: {
            "id": eid, "contract_id": 10, "client_id": 1, "amount": 1000.0, "released_amount": 1000.0, "status": "released"
        })

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp = client.post("/api/v1/escrow/10/refund")
        assert resp.status_code == 400
        assert "status: released" in resp.json()["detail"].lower()

    def test_freelancer_cannot_release_or_refund_escrow(self, monkeypatch):
        """Freelancer attempting to trigger escrow release or refund must receive 403 Forbidden."""
        monkeypatch.setattr(escrow, "get_escrow_core", lambda eid: {
            "id": eid, "contract_id": 10, "client_id": 1, "amount": 1000.0, "released_amount": 0.0, "status": "funded"
        })
        monkeypatch.setattr(escrow, "get_contract_parties", lambda cid: {"id": 10, "client_id": 1, "freelancer_id": 2})

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=2, role="freelancer", user_type="freelancer")
        resp_release = client.post("/api/v1/escrow/10/release", json={"escrow_id": 10, "amount": 500.0})
        assert resp_release.status_code == 403
        assert "only the client can release escrow" in resp_release.json()["detail"].lower()

        resp_refund = client.post("/api/v1/escrow/10/refund")
        assert resp_refund.status_code == 403
        assert "only the client can refund escrow" in resp_refund.json()["detail"].lower()


# ============================================================================
# 3. SECURITY, SQL/SCRIPT INJECTION & MULTI-TENANT ISOLATION TESTS
# ============================================================================

class TestSecurityAndInputValidation:
    """Stress tests for SQL/XSS payloads, review manipulation, and support ticket isolation."""

    def test_sql_injection_payload_in_milestone_creation(self, monkeypatch):
        """Parameterized query execution safely handles SQL injection payloads in milestone fields."""
        executed_params = []
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status", "amount"], [[10, 1, 2, "active", 1000.0]])
            if "COALESCE(SUM(AMOUNT)" in sql_u:
                return _build_result(["allocated"], [[0.0]])
            if "INSERT INTO MILESTONES" in sql_u:
                executed_params.extend(params or [])
                return {"rows_affected": 1, "last_insert_rowid": 88}
            return _build_result([], [])
        monkeypatch.setattr(milestones, "execute_query", fake_execute)
        monkeypatch.setattr(milestones, "_notify_safely", lambda *args, **kwargs: None)

        payload_title = "'); DROP TABLE users; --"
        payload_desc = "' UNION SELECT password_hash FROM users WHERE '1'='1"

        res = milestones.create_milestone(
            milestones.MilestoneCreate(
                contract_id=10,
                title=payload_title,
                description=payload_desc,
                amount=250.0,
            ),
            current_user=SimpleNamespace(id=1),
        )
        assert res["milestone_id"] == 88
        assert payload_title in executed_params
        assert payload_desc in executed_params

    def test_xss_script_payload_in_reviews(self, monkeypatch):
        """XSS and script injection payloads in review comments are stored safely without execution."""
        executed_params = []
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status"], [[10, 1, 2, "completed"]])
            if "FROM REVIEWS WHERE CONTRACT_ID = ?" in sql_u:
                return _build_result([], [])
            if "INSERT INTO REVIEWS" in sql_u:
                executed_params.extend(params or [])
                return {"rows_affected": 1, "last_insert_rowid": 44}
            return _build_result([], [])
        monkeypatch.setattr(reviews, "execute_query", fake_execute)

        xss_payload = "<script>alert(document.cookie);</script><img src=x onerror=alert(1)>"
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

        resp = client.post("/api/v1/reviews", json={
            "contract_id": 10,
            "rating": 5,
            "comment": xss_payload,
        })
        assert resp.status_code == 200
        assert resp.json()["review_id"] == 44
        assert xss_payload in executed_params

    def test_review_rating_boundaries_and_duplicate_prevention(self, monkeypatch):
        """Review rating must be between 1 and 5; duplicate review for same contract rejected with 409."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                return _build_result(["id", "client_id", "freelancer_id", "status"], [[10, 1, 2, "completed"]])
            if "FROM REVIEWS WHERE CONTRACT_ID = ?" in sql_u:
                return _build_result([], [])
            return _build_result([], [])
        monkeypatch.setattr(reviews, "execute_query", fake_execute)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

        # Rating = 0 (boundary failure)
        resp_0 = client.post("/api/v1/reviews", json={"contract_id": 10, "rating": 0, "comment": "Zero star"})
        assert resp_0.status_code == 400
        assert "between 1 and 5" in resp_0.json()["detail"].lower()

        # Rating = 6 (boundary failure)
        resp_6 = client.post("/api/v1/reviews", json={"contract_id": 10, "rating": 6, "comment": "Six star"})
        assert resp_6.status_code == 400
        assert "between 1 and 5" in resp_6.json()["detail"].lower()

    def test_review_unauthorized_parties_and_updates(self, monkeypatch):
        """Only contract parties can review; only author can edit/delete; only reviewee can respond."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM CONTRACTS WHERE ID = ?" in sql_u:
                # client_id = 1, freelancer_id = 2
                return _build_result(["id", "client_id", "freelancer_id", "status"], [[10, 1, 2, "completed"]])
            if "SELECT ID, REVIEWER_ID FROM REVIEWS WHERE ID = ?" in sql_u:
                return _build_result(["id", "reviewer_id"], [[88, 1]])  # authored by user 1
            if "SELECT ID, REVIEWEE_ID FROM REVIEWS WHERE ID = ?" in sql_u:
                return _build_result(["id", "reviewee_id"], [[88, 2]])  # reviewee is user 2
            return _build_result([], [])
        monkeypatch.setattr(reviews, "execute_query", fake_execute)

        # Attacker user 99 creates review -> 403
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=99, role="client", user_type="client")
        resp_create = client.post("/api/v1/reviews", json={"contract_id": 10, "rating": 4, "comment": "Third party"})
        assert resp_create.status_code == 403
        assert "only contract parties can review" in resp_create.json()["detail"].lower()

        # Attacker user 99 edits review 88 -> 403
        resp_edit = client.put("/api/v1/reviews/88", json={"rating": 1, "comment": "Hacked review"})
        assert resp_edit.status_code == 403
        assert "only the reviewer can edit" in resp_edit.json()["detail"].lower()

        # Attacker user 99 deletes review 88 -> 403
        resp_del = client.delete("/api/v1/reviews/88")
        assert resp_del.status_code == 403
        assert "only the reviewer can delete" in resp_del.json()["detail"].lower()

        # Attacker user 99 responds to review 88 -> 403
        resp_resp = client.post("/api/v1/reviews/88/respond", json={"response": "Fake response"})
        assert resp_resp.status_code == 403
        assert "only the reviewed user can respond" in resp_resp.json()["detail"].lower()

    def test_support_tickets_multi_tenant_isolation_non_admin(self, monkeypatch):
        """Non-admin user cannot access, reply to, or close another user's support ticket."""
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            if "FROM SUPPORT_TICKETS WHERE ID = ? AND USER_ID = ?" in sql_u:
                if params[1] == 99:
                    return _build_result([], [])
                return _build_result(["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                                     [[7, 5, "Secret issue", "Details", "billing", "high", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"]])
            return _build_result([], [])
        monkeypatch.setattr(support_tickets, "execute_query", fake_execute)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=99, role="client", user_type="client")

        # GET ticket belonging to user 5 -> 404
        resp_get = client.get("/api/v1/support-tickets/7")
        assert resp_get.status_code == 404

        # Reply to ticket belonging to user 5 -> 404
        resp_reply = client.post("/api/v1/support-tickets/7/reply", json={"message": "Attacker reply"})
        assert resp_reply.status_code == 404

        # Close ticket belonging to user 5 -> 404
        resp_close = client.post("/api/v1/support-tickets/7/close")
        assert resp_close.status_code == 404

    def test_support_tickets_admin_access_allowed(self, monkeypatch):
        """Admin user can view, reply, and close any user's support ticket."""
        writes = []
        def fake_execute(sql, params=None):
            sql_u = sql.upper()
            writes.append((sql, params))
            if "FROM SUPPORT_TICKETS WHERE ID = ?" in sql_u:
                return _build_result(["id", "user_id", "subject", "description", "category", "priority", "status", "created_at", "updated_at"],
                                     [[7, 5, "User issue", "Details", "billing", "high", "open", "2026-08-19T00:00:00Z", "2026-08-19T00:00:00Z"]])
            if "FROM SUPPORT_MESSAGES" in sql_u:
                return _build_result(["id", "ticket_id", "sender_id", "message", "created_at"], [])
            return _build_result([], [])
        monkeypatch.setattr(support_tickets, "execute_query", fake_execute)

        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=999, role="admin", user_type="admin")

        resp_get = client.get("/api/v1/support-tickets/7")
        assert resp_get.status_code == 200
        assert int(resp_get.json()["id"]) == 7

        resp_close = client.post("/api/v1/support-tickets/7/close")
        assert resp_close.status_code == 200
        assert resp_close.json()["message"] == "Ticket closed"

    def test_disputes_unauthorized_resolution_blocked(self, monkeypatch):
        """Non-admin user attempting to resolve or assign a dispute is rejected with 403 Forbidden."""
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")

        resp_resolve = client.post("/api/v1/disputes/10/resolve", json={"resolution": "Force refund to client"})
        assert resp_resolve.status_code == 403
        assert "only admins can resolve disputes" in resp_resolve.json()["detail"].lower()

        resp_assign = client.post("/api/v1/disputes/10/assign", json={"admin_id": 1})
        assert resp_assign.status_code == 403
        assert "only admins can assign disputes" in resp_assign.json()["detail"].lower()

    def test_proposal_accept_unauthorized_and_invalid_state(self, monkeypatch):
        """Non-owner client cannot accept proposals; cannot accept proposals in invalid states."""
        monkeypatch.setattr(proposals, "get_proposal_with_joins", lambda pid: {
            "id": pid, "project_id": 5, "freelancer_id": 2, "status": "submitted"
        })
        monkeypatch.setattr(proposals, "get_project_client_id", lambda pid: 1)  # Project belongs to client 1

        # Attacker client 99 attempts to accept proposal for project 5 -> 403
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=99, role="client", user_type="client")
        resp_acc = client.post("/api/v1/proposals/15/accept")
        assert resp_acc.status_code == 403
        assert "only the project owner" in resp_acc.json()["detail"].lower()

        # Owner client 1 attempts to accept a proposal already in 'accepted' status -> 400
        monkeypatch.setattr(proposals, "get_proposal_with_joins", lambda pid: {
            "id": pid, "project_id": 5, "freelancer_id": 2, "status": "accepted"
        })
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="client", user_type="client")
        resp_acc_again = client.post("/api/v1/proposals/15/accept")
        assert resp_acc_again.status_code == 400
        assert "cannot accept proposal with status 'accepted'" in resp_acc_again.json()["detail"].lower()
