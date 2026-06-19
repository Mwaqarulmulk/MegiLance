# @AI-HINT: Portal endpoints router — dashboard data for client/freelancer/admin portals
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(current_user=Depends(get_current_user)):
    user_type = current_user.user_type.lower() if current_user.user_type else "client"

    if user_type == "client":
        projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ?", [current_user.id])
        proposals = execute_query(
            "SELECT COUNT(*) as count FROM proposals pr JOIN projects p ON pr.project_id = p.id WHERE p.client_id = ?",
            [current_user.id],
        )
        contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE client_id = ?", [current_user.id])
        return {
            "portal": "client",
            "total_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
            "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
            "active_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
            "account_balance": current_user.account_balance if hasattr(current_user, "account_balance") else 0,
        }
    elif user_type == "freelancer":
        proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ?", [current_user.id])
        contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE freelancer_id = ?", [current_user.id])
        earnings = execute_query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE to_user_id = ? AND status = 'completed'",
            [current_user.id],
        )
        return {
            "portal": "freelancer",
            "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
            "active_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
            "total_earnings": parse_rows(earnings)[0]["total"] if parse_rows(earnings) else 0,
            "seller_level": current_user.seller_level if hasattr(current_user, "seller_level") else "new_seller",
        }
    else:
        users = execute_query("SELECT COUNT(*) as count FROM users", [])
        projects = execute_query("SELECT COUNT(*) as count FROM projects", [])
        return {
            "portal": "admin",
            "total_users": parse_rows(users)[0]["count"] if parse_rows(users) else 0,
            "total_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
        }


@router.get("/client/dashboard/stats")
def client_dashboard_stats(current_user=Depends(get_current_user)):
    projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ?", [current_user.id])
    active_projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = 'open'", [current_user.id])
    proposals = execute_query(
        "SELECT COUNT(*) as count FROM proposals pr JOIN projects p ON pr.project_id = p.id WHERE p.client_id = ?",
        [current_user.id],
    )
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE client_id = ? AND status = 'active'", [current_user.id])
    spending = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    return {
        "total_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
        "active_projects": parse_rows(active_projects)[0]["count"] if parse_rows(active_projects) else 0,
        "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
        "active_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
        "total_spending": parse_rows(spending)[0]["total"] if parse_rows(spending) else 0,
        "account_balance": rows[0]["account_balance"] if rows else 0,
    }


