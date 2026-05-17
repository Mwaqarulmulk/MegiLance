# @AI-HINT: Analytics router — platform analytics and metrics
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/overview")
async def get_overview(period: str = Query("30d"), current_user=Depends(require_admin)):
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    users = execute_query("SELECT COUNT(*) as count FROM users WHERE created_at >= ?", [since])
    projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE created_at >= ?", [since])
    proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE created_at >= ?", [since])
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE created_at >= ?", [since])
    revenue = execute_query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at >= ? AND status = 'completed'", [since])

    return {
        "period": period,
        "new_users": parse_rows(users)[0]["count"] if parse_rows(users) else 0,
        "new_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
        "new_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
        "new_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
        "revenue": parse_rows(revenue)[0]["total"] if parse_rows(revenue) else 0,
    }


@router.get("/users")
async def get_user_analytics(period: str = Query("30d"), current_user=Depends(require_admin)):
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    total = execute_query("SELECT COUNT(*) as count FROM users", [])
    active = execute_query("SELECT COUNT(*) as count FROM users WHERE created_at >= ?", [since])
    by_type = execute_query("SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type", [])
    verified = execute_query("SELECT COUNT(*) as count FROM users WHERE is_verified = 1", [])

    return {
        "total_users": parse_rows(total)[0]["count"] if parse_rows(total) else 0,
        "active_users": parse_rows(active)[0]["count"] if parse_rows(active) else 0,
        "by_type": {r["user_type"]: r["count"] for r in (parse_rows(by_type) or [])},
        "verified_users": parse_rows(verified)[0]["count"] if parse_rows(verified) else 0,
    }


@router.get("/projects")
async def get_project_analytics(period: str = Query("30d"), current_user=Depends(require_admin)):
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    total = execute_query("SELECT COUNT(*) as count FROM projects WHERE created_at >= ?", [since])
    by_status = execute_query("SELECT status, COUNT(*) as count FROM projects WHERE created_at >= ? GROUP BY status", [since])
    by_category = execute_query("SELECT category, COUNT(*) as count FROM projects WHERE created_at >= ? GROUP BY category ORDER BY count DESC LIMIT 10", [since])
    completion = execute_query("SELECT COUNT(*) as count FROM projects WHERE status = 'closed' AND created_at >= ?", [since])

    return {
        "total": parse_rows(total)[0]["count"] if parse_rows(total) else 0,
        "by_status": {r["status"]: r["count"] for r in (parse_rows(by_status) or [])},
        "top_categories": parse_rows(by_category) or [],
        "completion_rate": parse_rows(completion)[0]["count"] if parse_rows(completion) else 0,
    }


@router.get("/revenue")
async def get_revenue_analytics(period: str = Query("30d"), current_user=Depends(require_admin)):
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    total = execute_query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at >= ? AND status = 'completed'", [since])
    pending = execute_query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'pending'", [])
    by_method = execute_query("SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at >= ? GROUP BY payment_method", [since])

    return {
        "total_revenue": parse_rows(total)[0]["total"] if parse_rows(total) else 0,
        "pending_payments": parse_rows(pending)[0]["total"] if parse_rows(pending) else 0,
        "by_method": [{"method": r["payment_method"], "count": r["count"], "total": r["total"]} for r in (parse_rows(by_method) or [])],
    }
