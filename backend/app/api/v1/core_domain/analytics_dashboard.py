# @AI-HINT: Analytics Dashboard router — business intelligence endpoints for admin dashboard
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _cell(result, col=0):
    """Return the unwrapped scalar at row 0 / column `col`, handling Turso's
    {type, value} cell format. Returns None if absent."""
    if result and result.get("rows") and result["rows"]:
        val = result["rows"][0][col]
        if isinstance(val, dict):
            return None if val.get("type") == "null" else val.get("value")
        return val
    return None


def _safe_count(result, col=0) -> int:
    try:
        return int(_cell(result, col) or 0)
    except (TypeError, ValueError):
        return 0


def _safe_float(result, col=0) -> float:
    try:
        return float(_cell(result, col) or 0)
    except (TypeError, ValueError):
        return 0.0


@router.get("/analytics/dashboard/summary")
def get_dashboard_summary(current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()

    total_users = _safe_count(execute_query("SELECT COUNT(*) FROM users", []))
    new_users_month = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ?", [month_start]
    ))
    active_projects = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'open'", []
    ))
    rev_result = execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [month_start]
    )
    total_revenue = _safe_float(rev_result)

    active_users_week = _safe_count(execute_query(
        "SELECT COUNT(DISTINCT from_user_id) FROM payments WHERE created_at >= ?", [week_ago]
    ))

    return {
        "total_users": total_users,
        "new_users_this_month": new_users_month,
        "active_projects": active_projects,
        "revenue_this_month": round(total_revenue, 2),
        "active_users_this_week": active_users_week,
    }


