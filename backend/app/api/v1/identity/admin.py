# @AI-HINT: Admin router — user management, project management, platform stats, moderation
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.core.security import invalidate_user_cache

router = APIRouter()


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    email_verified: Optional[bool] = None


class AdminProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = ""
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    skills: Optional[str] = None
    status: Optional[str] = "open"


class AdminProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    skills: Optional[str] = None
    status: Optional[str] = None


# ── Platform settings (single JSON blob persisted in app_settings) ────────────

def _ensure_settings_table() -> None:
    execute_query(
        """CREATE TABLE IF NOT EXISTS app_settings (
               id INTEGER PRIMARY KEY,
               data TEXT NOT NULL DEFAULT '{}',
               updated_at TEXT
           )""",
        [],
    )


@router.get("/settings")
async def get_platform_settings(current_user=Depends(require_admin)):
    """Return the persisted platform settings JSON (empty object if unset)."""
    _ensure_settings_table()
    rows = parse_rows(execute_query("SELECT data FROM app_settings WHERE id = 1", []))
    if not rows:
        return {}
    try:
        return json.loads(rows[0].get("data") or "{}")
    except (ValueError, TypeError):
        return {}


@router.put("/settings")
async def update_platform_settings(payload: dict, current_user=Depends(require_admin)):
    """Persist the full platform settings JSON blob (upsert single row)."""
    _ensure_settings_table()
    now = datetime.now(timezone.utc).isoformat()
    data = json.dumps(payload)
    execute_query(
        """INSERT INTO app_settings (id, data, updated_at) VALUES (1, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at""",
        [data, now],
    )
    return {"message": "Settings saved", "updated_at": now}


# ══════════════════════════════════════════════════════════════════════════════
# USER MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user=Depends(require_admin),
):
    where = "WHERE 1=1"
    params: list = []

    if role:
        where += " AND (role = ? OR user_type = ?)"
        params.extend([role, role])
    if search:
        where += " AND (name LIKE ? OR email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if status_filter:
        if status_filter.lower() == "active":
            where += " AND is_active = 1"
        elif status_filter.lower() == "suspended":
            where += " AND is_active = 0"

    # Count total
    count_result = execute_query(f"SELECT COUNT(*) as total FROM users {where}", params)
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, email, name, user_type, role, is_active, email_verified,
                   profile_image_url, created_at, account_balance, joined_at,
                   bio, skills, hourly_rate, location, headline
            FROM users
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)

    return {"users": rows if rows else [], "items": rows if rows else [], "total": total, "page": page}


