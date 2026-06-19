# @AI-HINT: Reports router — report generation and export
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import csv
import io
import json
import os

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "reports_output")


class ReportRequest(BaseModel):
    report_type: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: str = "json"


def _build_report_data(report_type: str, start: str, end: str) -> list:
    queries = {
        "users": (
            "SELECT id, email, name, user_type, role, is_verified, is_active, country, created_at "
            "FROM users WHERE created_at BETWEEN ? AND ?",
        ),
        "projects": (
            "SELECT id, title, category, budget_type, budget_min, budget_max, status, client_id, created_at "
            "FROM projects WHERE created_at BETWEEN ? AND ?",
        ),
        "revenue": (
            "SELECT id, contract_id, amount, payment_method, status, created_at "
            "FROM payments WHERE created_at BETWEEN ? AND ?",
        ),
        "proposals": (
            "SELECT id, project_id, freelancer_id, bid_amount, status, created_at "
            "FROM proposals WHERE created_at BETWEEN ? AND ?",
        ),
        "contracts": (
            "SELECT id, project_id, client_id, freelancer_id, amount, contract_type, status, created_at "
            "FROM contracts WHERE created_at BETWEEN ? AND ?",
        ),
    }
    if report_type not in queries:
        raise HTTPException(status_code=400, detail=f"Unknown report type: {report_type}")

    result = execute_query(queries[report_type], [start, end])
    return parse_rows(result) or []


def _save_report_file(report_type: str, fmt: str, data: list) -> str:
    now = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{report_type}_{now}.{fmt}"
    os.makedirs(REPORT_DIR, exist_ok=True)
    filepath = os.path.join(REPORT_DIR, filename)

    if fmt == "csv" and data:
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
    elif fmt == "json":
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    return filepath


@router.get("/types")
def get_report_types():
    return {
        "types": [
            {"id": "users", "name": "User Report", "description": "All users with details"},
            {"id": "projects", "name": "Project Report", "description": "All projects with status"},
            {"id": "revenue", "name": "Revenue Report", "description": "Payment and revenue data"},
            {"id": "proposals", "name": "Proposal Report", "description": "All proposals with status"},
            {"id": "contracts", "name": "Contract Report", "description": "All contracts with details"},
        ]
    }


@router.post("/export")
def export_report(request: ReportRequest, current_user=Depends(require_admin)):
    start = request.start_date or (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    end = request.end_date or datetime.now(timezone.utc).isoformat()

    try:
        data = _build_report_data(request.report_type, start, end)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error building report data: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report data")

    if not data:
        return {
            "report_type": request.report_type,
            "format": request.format,
            "data": [],
            "total": 0,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    now = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    if request.format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        csv_content = output.getvalue()

        try:
            filepath = _save_report_file(request.report_type, "csv", data)
            return {
                "report_type": request.report_type,
                "format": "csv",
                "data": csv_content,
                "total": len(data),
                "filename": f"{request.report_type}_{now}.csv",
                "filepath": filepath,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            logger.warning(f"Could not save report file: {e}")
            return {
                "report_type": request.report_type,
                "format": "csv",
                "data": csv_content,
                "total": len(data),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }
    else:
        try:
            filepath = _save_report_file(request.report_type, "json", data)
            return {
                "report_type": request.report_type,
                "format": "json",
                "data": data,
                "total": len(data),
                "filename": f"{request.report_type}_{now}.json",
                "filepath": filepath,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            logger.warning(f"Could not save report file: {e}")
            return {
                "report_type": request.report_type,
                "format": "json",
                "data": data,
                "total": len(data),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }


@router.get("/list")
def list_reports(current_user=Depends(require_admin)):
    try:
        if not os.path.exists(REPORT_DIR):
            return {"reports": []}

        reports = []
        for filename in sorted(os.listdir(REPORT_DIR), reverse=True):
            filepath = os.path.join(REPORT_DIR, filename)
            if os.path.isfile(filepath):
                stat = os.stat(filepath)
                reports.append({
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                    "format": filename.rsplit(".", 1)[-1] if "." in filename else "unknown",
                })

        return {"reports": reports[:50]}
    except Exception as e:
        logger.error(f"Error listing reports: {e}")
        return {"reports": []}


@router.get("/{report_id}")
def get_report(report_id: str, current_user=Depends(require_admin)):
    try:
        filepath = os.path.join(REPORT_DIR, report_id)
        if not os.path.isfile(filepath):
            raise HTTPException(status_code=404, detail="Report not found")

        stat = os.stat(filepath)
        ext = report_id.rsplit(".", 1)[-1] if "." in report_id else "unknown"

        if ext == "json":
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        elif ext == "csv":
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            return {
                "filename": report_id,
                "format": "csv",
                "data": content,
                "size_bytes": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {ext}")

        return {
            "filename": report_id,
            "format": ext,
            "data": data,
            "total": len(data) if isinstance(data, list) else 0,
            "size_bytes": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading report: {e}")
        raise HTTPException(status_code=500, detail="Failed to read report")
