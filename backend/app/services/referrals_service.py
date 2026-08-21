# @AI-HINT: Service layer for the referral system - handles DB operations for 2-sided referral rewards, tracking, stats, and escrow milestone hooks

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging
import secrets

from app.db.turso_http import execute_query, parse_rows

logger = logging.getLogger(__name__)

_tables_ensured = False


def ensure_referrals_tables() -> None:
    """Idempotently ensure all referral program tables and user columns exist."""
    global _tables_ensured
    if _tables_ensured:
        return
    try:
        # 1. Ensure referral_code column on users table
        try:
            execute_query("ALTER TABLE users ADD COLUMN referral_code TEXT", [])
        except Exception:
            pass

        # 2. Main referrals tracking table
        execute_query(
            """CREATE TABLE IF NOT EXISTS referrals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                referrer_id INTEGER NOT NULL,
                referred_user_id INTEGER,
                referred_email TEXT,
                referral_code TEXT,
                status TEXT DEFAULT 'pending',
                referee_reward_amount REAL DEFAULT 20.0,
                reward_amount REAL DEFAULT 50.0,
                is_paid INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT,
                completed_at TEXT,
                FOREIGN KEY(referrer_id) REFERENCES users(id),
                FOREIGN KEY(referred_user_id) REFERENCES users(id)
            )""",
            [],
        )

        # 3. Referral credits ledger table
        execute_query(
            """CREATE TABLE IF NOT EXISTS referral_credits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                credit_type TEXT NOT NULL,
                source_referral_id INTEGER,
                description TEXT,
                created_at TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""",
            [],
        )

        # 4. Referral campaigns table
        execute_query(
            """CREATE TABLE IF NOT EXISTS referral_campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                bonus_amount REAL DEFAULT 0.0,
                bonus_type TEXT DEFAULT 'fixed',
                start_date TEXT,
                end_date TEXT,
                is_active INTEGER DEFAULT 1,
                max_referrals INTEGER,
                created_at TEXT
            )""",
            [],
        )

        # 5. Referral milestones table
        execute_query(
            """CREATE TABLE IF NOT EXISTS referral_milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                target_count INTEGER NOT NULL,
                reward_amount REAL NOT NULL,
                icon TEXT,
                created_at TEXT
            )""",
            [],
        )

        # 6. Referral milestone achievements table
        execute_query(
            """CREATE TABLE IF NOT EXISTS referral_milestone_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                milestone_id INTEGER NOT NULL,
                achieved_at TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(milestone_id) REFERENCES referral_milestones(id)
            )""",
            [],
        )
    except Exception as e:
        logger.warning(f"ensure_referrals_tables encountered non-fatal error: {e}")
    finally:
        _tables_ensured = True


