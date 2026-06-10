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
    """Initiate a deposit. Balance is only updated after payment gateway confirmation."""
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if request.amount > 10000:
        raise HTTPException(status_code=400, detail="Maximum single deposit is $10,000")

    now = datetime.now(timezone.utc).isoformat()

    # Create a pending payment (balance NOT modified yet)
    result = execute_query(
        """INSERT INTO payments (client_id, amount, currency, payment_method, status, description, created_at, updated_at)
           VALUES (?, ?, 'USD', ?, 'pending', ?, ?, ?)""",
        [current_user.id, request.amount, request.method, f"Deposit via {request.method}", now, now],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to initiate deposit")

    return {
        "message": "Deposit initiated — complete payment to add funds",
        "payment_id": result.get("last_insert_rowid"),
        "amount": request.amount,
        "status": "pending",
    }


@router.post("/withdraw")
async def withdraw(request: WithdrawRequest, current_user=Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if request.amount > 10000:
        raise HTTPException(status_code=400, detail="Maximum single withdrawal is $10,000")

    # Atomic balance check and deduction using a single UPDATE with WHERE clause
    # This prevents TOCTOU race conditions — the UPDATE only succeeds if balance >= amount
    now = datetime.now(timezone.utc).isoformat()
    update_result = execute_query(
        "UPDATE users SET account_balance = account_balance - ? WHERE id = ? AND account_balance >= ?",
        [request.amount, current_user.id, request.amount],
    )

    # Check if the update actually affected a row (balance was sufficient)
    if not update_result or update_result.get("rows_affected", 0) == 0:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at)
           VALUES (?, 'withdrawal', ?, ?, 'pending', ?)""",
        [current_user.id, request.amount, f"Withdrawal via {request.method}", now],
    )

    result = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    return {"message": "Withdrawal initiated", "balance": rows[0]["account_balance"] if rows else 0}
