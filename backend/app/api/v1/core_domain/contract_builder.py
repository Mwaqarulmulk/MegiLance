# @AI-HINT: Contract Builder router — visual contract creation and management
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_table():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS builder_contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            template_id INTEGER,
            client_id INTEGER,
            freelancer_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            terms_json TEXT,
            status TEXT DEFAULT 'draft',
            total_value REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            signed_by_client INTEGER DEFAULT 0,
            signed_by_freelancer INTEGER DEFAULT 0,
            client_signed_at TEXT,
            freelancer_signed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS contract_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            content TEXT,
            category TEXT DEFAULT 'general',
            is_public INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS contract_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            version_number INTEGER DEFAULT 1,
            content TEXT,
            changes_summary TEXT,
            created_by INTEGER,
            created_at TEXT NOT NULL
        )
    """, [])
    _TABLES_CREATED = True


def _get_contract(contract_id: int, user_id: int) -> dict:
    result = execute_query(
        "SELECT id, user_id, template_id, client_id, freelancer_id, title, content, "
        "terms_json, status, total_value, currency, signed_by_client, signed_by_freelancer, "
        "client_signed_at, freelancer_signed_at, created_at, updated_at "
        "FROM builder_contracts WHERE id = ?",
        [contract_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract = rows[0]
    if contract["user_id"] != user_id and contract.get("client_id") != user_id and contract.get("freelancer_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return contract


class ContractCreate(BaseModel):
    template_id: Optional[int] = None
    client_id: Optional[int] = None
    freelancer_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    terms_json: Optional[str] = None
    total_value: float = 0
    currency: str = "USD"


class ContractUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    terms_json: Optional[str] = None
    total_value: Optional[float] = None
    currency: Optional[str] = None
    client_id: Optional[int] = None
    freelancer_id: Optional[int] = None


class ContractSign(BaseModel):
    role: str


class ContractSend(BaseModel):
    recipient_email: Optional[str] = None
    message: Optional[str] = None


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: Optional[str] = None
    category: str = "general"
    is_public: bool = False


class ContractAmend(BaseModel):
    changes_summary: str
    new_content: Optional[str] = None
    new_terms_json: Optional[str] = None
    new_total_value: Optional[float] = None


@router.post("", status_code=201)
def create_contract(body: ContractCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        """INSERT INTO builder_contracts (user_id, template_id, client_id, freelancer_id,
           title, content, terms_json, status, total_value, currency, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)""",
        [
            current_user.id,
            body.template_id,
            body.client_id,
            body.freelancer_id,
            body.title,
            body.content,
            body.terms_json,
            body.total_value,
            body.currency,
            now,
            now,
        ],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create contract")

    contract_id = result.get("last_insert_rowid")

    execute_query(
        """INSERT INTO contract_versions (contract_id, version_number, content,
           changes_summary, created_by, created_at) VALUES (?, 1, ?, 'Initial creation', ?, ?)""",
        [contract_id, body.content, current_user.id, now],
    )

    if body.template_id:
        execute_query(
            "UPDATE contract_templates SET usage_count = usage_count + 1, updated_at = ? WHERE id = ?",
            [now, body.template_id],
        )

    return {"message": "Contract created", "contract_id": contract_id, "status": "draft"}


@router.get("")
def list_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    where = "WHERE user_id = ? OR client_id = ? OR freelancer_id = ?"
    params = [current_user.id, current_user.id, current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, user_id, template_id, client_id, freelancer_id, title, status,
                   total_value, currency, signed_by_client, signed_by_freelancer,
                   created_at, updated_at
            FROM builder_contracts
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    contracts = rows if rows else []

    return {"items": contracts, "total": len(contracts), "page": page}


@router.get("/templates")
def list_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    where = "WHERE (user_id = ? OR is_public = 1)"
    params = [current_user.id]

    if category:
        where += " AND category = ?"
        params.append(category)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, user_id, name, description, category, is_public, usage_count,
                   created_at, updated_at
            FROM contract_templates
            {where}
            ORDER BY usage_count DESC, created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    templates = rows if rows else []

    return {"items": templates, "total": len(templates), "page": page}


@router.post("/templates", status_code=201)
def create_template(body: TemplateCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        """INSERT INTO contract_templates (user_id, name, description, content, category,
           is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            current_user.id,
            body.name,
            body.description,
            body.content,
            body.category,
            1 if body.is_public else 0,
            now,
            now,
        ],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create template")

    template_id = result.get("last_insert_rowid")
    return {"message": "Template created", "template_id": template_id}


