# @AI-HINT: Talent Invitations router — Upwork-style invite-to-bid system
"""Talent invitation API routes for client-to-freelancer project invitations."""

from datetime import datetime, timedelta, timezone
import json
import logging
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.models.talent_invitation import TalentInvitation, InvitationStatus
from app.schemas.talent_invitation import (
    TalentInvitationCreate,
    TalentInvitationBulkCreate,
    TalentInvitationResponse as TalentInvitationResponseSchema,
    TalentInvitationDetail,
    TalentInvitationListItem,
    InvitationListResponse,
    ProjectInvitationsResponse,
)
from app.services.notifications_service import send_notification

logger = logging.getLogger(__name__)

router = APIRouter(tags=["talent-invitations"])

_table_ensured = False


def _ensure_talent_invitations_table():
    """Ensure the talent_invitations table and indexes exist."""
    global _table_ensured
    if _table_ensured:
        return
    try:
        execute_query("""
            CREATE TABLE IF NOT EXISTS talent_invitations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                client_id INTEGER NOT NULL,
                freelancer_id INTEGER NOT NULL,
                message TEXT,
                suggested_rate REAL,
                status TEXT DEFAULT 'pending',
                response_message TEXT,
                responded_at TEXT,
                proposal_id INTEGER,
                viewed INTEGER DEFAULT 0,
                viewed_at TEXT,
                expires_at TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        execute_query("CREATE INDEX IF NOT EXISTS idx_talent_inv_proj ON talent_invitations(project_id)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_talent_inv_client ON talent_invitations(client_id)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_talent_inv_free ON talent_invitations(freelancer_id)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_talent_inv_status ON talent_invitations(status)")
    except Exception as exc:
        logger.warning(f"Could not verify talent_invitations table: {exc}")
    _table_ensured = True


def _notify_safely(user_id: int, notification_type: str, title: str, content: str,
                   action_url: str, data: dict) -> None:
    """Send an in-app notification safely without disrupting the request flow."""
    try:
        send_notification(user_id, notification_type, title, content, data=data, action_url=action_url)
    except Exception as exc:
        logger.warning("Could not create %s notification for user %s: %s", notification_type, user_id, exc)


class RespondInvitationBody(BaseModel):
    accept: Optional[bool] = None
    action: Optional[str] = None  # 'accept' or 'decline'
    response_message: Optional[str] = Field(None, max_length=1000)
    message: Optional[str] = Field(None, max_length=1000)


class UpdateInvitationStatusBody(BaseModel):
    status: str
    reason: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def send_invitation(
    request: TalentInvitationCreate,
    current_user=Depends(get_current_user),
):
    """Send a talent invitation from a client to a freelancer for a project."""
    _ensure_talent_invitations_table()

    # Verify project exists and belongs to current user (unless admin)
    proj_rows = parse_rows(
        execute_query("SELECT id, title, client_id, status FROM projects WHERE id = ?", [request.project_id])
    )
    if not proj_rows:
        raise HTTPException(status_code=404, detail="Project not found")

    project = proj_rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    if int(project["client_id"]) != int(current_user.id) and not is_admin:
        raise HTTPException(status_code=403, detail="You can only invite talent to your own projects")

    # Verify freelancer exists and is not the current user
    if int(request.freelancer_id) == int(current_user.id):
        raise HTTPException(status_code=400, detail="You cannot invite yourself to a project")

    freelancer_rows = parse_rows(
        execute_query("SELECT id, name, email, role, user_type FROM users WHERE id = ?", [request.freelancer_id])
    )
    if not freelancer_rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")

    # Check if an active invitation already exists for this project and freelancer
    existing_invitations = parse_rows(
        execute_query(
            "SELECT id, status FROM talent_invitations WHERE project_id = ? AND freelancer_id = ? AND status IN ('pending', 'accepted')",
            [request.project_id, request.freelancer_id],
        )
    )
    if existing_invitations:
        raise HTTPException(
            status_code=400,
            detail=f"An active invitation already exists for this freelancer on this project (status: {existing_invitations[0]['status']})",
        )

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_at_iso = (now + timedelta(days=7)).isoformat()

    result = execute_query(
        """INSERT INTO talent_invitations
           (project_id, client_id, freelancer_id, message, suggested_rate, status, expires_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)""",
        [
            request.project_id,
            int(project["client_id"]),
            request.freelancer_id,
            request.message or "",
            request.suggested_rate,
            expires_at_iso,
            now_iso,
            now_iso,
        ],
    )

    invitation_id = result.get("last_insert_rowid") if result else None

    # Send notification to the freelancer
    _notify_safely(
        request.freelancer_id,
        "talent_invitation",
        "New Project Invitation",
        f"You have been invited to submit a proposal for '{project.get('title', 'Project')}'.",
        "/freelancer/invitations",
        {"invitation_id": invitation_id, "project_id": request.project_id},
    )

    return {
        "message": "Invitation sent successfully",
        "invitation_id": invitation_id,
        "status": "pending",
        "expires_at": expires_at_iso,
    }


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def bulk_send_invitations(
    request: TalentInvitationBulkCreate,
    current_user=Depends(get_current_user),
):
    """Send invitations to multiple freelancers for a single project."""
    _ensure_talent_invitations_table()

    proj_rows = parse_rows(
        execute_query("SELECT id, title, client_id FROM projects WHERE id = ?", [request.project_id])
    )
    if not proj_rows:
        raise HTTPException(status_code=404, detail="Project not found")

    project = proj_rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    if int(project["client_id"]) != int(current_user.id) and not is_admin:
        raise HTTPException(status_code=403, detail="You can only invite talent to your own projects")

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_at_iso = (now + timedelta(days=7)).isoformat()

    sent_count = 0
    created_ids = []

    for f_id in request.freelancer_ids:
        if int(f_id) == int(current_user.id):
            continue

        existing = parse_rows(
            execute_query(
                "SELECT id FROM talent_invitations WHERE project_id = ? AND freelancer_id = ? AND status IN ('pending', 'accepted')",
                [request.project_id, f_id],
            )
        )
        if existing:
            continue

        res = execute_query(
            """INSERT INTO talent_invitations
               (project_id, client_id, freelancer_id, message, status, expires_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)""",
            [request.project_id, int(project["client_id"]), f_id, request.message or "", expires_at_iso, now_iso, now_iso],
        )
        if res and res.get("last_insert_rowid"):
            inv_id = res.get("last_insert_rowid")
            created_ids.append(inv_id)
            sent_count += 1
            _notify_safely(
                f_id,
                "talent_invitation",
                "New Project Invitation",
                f"You have been invited to submit a proposal for '{project.get('title', 'Project')}'.",
                "/freelancer/invitations",
                {"invitation_id": inv_id, "project_id": request.project_id},
            )

    return {
        "message": f"Successfully sent {sent_count} invitation(s)",
        "sent_count": sent_count,
        "created_ids": created_ids,
    }


@router.get("")
@router.get("/")
def list_invitations(
    status: Optional[str] = None,
    project_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """List invitations for the current user (sent for clients, received for freelancers)."""
    _ensure_talent_invitations_table()

    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    user_type = getattr(current_user, "user_type", "") or getattr(current_user, "role", "")

    where_clauses = []
    params = []

    if not is_admin:
        if user_type == "client":
            where_clauses.append("ti.client_id = ?")
            params.append(current_user.id)
        elif user_type == "freelancer":
            where_clauses.append("ti.freelancer_id = ?")
            params.append(current_user.id)
        else:
            where_clauses.append("(ti.client_id = ? OR ti.freelancer_id = ?)")
            params.extend([current_user.id, current_user.id])

    if status:
        where_clauses.append("ti.status = ?")
        params.append(status)

    if project_id:
        where_clauses.append("ti.project_id = ?")
        params.append(project_id)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    # Count totals by status
    count_sql = f"""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN ti.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN ti.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
            SUM(CASE WHEN ti.status = 'declined' THEN 1 ELSE 0 END) as declined_count
        FROM talent_invitations ti
        {where_sql}
    """
    count_rows = parse_rows(execute_query(count_sql, list(params)))
    counts = count_rows[0] if count_rows else {}
    total = int(counts.get("total", 0) or 0)
    pending_count = int(counts.get("pending_count", 0) or 0)
    accepted_count = int(counts.get("accepted_count", 0) or 0)
    declined_count = int(counts.get("declined_count", 0) or 0)

    offset = (page - 1) * page_size
    query_params = list(params) + [page_size, offset]

    items_sql = f"""
        SELECT 
            ti.id, ti.project_id, ti.client_id, ti.freelancer_id,
            ti.message, ti.suggested_rate, ti.status, ti.response_message,
            ti.responded_at, ti.proposal_id, ti.viewed, ti.viewed_at,
            ti.expires_at, ti.created_at, ti.updated_at,
            p.title as project_title, p.description as project_description,
            p.budget_min as project_budget_min, p.budget_max as project_budget_max,
            p.category as project_category, p.skills as project_skills,
            c.name as client_name, c.profile_image_url as client_image,
            f.name as freelancer_name, f.profile_image_url as freelancer_image
        FROM talent_invitations ti
        LEFT JOIN projects p ON p.id = ti.project_id
        LEFT JOIN users c ON c.id = ti.client_id
        LEFT JOIN users f ON f.id = ti.freelancer_id
        {where_sql}
        ORDER BY ti.created_at DESC
        LIMIT ? OFFSET ?
    """
    rows = parse_rows(execute_query(items_sql, query_params)) or []

    formatted_items = []
    now = datetime.now(timezone.utc)
    for r in rows:
        msg = r.get("message") or ""
        preview = (msg[:97] + "...") if len(msg) > 100 else msg
        exp_str = r.get("expires_at")
        is_expired = False
        if exp_str and r.get("status") == "pending":
            try:
                exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                is_expired = now > exp_dt
            except Exception:
                pass

        formatted_items.append({
            "id": r.get("id"),
            "project_id": r.get("project_id"),
            "project_title": r.get("project_title") or "Untitled Project",
            "project_description": r.get("project_description") or "",
            "category": r.get("project_category") or "",
            "budget_min": r.get("project_budget_min"),
            "budget_max": r.get("project_budget_max"),
            "client_id": r.get("client_id"),
            "client_name": r.get("client_name") or "Client",
            "client_image": r.get("client_image"),
            "freelancer_id": r.get("freelancer_id"),
            "freelancer_name": r.get("freelancer_name") or "Freelancer",
            "freelancer_image": r.get("freelancer_image"),
            "message": msg,
            "message_preview": preview,
            "suggested_rate": r.get("suggested_rate"),
            "status": "expired" if is_expired else r.get("status", "pending"),
            "viewed": bool(r.get("viewed")),
            "viewed_at": r.get("viewed_at"),
            "response_message": r.get("response_message"),
            "responded_at": r.get("responded_at"),
            "proposal_id": r.get("proposal_id"),
            "expires_at": exp_str,
            "is_expired": is_expired,
            "created_at": r.get("created_at"),
            "updated_at": r.get("updated_at"),
        })

    return {
        "items": formatted_items,
        "invitations": formatted_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "per_page": page_size,
        "pending_count": pending_count,
        "accepted_count": accepted_count,
        "declined_count": declined_count,
    }


@router.get("/sent")
def list_sent_invitations(
    status: Optional[str] = None,
    project_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """List sent talent invitations for the current client."""
    _ensure_talent_invitations_table()
    where_clauses = ["ti.client_id = ?"]
    params = [current_user.id]

    if status:
        where_clauses.append("ti.status = ?")
        params.append(status)
    if project_id:
        where_clauses.append("ti.project_id = ?")
        params.append(project_id)

    where_sql = f"WHERE {' AND '.join(where_clauses)}"
    offset = (page - 1) * page_size
    query_params = list(params) + [page_size, offset]

    items_sql = f"""
        SELECT 
            ti.*,
            p.title as project_title, p.description as project_description,
            p.budget_min as project_budget_min, p.budget_max as project_budget_max,
            f.name as freelancer_name, f.profile_image_url as freelancer_image
        FROM talent_invitations ti
        LEFT JOIN projects p ON p.id = ti.project_id
        LEFT JOIN users f ON f.id = ti.freelancer_id
        {where_sql}
        ORDER BY ti.created_at DESC
        LIMIT ? OFFSET ?
    """
    rows = parse_rows(execute_query(items_sql, query_params)) or []
    return {"items": rows, "total": len(rows), "page": page}


@router.get("/received")
def list_received_invitations(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """List received talent invitations for the current freelancer."""
    _ensure_talent_invitations_table()
    where_clauses = ["ti.freelancer_id = ?"]
    params = [current_user.id]

    if status:
        where_clauses.append("ti.status = ?")
        params.append(status)

    where_sql = f"WHERE {' AND '.join(where_clauses)}"
    offset = (page - 1) * page_size
    query_params = list(params) + [page_size, offset]

    items_sql = f"""
        SELECT 
            ti.*,
            p.title as project_title, p.description as project_description,
            p.budget_min as project_budget_min, p.budget_max as project_budget_max,
            c.name as client_name, c.profile_image_url as client_image
        FROM talent_invitations ti
        LEFT JOIN projects p ON p.id = ti.project_id
        LEFT JOIN users c ON c.id = ti.client_id
        {where_sql}
        ORDER BY ti.created_at DESC
        LIMIT ? OFFSET ?
    """
    rows = parse_rows(execute_query(items_sql, query_params)) or []
    return {"items": rows, "total": len(rows), "page": page}


@router.get("/projects/{project_id}")
def get_project_invitations(
    project_id: int,
    current_user=Depends(get_current_user),
):
    """Get all talent invitations sent for a specific project."""
    _ensure_talent_invitations_table()

    proj_rows = parse_rows(
        execute_query("SELECT id, title, client_id FROM projects WHERE id = ?", [project_id])
    )
    if not proj_rows:
        raise HTTPException(status_code=404, detail="Project not found")

    project = proj_rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    if int(project["client_id"]) != int(current_user.id) and not is_admin:
        raise HTTPException(status_code=403, detail="You do not have access to this project's invitations")

    invitations = parse_rows(
        execute_query(
            """SELECT ti.*, f.name as freelancer_name, f.profile_image_url as freelancer_image
               FROM talent_invitations ti
               LEFT JOIN users f ON f.id = ti.freelancer_id
               WHERE ti.project_id = ?
               ORDER BY ti.created_at DESC""",
            [project_id],
        )
    ) or []

    pending = sum(1 for i in invitations if i.get("status") == "pending")
    accepted = sum(1 for i in invitations if i.get("status") == "accepted")
    declined = sum(1 for i in invitations if i.get("status") == "declined")
    expired = sum(1 for i in invitations if i.get("status") == "expired")

    return {
        "project_id": project_id,
        "project_title": project.get("title"),
        "invitations": invitations,
        "total_sent": len(invitations),
        "pending": pending,
        "accepted": accepted,
        "declined": declined,
        "expired": expired,
    }


@router.get("/{invitation_id}")
def get_invitation(
    invitation_id: int,
    current_user=Depends(get_current_user),
):
    """Get full details of a specific talent invitation."""
    _ensure_talent_invitations_table()

    detail_sql = """
        SELECT 
            ti.*,
            p.title as project_title, p.description as project_description,
            p.budget_min as project_budget_min, p.budget_max as project_budget_max,
            p.skills as project_skills, p.category as project_category,
            c.name as client_name, c.profile_image_url as client_image, c.location as client_country,
            f.name as freelancer_name, f.profile_image_url as freelancer_image
        FROM talent_invitations ti
        LEFT JOIN projects p ON p.id = ti.project_id
        LEFT JOIN users c ON c.id = ti.client_id
        LEFT JOIN users f ON f.id = ti.freelancer_id
        WHERE ti.id = ?
    """
    rows = parse_rows(execute_query(detail_sql, [invitation_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invitation not found")

    inv = rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    if int(current_user.id) not in (int(inv["client_id"]), int(inv["freelancer_id"])) and not is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to view this invitation")

    # If freelancer views for the first time, update viewed status
    if int(current_user.id) == int(inv["freelancer_id"]) and not inv.get("viewed"):
        now_iso = datetime.now(timezone.utc).isoformat()
        execute_query("UPDATE talent_invitations SET viewed = 1, viewed_at = ? WHERE id = ?", [now_iso, invitation_id])
        inv["viewed"] = 1
        inv["viewed_at"] = now_iso

    return inv


@router.post("/{invitation_id}/respond")
@router.put("/{invitation_id}/respond")
def respond_to_invitation(
    invitation_id: int,
    body: RespondInvitationBody,
    current_user=Depends(get_current_user),
):
    """Freelancer accepts or declines an invitation."""
    _ensure_talent_invitations_table()

    rows = parse_rows(
        execute_query(
            "SELECT ti.*, p.title as project_title FROM talent_invitations ti LEFT JOIN projects p ON p.id = ti.project_id WHERE ti.id = ?",
            [invitation_id],
        )
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Invitation not found")

    inv = rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    if int(inv["freelancer_id"]) != int(current_user.id) and not is_admin:
        raise HTTPException(status_code=403, detail="Only the invited freelancer can respond to this invitation")

    if inv.get("status") not in ("pending",):
        raise HTTPException(status_code=400, detail=f"Cannot respond to an invitation with status '{inv.get('status')}'")

    # Check if expired
    now = datetime.now(timezone.utc)
    exp_str = inv.get("expires_at")
    if exp_str:
        try:
            exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
            if now > exp_dt:
                execute_query("UPDATE talent_invitations SET status = 'expired' WHERE id = ?", [invitation_id])
                raise HTTPException(status_code=400, detail="This invitation has expired")
        except (ValueError, TypeError):
            pass

    # Determine acceptance
    is_accept = body.accept if body.accept is not None else (body.action == "accept")
    new_status = "accepted" if is_accept else "declined"
    resp_message = body.response_message or body.message or ""
    now_iso = now.isoformat()

    execute_query(
        "UPDATE talent_invitations SET status = ?, response_message = ?, responded_at = ?, updated_at = ? WHERE id = ?",
        [new_status, resp_message, now_iso, now_iso, invitation_id],
    )

    project_title = inv.get("project_title") or "Project"
    event_label = "accepted" if is_accept else "declined"
    _notify_safely(
        inv["client_id"],
        f"invitation_{event_label}",
        f"Invitation {event_label.capitalize()}",
        f"Freelancer has {event_label} your invitation to '{project_title}'.",
        f"/client/projects/{inv['project_id']}",
        {"invitation_id": invitation_id, "project_id": inv["project_id"], "status": new_status},
    )

    return {
        "message": f"Invitation {event_label} successfully",
        "invitation_id": invitation_id,
        "status": new_status,
        "responded_at": now_iso,
    }


@router.put("/{invitation_id}/status")
@router.patch("/{invitation_id}/status")
def update_invitation_status(
    invitation_id: int,
    body: UpdateInvitationStatusBody,
    current_user=Depends(get_current_user),
):
    """Update invitation status (e.g. client cancels, admin manages)."""
    _ensure_talent_invitations_table()

    rows = parse_rows(execute_query("SELECT * FROM talent_invitations WHERE id = ?", [invitation_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invitation not found")

    inv = rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    is_client = int(inv["client_id"]) == int(current_user.id)

    if not is_client and not is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to update this invitation status")

    target_status = body.status.lower()
    valid_statuses = {"pending", "accepted", "declined", "expired", "cancelled"}
    if target_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    # Client can only cancel
    if is_client and not is_admin and target_status != "cancelled":
        raise HTTPException(status_code=403, detail="Clients can only cancel invitations")

    now_iso = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE talent_invitations SET status = ?, updated_at = ? WHERE id = ?",
        [target_status, now_iso, invitation_id],
    )

    return {
        "message": f"Invitation status updated to '{target_status}'",
        "invitation_id": invitation_id,
        "status": target_status,
    }


@router.delete("/{invitation_id}")
def cancel_invitation(
    invitation_id: int,
    current_user=Depends(get_current_user),
):
    """Cancel or delete a talent invitation."""
    _ensure_talent_invitations_table()

    rows = parse_rows(execute_query("SELECT * FROM talent_invitations WHERE id = ?", [invitation_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invitation not found")

    inv = rows[0]
    is_admin = getattr(current_user, "role", "") == "admin" or getattr(current_user, "user_type", "") == "admin"
    is_client = int(inv["client_id"]) == int(current_user.id)

    if not is_client and not is_admin:
        raise HTTPException(status_code=403, detail="Only the inviting client or admin can cancel an invitation")

    now_iso = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE talent_invitations SET status = 'cancelled', updated_at = ? WHERE id = ?",
        [now_iso, invitation_id],
    )

    return {"message": "Invitation cancelled successfully", "invitation_id": invitation_id}
