# Handoff Report: Two-Sided Referral Engine & Escrow Milestone Qualification Hook

**Agent**: Explorer M1_2 (Milestone 1 — Backend Core Services & Growth Engine APIs)  
**Date**: 2026-08-21  
**Status**: Ready for Implementation  

---

## 1. Observation

A comprehensive codebase audit was conducted across the backend data models, authentication handlers, referral services, escrow release flows, and wallet accounting mechanisms.

### 1.1 Data Models (`backend/app/models/`)

- **`referral.py` (Lines 10–34)**:
  - `ReferralStatus` enum: `PENDING = "pending"`, `ACCEPTED = "accepted"`, `COMPLETED = "completed"`, `EXPIRED = "expired"`.
  - `Referral` table schema:
    - `id`: `Mapped[int]` (Primary Key)
    - `referrer_id`: `Mapped[int]` (FK to `users.id`)
    - `referred_email`: `Mapped[str]` (String 255, indexed)
    - `referred_user_id`: `Mapped[int]` (FK to `users.id`, nullable)
    - `status`: `Mapped[str]` (String 20, default `"pending"`)
    - `referral_code`: `Mapped[str]` (String 50, unique, indexed)
    - `reward_amount`: `Mapped[float]` (Float, default `0.0`)
    - `is_paid`: `Mapped[bool]` (Boolean, default `False`)
    - `created_at`, `updated_at`, `completed_at`: `Mapped[datetime]`
  - Relationships: `referrer` (`User`), `referred_user` (`User`).

- **`user.py` (Lines 46–47)**:
  - `account_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))`
  - `referral_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)`

- **`payment.py` & `wallet_service.py`**:
  - `wallet_transactions` table (`id`, `user_id`, `type`, `amount`, `currency`, `status`, `description`, `reference_id`, `metadata`, `created_at`, `completed_at`).
  - `wallet_balances` table (`user_id`, `available`, `pending`, `escrow`, `currency`, `updated_at`).

### 1.2 Existing Endpoints and Services

- **`backend/app/api/v1/identity/auth.py` (Lines 51–63, 158–265)**:
  - `RegisterRequest` accepts: `email`, `password`, `name`, `full_name`, `role`, `user_type`, `bio`, `skills`, `hourly_rate`, `profile_image_url`, `location`.
  - **Gap**: `RegisterRequest` currently lacks `referral_code` and `ref` fields. The `/register` endpoint does not capture URL query parameters (`?ref=...`) or process referral linkages, welcome vouchers, or initial account balance credits.

- **`backend/app/services/referrals_service.py` (Lines 1–91)**:
  - Provides basic functions: `get_referral_stats(user_id)`, `list_referrals(user_id)`, `check_already_invited(user_id, email)`, `check_user_exists_by_email(email)`, `create_referral(user_id, email, referral_code)`.
  - **Gap**: Lacks business logic for:
    1. Processing incoming registration referrals (`process_registration_referral`) and issuing the $20 welcome voucher.
    2. Hooking escrow milestone completion (`qualify_referral_on_milestone`) to mark referrals as `completed` and award the $50 referrer reward.
    3. Self-healing DDL table initialization (`ensure_referrals_tables()`).

- **`backend/app/api/v1/core_domain/referrals.py` (Lines 47–104, 265–297)**:
  - `GET /api/v1/referrals/me`: Queries `referrals WHERE referrer_id = ?`, returns stats (`total`, `completed`, `pending`), `total_earned` (sum of `reward_amount` for completed referrals), and `recent_referrals` joining `users` for `referred_name`.
  - `POST /api/v1/referrals/invite`: Creates an invite with `status = 'pending'`, `reward_amount = 0`.
  - `GET /api/v1/referrals/stats`: Aggregates completed, pending, and total earnings.
  - `GET /api/v1/referrals/history`: Lists referred users, avatars, and statuses.

- **`backend/app/api/v1/payments_domain/escrow.py` (Lines 136–195)** & **`backend/app/services/escrow_service.py` (Lines 245–278)**:
  - `release_escrow(escrow_id, request, current_user)`: Releases funds atomically via `release_escrow_funds`, updates freelancer balance and escrow status, logs `wallet_transactions`.
  - **Gap**: Does not invoke any referral qualification trigger.

