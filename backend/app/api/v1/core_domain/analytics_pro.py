# @AI-HINT: Advanced Analytics Pro router — ML predictions and BI dashboards
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import json
import math
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            user_id INTEGER,
            entity_type TEXT,
            entity_id INTEGER,
            metadata_json TEXT,
            created_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snapshot_date TEXT NOT NULL,
            metric_name TEXT NOT NULL,
            metric_value REAL,
            dimensions_json TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(snapshot_date, metric_name)
        )
    """, [])


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


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


# Ensure analytics tables exist on module load
_ensure_table()


# ===========================================================================
# 1. GET /analytics-pro/overview — Platform-wide analytics overview
# ===========================================================================

@router.get("/analytics-pro/overview")
async def get_overview(current_user=Depends(require_admin)):
    now = _now_utc()
    month_start = _iso(now.replace(day=1, hour=0, minute=0, second=0, microsecond=0))
    week_ago = _iso(now - timedelta(days=7))
    yesterday = _iso(now - timedelta(days=1))

    total_users = _safe_count(execute_query("SELECT COUNT(*) FROM users", []))
    total_freelancers = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE user_type = 'freelancer' OR role = 'freelancer'", []
    ))
    total_clients = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE user_type = 'client' OR role = 'client'", []
    ))
    active_projects = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'open'", []
    ))
    total_projects = _safe_count(execute_query("SELECT COUNT(*) FROM projects", []))

    total_revenue = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed'", []
    ))
    revenue_this_month = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [month_start]
    ))
    revenue_yesterday = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' "
        "AND created_at >= ? AND created_at < ?",
        [yesterday, _iso(now.replace(hour=0, minute=0, second=0, microsecond=0))]
    ))

    total_contracts = _safe_count(execute_query("SELECT COUNT(*) FROM contracts", []))
    completed_contracts = _safe_count(execute_query(
        "SELECT COUNT(*) FROM contracts WHERE status = 'completed'", []
    ))
    avg_rating = _safe_float(execute_query("SELECT AVG(rating) FROM reviews", []))

    return {
        "overview": {
            "total_users": total_users,
            "total_freelancers": total_freelancers,
            "total_clients": total_clients,
            "active_projects": active_projects,
            "total_projects": total_projects,
            "total_revenue": round(total_revenue, 2),
            "revenue_this_month": round(revenue_this_month, 2),
            "revenue_yesterday": round(revenue_yesterday, 2),
            "total_contracts": total_contracts,
            "completed_contracts": completed_contracts,
            "avg_rating": round(avg_rating, 2) if avg_rating else 0,
        },
        "generated_at": _iso(now),
    }


# ===========================================================================
# 2. GET /analytics-pro/revenue — Revenue analytics with time series data
# ===========================================================================

@router.get("/analytics-pro/revenue")
async def get_revenue_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = Query("day", regex="^(day|week|month)$"),
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=90))
    end = end_date or _iso(now)

    # Time-series revenue data
    result = execute_query(
        "SELECT DATE(created_at) as date, "
        "SUM(amount) as revenue, COUNT(*) as transaction_count, "
        "AVG(amount) as avg_transaction "
        "FROM payments WHERE status = 'completed' AND created_at >= ? AND created_at <= ? "
        "GROUP BY DATE(created_at) ORDER BY 1",
        [start, end],
    )
    time_series = parse_rows(result) or []
    for row in time_series:
        row["revenue"] = round(float(row.get("revenue", 0) or 0), 2)
        row["avg_transaction"] = round(float(row.get("avg_transaction", 0) or 0), 2)
        row["transaction_count"] = int(row.get("transaction_count", 0) or 0)

    # Summary stats
    summary_result = execute_query(
        "SELECT SUM(amount) as total, COUNT(*) as count, AVG(amount) as avg, "
        "MAX(amount) as max, MIN(amount) as min "
        "FROM payments WHERE status = 'completed' AND created_at >= ? AND created_at <= ?",
        [start, end],
    )
    summary_rows = parse_rows(summary_result)
    summary_raw = summary_rows[0] if summary_rows else {}

    # Revenue by payment method
    method_result = execute_query(
        "SELECT payment_method, SUM(amount) as revenue, COUNT(*) as count "
        "FROM payments WHERE status = 'completed' AND created_at >= ? AND created_at <= ? "
        "GROUP BY payment_method ORDER BY revenue DESC",
        [start, end],
    )
    by_method = parse_rows(method_result) or []
    for row in by_method:
        row["revenue"] = round(float(row.get("revenue", 0) or 0), 2)

    # Month-over-month comparison
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    this_month_rev = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [_iso(month_start)]
    ))
    last_month_rev = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' "
        "AND created_at >= ? AND created_at <= ?",
        [_iso(last_month_start), _iso(last_month_end)]
    ))

    if last_month_rev > 0:
        mom_change = round((this_month_rev - last_month_rev) / last_month_rev * 100, 1)
    else:
        mom_change = 0.0

    return {
        "interval": interval,
        "date_range": {"start": start, "end": end},
        "time_series": time_series,
        "summary": {
            "total_revenue": round(float(summary_raw.get("total", 0) or 0), 2),
            "total_transactions": int(summary_raw.get("count", 0) or 0),
            "avg_transaction": round(float(summary_raw.get("avg", 0) or 0), 2),
            "max_transaction": round(float(summary_raw.get("max", 0) or 0), 2),
            "min_transaction": round(float(summary_raw.get("min", 0) or 0), 2),
        },
        "by_payment_method": by_method,
        "month_over_month": {
            "this_month": round(this_month_rev, 2),
            "last_month": round(last_month_rev, 2),
            "change_pct": mom_change,
        },
        "generated_at": _iso(now),
    }


# ===========================================================================
# 3. GET /analytics-pro/user-growth — User growth analytics
# ===========================================================================

@router.get("/analytics-pro/user-growth")
async def get_user_growth(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = Query("day", regex="^(day|week|month)$"),
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=90))
    end = end_date or _iso(now)

    # Registration time-series
    reg_result = execute_query(
        "SELECT DATE(created_at) as date, COUNT(*) as count FROM users "
        "WHERE created_at >= ? AND created_at <= ? GROUP BY DATE(created_at) ORDER BY 1",
        [start, end],
    )
    time_series = parse_rows(reg_result) or []

    # By user type breakdown
    type_result = execute_query(
        "SELECT user_type, COUNT(*) as count FROM users "
        "WHERE created_at >= ? AND created_at <= ? GROUP BY user_type ORDER BY count DESC",
        [start, end],
    )
    by_type = parse_rows(type_result) or []

    # Growth rate: month-over-month
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    this_month_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ?",
        [_iso(month_start)]
    ))
    last_month_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ? AND created_at < ?",
        [_iso(last_month_start), _iso(last_month_end)]
    ))

    if last_month_users > 0:
        growth_pct = round((this_month_users - last_month_users) / last_month_users * 100, 1)
    else:
        growth_pct = 0.0

    total_users = _safe_count(execute_query("SELECT COUNT(*) FROM users", []))

    return {
        "interval": interval,
        "date_range": {"start": start, "end": end},
        "time_series": time_series,
        "by_user_type": by_type,
        "total_users": total_users,
        "this_month": this_month_users,
        "last_month": last_month_users,
        "growth_pct": growth_pct,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 4. GET /analytics-pro/project-metrics — Project completion rates, avg budgets
# ===========================================================================

@router.get("/analytics-pro/project-metrics")
async def get_project_metrics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=90))
    end = end_date or _iso(now)

    total = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE created_at >= ? AND created_at <= ?",
        [start, end]
    ))
    completed = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'completed' AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))
    open_projects = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'open' AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))
    cancelled = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE status = 'cancelled' AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    completion_rate = round(completed / total * 100, 1) if total > 0 else 0.0
    cancel_rate = round(cancelled / total * 100, 1) if total > 0 else 0.0

    # Average budget
    avg_budget = _safe_float(execute_query(
        "SELECT AVG(budget_max) FROM projects "
        "WHERE budget_max IS NOT NULL AND budget_max > 0 AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))
    avg_budget_min = _safe_float(execute_query(
        "SELECT AVG(budget_min) FROM projects "
        "WHERE budget_min IS NOT NULL AND budget_min > 0 AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Projects by category
    cat_result = execute_query(
        "SELECT category, COUNT(*) as count, AVG(budget_max) as avg_budget "
        "FROM projects WHERE created_at >= ? AND created_at <= ? "
        "GROUP BY category ORDER BY count DESC LIMIT 15",
        [start, end],
    )
    by_category = parse_rows(cat_result) or []
    for row in by_category:
        row["avg_budget"] = round(float(row.get("avg_budget", 0) or 0), 2)
        row["count"] = int(row.get("count", 0) or 0)

    # Projects by budget type
    budget_type_result = execute_query(
        "SELECT budget_type, COUNT(*) as count "
        "FROM projects WHERE created_at >= ? AND created_at <= ? "
        "GROUP BY budget_type ORDER BY count DESC",
        [start, end],
    )
    by_budget_type = parse_rows(budget_type_result) or []

    # Completion time-series
    completion_ts_result = execute_query(
        "SELECT DATE(created_at) as date, "
        "COUNT(*) as total, "
        "SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed "
        "FROM projects WHERE created_at >= ? AND created_at <= ? "
        "GROUP BY DATE(created_at) ORDER BY 1",
        [start, end],
    )
    time_series = parse_rows(completion_ts_result) or []
    for row in time_series:
        t = int(row.get("total", 0) or 0)
        c = int(row.get("completed", 0) or 0)
        row["completion_rate"] = round(c / t * 100, 1) if t > 0 else 0.0

    return {
        "date_range": {"start": start, "end": end},
        "summary": {
            "total_projects": total,
            "completed": completed,
            "open": open_projects,
            "cancelled": cancelled,
            "completion_rate": completion_rate,
            "cancel_rate": cancel_rate,
        },
        "budgets": {
            "avg_budget_max": round(avg_budget, 2),
            "avg_budget_min": round(avg_budget_min, 2),
        },
        "by_category": by_category,
        "by_budget_type": by_budget_type,
        "time_series": time_series,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 5. GET /analytics-pro/freelancer-performance — Top freelancers by earnings
# ===========================================================================

@router.get("/analytics-pro/freelancer-performance")
async def get_freelancer_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=365))
    end = end_date or _iso(now)

    # Top freelancers by earnings (from payments via contracts)
    top_earners_result = execute_query(
        "SELECT c.freelancer_id, u.name, u.email, "
        "SUM(p.amount) as total_earned, COUNT(p.id) as payment_count, "
        "AVG(p.amount) as avg_payment "
        "FROM payments p "
        "JOIN contracts c ON p.contract_id = c.id "
        "JOIN users u ON c.freelancer_id = u.id "
        "WHERE p.status = 'completed' AND p.created_at >= ? AND p.created_at <= ? "
        "GROUP BY c.freelancer_id ORDER BY total_earned DESC LIMIT ?",
        [start, end, limit],
    )
    top_earners = parse_rows(top_earners_result) or []
    for row in top_earners:
        row["total_earned"] = round(float(row.get("total_earned", 0) or 0), 2)
        row["payment_count"] = int(row.get("payment_count", 0) or 0)
        row["avg_payment"] = round(float(row.get("avg_payment", 0) or 0), 2)

    # Top freelancers by average rating
    top_rated_result = execute_query(
        "SELECT reviewer_id as freelancer_id, u.name, "
        "AVG(r.rating) as avg_rating, COUNT(r.id) as review_count "
        "FROM reviews r "
        "JOIN users u ON r.reviewer_id = u.id "
        "WHERE r.created_at >= ? AND r.created_at <= ? "
        "GROUP BY reviewer_id HAVING COUNT(r.id) >= 2 "
        "ORDER BY avg_rating DESC LIMIT ?",
        [start, end, limit],
    )
    top_rated = parse_rows(top_rated_result) or []
    for row in top_rated:
        row["avg_rating"] = round(float(row.get("avg_rating", 0) or 0), 2)
        row["review_count"] = int(row.get("review_count", 0) or 0)

    # Top freelancers by project count
    top_active_result = execute_query(
        "SELECT c.freelancer_id, u.name, "
        "COUNT(DISTINCT c.project_id) as projects_completed, "
        "SUM(c.amount) as total_earned "
        "FROM contracts c "
        "JOIN users u ON c.freelancer_id = u.id "
        "WHERE c.status = 'completed' AND c.created_at >= ? AND c.created_at <= ? "
        "GROUP BY c.freelancer_id ORDER BY projects_completed DESC LIMIT ?",
        [start, end, limit],
    )
    top_active = parse_rows(top_active_result) or []
    for row in top_active:
        row["projects_completed"] = int(row.get("projects_completed", 0) or 0)
        row["total_earned"] = round(float(row.get("total_earned", 0) or 0), 2)

    # Earnings distribution
    distribution_result = execute_query(
        "SELECT "
        "SUM(CASE WHEN earned < 1000 THEN 1 ELSE 0 END) as under_1k, "
        "SUM(CASE WHEN earned >= 1000 AND earned < 5000 THEN 1 ELSE 0 END) as k1_to_5k, "
        "SUM(CASE WHEN earned >= 5000 AND earned < 20000 THEN 1 ELSE 0 END) as k5_to_20k, "
        "SUM(CASE WHEN earned >= 20000 AND earned < 50000 THEN 1 ELSE 0 END) as k20_to_50k, "
        "SUM(CASE WHEN earned >= 50000 THEN 1 ELSE 0 END) as over_50k FROM ("
        "SELECT c.freelancer_id, SUM(p.amount) as earned "
        "FROM payments p JOIN contracts c ON p.contract_id = c.id "
        "WHERE p.status = 'completed' GROUP BY c.freelancer_id"
        ")",
        [],
    )
    dist_rows = parse_rows(distribution_result) or []
    distribution = dist_rows[0] if dist_rows else {}

    return {
        "date_range": {"start": start, "end": end},
        "top_earners": top_earners,
        "top_rated": top_rated,
        "top_active": top_active,
        "earnings_distribution": distribution,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 6. GET /analytics-pro/market-trends — Market trend analysis
# ===========================================================================

@router.get("/analytics-pro/market-trends")
async def get_market_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=180))
    end = end_date or _iso(now)

    # Popular skills demand
    skills_result = execute_query(
        "SELECT skills, COUNT(*) as count FROM users "
        "WHERE skills IS NOT NULL AND skills != '' "
        "GROUP BY skills ORDER BY count DESC LIMIT 20",
        [],
    )
    popular_skills = parse_rows(skills_result) or []

    # Trending categories
    categories_result = execute_query(
        "SELECT category, COUNT(*) as project_count, AVG(budget_max) as avg_budget "
        "FROM projects WHERE created_at >= ? AND created_at <= ? AND category IS NOT NULL "
        "GROUP BY category ORDER BY project_count DESC LIMIT 15",
        [start, end],
    )
    trending_categories = parse_rows(categories_result) or []
    for row in trending_categories:
        row["avg_budget"] = round(float(row.get("avg_budget", 0) or 0), 2)
        row["project_count"] = int(row.get("project_count", 0) or 0)

    # Average hourly rate trends (by experience level)
    rate_result = execute_query(
        "SELECT experience_level, AVG(hourly_rate) as avg_rate, COUNT(*) as count "
        "FROM users WHERE hourly_rate > 0 AND experience_level IS NOT NULL "
        "GROUP BY experience_level ORDER BY avg_rate DESC",
        [],
    )
    rate_by_experience = parse_rows(rate_result) or []
    for row in rate_by_experience:
        row["avg_rate"] = round(float(row.get("avg_rate", 0) or 0), 2)
        row["count"] = int(row.get("count", 0) or 0)

    # Proposal activity trends
    proposal_trend_result = execute_query(
        "SELECT DATE(created_at) as date, COUNT(*) as proposals_sent "
        "FROM proposals WHERE created_at >= ? AND created_at <= ? "
        "GROUP BY DATE(created_at) ORDER BY 1",
        [start, end],
    )
    proposal_trend = parse_rows(proposal_trend_result) or []

    # Budget distribution across projects
    budget_dist_result = execute_query(
        "SELECT "
        "SUM(CASE WHEN budget_max <= 500 THEN 1 ELSE 0 END) as micro, "
        "SUM(CASE WHEN budget_max > 500 AND budget_max <= 2000 THEN 1 ELSE 0 END) as small, "
        "SUM(CASE WHEN budget_max > 2000 AND budget_max <= 10000 THEN 1 ELSE 0 END) as medium, "
        "SUM(CASE WHEN budget_max > 10000 AND budget_max <= 50000 THEN 1 ELSE 0 END) as large, "
        "SUM(CASE WHEN budget_max > 50000 THEN 1 ELSE 0 END) as enterprise "
        "FROM projects WHERE budget_max IS NOT NULL AND created_at >= ? AND created_at <= ?",
        [start, end],
    )
    budget_dist_rows = parse_rows(budget_dist_result) or []
    budget_distribution = budget_dist_rows[0] if budget_dist_rows else {}

    return {
        "date_range": {"start": start, "end": end},
        "popular_skills": popular_skills,
        "trending_categories": trending_categories,
        "rate_by_experience": rate_by_experience,
        "proposal_trend": proposal_trend,
        "budget_distribution": budget_distribution,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 7. POST /analytics-pro/forecast — Revenue/user growth forecast
# ===========================================================================

class ForecastRequest(BaseModel):
    forecast_type: str = "revenue"
    days_ahead: int = 30
    method: str = "linear"


@router.post("/analytics-pro/forecast")
async def get_forecast(
    request: ForecastRequest,
    current_user=Depends(require_admin),
):
    if request.forecast_type not in ("revenue", "users"):
        raise HTTPException(status_code=400, detail="forecast_type must be 'revenue' or 'users'")
    if request.days_ahead < 1 or request.days_ahead > 365:
        raise HTTPException(status_code=400, detail="days_ahead must be between 1 and 365")

    now = _now_utc()

    if request.forecast_type == "revenue":
        # Fetch historical daily revenue
        result = execute_query(
            "SELECT DATE(created_at) as date, SUM(amount) as revenue "
            "FROM payments WHERE status = 'completed' "
            "AND created_at >= ? GROUP BY DATE(created_at) ORDER BY 1",
            [_iso(now - timedelta(days=180))],
        )
        data = parse_rows(result) or []
        values = [float(row.get("revenue", 0) or 0) for row in data]
        labels = [row.get("date", "") for row in data]
    else:
        result = execute_query(
            "SELECT DATE(created_at) as date, COUNT(*) as count FROM users "
            "WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY 1",
            [_iso(now - timedelta(days=180))],
        )
        data = parse_rows(result) or []
        values = [float(row.get("count", 0) or 0) for row in data]
        labels = [row.get("date", "") for row in data]

    # Simple linear regression forecast
    n = len(values)
    if n >= 2:
        x_vals = list(range(n))
        x_mean = sum(x_vals) / n
        y_mean = sum(values) / n

        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, values))
        denominator = sum((x - x_mean) ** 2 for x in x_vals)

        if denominator != 0:
            slope = numerator / denominator
        else:
            slope = 0
        intercept = y_mean - slope * x_mean

        # Generate forecast points
        forecast = []
        for i in range(1, request.days_ahead + 1):
            predicted = slope * (n + i - 1) + intercept
            predicted = max(0, predicted)
            forecast_date = now + timedelta(days=i)
            forecast.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "predicted_value": round(predicted, 2),
            })

        # Confidence interval (simplified)
        residuals = [abs(v - (slope * i + intercept)) for i, v in enumerate(values)]
        avg_residual = sum(residuals) / len(residuals) if residuals else 0
        confidence_margin = round(avg_residual * 1.96, 2)

        trend = "upward" if slope > 0.01 else ("downward" if slope < -0.01 else "stable")
    else:
        forecast = []
        confidence_margin = 0
        trend = "insufficient_data"

    return {
        "forecast_type": request.forecast_type,
        "days_ahead": request.days_ahead,
        "method": "linear_regression",
        "forecast": forecast,
        "confidence_margin": confidence_margin,
        "trend": trend,
        "historical_data_points": n,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 8. GET /analytics-pro/cohort — Cohort analysis data
# ===========================================================================

@router.get("/analytics-pro/cohort")
async def get_cohort_analysis(
    cohort_type: str = Query("monthly", regex="^(weekly|monthly)$"),
    months_back: int = Query(12, ge=1, le=24),
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start_date = _iso(now - timedelta(days=months_back * 31))

    if cohort_type == "monthly":
        # Group users by registration month
        cohort_result = execute_query(
            "SELECT strftime('%Y-%m', created_at) as cohort_month, COUNT(*) as user_count "
            "FROM users WHERE created_at >= ? "
            "GROUP BY strftime('%Y-%m', created_at) ORDER BY cohort_month",
            [start_date],
        )
        cohorts = parse_rows(cohort_result) or []

        # For each cohort, calculate activity in subsequent months
        for cohort in cohorts:
            cohort_month = cohort.get("cohort_month", "")
            user_count = int(cohort.get("user_count", 0) or 0)

            if not cohort_month:
                continue

            # Calculate retention: how many users from this cohort are active
            retention = []
            for m in range(0, min(months_back, 13)):
                try:
                    cohort_dt = datetime.strptime(cohort_month, "%Y-%m").replace(tzinfo=timezone.utc)
                except ValueError:
                    continue
                period_start = _iso(cohort_dt + timedelta(days=m * 30))
                period_end = _iso(cohort_dt + timedelta(days=(m + 1) * 30))

                active_count = _safe_count(execute_query(
                    "SELECT COUNT(DISTINCT user_id) FROM analytics_events "
                    "WHERE created_at >= ? AND created_at < ?",
                    [period_start, period_end]
                ))
                # If analytics_events is sparse, fall back to payment activity
                if active_count == 0:
                    active_count = _safe_count(execute_query(
                        "SELECT COUNT(DISTINCT from_user_id) FROM payments "
                        "WHERE created_at >= ? AND created_at < ?",
                        [period_start, period_end]
                    ))

                retention.append({
                    "month_offset": m,
                    "active_users": active_count,
                    "retention_pct": round(active_count / user_count * 100, 1) if user_count > 0 else 0,
                })

            cohort["retention"] = retention

    else:  # weekly
        cohort_result = execute_query(
            "SELECT strftime('%Y-W%W', created_at) as cohort_week, COUNT(*) as user_count "
            "FROM users WHERE created_at >= ? "
            "GROUP BY strftime('%Y-W%W', created_at) ORDER BY cohort_week",
            [start_date],
        )
        cohorts = parse_rows(cohort_result) or []
        for cohort in cohorts:
            cohort["retention"] = []

    return {
        "cohort_type": cohort_type,
        "months_back": months_back,
        "cohorts": cohorts,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 9. GET /analytics-pro/funnel — Conversion funnel data
# ===========================================================================

@router.get("/analytics-pro/funnel")
async def get_conversion_funnel(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(require_admin),
):
    now = _now_utc()
    start = start_date or _iso(now - timedelta(days=90))
    end = end_date or _iso(now)

    # Step 1: Registered users
    registered = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Step 2: Users with completed profiles (bio or skills set)
    with_profile = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ? AND created_at <= ? "
        "AND (bio IS NOT NULL AND bio != '') OR (skills IS NOT NULL AND skills != '')",
        [start, end]
    ))

    # Step 3: Users who posted a project (clients)
    posted_project = _safe_count(execute_query(
        "SELECT COUNT(DISTINCT client_id) FROM projects "
        "WHERE created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Step 4: Users who sent a proposal (freelancers)
    sent_proposal = _safe_count(execute_query(
        "SELECT COUNT(DISTINCT freelancer_id) FROM proposals "
        "WHERE created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Step 5: Proposals that got accepted -> contract created
    contracted = _safe_count(execute_query(
        "SELECT COUNT(*) FROM contracts WHERE created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Step 6: Contracts completed
    completed = _safe_count(execute_query(
        "SELECT COUNT(*) FROM contracts WHERE status = 'completed' "
        "AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Step 7: Payment processed
    paid = _safe_count(execute_query(
        "SELECT COUNT(*) FROM payments WHERE status = 'completed' "
        "AND created_at >= ? AND created_at <= ?",
        [start, end]
    ))

    # Calculate conversion rates between steps
    stages = [
        {"stage": "registered", "count": registered},
        {"stage": "completed_profile", "count": with_profile},
        {"stage": "posted_project", "count": posted_project},
        {"stage": "sent_proposal", "count": sent_proposal},
        {"stage": "contracted", "count": contracted},
        {"stage": "completed", "count": completed},
        {"stage": "paid", "count": paid},
    ]

    for i, stage in enumerate(stages):
        if i == 0:
            stage["conversion_from_prev"] = 100.0
            stage["conversion_from_top"] = 100.0
        else:
            prev = stages[i - 1]["count"]
            top = stages[0]["count"]
            stage["conversion_from_prev"] = round(stage["count"] / prev * 100, 1) if prev > 0 else 0
            stage["conversion_from_top"] = round(stage["count"] / top * 100, 1) if top > 0 else 0

    return {
        "date_range": {"start": start, "end": end},
        "stages": stages,
        "overall_conversion": round(paid / registered * 100, 1) if registered > 0 else 0,
        "generated_at": _iso(now),
    }


# ===========================================================================
# 10. GET /analytics-pro/realtime — Real-time platform metrics
# ===========================================================================

@router.get("/analytics-pro/realtime")
async def get_realtime_metrics(current_user=Depends(require_admin)):
    now = _now_utc()
    one_hour_ago = _iso(now - timedelta(hours=1))
    one_day_ago = _iso(now - timedelta(days=1))
    five_min_ago = _iso(now - timedelta(minutes=5))

    # Activity in the last 5 minutes
    recent_events = _safe_count(execute_query(
        "SELECT COUNT(*) FROM analytics_events WHERE created_at >= ?",
        [five_min_ago]
    ))
    recent_users_active = _safe_count(execute_query(
        "SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= ?",
        [five_min_ago]
    ))

    # Activity in the last hour
    hourly_events = _safe_count(execute_query(
        "SELECT COUNT(*) FROM analytics_events WHERE created_at >= ?",
        [one_hour_ago]
    ))
    hourly_new_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ?",
        [one_hour_ago]
    ))
    hourly_proposals = _safe_count(execute_query(
        "SELECT COUNT(*) FROM proposals WHERE created_at >= ?",
        [one_hour_ago]
    ))
    hourly_payments = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [one_hour_ago]
    ))

    # Activity in the last 24 hours
    daily_new_users = _safe_count(execute_query(
        "SELECT COUNT(*) FROM users WHERE created_at >= ?",
        [one_day_ago]
    ))
    daily_new_projects = _safe_count(execute_query(
        "SELECT COUNT(*) FROM projects WHERE created_at >= ?",
        [one_day_ago]
    ))
    daily_proposals = _safe_count(execute_query(
        "SELECT COUNT(*) FROM proposals WHERE created_at >= ?",
        [one_day_ago]
    ))
    daily_payments = _safe_float(execute_query(
        "SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= ?",
        [one_day_ago]
    ))
    daily_contracts = _safe_count(execute_query(
        "SELECT COUNT(*) FROM contracts WHERE created_at >= ?",
        [one_day_ago]
    ))

    # System health
    try:
        db_check = execute_query("SELECT 1 as ok", [])
        db_healthy = bool(db_check and db_check.get("rows"))
    except Exception:
        db_healthy = False

    failed_payments_24h = _safe_count(execute_query(
        "SELECT COUNT(*) FROM payments WHERE status = 'failed' AND created_at >= ?",
        [one_day_ago]
    ))

    # Active online users (approximate: users with events in last 5 min)
    online_users = recent_users_active

    return {
        "realtime": {
            "online_users": online_users,
            "events_last_5min": recent_events,
            "events_last_hour": hourly_events,
        },
        "last_hour": {
            "new_users": hourly_new_users,
            "proposals": hourly_proposals,
            "payments_total": round(hourly_payments, 2),
        },
        "last_24h": {
            "new_users": daily_new_users,
            "new_projects": daily_new_projects,
            "proposals": daily_proposals,
            "payments_total": round(daily_payments, 2),
            "contracts": daily_contracts,
            "failed_payments": failed_payments_24h,
        },
        "system": {
            "database_healthy": db_healthy,
        },
        "timestamp": _iso(now),
    }