@router.get("/client/proposals")
def client_proposals(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    where = "WHERE p.client_id = ?"
    params = [current_user.id]

    if status_filter:
        where += " AND pr.status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT pr.id, pr.project_id, pr.freelancer_id, pr.cover_letter, pr.bid_amount, pr.delivery_time, pr.status, pr.created_at,
                   u.name as freelancer_name, u.profile_image_url, p.title as project_title
            FROM proposals pr
            JOIN projects p ON pr.project_id = p.id
            LEFT JOIN users u ON pr.freelancer_id = u.id
            {where}
            ORDER BY pr.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/client/spending/monthly")
def client_monthly_spending(months: int = Query(6, ge=1, le=24), current_user=Depends(get_current_user)):
    spending = []
    for i in range(months - 1, -1, -1):
        month_start = (datetime.now(timezone.utc) - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = month_start + timedelta(days=32)
        month_end = month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        result = execute_query(
            """SELECT COALESCE(SUM(p.amount), 0) as total
               FROM payments p
               JOIN contracts c ON p.contract_id = c.id
               WHERE c.client_id = ? AND p.status = 'completed' AND p.created_at >= ? AND p.created_at < ?""",
            [current_user.id, month_start.isoformat(), month_end.isoformat()],
        )
        rows = parse_rows(result)
        total = rows[0]["total"] if rows else 0
        spending.append({"name": month_start.strftime("%b %Y"), "spending": total})

    return {"spending": spending}


@router.get("/client/wallet")
def client_wallet(current_user=Depends(get_current_user)):
    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    balance_val = rows[0]["account_balance"] if rows else 0

    transactions = execute_query(
        "SELECT id, type, amount, description, created_at FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [current_user.id],
    )
    tx_rows = parse_rows(transactions)

    return {
        "balance": balance_val,
        "currency": "USD",
        "recent_transactions": tx_rows if tx_rows else [],
    }


@router.get("/freelancer/dashboard/stats")
def freelancer_dashboard_stats(current_user=Depends(get_current_user)):
    proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ?", [current_user.id])
    active_proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ? AND status = 'submitted'", [current_user.id])
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE freelancer_id = ? AND status = 'active'", [current_user.id])
    earnings = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    pending_earnings = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'pending'",
        [current_user.id],
    )
    return {
        "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
        "active_proposals": parse_rows(active_proposals)[0]["count"] if parse_rows(active_proposals) else 0,
        "active_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
        "total_earnings": parse_rows(earnings)[0]["total"] if parse_rows(earnings) else 0,
        "pending_earnings": parse_rows(pending_earnings)[0]["total"] if parse_rows(pending_earnings) else 0,
        "seller_level": current_user.seller_level if hasattr(current_user, "seller_level") else "new_seller",
    }


@router.get("/freelancer/jobs")
def freelancer_jobs(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    where = "WHERE status = 'open'"
    params: list = []

    if category:
        where += " AND category = ?"
        params.append(category)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT id, title, description, category, budget_type, budget_min, budget_max, status, created_at FROM projects {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/freelancer/proposals")
def freelancer_proposals(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    where = "WHERE freelancer_id = ?"
    params = [current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT pr.id, pr.project_id, pr.bid_amount, pr.delivery_time, pr.status, pr.created_at,
                   p.title as project_title, p.category
            FROM proposals pr
            JOIN projects p ON pr.project_id = p.id
            {where}
            ORDER BY pr.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/freelancer/proposals")
def submit_proposal(data: dict, current_user=Depends(get_current_user)):
    project_id = data.get("project_id")
    cover_letter = data.get("cover_letter", "")
    bid_amount = data.get("bid_amount", 0)
    estimated_hours = data.get("estimated_hours") or data.get("delivery_time", 0)
    hourly_rate = data.get("hourly_rate", 0)
    availability = data.get("availability", "")
    attachments = data.get("attachments", "")

    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")
    if not cover_letter.strip():
        raise HTTPException(status_code=400, detail="cover_letter is required")

    # Validate project exists and is open
    proj_result = execute_query("SELECT id, status FROM projects WHERE id = ?", [project_id])
    if not proj_result or not proj_result.get("rows"):
        raise HTTPException(status_code=404, detail="Project not found")
    proj_rows = parse_rows(proj_result)
    proj_status = proj_rows[0].get("status") if proj_rows else None
    if proj_status != "open":
        raise HTTPException(status_code=400, detail="Project is not accepting proposals")

    # Check for duplicate proposal
    dup_result = execute_query(
        "SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ? AND is_draft = 0",
        [project_id, current_user.id],
    )
    if dup_result and dup_result.get("rows"):
        raise HTTPException(status_code=409, detail="You already submitted a proposal for this project")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO proposals (freelancer_id, project_id, cover_letter, bid_amount,
           estimated_hours, hourly_rate, availability, attachments, status, is_draft, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 0, ?, ?)""",
        [current_user.id, project_id, cover_letter, bid_amount, estimated_hours, hourly_rate, availability, attachments, now, now],
    )
    return {"message": "Proposal submitted", "proposal_id": result.get("last_insert_rowid")}


@router.get("/freelancer/portfolio")
def freelancer_portfolio(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, title, description, image_url, project_url, category, skills, created_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/freelancer/skills")
def freelancer_skills(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, level, category FROM user_skills WHERE user_id = ? ORDER BY level DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/freelancer/seller-stats")
def freelancer_seller_stats(current_user=Depends(get_current_user)):
    user_result = execute_query(
        "SELECT seller_level, hourly_rate, experience_level FROM users WHERE id = ?",
        [current_user.id],
    )
    user_rows = parse_rows(user_result)
    user_data = user_rows[0] if user_rows else {}

    completed_result = execute_query(
        "SELECT COUNT(*) as count FROM contracts WHERE freelancer_id = ? AND status = 'completed'",
        [current_user.id],
    )
    completed = (parse_rows(completed_result) or [{"count": 0}])[0]["count"]

    earnings_result = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    total_earnings = (parse_rows(earnings_result) or [{"total": 0}])[0]["total"]

    reviews_result = execute_query(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE reviewed_user_id = ?",
        [current_user.id],
    )
    rev_rows = parse_rows(reviews_result) or [{"avg_rating": None, "count": 0}]
    avg_rating = rev_rows[0]["avg_rating"] or 0
    review_count = rev_rows[0]["count"] or 0
    jss_score = min(100, int(avg_rating * 20)) if avg_rating else 0

    seller_level = user_data.get("seller_level") or "new_seller"
    badges = []
    if completed >= 1:
        badges.append("first_order")
    if completed >= 10:
        badges.append("rising_talent")
    if completed >= 50 or jss_score >= 90:
        badges.append("top_rated")

    return {
        "seller_level": seller_level,
        "jss_score": jss_score,
        "total_earnings": float(total_earnings),
        "total_jobs_done": completed,
        "avg_rating": round(float(avg_rating), 2),
        "review_count": review_count,
        "badges": badges,
        "hourly_rate": user_data.get("hourly_rate"),
        "experience_level": user_data.get("experience_level"),
    }


@router.get("/freelancer/earnings")
def freelancer_earnings(current_user=Depends(get_current_user)):
    total = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    pending = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'pending'",
        [current_user.id],
    )
    this_month = execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed' AND p.created_at >= date('now', 'start of month')",
        [current_user.id],
    )
    return {
        "total_earnings": parse_rows(total)[0]["total"] if parse_rows(total) else 0,
        "pending_earnings": parse_rows(pending)[0]["total"] if parse_rows(pending) else 0,
        "this_month_earnings": parse_rows(this_month)[0]["total"] if parse_rows(this_month) else 0,
    }


@router.get("/freelancer/earnings/monthly")
def freelancer_monthly_earnings(months: int = Query(6, ge=1, le=24), current_user=Depends(get_current_user)):
    earnings = []
    for i in range(months - 1, -1, -1):
        month_start = (datetime.now(timezone.utc) - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = month_start + timedelta(days=32)
        month_end = month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        result = execute_query(
            """SELECT COALESCE(SUM(p.amount), 0) as total
               FROM payments p
               JOIN contracts c ON p.contract_id = c.id
               WHERE c.freelancer_id = ? AND p.status = 'completed' AND p.created_at >= ? AND p.created_at < ?""",
            [current_user.id, month_start.isoformat(), month_end.isoformat()],
        )
        rows = parse_rows(result)
        total = rows[0]["total"] if rows else 0
        earnings.append({"month": month_start.strftime("%b %Y"), "amount": total})

    return {"earnings": earnings}


@router.get("/client/projects")
def client_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT id, title, description, category, status, budget_type, budget_min, budget_max,
                  created_at, updated_at
           FROM projects WHERE client_id = ?
           ORDER BY created_at DESC LIMIT ? OFFSET ?""",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    count_result = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ?", [current_user.id])
    count_rows = parse_rows(count_result)
    total = count_rows[0]["count"] if count_rows else 0
    return {"projects": rows if rows else [], "total": total, "page": page, "page_size": page_size}


@router.post("/client/projects")
def client_create_project(data: dict, current_user=Depends(get_current_user)):
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    budget_type = data.get("budget_type", "fixed")
    budget_min = data.get("budget_min", 0)
    budget_max = data.get("budget_max", 0)

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")

    experience_level = data.get("experience_level") or "intermediate"
    estimated_duration = data.get("estimated_duration") or "1-3 months"
    skills = data.get("skills") or ""
    if isinstance(skills, list):
        skills = ", ".join(str(s) for s in skills)

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO projects (client_id, title, description, category, status, budget_type,
           budget_min, budget_max, experience_level, estimated_duration, skills, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?)""",
        [current_user.id, title, description, category, budget_type, budget_min, budget_max,
         experience_level, estimated_duration, skills, now, now],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return {"message": "Project created", "project_id": result.get("last_insert_rowid")}


@router.get("/client/payments")
def client_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT p.id, p.amount, p.status, p.type, p.description, p.created_at as date,
                  pr.title as project, u.name as freelancer_name
           FROM payments p
           JOIN contracts c ON p.contract_id = c.id
           LEFT JOIN projects pr ON c.project_id = pr.id
           LEFT JOIN users u ON c.freelancer_id = u.id
           WHERE c.client_id = ?
           ORDER BY p.created_at DESC LIMIT ? OFFSET ?""",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    count_result = execute_query(
        "SELECT COUNT(*) as count FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ?",
        [current_user.id],
    )
    count_rows = parse_rows(count_result)
    total = count_rows[0]["count"] if count_rows else 0
    return {"payments": rows if rows else [], "total": total, "page": page}


@router.get("/freelancer/projects")
def freelancer_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    where = "WHERE c.freelancer_id = ?"
    params: list = [current_user.id]

    if status_filter:
        where += " AND c.status = ?"
        params.append(status_filter)

    result = execute_query(
        f"""SELECT c.id, c.project_id, c.amount as total_amount, c.contract_type, c.status,
                   c.start_date, c.end_date, c.description, c.created_at, c.updated_at,
                   p.title as project_title, p.category,
                   u.name as client_name
            FROM contracts c
            LEFT JOIN projects p ON c.project_id = p.id
            LEFT JOIN users u ON c.client_id = u.id
            {where}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?""",
        params + [page_size, offset],
    )
    rows = parse_rows(result)
    count_result = execute_query(
        f"SELECT COUNT(*) as count FROM contracts c {where}",
        params,
    )
    count_rows = parse_rows(count_result)
    total = count_rows[0]["count"] if count_rows else 0
    return {"projects": rows if rows else [], "total": total, "page": page, "page_size": page_size}


@router.get("/freelancer/payments")
def freelancer_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT p.id, p.amount, p.status, p.payment_type, p.description, p.created_at as date,
                  p.payment_method, p.platform_fee, p.freelancer_amount,
                  pr.title as project, c.client_id,
                  u.name as client_name
           FROM payments p
           JOIN contracts c ON p.contract_id = c.id
           LEFT JOIN projects pr ON c.project_id = pr.id
           LEFT JOIN users u ON c.client_id = u.id
           WHERE c.freelancer_id = ?
           ORDER BY p.created_at DESC LIMIT ? OFFSET ?""",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    count_result = execute_query(
        "SELECT COUNT(*) as count FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ?",
        [current_user.id],
    )
    count_rows = parse_rows(count_result)
    total = count_rows[0]["count"] if count_rows else 0
    return {"payments": rows if rows else [], "total": total, "page": page}


@router.get("/freelancer/wallet")
def freelancer_wallet(current_user=Depends(get_current_user)):
    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    balance_val = rows[0]["account_balance"] if rows else 0

    transactions = execute_query(
        "SELECT id, type, amount, description, created_at FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [current_user.id],
    )
    tx_rows = parse_rows(transactions)

    return {
        "balance": balance_val,
        "currency": "USD",
        "recent_transactions": tx_rows if tx_rows else [],
    }


@router.post("/freelancer/withdraw")
def freelancer_withdraw(data: dict, current_user=Depends(get_current_user)):
    amount = data.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if amount > 50000:
        raise HTTPException(status_code=400, detail="Maximum single withdrawal is $50,000")

    # Atomic balance check and deduction (prevents TOCTOU race conditions)
    now = datetime.now(timezone.utc).isoformat()
    update_result = execute_query(
        "UPDATE users SET account_balance = account_balance - ? WHERE id = ? AND account_balance >= ?",
        [amount, current_user.id, amount],
    )

    # Check if the update actually affected a row (balance was sufficient)
    if not update_result or update_result.get("rows_affected", 0) == 0:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    execute_query(
        "INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at) VALUES (?, 'withdrawal', ?, ?, 'pending', ?)",
        [current_user.id, amount, f"Withdrawal of ${amount}", now],
    )

    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    return {"message": "Withdrawal processed", "amount": amount, "status": "pending", "balance": rows[0]["account_balance"] if rows else 0}