@router.get("/analytics/platform-health")
def get_platform_health(current_user=Depends(require_admin)):
    try:
        db_check = execute_query("SELECT 1 as ok", [])
        db_connected = bool(db_check and db_check.get("rows"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_connected = False

    now = datetime.now(timezone.utc)
    one_hour_ago = (now - timedelta(hours=1)).isoformat()
    one_day_ago = (now - timedelta(days=1)).isoformat()

    queries_1h = {}
    for table in ["users", "projects", "payments", "contracts", "proposals"]:
        try:
            result = execute_query(
                f"SELECT COUNT(*) FROM {table} WHERE created_at >= ?",
                [one_hour_ago],
            )
            queries_1h[table] = _safe_count(result)
        except Exception:
            queries_1h[table] = 0

    queries_24h = {}
    for table in ["users", "projects", "payments", "contracts", "proposals"]:
        try:
            result = execute_query(
                f"SELECT COUNT(*) FROM {table} WHERE created_at >= ?",
                [one_day_ago],
            )
            queries_24h[table] = _safe_count(result)
        except Exception:
            queries_24h[table] = 0

    try:
        failed_payments = _safe_count(execute_query(
            "SELECT COUNT(*) FROM payments WHERE status = 'failed' AND created_at >= ?",
            [one_day_ago],
        ))
    except Exception:
        failed_payments = 0

    try:
        disputes = _safe_count(execute_query(
            "SELECT COUNT(*) FROM disputes WHERE status = 'open'", []
        ))
    except Exception:
        disputes = 0

    status = "healthy"
    if not db_connected:
        status = "critical"
    elif failed_payments > 10 or disputes > 5:
        status = "degraded"

    return {
        "status": status,
        "database": "connected" if db_connected else "disconnected",
        "checked_at": now.isoformat(),
        "activity_1h": queries_1h,
        "activity_24h": queries_24h,
        "failed_payments_24h": failed_payments,
        "open_disputes": disputes,
    }


@router.get("/analytics/user-distribution")
def get_user_distribution(
    group_by: str = Query("country", pattern="^(country|user_type|role|seller_level|experience_level)$"),
    current_user=Depends(require_admin),
):
    valid_columns = {"country", "user_type", "role", "seller_level", "experience_level"}
    if group_by not in valid_columns:
        group_by = "country"

    try:
        result = execute_query(
            f"SELECT {group_by}, COUNT(*) as count FROM users "
            f"WHERE {group_by} IS NOT NULL GROUP BY {group_by} ORDER BY count DESC LIMIT 30",
            [],
        )
        rows = parse_rows(result) or []

        total_result = execute_query("SELECT COUNT(*) FROM users", [])
        total = _safe_count(total_result)

        for row in rows:
            pct = round(row["count"] / total * 100, 1) if total > 0 else 0
            row["percentage"] = pct

        return {"group_by": group_by, "distribution": rows, "total_users": total}
    except Exception as e:
        logger.error(f"Error fetching user distribution: {e}")
        return {"group_by": group_by, "distribution": [], "total_users": 0}


@router.get("/analytics/revenue-trends")
def get_revenue_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = Query("day", pattern="^(day|week|month)$"),
    current_user=Depends(require_admin),
):
    since = start_date or (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    try:
        result = execute_query(
            "SELECT DATE(created_at) as date, "
            "SUM(amount) as revenue, COUNT(*) as transaction_count, "
            "AVG(amount) as avg_transaction "
            "FROM payments WHERE status = 'completed' AND created_at >= ? "
            "GROUP BY DATE(created_at) ORDER BY 1",
            [since],
        )
        data = parse_rows(result) or []

        for row in data:
            row["revenue"] = round(float(row.get("revenue", 0) or 0), 2)
            row["avg_transaction"] = round(float(row.get("avg_transaction", 0) or 0), 2)
            row["transaction_count"] = int(row.get("transaction_count", 0) or 0)

        total_result = execute_query(
            "SELECT SUM(amount) as total, COUNT(*) as count, AVG(amount) as avg "
            "FROM payments WHERE status = 'completed' AND created_at >= ?",
            [since],
        )
        total_rows = parse_rows(total_result)
        summary = total_rows[0] if total_rows else {"total": 0, "count": 0, "avg": 0}

        return {
            "interval": interval,
            "data": data,
            "summary": {
                "total_revenue": round(float(summary.get("total", 0) or 0), 2),
                "total_transactions": int(summary.get("count", 0) or 0),
                "avg_transaction": round(float(summary.get("avg", 0) or 0), 2),
            },
        }
    except Exception as e:
        logger.error(f"Error fetching revenue trends: {e}")
        return {"interval": interval, "data": [], "summary": {}}


@router.get("/analytics/users/registration-trends")
def get_registration_trends(
    start_date: Optional[str] = None,
    interval: str = Query("day", pattern="^(day|week|month)$"),
    current_user=Depends(require_admin),
):
    since = start_date or (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    result = execute_query(
        "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= ? "
        "GROUP BY DATE(created_at) ORDER BY 1",
        [since],
    )
    data = parse_rows(result) or []
    return {"interval": interval, "data": data}


@router.get("/analytics/projects/completion-rate")
def get_project_completion_rate(current_user=Depends(require_admin)):
    total = _safe_count(execute_query("SELECT COUNT(*) FROM projects", []))
    completed = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'completed'", []
    ))
    rate = round(completed / total * 100, 1) if total > 0 else 0
    return {"total_projects": total, "completed": completed, "completion_rate": rate}


@router.get("/analytics/revenue/stats")
def get_revenue_stats(
    days: int = Query(30, ge=1, le=365),
    current_user=Depends(require_admin),
):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    rev_result = execute_query(
        "SELECT SUM(amount), COUNT(*), AVG(amount) FROM payments "
        "WHERE status = 'completed' AND created_at >= ?",
        [since],
    )
    total = _safe_float(rev_result, 0)
    count = _safe_count(rev_result, 1)
    avg = _safe_float(rev_result, 2)
    return {
        "days": days,
        "total_revenue": round(total, 2),
        "transaction_count": count,
        "avg_transaction": round(avg, 2),
    }


@router.get("/analytics/growth/summary")
def get_growth_summary(current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month = (this_month - timedelta(days=1)).replace(day=1)

    this_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ?", [this_month.isoformat()]
    ))
    last_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ? AND created_at < ?",
        [last_month.isoformat(), this_month.isoformat()]
    ))
    growth_pct = round((this_users - last_users) / max(last_users, 1) * 100, 1)

    this_revenue = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [this_month.isoformat()],
    ))

    last_revenue = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ? AND created_at < ?",
        [last_month.isoformat(), this_month.isoformat()],
    ))

    return {
        "users_this_month": this_users,
        "users_last_month": last_users,
        "user_growth_pct": growth_pct,
        "revenue_this_month": round(this_revenue, 2),
        "revenue_last_month": round(last_revenue, 2),
    }


@router.get("/analytics/funnel/conversion")
def get_conversion_funnel(current_user=Depends(require_admin)):
    total_users = _safe_count(execute_query("SELECT COUNT(*) FROM users", []))
    posted_project = _safe_count(execute_query("SELECT COUNT(DISTINCT client_id) FROM projects", []))
    got_proposal = _safe_count(execute_query("SELECT COUNT(DISTINCT project_id) FROM proposals", []))
    contracted = _safe_count(execute_query("SELECT COUNT(*) FROM contracts", []))
    completed = _safe_count(execute_query("SELECT COUNT(*) FROM contracts WHERE status = 'completed'", []))
    return {
        "stages": [
            {"stage": "registered", "count": total_users},
            {"stage": "posted_project", "count": posted_project},
            {"stage": "received_proposals", "count": got_proposal},
            {"stage": "contracted", "count": contracted},
            {"stage": "completed", "count": completed},
        ]
    }