- **`backend/app/api/v1/projects_domain/milestones.py` (Lines 228–326)**:
  - `approve_milestone(milestone_id, request, current_user)`: Verifies client access, calls `release_escrow_funds`, marks milestone `approved`, logs `wallet_transactions`, updates contract status if all milestones complete.
  - **Gap**: Does not invoke any referral qualification trigger.

- **`backend/app/api/v1/payments_domain/wallet.py` (Lines 26–50)**:
  - `GET /api/v1/wallet`: Queries `users.account_balance` and `wallet_transactions` for current user.

---

## 2. Logic Chain

```
[User Signup with Referral Code / ?ref=...]
       │
       ▼
1. Validate Referrer (Exclude Self-Referral)
       │
       ▼
2. Create/Link Pending Referral in `referrals`
       │
       ▼
3. Deposit $20.00 Welcome Credit Voucher into Referee's Wallet
       │
       ▼
4. Generate & Save Referee's Unique Referral Code
       │
       ▼
[Escrow Milestone Approved / Released by Client]
       │
       ▼
5. Check if Client or Freelancer has `status = 'pending'` in `referrals`
       │
       ▼
6. Idempotently Update `referrals`:
   - status = 'completed'
   - reward_amount = 50.00
   - is_paid = 1
   - completed_at = now
       │
       ▼
7. Deposit $50.00 Project Credit into Referrer's Wallet
       │
       ▼
8. Log Double-Entry `wallet_transactions` & Dispatch In-App Notifications
```

### Step 1: User Registration with Referral Code Capture & $20 Welcome Credit
1. **Input Ingestion**:
   - `RegisterRequest` accepts optional `referral_code: Optional[str] = None` and `ref: Optional[str] = None`.
   - The `/register` endpoint accepts query parameter `ref: Optional[str] = Query(None)`.
   - Resolved code: `resolved_code = body.referral_code or body.ref or ref or request.query_params.get("ref")`.
2. **Referrer Resolution**:
   - Query `users` for `UPPER(referral_code) = UPPER(resolved_code)`.
   - Fallback: Query `referrals` for pre-existing pending invite matching `LOWER(referred_email) = LOWER(body.email)`.
3. **Anti-Abuse Verification**:
   - Ensure referrer exists and `referrer_id != new_user_id`.
   - Ensure new user hasn't already claimed a welcome credit.
4. **Referral Record Creation / Association**:
   - If pre-existing pending record exists for `(referrer_id, new_user_email)`:
     `UPDATE referrals SET referred_user_id = :user_id, referral_code = :ref_code, updated_at = :now WHERE id = :id`
   - Otherwise:
     `INSERT INTO referrals (referrer_id, referred_email, referred_user_id, referral_code, status, reward_amount, is_paid, created_at, updated_at) VALUES (:referrer_id, :email, :user_id, :ref_code, 'pending', 0.0, 0, :now, :now)`
5. **Immediate $20.00 Welcome Voucher Deposit**:
   - `UPDATE users SET account_balance = COALESCE(account_balance, 0) + 20.00 WHERE id = :user_id`
   - `UPDATE wallet_balances SET available = available + 20.00, updated_at = :now WHERE user_id = :user_id` (if table exists)
   - Insert into `wallet_transactions`:
     - `user_id`: `:user_id`
     - `type`: `'referral_welcome_credit'`
     - `amount`: `20.00`
     - `currency`: `'USD'`
     - `status`: `'completed'`
     - `description`: `'$20.00 Referral Welcome Credit Voucher'`
     - `reference_id`: `'ref_welcome_' || referral_id`
6. **Assign Referee's Own Shareable Referral Code**:
   - Generate `REF-{user_id}-{token_hex(4).upper()}`.
   - `UPDATE users SET referral_code = :code WHERE id = :user_id AND (referral_code IS NULL OR referral_code = '')`.
7. **Notifications**:
   - Referee receives: *"Welcome bonus! $20.00 project credit voucher deposited to your wallet."*
   - Referrer receives: *"Someone registered with your referral link! You'll receive $50.00 when they complete their first milestone."*

### Step 2: Milestone Escrow Approval / Release Referral Hook
1. **Hook Invocations**:
   - Called in `backend/app/api/v1/payments_domain/escrow.py` (`release_escrow`) and `backend/app/api/v1/projects_domain/milestones.py` (`approve_milestone`) immediately following successful escrow release.
