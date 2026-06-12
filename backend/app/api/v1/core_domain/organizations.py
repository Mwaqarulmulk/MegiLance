# @AI-HINT: Organizations router — organization/company management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None


@router.get("")
async def list_organizations(current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT o.id, o.name, o.description, o.website, o.industry, o.owner_id, o.created_at,
                  COUNT(om.user_id) as member_count
           FROM organizations o
           LEFT JOIN organization_members om ON o.id = om.organization_id
           WHERE o.owner_id = ? OR om.user_id = ?
           GROUP BY o.id""",
        [current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("")
async def create_organization(request: OrganizationCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO organizations (name, description, website, industry, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [request.name, request.description or "", request.website or "", request.industry or "", current_user.id, now, now],
    )
    org_id = result.get("last_insert_rowid")
    execute_query(
        "INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)",
        [org_id, current_user.id, now],
    )
    return {"message": "Organization created", "organization_id": org_id}


@router.get("/{org_id}")
async def get_organization(org_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, description, website, industry, owner_id, created_at FROM organizations WHERE id = ?",
        [org_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Organization not found")

    members = execute_query(
        "SELECT om.user_id, om.role, om.joined_at, u.name, u.email FROM organization_members om LEFT JOIN users u ON om.user_id = u.id WHERE om.organization_id = ?",
        [org_id],
    )
    rows[0]["members"] = parse_rows(members) or []
    return rows[0]


@router.put("/{org_id}")
async def update_organization(org_id: int, request: OrganizationUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), org_id, current_user.id]

    execute_query(f"UPDATE organizations SET {', '.join(set_parts)} WHERE id = ? AND owner_id = ?", values)
    return {"message": "Organization updated"}