@router.get("/{contract_id}")
def get_contract(contract_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    contract = _get_contract(contract_id, current_user.id)
    return contract


@router.put("/{contract_id}")
def update_contract(
    contract_id: int,
    body: ContractUpdate,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    contract = _get_contract(contract_id, current_user.id)

    if contract["status"] not in ("draft", "amended"):
        raise HTTPException(status_code=400, detail=f"Cannot update contract in '{contract['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    updates = []
    params = []

    if body.title is not None:
        updates.append("title = ?")
        params.append(body.title)
    if body.content is not None:
        updates.append("content = ?")
        params.append(body.content)
    if body.terms_json is not None:
        updates.append("terms_json = ?")
        params.append(body.terms_json)
    if body.total_value is not None:
        updates.append("total_value = ?")
        params.append(body.total_value)
    if body.currency is not None:
        updates.append("currency = ?")
        params.append(body.currency)
    if body.client_id is not None:
        updates.append("client_id = ?")
        params.append(body.client_id)
    if body.freelancer_id is not None:
        updates.append("freelancer_id = ?")
        params.append(body.freelancer_id)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates.append("updated_at = ?")
    params.append(now)
    params.append(contract_id)

    execute_query(
        f"UPDATE builder_contracts SET {', '.join(updates)} WHERE id = ?",
        params,
    )

    return {"message": "Contract updated", "contract_id": contract_id}


@router.post("/{contract_id}/sign")
def sign_contract(
    contract_id: int,
    body: ContractSign,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    contract = _get_contract(contract_id, current_user.id)

    if contract["status"] not in ("sent", "pending_signature", "draft"):
        raise HTTPException(status_code=400, detail=f"Cannot sign contract in '{contract['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    role = body.role.lower()

    if role == "client":
        if contract["client_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Only the client can sign in client role")
        if contract["signed_by_client"]:
            raise HTTPException(status_code=400, detail="Client has already signed")
        execute_query(
            "UPDATE builder_contracts SET signed_by_client = 1, client_signed_at = ?, updated_at = ? WHERE id = ?",
            [now, now, contract_id],
        )
    elif role == "freelancer":
        if contract["freelancer_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Only the freelancer can sign in freelancer role")
        if contract["signed_by_freelancer"]:
            raise HTTPException(status_code=400, detail="Freelancer has already signed")
        execute_query(
            "UPDATE builder_contracts SET signed_by_freelancer = 1, freelancer_signed_at = ?, updated_at = ? WHERE id = ?",
            [now, now, contract_id],
        )
    else:
        raise HTTPException(status_code=400, detail="Role must be 'client' or 'freelancer'")

    updated = _get_contract(contract_id, current_user.id)
    new_status = contract["status"]
    if updated["signed_by_client"] and updated["signed_by_freelancer"]:
        new_status = "fully_signed"
    elif updated["signed_by_client"] or updated["signed_by_freelancer"]:
        new_status = "partially_signed"

    if new_status != contract["status"]:
        execute_query(
            "UPDATE builder_contracts SET status = ?, updated_at = ? WHERE id = ?",
            [new_status, now, contract_id],
        )

    return {"message": f"Contract signed by {role}", "status": new_status, "signed_at": now}


@router.post("/{contract_id}/send")
def send_contract(
    contract_id: int,
    body: ContractSend,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    contract = _get_contract(contract_id, current_user.id)

    if contract["status"] not in ("draft", "amended"):
        raise HTTPException(status_code=400, detail=f"Cannot send contract in '{contract['status']}' status")

    if not contract.get("client_id") and not contract.get("freelancer_id"):
        raise HTTPException(status_code=400, detail="Contract must have at least one counterparty assigned")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE builder_contracts SET status = 'sent', updated_at = ? WHERE id = ?",
        [now, contract_id],
    )

    return {
        "message": "Contract sent for signature",
        "contract_id": contract_id,
        "recipient_email": body.recipient_email,
        "status": "sent",
    }


@router.post("/{contract_id}/amend")
def amend_contract(
    contract_id: int,
    body: ContractAmend,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    contract = _get_contract(contract_id, current_user.id)

    if contract["status"] in ("fully_signed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot amend contract in '{contract['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    new_content = body.new_content or contract["content"]
    new_terms = body.new_terms_json or contract["terms_json"]
    new_value = body.new_total_value if body.new_total_value is not None else contract["total_value"]

    result = execute_query(
        "SELECT MAX(version_number) as max_ver FROM contract_versions WHERE contract_id = ?",
        [contract_id],
    )
    rows = parse_rows(result)
    current_version = rows[0]["max_ver"] if rows and rows[0]["max_ver"] else 0
    new_version = current_version + 1

    execute_query(
        """UPDATE builder_contracts SET content = ?, terms_json = ?, total_value = ?,
           status = 'amended', updated_at = ? WHERE id = ?""",
        [new_content, new_terms, new_value, now, contract_id],
    )

    execute_query(
        """INSERT INTO contract_versions (contract_id, version_number, content,
           changes_summary, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)""",
        [contract_id, new_version, new_content, body.changes_summary, current_user.id, now],
    )

    return {
        "message": "Contract amended",
        "contract_id": contract_id,
        "version_number": new_version,
        "status": "amended",
    }


@router.get("/{contract_id}/history")
def contract_history(
    contract_id: int,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    _get_contract(contract_id, current_user.id)

    result = execute_query(
        """SELECT id, contract_id, version_number, content, changes_summary,
           created_by, created_at
           FROM contract_versions WHERE contract_id = ?
           ORDER BY version_number DESC""",
        [contract_id],
    )
    rows = parse_rows(result)
    versions = rows if rows else []

    return {"contract_id": contract_id, "versions": versions, "total": len(versions)}