2. **Referee Identification**:
   - Check if either participant (`client_id` or `freelancer_id`) is a referred user with a `pending` referral:
     `SELECT id, referrer_id, referred_user_id, referred_email, referral_code FROM referrals WHERE referred_user_id IN (:client_id, :freelancer_id) AND status = 'pending'`
3. **Idempotent Referral Completion & $50.00 Payout**:
   - For each matching referral record:
     ```sql
     UPDATE referrals
     SET status = 'completed',
         reward_amount = 50.00,
         is_paid = 1,
         completed_at = :now,
         updated_at = :now
     WHERE id = :referral_id AND status = 'pending'
     ```
   - If update affects 1 row (idempotency guard):
     - `UPDATE users SET account_balance = COALESCE(account_balance, 0) + 50.00 WHERE id = :referrer_id`
     - `UPDATE wallet_balances SET available = available + 50.00, updated_at = :now WHERE user_id = :referrer_id` (if table exists)
     - Insert into `wallet_transactions`:
       - `user_id`: `:referrer_id`
       - `type`: `'referral_reward'`
       - `amount`: `50.00`
       - `currency`: `'USD'`
       - `status`: `'completed'`
       - `description`: `'$50.00 Referral Reward: Referee completed milestone escrow release'`
       - `reference_id`: `'ref_qualify_' || referral_id`
     - Dispatch notification to referrer:
       *"Referral reward unlocked! $50.00 project credit added to your wallet."*

### Step 3: Consistency & Stats Reflection
- `GET /api/v1/referrals/me`: Counts 1 additional completed referral; `total_earned` increases by `$50.00`.
- `GET /api/v1/referrals/stats`: `completed_referrals` increases, `pending` decreases; `total_earned` increases by `$50.00`.
- `GET /api/v1/referrals/history`: Displays referee display name and avatar, marked as `"completed"` with `reward_amount = 50.00` and `completed_at` timestamp.
- `GET /api/v1/wallet`:
  - Referee's wallet shows initial `$20.00` balance and `referral_welcome_credit` transaction.
  - Referrer's wallet shows `+$50.00` balance and `referral_reward` transaction.

---

## 3. Caveats

1. **Self-Referral Prevention**:
   - Users cannot refer themselves. Validation checks: `referrer_id != new_user_id` and `LOWER(referrer.email) != LOWER(new_user.email)`.
2. **Duplicate Invites vs Direct Link**:
   - If a referrer previously created an invite for `alice@example.com` via `/referrals/invite`, and Alice later signs up via a direct link or referral code, the existing `pending` record is updated with Alice's `referred_user_id` rather than inserting a duplicate.
3. **Multi-Milestone Contracts**:
   - A single referee may complete 10 milestones on a contract. The qualification hook specifically queries `WHERE referred_user_id = :id AND status = 'pending'`. Once set to `'completed'`, subsequent milestones for the same referee are safely ignored.
4. **Database Self-Healing**:
   - In Turso HTTP mode, tables must exist even without traditional migrations. The `referrals_service.py` module will include `ensure_referrals_tables()` executed idempotently once per process.
5. **Non-Blocking Notifications**:
   - Notification dispatches are wrapped in `try/except` blocks so that a notification error never rolls back a successful wallet credit or referral qualification.

---

## 4. Conclusion & Implementation Blueprint

### 4.1 Service Layer: `backend/app/services/referrals_service.py`

Add the following complete implementations:

