# @AI-HINT: Branding router — organization branding and customization
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class BrandingConfigCreate(BaseModel):
    organization_id: str
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None


class BrandingConfigUpdate(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo_url: Optional[str] = None
    custom_css: Optional[str] = None


@router.get("/config/{organization_id}")
def get_branding_config(organization_id: str, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, organization_id, primary_color, secondary_color, accent_color, logo_url, favicon_url, custom_css, created_at, updated_at FROM branding_config WHERE organization_id = ?",
        [organization_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Branding config not found")
    return rows[0]


@router.post("/config")
def create_branding_config(request: BrandingConfigCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO branding_config (organization_id, primary_color, secondary_color, accent_color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [request.organization_id, request.primary_color or "#000000", request.secondary_color or "#ffffff", request.accent_color or "#0066ff", now, now],
    )
    return {"message": "Branding config created", "config_id": result.get("last_insert_rowid")}


@router.put("/config/{organization_id}")
def update_branding_config(organization_id: str, request: BrandingConfigUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), organization_id]

    execute_query(f"UPDATE branding_config SET {', '.join(set_parts)} WHERE organization_id = ?", values)
    return {"message": "Branding config updated"}


@router.post("/config/{organization_id}/logo")
def upload_logo(organization_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    file_url = f"/uploads/branding/{organization_id}/logo_{file.filename}"
    execute_query(
        "UPDATE branding_config SET logo_url = ?, updated_at = ? WHERE organization_id = ?",
        [file_url, datetime.now(timezone.utc).isoformat(), organization_id],
    )
    return {"message": "Logo uploaded", "logo_url": file_url}


@router.post("/config/{organization_id}/favicon")
def upload_favicon(organization_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    file_url = f"/uploads/branding/{organization_id}/favicon_{file.filename}"
    execute_query(
        "UPDATE branding_config SET favicon_url = ?, updated_at = ? WHERE organization_id = ?",
        [file_url, datetime.now(timezone.utc).isoformat(), organization_id],
    )
    return {"message": "Favicon uploaded", "favicon_url": file_url}


@router.get("/presets")
def get_presets(current_user=Depends(get_current_user)):
    return {
        "presets": [
            {"id": "modern", "name": "Modern", "primary_color": "#0066ff", "secondary_color": "#ffffff", "accent_color": "#00cc88"},
            {"id": "dark", "name": "Dark", "primary_color": "#1a1a2e", "secondary_color": "#16213e", "accent_color": "#e94560"},
            {"id": "minimal", "name": "Minimal", "primary_color": "#000000", "secondary_color": "#ffffff", "accent_color": "#333333"},
        ]
    }


@router.post("/config/{organization_id}/apply-preset")
def apply_preset(organization_id: str, preset_id: str = Query(...), current_user=Depends(get_current_user)):
    presets = {
        "modern": {"primary_color": "#0066ff", "secondary_color": "#ffffff", "accent_color": "#00cc88"},
        "dark": {"primary_color": "#1a1a2e", "secondary_color": "#16213e", "accent_color": "#e94560"},
        "minimal": {"primary_color": "#000000", "secondary_color": "#ffffff", "accent_color": "#333333"},
    }
    preset = presets.get(preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")

    set_parts = [f"{k} = ?" for k in preset]
    set_parts.append("updated_at = ?")
    values = list(preset.values()) + [datetime.now(timezone.utc).isoformat(), organization_id]

    execute_query(f"UPDATE branding_config SET {', '.join(set_parts)} WHERE organization_id = ?", values)
    return {"message": "Preset applied"}


@router.get("/config/{organization_id}/preview")
def preview_branding(organization_id: str, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT primary_color, secondary_color, accent_color, logo_url FROM branding_config WHERE organization_id = ?",
        [organization_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Branding config not found")
    return {"preview": rows[0]}


@router.post("/config/{organization_id}/custom-domain")
def setup_custom_domain(organization_id: str, domain: str = Query(...), current_user=Depends(get_current_user)):
    execute_query(
        "UPDATE branding_config SET custom_domain = ?, domain_status = 'pending', updated_at = ? WHERE organization_id = ?",
        [domain, datetime.now(timezone.utc).isoformat(), organization_id],
    )
    return {"message": "Custom domain setup initiated", "domain": domain}


@router.get("/config/{organization_id}/domain-status")
def check_domain_status(organization_id: str, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT custom_domain, domain_status FROM branding_config WHERE organization_id = ?",
        [organization_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Branding config not found")
    return {"domain": rows[0].get("custom_domain"), "status": rows[0].get("domain_status", "not_configured")}


@router.delete("/config/{organization_id}")
def delete_branding_config(organization_id: str, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM branding_config WHERE organization_id = ?", [organization_id])
    return {"message": "Branding config deleted"}
