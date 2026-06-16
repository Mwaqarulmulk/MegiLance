# @AI-HINT: Service layer for escrow CRUD operations using Turso HTTP (not advanced_escrow.py which uses Stripe/SQLAlchemy)
"""
Escrow Service - Data access and business logic for escrow endpoints.
Handles escrow creation, listing, release, refund, and balance checks via Turso.
"""
from datetime import datetime, timezone
from typing import List, Optional
import logging

from app.db.turso_http import execute_query, to_str, to_int, to_float, extract_value, parse_date

logger = logging.getLogger(__name__)


def _row_to_escrow(row) -> dict:
    """Convert Turso row to escrow dict. DB order: id(0), contract_id(1), client_id(2), amount(3), status(4), released_amount(5), released_at(6), expires_at(7), created_at(8), updated_at(9)"""
    return {
        "id": to_int(row[0]),
        "contract_id": to_int(row[1]),
        "client_id": to_int(row[2]),
        "amount": to_float(row[3]) or 0.0,
        "status": to_str(row[4]) or "pending",
        "released_amount": to_float(row[5]) or 0.0,
        "released_at": parse_date(row[6]),
        "expires_at": parse_date(row[7]),
        "created_at": parse_date(row[8]),
        "updated_at": parse_date(row[9])
    }


ESCROW_SELECT_COLS = "id, contract_id, client_id, amount, status, released_amount, released_at, expires_at, created_at, updated_at"


def get_contract_parties(contract_id: int) -> Optional[dict]:
    """Get client_id and freelancer_id for a contract. Returns None if not found."""
    result = execute_query("SELECT id, client_id, freelancer_id FROM contracts WHERE id = ?", [contract_id])
    if not result or not result.get("rows"):
        return None
    row = result["rows"][0]
    return {
        "id": to_int(row[0]),
        "client_id": to_int(row[1]),
        "freelancer_id": to_int(row[2]),
    }


def get_user_balance(user_id: int) -> float:
    """Get user's account balance."""
    result = execute_query("SELECT account_balance FROM users WHERE id = ?", [user_id])
    if result and result.get("rows"):
        return to_float(result["rows"][0][0]) or 0.0
    return 0.0


def update_user_balance(user_id: int, new_balance: float):
    """Set user's account balance."""
    execute_query("UPDATE users SET account_balance = ? WHERE id = ?", [new_balance, user_id])


def fund_pending_escrow(contract_id: int, client_id: int, amount: float, notes: Optional[str]) -> Optional[dict]:
    """Fund a pending escrow record and update balance atomically."""
    now = datetime.now(timezone.utc).isoformat()
    
    result = execute_query("SELECT id, amount, status FROM escrow WHERE contract_id = ? AND client_id = ? ORDER BY id DESC LIMIT 1", [contract_id, client_id])
    if not result or not result.get("rows"):
        return None
        
    escrow_id = to_int(result["rows"][0][0])
    
    # Deduct balance
    balance = get_user_balance(client_id)
    new_balance = balance - amount
    
    if new_balance < 0:
        raise ValueError("Insufficient balance to fund escrow")
    
    # Atomic batch: balance deduction + escrow update + contract activation
    from app.db.turso_http import get_turso_http
    client = get_turso_http()
    statements = [
        {"q": "UPDATE users SET account_balance = ? WHERE id = ?", "params": [new_balance, client_id]},
        {"q": "UPDATE escrow SET status = 'funded', updated_at = ? WHERE id = ?", "params": [now, escrow_id]},
        {"q": "UPDATE contracts SET status = 'active', updated_at = ? WHERE id = ?", "params": [now, contract_id]},
    ]
    try:
        client.execute_many(statements)
    except Exception as e:
        logger.error(f"Atomic escrow fund failed: {e}")
        raise ValueError("Failed to fund escrow — transaction rolled back")
    
    updated = execute_query(f"SELECT {ESCROW_SELECT_COLS} FROM escrow WHERE id = ?", [escrow_id])
    return _row_to_escrow(updated["rows"][0]) if updated and updated.get("rows") else None


