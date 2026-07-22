"""Authorization and payment tests for the contract milestone lifecycle."""

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.v1.projects_domain import milestones


def _result(columns: list[str], values: list[object]) -> dict:
    return {
        "cols": [{"name": column} for column in columns],
        "rows": [[
            {"type": "null", "value": None}
            if value is None
            else {
                "type": "integer" if isinstance(value, int) else "float" if isinstance(value, float) else "text",
                "value": str(value),
            }
            for value in values
        ]],
    }


@pytest.fixture
def lifecycle_db(monkeypatch):
    writes: list[tuple[str, list]] = []

    def fake_execute(sql: str, params=None):
        params = params or []
        normalized = " ".join(sql.upper().split())
        if "FROM CONTRACTS WHERE ID = ?" in normalized:
            return _result(
                ["id", "client_id", "freelancer_id", "status", "amount"],
                [10, 1, 2, "active", 1000],
            )
        if "SELECT CONTRACT_ID, STATUS, AMOUNT FROM MILESTONES" in normalized:
            return _result(["contract_id", "status", "amount"], [10, "submitted", 400])
        if "SELECT CONTRACT_ID, STATUS FROM MILESTONES" in normalized:
            return _result(["contract_id", "status"], [10, "pending"])
        if "COALESCE(SUM(AMOUNT)" in normalized:
            return _result(["allocated"], [300])
        if "FROM ESCROW" in normalized:
            return _result(["id", "amount", "released_amount"], [20, 1000, 200])
        writes.append((sql, params))
        return {"columns": [], "rows": [], "rows_affected": 1, "last_insert_rowid": 30}

    released: list[dict] = []
    monkeypatch.setattr(milestones, "execute_query", fake_execute)
    monkeypatch.setattr(milestones, "release_escrow_funds", lambda **kwargs: released.append(kwargs))
    return writes, released


def test_freelancer_cannot_create_milestone(lifecycle_db):
    with pytest.raises(HTTPException) as exc:
        milestones.create_milestone(
            milestones.MilestoneCreate(contract_id=10, title="Build", amount=400),
            current_user=SimpleNamespace(id=2),
        )
    assert exc.value.status_code == 403


def test_client_cannot_submit_freelancer_work(lifecycle_db):
    with pytest.raises(HTTPException) as exc:
        milestones.submit_milestone(
            30,
            milestones.MilestoneSubmit(deliverables="files.zip"),
            current_user=SimpleNamespace(id=1),
        )
    assert exc.value.status_code == 403


def test_approval_releases_exact_milestone_amount(lifecycle_db):
    writes, released = lifecycle_db
    response = milestones.approve_milestone(
        30,
        milestones.MilestoneApprove(approval_notes="Accepted"),
        current_user=SimpleNamespace(id=1),
    )

    assert response["released_amount"] == 400
    assert released == [{
        "escrow_id": 20,
        "release_amount": 400.0,
        "freelancer_id": 2,
        "current_released": 200.0,
        "total_amount": 1000.0,
    }]
    assert any("STATUS = 'APPROVED'" in sql.upper() for sql, _ in writes)


def test_client_cannot_overallocate_contract(lifecycle_db):
    with pytest.raises(HTTPException) as exc:
        milestones.create_milestone(
            milestones.MilestoneCreate(contract_id=10, title="Too much", amount=800),
            current_user=SimpleNamespace(id=1),
        )
    assert exc.value.status_code == 400
    assert "contract amount" in exc.value.detail