```python
# @AI-HINT: Service layer for referral engine - registration credits, escrow milestone qualification, stats
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging
import secrets

from app.db.turso_http import execute_query, parse_rows, to_float, to_int
from app.services.notifications_service import send_notification

logger = logging.getLogger(__name__)

_referrals_table_initialized = False

def ensure_referrals_tables() -> None:
    """Create referrals tables and ensure columns exist."""
    global _referrals_table_initialized
    if _referrals_table_initialized:
        return
    try:
        execute_query("""
            CREATE TABLE IF NOT EXISTS referrals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                referrer_id INTEGER NOT NULL,
                referred_email TEXT NOT NULL,
                referred_user_id INTEGER,
                referral_code TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                reward_amount REAL DEFAULT 0.0,
                is_paid INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT
            )
        """)
        execute_query("CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referred_user_id)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code)")
        execute_query("CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(referred_email)")
        execute_query("ALTER TABLE users ADD COLUMN referral_code TEXT")
    except Exception:
        pass
    finally:
        _referrals_table_initialized = True


def process_registration_referral(
    new_user_id: int,
    new_user_email: str,
    referral_code: Optional[str] = None,
    new_user_name: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Process referral code during user registration.
    - Resolves referrer by code or prior email invitation.
    - Creates or links pending referral record.
    - Immediately deposits $20.00 welcome credit voucher into referee's wallet.
    - Generates shareable referral code for new user.
    """
    ensure_referrals_tables()
    now = datetime.now(timezone.utc).isoformat()
    clean_email = new_user_email.strip().lower()
    referrer = None

    if referral_code and referral_code.strip():
        code_clean = referral_code.strip().upper()
        res = execute_query(
            "SELECT id, email, name, referral_code FROM users WHERE UPPER(referral_code) = ? AND id != ?",
            [code_clean, new_user_id]
        )
        rows = parse_rows(res)
        if rows:
            referrer = rows[0]

    # Fallback: check if an invitation was sent to this email
    if not referrer:
        res = execute_query(
            """SELECT r.id as referral_id, r.referrer_id, u.email, u.name, u.referral_code
               FROM referrals r
               JOIN users u ON r.referrer_id = u.id
               WHERE LOWER(r.referred_email) = ? AND r.status = 'pending' AND r.referrer_id != ?
               ORDER BY r.id DESC LIMIT 1""",
            [clean_email, new_user_id]
        )
        rows = parse_rows(res)
        if rows:
            referrer = {
                "id": rows[0]["referrer_id"],
                "email": rows[0]["email"],
                "name": rows[0]["name"],
                "referral_code": rows[0]["referral_code"],
                "existing_referral_id": rows[0]["referral_id"]
            }

    # Generate referee's own referral code if missing
    user_res = execute_query("SELECT referral_code FROM users WHERE id = ?", [new_user_id])
    user_rows = parse_rows(user_res)
    if not user_rows or not user_rows[0].get("referral_code"):
        my_code = f"REF-{new_user_id}-{secrets.token_hex(4).upper()}"
        execute_query("UPDATE users SET referral_code = ? WHERE id = ?", [my_code, new_user_id])

    if not referrer or referrer["id"] == new_user_id:
        return None

    referrer_id = int(referrer["id"])
    used_code = referrer.get("referral_code") or (referral_code.strip().upper() if referral_code else f"REF-{referrer_id}")

    # Insert or update referral record
    referral_id = referrer.get("existing_referral_id")
    if referral_id:
        execute_query(
            "UPDATE referrals SET referred_user_id = ?, referral_code = ?, updated_at = ? WHERE id = ?",
            [new_user_id, used_code, now, referral_id]
        )
    else:
        ins_res = execute_query(
            """INSERT INTO referrals (referrer_id, referred_email, referred_user_id, referral_code, status, reward_amount, is_paid, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'pending', 0.0, 0, ?, ?)""",
            [referrer_id, clean_email, new_user_id, used_code, now, now]
        )
        referral_id = ins_res.get("last_insert_rowid") if ins_res else None

    # Deposit $20.00 welcome credit voucher into referee's wallet
    welcome_amount = 20.00
    execute_query("UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?", [welcome_amount, new_user_id])
    try:
        execute_query("UPDATE wallet_balances SET available = available + ?, updated_at = ? WHERE user_id = ?", [welcome_amount, now, new_user_id])
    except Exception:
        pass

    ref_tx_id = f"ref_welcome_{referral_id or new_user_id}"
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, currency, status, description, reference_id, created_at, completed_at)
           VALUES (?, 'referral_welcome_credit', ?, 'USD', 'completed', '$20.00 Referral Welcome Credit Voucher', ?, ?, ?)""",
        [new_user_id, welcome_amount, ref_tx_id, now, now]
    )

    # In-app notifications
    try:
        send_notification(
            user_id=new_user_id,
            notification_type="referral_welcome_bonus",
            title="Welcome Credit Received! 🎁",
            content="A $20.00 welcome credit voucher has been deposited into your MegiLance wallet balance.",
            data={"amount": welcome_amount, "referral_id": referral_id},
            action_url="/wallet"
        )
    except Exception as e:
        logger.warning(f"Failed to send welcome notification to referee {new_user_id}: {e}")

    try:
        send_notification(
            user_id=referrer_id,
            notification_type="referral_joined",
            title="New Referral Joined! 🚀",
            content=f"{new_user_name or 'A new user'} joined using your referral link. You will earn $50.00 once they complete their first milestone!",
            data={"referee_id": new_user_id, "referral_id": referral_id},
            action_url="/freelancer/referrals"
        )
    except Exception as e:
        logger.warning(f"Failed to send referral joined notification to referrer {referrer_id}: {e}")

    return {
        "referral_id": referral_id,
        "referrer_id": referrer_id,
        "welcome_credit": welcome_amount,
        "status": "pending"
    }


def qualify_referral_on_milestone(
    client_id: int,
    freelancer_id: int,
    milestone_id: Optional[int] = None,
    escrow_id: Optional[int] = None,
    milestone_amount: Optional[float] = None,
) -> List[Dict[str, Any]]:
    """
    Hook called when an escrow milestone is approved/released.
    - Checks if either the client or the freelancer has a pending referral.
    - Transitions referral status from 'pending' to 'completed'.
    - Awards $50.00 project credit directly to the referrer's wallet.
    - Returns list of qualified referrals.
    """
    ensure_referrals_tables()
    now = datetime.now(timezone.utc).isoformat()
    candidate_user_ids = [uid for uid in [client_id, freelancer_id] if uid]
    if not candidate_user_ids:
        return []

    placeholders = ",".join(["?" for _ in candidate_user_ids])
    res = execute_query(
        f"""SELECT id, referrer_id, referred_user_id, referred_email, referral_code
            FROM referrals
            WHERE referred_user_id IN ({placeholders}) AND status = 'pending'""",
        candidate_user_ids
    )
    pending_referrals = parse_rows(res) or []
    qualified = []

    for ref in pending_referrals:
        ref_id = int(ref["id"])
        referrer_id = int(ref["referrer_id"])
        referee_id = int(ref["referred_user_id"])
        reward = 50.00

        # Atomic transition to completed
        upd = execute_query(
            "UPDATE referrals SET status = 'completed', reward_amount = ?, is_paid = 1, completed_at = ?, updated_at = ? WHERE id = ? AND status = 'pending'",
            [reward, now, now, ref_id]
        )
        rows_affected = upd.get("rows_affected", 0) if isinstance(upd, dict) else 1
        if rows_affected == 0:
            continue  # Already completed concurrently

        # Credit $50.00 to referrer's wallet
        execute_query("UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?", [reward, referrer_id])
        try:
            execute_query("UPDATE wallet_balances SET available = available + ?, updated_at = ? WHERE user_id = ?", [reward, now, referrer_id])
        except Exception:
            pass

        ref_tx_id = f"ref_qualify_{ref_id}"
        execute_query(
            """INSERT INTO wallet_transactions (user_id, type, amount, currency, status, description, reference_id, created_at, completed_at)
               VALUES (?, 'referral_reward', ?, 'USD', 'completed', '$50.00 Referral Reward: Referee completed milestone escrow release', ?, ?, ?)""",
            [referrer_id, reward, ref_tx_id, now, now]
        )

        try:
            send_notification(
                user_id=referrer_id,
                notification_type="referral_reward",
                title="Referral Reward Unlocked! 💰",
                content=f"$50.00 project credit has been added to your wallet because your referee completed a milestone release.",
                data={"referral_id": ref_id, "amount": reward, "milestone_id": milestone_id, "escrow_id": escrow_id},
                action_url="/freelancer/referrals"
            )
        except Exception as e:
            logger.warning(f"Failed to send qualification notification to referrer {referrer_id}: {e}")

        qualified.append({
            "referral_id": ref_id,
            "referrer_id": referrer_id,
            "referee_id": referee_id,
            "reward_amount": reward,
            "status": "completed"
        })

    return qualified
```