@router.get("/users/{user_id}")
async def get_user(user_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        """SELECT id, email, name, user_type, role, is_active, email_verified,
                  profile_image_url, created_at, account_balance, bio, skills,
                  hourly_rate, location, headline, joined_at
           FROM users WHERE id = ?""",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    return rows[0]


@router.put("/users/{user_id}")
async def update_user(user_id: int, request: AdminUserUpdate, current_user=Depends(require_admin)):
    _ALLOWED_ADMIN_USER_COLUMNS = frozenset({"is_active", "role", "email_verified"})
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Validate column names against allowlist
    for k in updates:
        if k not in _ALLOWED_ADMIN_USER_COLUMNS:
            raise HTTPException(status_code=400, detail=f"Invalid field: {k}")

    for k, v in updates.items():
        if isinstance(v, bool):
            updates[k] = 1 if v else 0

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [user_id]
    execute_query(f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?", values)

    # Invalidate cached user so next request picks up changes
    try:
        user_result = execute_query("SELECT email FROM users WHERE id = ?", [user_id])
        user_rows = parse_rows(user_result)
        if user_rows:
            invalidate_user_cache(user_rows[0]["email"])
    except Exception:
        pass

    return {"message": "User updated"}


@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: int, current_user=Depends(require_admin)):
    """Toggle a user's active/suspended status."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own account")

    result = execute_query("SELECT id, is_active FROM users WHERE id = ?", [user_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")

    current_active = bool(rows[0].get("is_active", 1))
    new_status = 0 if current_active else 1
    action = "suspended" if new_status == 0 else "activated"

    execute_query("UPDATE users SET is_active = ? WHERE id = ?", [new_status, user_id])

    # Invalidate cached user
    try:
        user_result = execute_query("SELECT email FROM users WHERE id = ?", [user_id])
        user_rows = parse_rows(user_result)
        if user_rows:
            invalidate_user_cache(user_rows[0]["email"])
    except Exception:
        pass

    logger.info(f"admin_user_{action} admin={current_user.id} target_user={user_id}")
    return {"message": f"User {action}", "is_active": bool(new_status)}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user=Depends(require_admin)):
    """Soft-delete a user and clean up related data. Prevents self-deletion."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Check user exists
    user_result = execute_query("SELECT id, email, name FROM users WHERE id = ?", [user_id])
    if not user_result or not parse_rows(user_result):
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc).isoformat()

    # Soft-delete: deactivate instead of hard delete to preserve referential integrity
    execute_query(
        "UPDATE users SET is_active = 0, email = CONCAT(email, '_deleted_', ?), updated_at = ? WHERE id = ?",
        [str(user_id), now, user_id],
    )

    # Cancel any active contracts
    execute_query(
        "UPDATE contracts SET status = 'cancelled', updated_at = ? WHERE (client_id = ? OR freelancer_id = ?) AND status IN ('pending', 'active')",
        [now, user_id, user_id],
    )

    # Withdraw any open proposals
    execute_query(
        "UPDATE proposals SET status = 'withdrawn', updated_at = ? WHERE freelancer_id = ? AND status IN ('submitted', 'pending')",
        [now, user_id],
    )

    # Cancel open disputes
    execute_query(
        "UPDATE disputes SET status = 'closed', updated_at = ? WHERE raised_by = ? AND status IN ('open', 'in_review')",
        [now, user_id],
    )

    # Invalidate cached user
    try:
        invalidate_user_cache(parse_rows(user_result)[0]["email"])
    except Exception:
        pass

    logger.info(f"admin_user_deleted admin={current_user.id} target_user={user_id}")
    return {"message": "User deactivated successfully", "user_id": user_id}


# ══════════════════════════════════════════════════════════════════════════════
# PROJECT MANAGEMENT (admin has full access)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/projects")
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user=Depends(require_admin),
):
    """List all platform projects for admin management."""
    where = "WHERE 1=1"
    params: list = []

    if status and status.lower() != "all":
        where += " AND p.status = ?"
        params.append(status.lower())
    if search:
        where += " AND (p.title LIKE ? OR p.description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM projects p {where}", params
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT p.id, p.title, p.description, p.category, p.status,
                   p.budget_min, p.budget_max, p.budget_type, p.skills,
                   p.client_id, p.created_at, p.updated_at,
                   u.name AS client_name
            FROM projects p
            LEFT JOIN users u ON p.client_id = u.id
            {where}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result) or []

    projects = []
    for r in rows:
        projects.append({
            "id": r.get("id"),
            "title": r.get("title") or "Untitled",
            "description": r.get("description") or "",
            "client": r.get("client_name") or f"Client #{r.get('client_id', '?')}",
            "client_id": r.get("client_id"),
            "budget": f"${r.get('budget_min', 0) or 0} - ${r.get('budget_max', 0) or 0}",
            "budget_min": r.get("budget_min"),
            "budget_max": r.get("budget_max"),
            "status": r.get("status") or "open",
            "category": r.get("category") or "",
            "skills": r.get("skills") or "",
            "created_at": r.get("created_at") or "",
            "updated_at": r.get("updated_at") or "",
        })

    return {"projects": projects, "items": projects, "total": total, "page": page}


