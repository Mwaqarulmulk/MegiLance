# @AI-HINT: Pakistan payments router — USDC, JazzCash, EasyPaisa, AirTM, Wise, Payoneer (Stripe is NOT available in Pakistan)
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

PK_PAYMENT_METHODS = {
    "jazzcash": {
        "id": "jazzcash",
        "name": "JazzCash",
        "type": "mobile_wallet",
        "icon": "jazzcash",
        "description": "Pay with JazzCash mobile wallet",
        "min_amount": 100,
        "max_amount": 500000,
        "currency": "PKR",
        "fee_percent": 1.5,
    },
    "easypaisa": {
        "id": "easypaisa",
        "name": "EasyPaisa",
        "type": "mobile_wallet",
        "icon": "easypaisa",
        "description": "Pay with EasyPaisa mobile wallet",
        "min_amount": 100,
        "max_amount": 500000,
        "currency": "PKR",
        "fee_percent": 1.5,
    },
    "usdc_bep20": {
        "id": "usdc_bep20",
        "name": "USDC (BEP-20)",
        "type": "crypto",
        "icon": "usdc",
        "description": "Pay with USDC on Binance Smart Chain",
        "min_amount": 5,
        "max_amount": 100000,
        "currency": "USD",
        "fee_percent": 0.5,
    },
    "airtm": {
        "id": "airtm",
        "name": "AirTM",
        "type": "digital_wallet",
        "icon": "airtm",
        "description": "Pay with AirTM digital dollar wallet",
        "min_amount": 5,
        "max_amount": 50000,
        "currency": "USD",
        "fee_percent": 2.0,
    },
    "wise": {
        "id": "wise",
        "name": "Wise",
        "type": "bank_transfer",
        "icon": "wise",
        "description": "International bank transfer via Wise",
        "min_amount": 10,
        "max_amount": 100000,
        "currency": "USD",
        "fee_percent": 1.0,
    },
    "payoneer": {
        "id": "payoneer",
        "name": "Payoneer",
        "type": "digital_wallet",
        "icon": "payoneer",
        "description": "Pay with Payoneer account",
        "min_amount": 5,
        "max_amount": 50000,
        "currency": "USD",
        "fee_percent": 2.0,
    },
    "bank_transfer": {
        "id": "bank_transfer",
        "name": "Bank Transfer (PKR)",
        "type": "bank_transfer",
        "icon": "bank",
        "description": "Direct bank transfer to platform account",
        "min_amount": 1000,
        "max_amount": 5000000,
        "currency": "PKR",
        "fee_percent": 0,
    },
}


class PKPaymentCreate(BaseModel):
    amount: float
    method: str
    currency: str = "PKR"
    description: Optional[str] = None
    contract_id: Optional[int] = None


class USDCPaymentCreate(BaseModel):
    amount: float
    wallet_address: str
    network: str = "BEP-20"
    description: Optional[str] = None
    contract_id: Optional[int] = None


@router.get("/methods")
async def list_pk_payment_methods():
    """List available payment methods for Pakistan"""
    return {"methods": list(PK_PAYMENT_METHODS.values())}


