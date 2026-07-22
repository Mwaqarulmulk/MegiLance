"""Critical consent and ownership tests for AI talent invitations."""

from types import SimpleNamespace

import pytest

from app.api.v1.ai import project_brief
from app.schemas.project_brief import HireConfirmRequest, InvitationRespondRequest


def _result(columns=(), rows=(), *, last_id=None, affected=0):
    return {
        "cols": [{"name": column} for column in columns],
        "rows": [[{"type": "text", "value": value} for value in row] for row in rows],
        "last_insert_rowid": last_id,
        "rows_affected": affected,
    }


@pytest.mark.asyncio
async def test_confirm_hire_creates_invitation_not_contract(monkeypatch):
    queries = []

    def execute(sql, params=None):
        queries.append((sql, params or []))
        if "SELECT id FROM users" in sql:
            return _result(("id",), ((22,),))
        if "INSERT INTO projects" in sql:
            return _result(last_id=101, affected=1)
        if "INSERT INTO invitations" in sql:
            return _result(last_id=301, affected=1)
        return _result()

    monkeypatch.setattr(project_brief, "execute_query", execute)
    monkeypatch.setattr(project_brief, "send_notification", lambda *args, **kwargs: {})

    response = await project_brief.confirm_hire(
        HireConfirmRequest(
            freelancer_id=22,
            project_brief={"title": "Real project", "description": "A sufficiently clear scope"},
            agreed_amount=1200,
        ),
        SimpleNamespace(id=7, user_type="client"),
    )

    assert response.status == "invited"
    assert response.contract_id is None
    assert not any("INSERT INTO contracts" in sql for sql, _ in queries)
    assert any("INSERT INTO invitations" in sql for sql, _ in queries)


@pytest.mark.asyncio
async def test_accept_invitation_requires_owned_pending_invitation(monkeypatch):
    monkeypatch.setattr(project_brief, "execute_query", lambda *args, **kwargs: _result())

    with pytest.raises(project_brief.HTTPException) as error:
        await project_brief.respond_to_invitation(
            99,
            InvitationRespondRequest(accept=True),
            SimpleNamespace(id=22, user_type="freelancer"),
        )

    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_accept_owned_invitation_creates_pending_contract(monkeypatch):
    queries = []

    def execute(sql, params=None):
        queries.append((sql, params or []))
        if "FROM invitations i JOIN projects" in sql:
            return _result(
                ("id", "project_id", "client_id", "proposed_rate", "expires_at", "budget_min", "budget_max", "title", "project_status"),
                ((9, 101, 7, 1200, "2099-01-01T00:00:00+00:00", 900, 1200, "Real project", "open"),),
            )
        if "INSERT INTO contracts" in sql:
            return _result(("id",), ((501,),), last_id=501, affected=1)
        return _result(affected=1)

    monkeypatch.setattr(project_brief, "execute_query", execute)
    monkeypatch.setattr(project_brief, "send_notification", lambda *args, **kwargs: {})

    response = await project_brief.respond_to_invitation(
        9,
        InvitationRespondRequest(accept=True),
        SimpleNamespace(id=22, user_type="freelancer"),
    )

    assert response.contract_id == 501
    assert response.status == "accepted"
    assert any("freelancer_id = ?" in sql for sql, _ in queries if "FROM invitations" in sql)
    assert any("status = 'accepted'" in sql for sql, _ in queries)