def get_referral_stats(user_id: int) -> Dict[str, Any]:
    """Get referral statistics: total referrals, paid earnings, and pending earnings."""
    ensure_referrals_tables()
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
        "SELECT SUM(reward_amount) as total FROM referrals WHERE referrer_id = ? AND (is_paid = 1 OR status = 'completed')",
        [user_id]
    )
    total_earnings = 0.0
    if result and result.get("rows"):
        rows = parse_rows(result)
        if rows and rows[0].get("total"):
            total_earnings = float(rows[0].get("total"))

    # Pending earnings (pending qualification)
    result = execute_query(
        "SELECT SUM(reward_amount) as total FROM referrals WHERE referrer_id = ? AND status = 'pending'",
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
    ensure_referrals_tables()
    result = execute_query(
        """SELECT id, referred_email, status, reward_amount, referee_reward_amount, is_paid, created_at, completed_at
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
    ensure_referrals_tables()
    result = execute_query(
        "SELECT id FROM referrals WHERE referrer_id = ? AND LOWER(referred_email) = ?",
        [user_id, email.lower().strip()]
    )
    return bool(result and result.get("rows"))


def check_user_exists_by_email(email: str) -> bool:
    """Check if a user with the given email already exists on the platform."""
    result = execute_query(
        "SELECT id FROM users WHERE LOWER(email) = ?",
        [email.lower().strip()]
    )
    return bool(result and result.get("rows"))


def create_referral(user_id: int, email: str, referral_code: str) -> Optional[int]:
    """Create a new referral record with pending status."""
    ensure_referrals_tables()
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO referrals (referrer_id, referred_email, referral_code, status, referee_reward_amount, reward_amount, is_paid, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', 20.0, 50.0, 0, ?, ?)""",
        [user_id, email.lower().strip(), referral_code, now, now]
    )
    return result.get("last_insert_rowid") if result else None


def process_registration_referral(
    new_user_id: int,
    new_user_email: str,
    referral_code: Optional[str],
) -> Optional[Dict[str, Any]]:
    """
    Process two-sided referral upon user registration:
    1. Finds referrer user by referral_code.
    2. Attaches new_user_id to referrals record (or inserts one if not previously invited).
    3. Credits $20.00 welcome credit voucher to referee wallet balance.
    4. Records welcome credit ledger entry in referral_credits and wallet_transactions.
    """
    if not referral_code or not referral_code.strip():
        return None

    ensure_referrals_tables()
    clean_code = referral_code.strip()
    now = datetime.now(timezone.utc).isoformat()
    email_clean = new_user_email.lower().strip()

    # 1. Lookup referrer by referral code
    referrer_res = execute_query(
        "SELECT id, name, email FROM users WHERE referral_code = ? AND id != ?",
        [clean_code, new_user_id],
    )
    referrer_rows = parse_rows(referrer_res) if referrer_res else []
    if not referrer_rows:
        logger.info(f"Referral code {clean_code} not found during registration for {new_user_email}")
        return None

    referrer = referrer_rows[0]
    referrer_id = int(referrer["id"])

    # 2. Check if an existing invite row exists for this email and referrer
    existing_res = execute_query(
        "SELECT id FROM referrals WHERE referrer_id = ? AND LOWER(referred_email) = ? AND (referred_user_id IS NULL OR referred_user_id = ?)",
        [referrer_id, email_clean, new_user_id],
    )
    existing_rows = parse_rows(existing_res) if existing_res else []

    referral_id = None
    if existing_rows:
        referral_id = existing_rows[0]["id"]
        execute_query(
            "UPDATE referrals SET referred_user_id = ?, status = 'pending', updated_at = ? WHERE id = ?",
            [new_user_id, now, referral_id],
        )
    else:
        insert_res = execute_query(
            """INSERT INTO referrals (referrer_id, referred_user_id, referred_email, referral_code, status, referee_reward_amount, reward_amount, is_paid, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [referrer_id, new_user_id, email_clean, clean_code, "pending", 20.0, 50.0, 0, now, now],
        )
        referral_id = insert_res.get("last_insert_rowid") if insert_res else None

    # 3. Credit $20.00 Welcome Voucher to referee's wallet
    welcome_amount = 20.0
    execute_query(
        "UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?",
        [welcome_amount, new_user_id],
    )

    # 4. Record wallet transaction & referral_credits entry
    try:
        execute_query(
            """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
               VALUES (?, 'referral_welcome_credit', ?, 'USD', 'Welcome credit voucher for joining via referral code', 'completed', ?, ?)""",
            [new_user_id, welcome_amount, f"ref_{referral_id}", now],
        )
    except Exception as e:
        logger.warning(f"Could not log wallet transaction for referee {new_user_id}: {e}")

    try:
        execute_query(
            """INSERT INTO referral_credits (user_id, amount, credit_type, source_referral_id, description, created_at)
               VALUES (?, ?, 'welcome_credit', ?, 'Welcome credit voucher for signing up via referral', ?)""",
            [new_user_id, welcome_amount, referral_id, now],
        )
    except Exception as e:
        logger.warning(f"Could not log referral_credits for referee {new_user_id}: {e}")

    logger.info(f"Awarded $20.00 welcome credit to user {new_user_id} via referral code {clean_code}")
    return {
        "referral_id": referral_id,
        "referrer_id": referrer_id,
        "referee_user_id": new_user_id,
        "welcome_credit": welcome_amount,
        "status": "pending_milestone",
    }


def qualify_referral_on_milestone(
    client_id: int,
    contract_id: Optional[int] = None,
    milestone_id: Optional[int] = None,
) -> Optional[Dict[str, Any]]:
    """
    Hook invoked when an escrow milestone is released/approved:
    1. Checks if client (or referee) was referred with pending milestone qualification.
    2. Marks referral as completed and paid.
    3. Credits $50.00 project credit to the referrer's wallet balance.
    4. Logs transaction in referral_credits and wallet_transactions.
    5. Dispatches notification to referrer.
    """
    ensure_referrals_tables()
    now = datetime.now(timezone.utc).isoformat()

    # Find pending referral for this user
    ref_res = execute_query(
        """SELECT r.id, r.referrer_id, r.referred_user_id, r.referee_reward_amount, r.reward_amount, r.referral_code
           FROM referrals r
           WHERE (r.referred_user_id = ? OR r.referred_email = (SELECT email FROM users WHERE id = ?))
             AND r.status = 'pending'
           LIMIT 1""",
        [client_id, client_id],
    )
    rows = parse_rows(ref_res) if ref_res else []
    if not rows:
        return None

    referral = rows[0]
    referral_id = int(referral["id"])
    referrer_id = int(referral["referrer_id"])
    reward_amount = float(referral.get("reward_amount") or 50.0)

    # 1. Update referral status to completed and paid
    execute_query(
        "UPDATE referrals SET status = 'completed', is_paid = 1, completed_at = ?, updated_at = ? WHERE id = ?",
        [now, now, referral_id],
    )

    # 2. Credit $50.00 project credit to referrer
    execute_query(
        "UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?",
        [reward_amount, referrer_id],
    )

    # 3. Log wallet transaction
    ref_key = f"milestone_{milestone_id}" if milestone_id else f"contract_{contract_id}" if contract_id else f"ref_{referral_id}"
    try:
        execute_query(
            """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
               VALUES (?, 'referral_milestone_reward', ?, 'USD', 'Referral reward for referee milestone release', 'completed', ?, ?)""",
            [referrer_id, reward_amount, ref_key, now],
        )
    except Exception as e:
        logger.warning(f"Wallet transaction logging failed for referrer {referrer_id}: {e}")

    # 4. Log referral_credits entry
    try:
        execute_query(
            """INSERT INTO referral_credits (user_id, amount, credit_type, source_referral_id, description, created_at)
               VALUES (?, ?, 'milestone_reward', ?, 'Referral reward credited on milestone escrow release', ?)""",
            [referrer_id, reward_amount, referral_id, now],
        )
    except Exception as e:
        logger.warning(f"Referral credits logging failed for referrer {referrer_id}: {e}")

    # 5. Send notification to referrer
    try:
        from app.services.notifications_service import send_notification
        send_notification(
            referrer_id,
            "referral_reward",
            "Referral Reward Earned! 🎁",
            f"Your referral completed their first milestone! ${reward_amount:.2f} project credit has been added to your wallet.",
            action_url="/freelancer/referrals",
            data={"referral_id": referral_id, "amount": reward_amount},
        )
    except Exception as e:
        logger.warning(f"Referral notification failed for referrer {referrer_id}: {e}")

    logger.info(f"Referral #{referral_id} qualified on milestone release: ${reward_amount:.2f} credited to referrer {referrer_id}")
    return {
        "referral_id": referral_id,
        "referrer_id": referrer_id,
        "reward_amount": reward_amount,
        "status": "completed",
    }