@router.post("/deposit")
async def pk_deposit(request: PKPaymentCreate, current_user=Depends(get_current_user)):
    """Create a deposit using a Pakistan-friendly payment method"""
    if request.method not in PK_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail=f"Unsupported payment method: {request.method}")

    method = PK_PAYMENT_METHODS[request.method]

    if request.amount < method["min_amount"]:
        raise HTTPException(status_code=400, detail=f"Minimum amount for {method['name']} is {method['min_amount']} {method['currency']}")
    if request.amount > method["max_amount"]:
        raise HTTPException(status_code=400, detail=f"Maximum amount for {method['name']} is {method['max_amount']} {method['currency']}")

    fee = request.amount * (method["fee_percent"] / 100)
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        """INSERT INTO payments (client_id, amount, currency, payment_method, status, description, transaction_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)""",
        [
            current_user.id,
            request.amount,
            method["currency"],
            request.method,
            request.description or f"Deposit via {method['name']}",
            f"pk_{secrets.token_urlsafe(16)}",
            now,
            now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create deposit")

    return {
        "message": f"Deposit initiated via {method['name']}",
        "payment_id": result.get("last_insert_rowid"),
        "amount": request.amount,
        "currency": method["currency"],
        "fee": round(fee, 2),
        "total": round(request.amount + fee, 2),
        "method": method["name"],
        "instructions": _get_payment_instructions(request.method),
    }


@router.post("/usdc-deposit")
async def usdc_deposit(request: USDCPaymentCreate, current_user=Depends(get_current_user)):
    """Deposit via USDC on Binance Smart Chain"""
    if request.network not in ("BEP-20", "ERC-20", "TRC-20"):
        raise HTTPException(status_code=400, detail="Supported networks: BEP-20, ERC-20, TRC-20")

    # Platform wallet address (in production, fetch from config)
    platform_wallet = "0x1234567890abcdef1234567890abcdef12345678"
    fee = request.amount * 0.005  # 0.5% fee

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO payments (client_id, amount, currency, payment_method, status, description, transaction_id, created_at, updated_at)
           VALUES (?, ?, 'USD', 'usdc_bep20', 'pending', ?, ?, ?, ?)""",
        [
            current_user.id,
            request.amount,
            request.description or f"USDC deposit ({request.network})",
            f"usdc_{secrets.token_urlsafe(16)}",
            now,
            now,
        ],
    )

    return {
        "message": "USDC deposit initiated",
        "payment_id": result.get("last_insert_rowid"),
        "amount": request.amount,
        "currency": "USD",
        "fee": round(fee, 2),
        "network": request.network,
        "platform_wallet": platform_wallet,
        "instructions": f"Send {request.amount} USDC ({request.network}) to {platform_wallet}. Include your user ID ({current_user.id}) in the memo.",
    }


@router.post("/withdraw")
async def pk_withdraw(amount: float, method: str = "jazzcash", current_user=Depends(get_current_user)):
    """Withdraw funds to a Pakistan-friendly payment method"""
    if method not in PK_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail=f"Unsupported withdrawal method: {method}")

    # Check balance
    balance_result = execute_query(
        "SELECT account_balance FROM users WHERE id = ?",
        [current_user.id],
    )
    rows = parse_rows(balance_result)
    balance = rows[0].get("account_balance", 0) if rows else 0

    if balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    method_info = PK_PAYMENT_METHODS[method]
    fee = amount * (method_info["fee_percent"] / 100)
    now = datetime.now(timezone.utc).isoformat()

    # Deduct balance
    execute_query(
        "UPDATE users SET account_balance = account_balance - ? WHERE id = ?",
        [amount + fee, current_user.id],
    )

    # Create withdrawal record
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at)
           VALUES (?, 'withdrawal', ?, ?, 'pending', ?)""",
        [current_user.id, amount, f"Withdrawal via {method_info['name']} (fee: {fee})", now],
    )

    return {
        "message": f"Withdrawal initiated via {method_info['name']}",
        "amount": amount,
        "fee": round(fee, 2),
        "total_deducted": round(amount + fee, 2),
        "method": method_info["name"],
        "status": "pending",
    }


@router.get("/rates")
async def get_usd_to_pkr_rate():
    """Get current USD to PKR rate"""
    # In production, fetch from a live API
    return {
        "from": "USD",
        "to": "PKR",
        "rate": 278.50,
        "source": "platform_rate",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _get_payment_instructions(method: str) -> str:
    """Get payment instructions for a method"""
    instructions = {
        "jazzcash": "Dial *786# from your JazzCash account. Select 'Send Money'. Enter the platform number and amount.",
        "easypaisa": "Open EasyPaisa app. Select 'Send Money'. Enter the platform number and amount.",
        "usdc_bep20": "Send USDC to the provided wallet address on Binance Smart Chain. Include your user ID in the memo.",
        "airtm": "Log in to AirTM. Select 'Send' and enter the platform email. Specify the amount in USD.",
        "wise": "Log in to Wise. Send to the platform's bank details. Include your user ID as reference.",
        "payoneer": "Log in to Payoneer. Select 'Pay to' and enter the platform's Payoneer email.",
        "bank_transfer": "Transfer to the platform's bank account. Include your user ID as reference.",
    }
    return instructions.get(method, "Follow the payment provider's instructions to complete the transfer.")
