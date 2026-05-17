# @AI-HINT: Contracts router — create, list, manage contract lifecycle
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.db_utils import get_val as _get_val, safe_str as _safe_str
from app.services.contracts_service import (
    query_user_contracts,
    fetch_contract_with_joins,
    contract_from_row,
)

router = APIRouter()


class ContractCreate(BaseModel):
    project_id: int
    freelancer_id: int
    amount: float
    contract_type: str = "fixed"
    currency: str = "USD"
    description: Optional[str] = None
    terms: Optional[str] = None
    milestones: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ContractAcknowledge(BaseModel):
    acknowledged: bool = True

class ContractComplete(BaseModel):
    completion_notes: Optional[str] = None


@router.get("/")
async def list_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    contracts = query_user_contracts(
        user_id=current_user.id,
        status=status_filter,
        limit=page_size,
        offset=(page - 1) * page_size,
    )
    return {"items": contracts, "total": len(contracts), "page": page}


@router.get("/{contract_id}")
async def get_contract(contract_id: str, current_user=Depends(get_current_user)):
    raw_row = fetch_contract_with_joins(contract_id)
    if not raw_row:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_from_row(raw_row)
    if contract["client_id"] != current_user.id and contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return contract


@router.post("/")
async def create_contract(request: ContractCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()

    project_result = execute_query(
        "SELECT id, client_id, title FROM projects WHERE id = ?",
        [request.project_id],
    )
    project_rows = parse_rows(project_result)
    if not project_rows:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_rows[0]["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project owner can create contracts")

    freelancer_result = execute_query(
        "SELECT id, name FROM users WHERE id = ? AND user_type = 'freelancer'",
        [request.freelancer_id],
    )
    if not parse_rows(freelancer_result):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    result = execute_query(
        """INSERT INTO contracts (project_id, freelancer_id, client_id, amount, contract_type,
                  currency, description, terms, milestones, status, start_date, end_date,
                  created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)""",
        [
            request.project_id, request.freelancer_id, current_user.id, request.amount,
            request.contract_type, request.currency, request.description or "",
            request.terms or "", request.milestones or "",
            request.start_date or now, request.end_date or "",
            now, now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create contract")

    return {"message": "Contract created successfully", "contract_id": result.get("last_insert_rowid")}


@router.post("/{contract_id}/acknowledge")
async def acknowledge_contract(contract_id: str, request: ContractAcknowledge, current_user=Depends(get_current_user)):
    raw_row = fetch_contract_with_joins(contract_id)
    if not raw_row:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_from_row(raw_row)
    if contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the freelancer can acknowledge")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE contracts SET status = 'active', updated_at = ? WHERE id = ?",
        [now, contract_id],
    )
    return {"message": "Contract acknowledged successfully"}


@router.post("/{contract_id}/complete")
async def complete_contract(contract_id: str, request: ContractComplete, current_user=Depends(get_current_user)):
    raw_row = fetch_contract_with_joins(contract_id)
    if not raw_row:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_from_row(raw_row)
    if contract["client_id"] != current_user.id and contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE contracts SET status = 'completed', updated_at = ? WHERE id = ?",
        [now, contract_id],
    )
    return {"message": "Contract completed successfully"}


class ContractDirectCreate(BaseModel):
    freelancer_id: int
    title: str
    description: str
    rate_type: str = "fixed"
    rate: float
    start_date: Optional[str] = None


@router.post("/direct")
async def create_direct_contract(request: ContractDirectCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()

    freelancer_result = execute_query(
        "SELECT id, name FROM users WHERE id = ? AND user_type = 'freelancer'",
        [request.freelancer_id],
    )
    if not parse_rows(freelancer_result):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    result = execute_query(
        """INSERT INTO contracts (project_id, freelancer_id, client_id, amount, contract_type,
                  currency, description, terms, milestones, status, start_date, end_date,
                  created_at, updated_at)
           VALUES (NULL, ?, ?, ?, ?, 'USD', ?, '', '', 'pending', ?, NULL, ?, ?)""",
        [
            request.freelancer_id, current_user.id, request.rate,
            request.rate_type, request.description,
            request.start_date or now, now, now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create contract")

    return {"message": "Direct contract created successfully", "contract_id": result.get("last_insert_rowid")}


@router.delete("/{contract_id}")
async def delete_contract(contract_id: str, current_user=Depends(get_current_user)):
    raw_row = fetch_contract_with_joins(contract_id)
    if not raw_row:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_from_row(raw_row)
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can delete")

    execute_query("DELETE FROM contracts WHERE id = ?", [contract_id])
    return {"message": "Contract deleted successfully"}
