# @AI-HINT: Service layer for the referral system - handles all DB operations for referral tracking, stats, and invitations

from typing import List, Dict, Any
from datetime import datetime, timezone

from app.db.turso_http import execute_query, parse_rows


def get_referral_stats(user_id: int) -> Dict[str, Any]:
    """Get referral statistics: total referrals, paid earnings, and pending earnings."""
    # Total referrals
    result = execute_query(
        "SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ?",
        [user_id]
    )
    total_referrals = 0
    if result and result.get("rows"):
        rows = parse_rows(result)
        if rows:
            total_referrals = rows[0].get("count", 0)

    # Total earnings (paid)
    result = execute_query(
        "SELECT SUM(reward_amount) as total FROM referrals WHERE referrer_id = ? AND is_paid = 1",
        [user_id]
    )
    total_earnings = 0.0
    if result and result.get("rows"):
        rows = parse_rows(result)
        if rows and rows[0].get("total"):
            total_earnings = float(rows[0].get("total"))

    # Pending earnings (completed but not paid)
    result = execute_query(
        "SELECT SUM(reward_amount) as total FROM referrals WHERE referrer_id = ? AND status = 'completed' AND is_paid = 0",
        [user_id]
    )
    pending_earnings = 0.0
    if result and result.get("rows"):
        rows = parse_rows(result)
        if rows and rows[0].get("total"):
            pending_earnings = float(rows[0].get("total"))

    return {
        "total_referrals": total_referrals,
        "total_earnings": total_earnings,
        "pending_earnings": pending_earnings,
    }


def list_referrals(user_id: int) -> List[Dict[str, Any]]:
    """List all referrals sent by a user, ordered by creation date descending."""
    result = execute_query(
        """SELECT id, referred_email, status, reward_amount, is_paid, created_at, completed_at
           FROM referrals
           WHERE referrer_id = ?
           ORDER BY created_at DESC""",
        [user_id]
    )
    if not result:
        return []
    return parse_rows(result)


def check_already_invited(user_id: int, email: str) -> bool:
    """Check if the user has already invited this email address."""
    result = execute_query(
        "SELECT id FROM referrals WHERE referrer_id = ? AND referred_email = ?",
        [user_id, email]
    )
    return bool(result and result.get("rows"))


def check_user_exists_by_email(email: str) -> bool:
    """Check if a user with the given email already exists on the platform."""
    result = execute_query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    )
    return bool(result and result.get("rows"))


def create_referral(user_id: int, email: str, referral_code: str) -> None:
    """Create a new referral record with pending status."""
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        """INSERT INTO referrals (referrer_id, referred_email, referral_code, status, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', ?, ?)""",
        [user_id, email, referral_code, now, now]
    )
