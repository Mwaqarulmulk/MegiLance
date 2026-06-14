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
async def get_dashboard(current_user=Depends(get_current_user)):
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
            "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE freelancer_id = ? AND status = 'completed'",
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
async def client_dashboard_stats(current_user=Depends(get_current_user)):
    projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ?", [current_user.id])
    active_projects = execute_query("SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = 'open'", [current_user.id])
    proposals = execute_query(
        "SELECT COUNT(*) as count FROM proposals pr JOIN projects p ON pr.project_id = p.id WHERE p.client_id = ?",
        [current_user.id],
    )
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE client_id = ? AND status = 'active'", [current_user.id])
    spending = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ? AND p.status = 'completed'",
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
async def client_proposals(
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
async def client_monthly_spending(months: int = Query(6, ge=1, le=24), current_user=Depends(get_current_user)):
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
async def client_wallet(current_user=Depends(get_current_user)):
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
async def freelancer_dashboard_stats(current_user=Depends(get_current_user)):
    proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ?", [current_user.id])
    active_proposals = execute_query("SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ? AND status = 'submitted'", [current_user.id])
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts WHERE freelancer_id = ? AND status = 'active'", [current_user.id])
    earnings = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    pending_earnings = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'pending'",
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
async def freelancer_jobs(
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
async def freelancer_proposals(
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
async def submit_proposal(data: dict, current_user=Depends(get_current_user)):
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
    proj_status = proj_result["rows"][0][1]
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
async def freelancer_portfolio(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, title, description, image_url, project_url, category, skills, created_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/freelancer/skills")
async def freelancer_skills(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, level, category FROM user_skills WHERE user_id = ? ORDER BY level DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/freelancer/earnings")
async def freelancer_earnings(current_user=Depends(get_current_user)):
    total = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed'",
        [current_user.id],
    )
    pending = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'pending'",
        [current_user.id],
    )
    this_month = execute_query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? AND p.status = 'completed' AND p.created_at >= date('now', 'start of month')",
        [current_user.id],
    )
    return {
        "total_earnings": parse_rows(total)[0]["total"] if parse_rows(total) else 0,
        "pending_earnings": parse_rows(pending)[0]["total"] if parse_rows(pending) else 0,
        "this_month_earnings": parse_rows(this_month)[0]["total"] if parse_rows(this_month) else 0,
    }


@router.get("/freelancer/earnings/monthly")
async def freelancer_monthly_earnings(months: int = Query(6, ge=1, le=24), current_user=Depends(get_current_user)):
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


@router.get("/freelancer/wallet")
async def freelancer_wallet(current_user=Depends(get_current_user)):
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
async def freelancer_withdraw(data: dict, current_user=Depends(get_current_user)):
    amount = data.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if amount > 50000:
        raise HTTPException(status_code=400, detail="Maximum single withdrawal is $50,000")

    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    current_balance = rows[0]["account_balance"] if rows else 0

    if amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    now = datetime.now(timezone.utc).isoformat()

    # Create pending withdrawal transaction (balance deducted immediately for withdrawals)
    execute_query("UPDATE users SET account_balance = account_balance - ? WHERE id = ?", [amount, current_user.id])
    execute_query(
        "INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at) VALUES (?, 'withdrawal', ?, ?, 'pending', ?)",
        [current_user.id, amount, f"Withdrawal of ${amount}", now],
    )

    return {"message": "Withdrawal processed", "amount": amount, "status": "pending"}
