# @AI-HINT: Email templates router — email template management
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class EmailTemplateCreate(BaseModel):
    template_type: str
    name: str
    subject: str
    html_body: str
    text_body: Optional[str] = None
    variables: Optional[list[str]] = None


class EmailTemplateUpdate(BaseModel):
    template_type: Optional[str] = None
    name: Optional[str] = None
    subject: Optional[str] = None
    html_body: Optional[str] = None
    text_body: Optional[str] = None
    variables: Optional[list[str]] = None
    is_active: Optional[bool] = None


@router.get("")
async def list_templates(
    include_inactive: bool = Query(False),
    current_user=Depends(require_admin),
):
    where = "" if include_inactive else "WHERE is_active = 1"
    result = execute_query(
        f"SELECT id, template_type, name, subject, html_body, text_body, variables, is_active, created_at, updated_at FROM email_templates {where} ORDER BY template_type ASC",
        [],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/types")
async def get_template_types(current_user=Depends(require_admin)):
    return {
        "types": [
            {"id": "welcome", "name": "Welcome Email", "description": "Sent when a user signs up"},
            {"id": "password_reset", "name": "Password Reset", "description": "Sent when a user requests password reset"},
            {"id": "proposal_received", "name": "Proposal Received", "description": "Sent to client when proposal is submitted"},
            {"id": "payment_received", "name": "Payment Received", "description": "Sent when payment is processed"},
            {"id": "contract_started", "name": "Contract Started", "description": "Sent when contract begins"},
        ]
    }


@router.get("/{template_id}")
async def get_template(template_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT id, template_type, name, subject, html_body, text_body, variables, is_active, created_at, updated_at FROM email_templates WHERE id = ?",
        [template_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Template not found")
    return rows[0]


@router.post("")
async def create_template(request: EmailTemplateCreate, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    import json
    result = execute_query(
        "INSERT INTO email_templates (template_type, name, subject, html_body, text_body, variables, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)",
        [request.template_type, request.name, request.subject, request.html_body, request.text_body or "", json.dumps(request.variables or []), now, now],
    )
    return {"message": "Template created", "template_id": result.get("last_insert_rowid")}


@router.put("/{template_id}")
async def update_template(template_id: int, request: EmailTemplateUpdate, current_user=Depends(require_admin)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    import json
    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "variables":
            set_parts.append(f"{k} = ?")
            values.append(json.dumps(v))
        elif k == "is_active":
            set_parts.append(f"{k} = ?")
            values.append(1 if v else 0)
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), template_id])

    execute_query(f"UPDATE email_templates SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Template updated"}


@router.delete("/{template_id}")
async def delete_template(template_id: int, current_user=Depends(require_admin)):
    execute_query("DELETE FROM email_templates WHERE id = ?", [template_id])
    return {"message": "Template deleted"}


@router.post("/{template_id}/preview")
async def preview_template(template_id: int, data: dict, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT subject, html_body FROM email_templates WHERE id = ?",
        [template_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Template not found")

    sample_data = data.get("sample_data", {})
    subject = rows[0]["subject"]
    html_body = rows[0]["html_body"]

    for key, value in sample_data.items():
        subject = subject.replace(f"{{{{{key}}}}}", str(value))
        html_body = html_body.replace(f"{{{{{key}}}}}", str(value))

    return {"subject": subject, "html_body": html_body}


@router.post("/{template_id}/duplicate")
async def duplicate_template(template_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT template_type, name, subject, html_body, text_body, variables FROM email_templates WHERE id = ?",
        [template_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Template not found")

    now = datetime.now(timezone.utc).isoformat()
    new_name = f"{rows[0]['name']} (Copy)"
    new_result = execute_query(
        "INSERT INTO email_templates (template_type, name, subject, html_body, text_body, variables, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)",
        [rows[0]["template_type"], new_name, rows[0]["subject"], rows[0]["html_body"], rows[0]["text_body"], rows[0]["variables"], now, now],
    )
    return {"message": "Template duplicated", "template_id": new_result.get("last_insert_rowid")}