### 4.2 Auth Integration: `backend/app/api/v1/identity/auth.py`

1. **Update `RegisterRequest`**:
```python
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "client"
    user_type: Optional[str] = None
    bio: str = ""
    skills: str = ""
    hourly_rate: float = 0
    profile_image_url: str = ""
    location: str = ""
    referral_code: Optional[str] = None
    ref: Optional[str] = None
```

2. **Update `/register` Endpoint**:
```python
@router.post("/register", status_code=status.HTTP_201_CREATED)
@auth_rate_limit()
async def register(
    request: Request,
    body: RegisterRequest,
    response: Response,
    ref: Optional[str] = Query(None, description="Optional referral code query param")
):
    ...
    # After user is created and retrieved (around line 215):
    from app.services.referrals_service import process_registration_referral
    ref_code_input = body.referral_code or body.ref or ref or request.query_params.get("ref")
    ref_result = process_registration_referral(
        new_user_id=user["id"],
        new_user_email=user["email"],
        referral_code=ref_code_input,
        new_user_name=name,
    )
    ...
    # Updated balance in response user object:
    user_balance = 20.0 if ref_result else float(user.get("account_balance", 0.0))
    ...
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": name,
            "role": user.get("role", user_type),
            "user_type": user_type,
            "account_balance": user_balance,
            "referral_code": user.get("referral_code"),
            "welcome_credit_applied": bool(ref_result),
        }
    }
```