@router.get("/projects/{project_id}")
async def get_project(project_id: int, current_user=Depends(require_admin)):
    """Get a single project for admin."""
    result = execute_query(
        """SELECT p.id, p.title, p.description, p.category, p.status,
                  p.budget_min, p.budget_max, p.budget_type, p.skills,
                  p.client_id, p.created_at, p.updated_at,
                  u.name AS client_name
           FROM projects p
           LEFT JOIN users u ON p.client_id = u.id
           WHERE p.id = ?""",
        [project_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    r = rows[0]
    return {
        "id": r.get("id"),
        "title": r.get("title") or "Untitled",
        "description": r.get("description") or "",
        "client": r.get("client_name") or f"Client #{r.get('client_id', '?')}",
        "client_id": r.get("client_id"),
        "budget": f"${r.get('budget_min', 0) or 0} - ${r.get('budget_max', 0) or 0}",
        "budget_min": r.get("budget_min"),
        "budget_max": r.get("budget_max"),
        "status": r.get("status") or "open",
        "category": r.get("category") or "",
        "skills": r.get("skills") or "",
        "created_at": r.get("created_at") or "",
        "updated_at": r.get("updated_at") or "",
    }


@router.post("/projects")
async def create_project(body: AdminProjectCreate, current_user=Depends(require_admin)):
    """Admin can create any project on behalf of a client or as platform project."""
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO projects (title, description, category, budget_min, budget_max,
                  skills, status, client_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            body.title,
            body.description or "",
            body.category or "",
            body.budget_min,
            body.budget_max,
            body.skills or "",
            body.status or "open",
            current_user.id,
            now,
            now,
        ],
    )
    return {"message": "Project created", "id": result.get("last_inserted_id") if result else None}


@router.put("/projects/{project_id}")
async def update_project(project_id: int, body: AdminProjectUpdate, current_user=Depends(require_admin)):
    """Admin can update any project."""
    existing = execute_query("SELECT id FROM projects WHERE id = ?", [project_id])
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Project not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [project_id]
    execute_query(f"UPDATE projects SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Project updated"}


@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, current_user=Depends(require_admin)):
    """Admin can delete any project. Cancels associated proposals and contracts."""
    existing = execute_query("SELECT id FROM projects WHERE id = ?", [project_id])
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc).isoformat()

    # Cancel associated contracts
    execute_query(
        "UPDATE contracts SET status = 'cancelled', updated_at = ? WHERE project_id = ?",
        [now, project_id],
    )

    # Withdraw associated proposals
    execute_query(
        "UPDATE proposals SET status = 'withdrawn', updated_at = ? WHERE project_id = ?",
        [now, project_id],
    )

    # Delete the project
    execute_query("DELETE FROM projects WHERE id = ?", [project_id])

    logger.info(f"admin_project_deleted admin={current_user.id} project={project_id}")
    return {"message": "Project deleted", "project_id": project_id}


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS (admin view)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/payments")
async def list_admin_payments(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    current_user=Depends(require_admin),
):
    """Platform-wide transactions for the admin payments page."""
    where = "WHERE 1=1"
    params: list = []
    if status_filter and status_filter.lower() != "all":
        where += " AND p.status = ?"
        params.append(status_filter.lower())

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT p.id, p.amount, p.currency, p.status, p.description,
                   p.payment_method, p.created_at, p.client_id, p.freelancer_id,
                   cl.name AS client_name, fr.name AS freelancer_name
            FROM payments p
            LEFT JOIN users cl ON p.client_id = cl.id
            LEFT JOIN users fr ON p.freelancer_id = fr.id
            {where}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result) or []

    payments = []
    for r in rows:
        desc = (r.get("description") or "").lower()
        method = (r.get("payment_method") or "").lower()
        if "refund" in desc or "refund" in method or r.get("status") == "refunded":
            txn_type = "Refund"
        elif "payout" in desc or "withdraw" in desc:
            txn_type = "Payout"
        else:
            txn_type = "Deposit"
        payments.append({
            "id": r.get("id"),
            "amount": r.get("amount") or 0,
            "currency": r.get("currency") or "USD",
            "status": (r.get("status") or "pending").capitalize(),
            "description": r.get("description") or "",
            "payment_type": txn_type,
            "type": txn_type,
            "user": r.get("client_name") or r.get("freelancer_name") or "\u2014",
            "role": "Client" if r.get("client_id") else "Freelancer",
            "created_at": r.get("created_at") or "",
        })

    return {"payments": payments, "total": len(payments), "page": page}


# ══════════════════════════════════════════════════════════════════════════════
# PLATFORM STATS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/stats")
async def get_stats(current_user=Depends(require_admin)):
    users = execute_query("SELECT COUNT(*) as count FROM users", [])
    projects = execute_query("SELECT COUNT(*) as count FROM projects", [])
    proposals = execute_query("SELECT COUNT(*) as count FROM proposals", [])
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts", [])

    return {
        "total_users": parse_rows(users)[0]["count"] if parse_rows(users) else 0,
        "total_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
        "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
        "total_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
    }
