# @AI-HINT: Portal endpoints router — dashboard data for client/freelancer/admin portals
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
import logging

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


@router.get("/client/projects")
async def client_projects(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1), current_user=Depends(get_current_user)):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT id, title, description, category, budget_type, budget_min, budget_max, status, created_at FROM projects WHERE client_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/client/payments")
async def client_payments(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1), current_user=Depends(get_current_user)):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT p.id, p.contract_id, p.amount, p.currency, p.status, p.created_at FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/freelancer/projects")
async def freelancer_projects(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1), current_user=Depends(get_current_user)):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT p.id, p.title, p.description, p.category, p.budget_type, p.budget_min, p.budget_max, p.status, p.created_at FROM projects p JOIN proposals pr ON pr.project_id = p.id WHERE pr.freelancer_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/freelancer/payments")
async def freelancer_payments(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1), current_user=Depends(get_current_user)):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT p.id, p.contract_id, p.amount, p.currency, p.status, p.created_at FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.freelancer_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}
