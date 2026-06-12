# @AI-HINT: Payout methods router — payment withdrawal methods
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class PayoutMethodCreate(BaseModel):
    method_type: str
    name: str
    details: dict
    is_default: bool = False


class PayoutMethodUpdate(BaseModel):
    name: Optional[str] = None
    details: Optional[dict] = None
    is_default: Optional[bool] = None


@router.get("")
async def list_payout_methods(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, method_type, name, details, is_default, created_at, updated_at FROM payout_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/{method_id}")
async def get_payout_method(method_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, method_type, name, details, is_default, created_at, updated_at FROM payout_methods WHERE id = ? AND user_id = ?",
        [method_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Payout method not found")
    return rows[0]


@router.post("")
async def create_payout_method(request: PayoutMethodCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    import json

    if request.is_default:
        execute_query("UPDATE payout_methods SET is_default = 0 WHERE user_id = ?", [current_user.id])

    result = execute_query(
        "INSERT INTO payout_methods (user_id, method_type, name, details, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, request.method_type, request.name, json.dumps(request.details), 1 if request.is_default else 0, now, now],
    )
    return {"message": "Payout method created", "method_id": result.get("last_insert_rowid")}


@router.put("/{method_id}")
async def update_payout_method(method_id: int, request: PayoutMethodUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    import json
    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "details":
            set_parts.append(f"{k} = ?")
            values.append(json.dumps(v))
        elif k == "is_default":
            set_parts.append(f"{k} = ?")
            values.append(1 if v else 0)
            if v:
                execute_query("UPDATE payout_methods SET is_default = 0 WHERE user_id = ? AND id != ?", [current_user.id, method_id])
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), method_id])

    execute_query(f"UPDATE payout_methods SET {', '.join(set_parts)} WHERE id = ? AND user_id = ?", values + [current_user.id])
    return {"message": "Payout method updated"}


@router.delete("/{method_id}")
async def delete_payout_method(method_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM payout_methods WHERE id = ? AND user_id = ?", [method_id, current_user.id])
    return {"message": "Payout method deleted"}