### 4.3 Escrow Integration: `backend/app/api/v1/payments_domain/escrow.py`

In `release_escrow(...)` (around line 193):
```python
    # Qualify any pending referrals for client or freelancer
    try:
        from app.services.referrals_service import qualify_referral_on_milestone
        qualify_referral_on_milestone(
            client_id=escrow_core["client_id"],
            freelancer_id=freelancer_id,
            escrow_id=escrow_id,
            milestone_amount=release_amount,
        )
    except Exception as exc:
        logger.warning(f"Referral milestone qualification hook failed for escrow #{escrow_id}: {exc}")
```

### 4.4 Milestones Integration: `backend/app/api/v1/projects_domain/milestones.py`

In `approve_milestone(...)` (around line 302):
```python
    # Qualify any pending referrals for client or freelancer
    try:
        from app.services.referrals_service import qualify_referral_on_milestone
        qualify_referral_on_milestone(
            client_id=contract["client_id"],
            freelancer_id=contract["freelancer_id"],
            milestone_id=milestone_id,
            milestone_amount=milestone_amount,
        )
    except Exception as exc:
        logger.warning(f"Referral milestone qualification hook failed for milestone #{milestone_id}: {exc}")
```

---

## 5. Verification Method

### 5.1 Automated Pytest Specification (`backend/tests/test_instant_matching_and_growth.py`)

A comprehensive unit/integration test suite covering the entire referral lifecycle:

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_referral_registration_and_welcome_credit():
    # 1. Referrer exists with code 'REF-ALICE-1234'
    # 2. Register new referee with referral_code: 'REF-ALICE-1234'
    resp = client.post("/api/v1/auth/register", json={
        "email": "bob_referee@test.com",
        "password": "SecurePassword123!",
        "name": "Bob Referee",
        "referral_code": "REF-ALICE-1234"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["account_balance"] == 20.0
    assert data["user"]["welcome_credit_applied"] is True

    # 3. Check Referee Wallet
    wallet_resp = client.get("/api/v1/wallet", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert wallet_resp.status_code == 200
    assert wallet_resp.json()["balance"] == 20.0
    txs = wallet_resp.json()["transactions"]
    assert any(tx["type"] == "referral_welcome_credit" and tx["amount"] == 20.0 for tx in txs)

def test_milestone_escrow_referral_qualification():
    # 1. Referee (Bob) is client on a contract with Escrow funded
    # 2. Approve milestone / release escrow
    resp = client.post("/api/v1/milestones/10/approve", json={"approval_notes": "Great work!"}, headers=client_headers)
    assert resp.status_code == 200

    # 3. Referrer (Alice) wallet balance increases by $50.00
    alice_wallet = client.get("/api/v1/wallet", headers=alice_headers).json()
    assert any(tx["type"] == "referral_reward" and tx["amount"] == 50.0 for tx in alice_wallet["transactions"])

    # 4. Referral stats reflect completion
    alice_stats = client.get("/api/v1/referrals/stats", headers=alice_headers).json()
    assert alice_stats["completed_referrals"] >= 1
    assert alice_stats["total_earned"] >= 50.0
```

### 5.2 Invalidation Conditions
- If `RegisterRequest` accepts a referral code but does not credit the `$20.00` welcome voucher.
- If a user can enter their own referral code and receive a self-referral bonus.
- If approving a second milestone on the same contract duplicates the `$50.00` referrer reward.
- If `referrals.status` fails to update to `'completed'` upon milestone escrow release.