def create_escrow(contract_id: int, client_id: int, amount: float,
                  expires_at: Optional[str], notes: Optional[str]) -> dict:
    """Insert a new escrow record, deduct client balance atomically, and return the created escrow."""
    now = datetime.now(timezone.utc).isoformat()
    
    balance = get_user_balance(client_id)
    new_balance = balance - amount
    
    if new_balance < 0:
        raise ValueError("Insufficient balance to create escrow")
    
    # Atomic batch: insert escrow + deduct balance
    from app.db.turso_http import get_turso_http
    client = get_turso_http()
    statements = [
        {
            "q": "INSERT INTO escrow (contract_id, client_id, amount, released_amount, status, expires_at, created_at, updated_at) VALUES (?, ?, ?, 0.0, 'active', ?, ?, ?)",
            "params": [contract_id, client_id, amount, expires_at, now, now],
        },
        {
            "q": "UPDATE users SET account_balance = ? WHERE id = ?",
            "params": [new_balance, client_id],
        },
    ]
    try:
        client.execute_many(statements)
    except Exception as e:
        logger.error(f"Atomic escrow creation failed: {e}")
        raise ValueError("Failed to create escrow — transaction rolled back")
    
    result = execute_query(f"""
        SELECT {ESCROW_SELECT_COLS}
        FROM escrow WHERE contract_id = ? AND client_id = ? ORDER BY id DESC LIMIT 1
    """, [contract_id, client_id])
    if not result or not result.get("rows"):
        return None
    return _row_to_escrow(result["rows"][0])


def expire_stale_escrows():
    """Mark expired escrows."""
    now = datetime.now(timezone.utc).isoformat()
    execute_query("""
        UPDATE escrow SET status = 'expired'
        WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < ?
    """, [now])


def get_freelancer_contract_ids(user_id: int) -> List[int]:
    """Get contract IDs where user is the freelancer."""
    result = execute_query("SELECT id FROM contracts WHERE freelancer_id = ?", [user_id])
    if not result or not result.get("rows"):
        return []
    return [to_int(r[0]) for r in result["rows"]]


def list_escrows(user_id: int, user_role: str, contract_id: Optional[int],
                 status_filter: Optional[str], limit: int, offset: int) -> List[dict]:
    """List escrow records filtered by role and optional params."""
    expire_stale_escrows()

    if user_role == "client":
        sql = f"SELECT {ESCROW_SELECT_COLS} FROM escrow WHERE client_id = ?"
        params = [user_id]
    elif user_role == "freelancer":
        contract_ids = get_freelancer_contract_ids(user_id)
        if not contract_ids:
            return []
        placeholders = ",".join(["?" for _ in contract_ids])
        sql = f"SELECT {ESCROW_SELECT_COLS} FROM escrow WHERE contract_id IN ({placeholders})"
        params = list(contract_ids)
    else:
        sql = f"SELECT {ESCROW_SELECT_COLS} FROM escrow WHERE 1=1"
        params = []

    if contract_id:
        sql += " AND contract_id = ?"
        params.append(contract_id)
    if status_filter:
        sql += " AND status = ?"
        params.append(status_filter)

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    result = execute_query(sql, params)
    if not result or not result.get("rows"):
        return []
    return [_row_to_escrow(row) for row in result["rows"]]


def get_escrow_balance_data(contract_id: int) -> dict:
    """Calculate escrow balance summary for a contract."""
    result = execute_query("SELECT amount, released_amount, status FROM escrow WHERE contract_id = ?", [contract_id])
    total_funded = 0.0
    total_released = 0.0
    has_active = False
    if result and result.get("rows"):
        for row in result["rows"]:
            amount = to_float(row[0]) or 0.0
            released = to_float(row[1]) or 0.0
            st = to_str(row[2])
            if st in ["active", "released"]:
                total_funded += amount
            total_released += released
            if st == "active":
                has_active = True
    return {
        "total_funded": round(total_funded, 2),
        "total_released": round(total_released, 2),
        "available_balance": round(total_funded - total_released, 2),
        "status": "active" if has_active else "none",
    }


def get_escrow_by_id(escrow_id: int) -> Optional[dict]:
    """Get a single escrow record by ID."""
    result = execute_query(f"SELECT {ESCROW_SELECT_COLS} FROM escrow WHERE id = ?", [escrow_id])
    if not result or not result.get("rows"):
        return None
    return _row_to_escrow(result["rows"][0])


