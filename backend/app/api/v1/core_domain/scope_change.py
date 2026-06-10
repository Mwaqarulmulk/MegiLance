from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ScopeChangeRequest(BaseModel):
    contract_id: int
    title: str
    description: str
    reason: str


@router.post("")
def create_scope_change(req: ScopeChangeRequest, user=Depends(get_current_user)):
    user_id = str(getattr(user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        "SELECT id, client_id, freelancer_id, amount, status FROM contracts WHERE id = ?",
        [req.contract_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = rows[0]
    cid = str(contract.get("client_id", ""))
    fid = str(contract.get("freelancer_id", ""))
    if user_id not in (cid, fid):
        raise HTTPException(status_code=403, detail="Not authorized for this contract")

    old_amount = float(contract.get("amount") or 0)

    result = execute_query(
        "INSERT INTO scope_change_requests (contract_id, requested_by, title, description, reason, status, old_amount, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?) RETURNING id",
        [req.contract_id, user_id, req.title, req.description, req.reason, old_amount, now, now],
    )
    rows = parse_rows(result) if result else []
    change_id = str(rows[0].get("id", "")) if rows else "0"
    return {"id": change_id, "status": "pending"}
