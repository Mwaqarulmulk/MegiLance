# @AI-HINT: Wallet router — balance, transactions, deposit, withdraw
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date

router = APIRouter()


class DepositRequest(BaseModel):
    amount: float
    method: str = "stripe"

class WithdrawRequest(BaseModel):
    amount: float
    method: str = "bank_transfer"


@router.get("/")
async def get_wallet(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT account_balance FROM users WHERE id = ?",
        [current_user.id],
    )
    rows = parse_rows(result)
    balance = rows[0]["account_balance"] if rows else 0.0

    transactions_result = execute_query(
        """SELECT id, user_id, type, amount, description, status, created_at
           FROM wallet_transactions
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 50""",
        [current_user.id],
    )
    transactions = parse_rows(transactions_result) or []

    return {
        "user_id": current_user.id,
        "balance": balance,
        "currency": "USD",
        "transactions": transactions,
    }


@router.get("/transactions")
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT id, user_id, type, amount, description, status, created_at
           FROM wallet_transactions
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?""",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/deposit")
async def deposit(request: DepositRequest, current_user=Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
        [request.amount, current_user.id],
    )
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at)
           VALUES (?, 'deposit', ?, ?, 'completed', ?)""",
        [current_user.id, request.amount, f"Deposit via {request.method}", now],
    )

    result = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    return {"message": "Deposit successful", "balance": rows[0]["account_balance"] if rows else 0}


@router.post("/withdraw")
async def withdraw(request: WithdrawRequest, current_user=Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    result = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    balance = rows[0]["account_balance"] if rows else 0

    if balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET account_balance = account_balance - ? WHERE id = ?",
        [request.amount, current_user.id],
    )
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at)
           VALUES (?, 'withdrawal', ?, ?, 'pending', ?)""",
        [current_user.id, request.amount, f"Withdrawal via {request.method}", now],
    )

    result = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    return {"message": "Withdrawal initiated", "balance": rows[0]["account_balance"] if rows else 0}