def get_escrow_core(escrow_id: int) -> Optional[dict]:
    """Get minimal escrow info for release/refund validation."""
    result = execute_query("""
        SELECT id, contract_id, client_id, amount, released_amount, status
        FROM escrow WHERE id = ?
    """, [escrow_id])
    if not result or not result.get("rows"):
        return None
    row = result["rows"][0]
    return {
        "id": to_int(row[0]),
        "contract_id": to_int(row[1]),
        "client_id": to_int(row[2]),
        "amount": to_float(row[3]) or 0.0,
        "released_amount": to_float(row[4]) or 0.0,
        "status": to_str(row[5]),
    }


def get_freelancer_id_for_contract(contract_id: int) -> Optional[int]:
    """Get freelancer_id from a contract."""
    result = execute_query("SELECT freelancer_id FROM contracts WHERE id = ?", [contract_id])
    if not result or not result.get("rows"):
        return None
    return to_int(result["rows"][0][0])


def release_escrow_funds(escrow_id: int, release_amount: float,
                         freelancer_id: int, current_released: float, total_amount: float):
    """Transfer funds from escrow to freelancer atomically."""
    freelancer_balance = get_user_balance(freelancer_id)
    new_freelancer_balance = freelancer_balance + release_amount
    new_released = current_released + release_amount
    new_status = "released" if new_released >= total_amount else "active"
    now = datetime.now(timezone.utc).isoformat()

    # Atomic batch: credit freelancer + update escrow
    from app.db.turso_http import get_turso_http
    client = get_turso_http()
    statements = [
        {"q": "UPDATE users SET account_balance = ? WHERE id = ?", "params": [new_freelancer_balance, freelancer_id]},
        {"q": "UPDATE escrow SET released_amount = ?, status = ?, updated_at = ? WHERE id = ?", "params": [new_released, new_status, now, escrow_id]},
    ]
    try:
        client.execute_many(statements)
    except Exception as e:
        logger.error(f"Atomic escrow release failed: {e}")
        raise ValueError("Failed to release escrow funds — transaction rolled back")


def refund_escrow_funds(escrow_id: int, refund_amount: float,
                        client_id: int, current_released: float):
    """Refund escrow funds back to client atomically."""
    client_balance = get_user_balance(client_id)
    new_client_balance = client_balance + refund_amount
    new_released = current_released + refund_amount
    now = datetime.now(timezone.utc).isoformat()

    # Atomic batch: credit client + update escrow
    from app.db.turso_http import get_turso_http
    client = get_turso_http()
    statements = [
        {"q": "UPDATE users SET account_balance = ? WHERE id = ?", "params": [new_client_balance, client_id]},
        {"q": "UPDATE escrow SET released_amount = ?, status = 'refunded', updated_at = ? WHERE id = ?", "params": [new_released, now, escrow_id]},
    ]
    try:
        client.execute_many(statements)
    except Exception as e:
        logger.error(f"Atomic escrow refund failed: {e}")
        raise ValueError("Failed to refund escrow — transaction rolled back")


def get_escrow_ownership(escrow_id: int) -> Optional[dict]:
    """Get escrow client_id/status for update authorization."""
    result = execute_query("SELECT id, client_id, status FROM escrow WHERE id = ?", [escrow_id])
    if not result or not result.get("rows"):
        return None
    row = result["rows"][0]
    return {
        "id": to_int(row[0]),
        "client_id": to_int(row[1]),
        "status": to_str(row[2]),
    }


_ALLOWED_ESCROW_COLUMNS = frozenset({
    "status", "amount", "released_amount", "expires_at", "released_at",
})


def update_escrow_fields(escrow_id: int, update_dict: dict):
    """Apply partial update to an escrow record."""
    update_fields = []
    params = []
    for field, value in update_dict.items():
        if field not in _ALLOWED_ESCROW_COLUMNS:
            raise ValueError(f"Invalid column name: {field}")
        if field == "expires_at" and value:
            update_fields.append(f"{field} = ?")
            params.append(value.isoformat() if hasattr(value, 'isoformat') else str(value))
        else:
            update_fields.append(f"{field} = ?")
            params.append(value)
    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now(timezone.utc).isoformat())
        params.append(escrow_id)
        execute_query(f"UPDATE escrow SET {', '.join(update_fields)} WHERE id = ?", params)
