# @AI-HINT: Reports router — report generation and export
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import csv
import io

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ReportRequest(BaseModel):
    report_type: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: str = "json"


@router.get("/types")
async def get_report_types():
    return {
        "types": [
            {"id": "users", "name": "User Report", "description": "All users with details"},
            {"id": "projects", "name": "Project Report", "description": "All projects with status"},
            {"id": "revenue", "name": "Revenue Report", "description": "Payment and revenue data"},
            {"id": "proposals", "name": "Proposal Report", "description": "All proposals with status"},
            {"id": "contracts", "name": "Contract Report", "description": "All contracts with details"},
        ]
    }


@router.post("/generate")
async def generate_report(request: ReportRequest, current_user=Depends(require_admin)):
    start = request.start_date or (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    end = request.end_date or datetime.now(timezone.utc).isoformat()

    if request.report_type == "users":
        result = execute_query("SELECT id, email, name, user_type, role, is_verified, is_active, created_at FROM users WHERE created_at BETWEEN ? AND ?", [start, end])
        data = parse_rows(result) or []
    elif request.report_type == "projects":
        result = execute_query("SELECT id, title, category, budget_type, budget_min, budget_max, status, client_id, created_at FROM projects WHERE created_at BETWEEN ? AND ?", [start, end])
        data = parse_rows(result) or []
    elif request.report_type == "revenue":
        result = execute_query("SELECT id, contract_id, amount, currency, payment_method, status, created_at FROM payments WHERE created_at BETWEEN ? AND ?", [start, end])
        data = parse_rows(result) or []
    elif request.report_type == "proposals":
        result = execute_query("SELECT id, project_id, freelancer_id, bid_amount, status, created_at FROM proposals WHERE created_at BETWEEN ? AND ?", [start, end])
        data = parse_rows(result) or []
    elif request.report_type == "contracts":
        result = execute_query("SELECT id, project_id, client_id, freelancer_id, amount, contract_type, status, created_at FROM contracts WHERE created_at BETWEEN ? AND ?", [start, end])
        data = parse_rows(result) or []
    else:
        raise HTTPException(status_code=400, detail=f"Unknown report type: {request.report_type}")

    if request.format == "csv" and data:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return {"format": "csv", "data": output.getvalue()}

    return {"format": "json", "data": data, "total": len(data)}


@router.get("/export/{report_type}")
async def export_report(report_type: str, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return {"message": f"Report {report_type} export initiated", "filename": f"{report_type}_{now}.csv"}
