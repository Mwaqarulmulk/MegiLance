# @AI-HINT: Email verification service for generating tokens, sending verification emails, and validating user emails
# Handles email verification token generation, expiry checking, rate limiting, and verification workflow

import secrets
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import logging

from app.db.turso_http import execute_query, parse_rows
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

_MAX_RESENDS_PER_HOUR = 3
_RESEND_TRACKER: Dict[int, list] = {}


class EmailVerificationService:
    """Service for handling email verification operations with expiry, rate limiting, and consistency checks."""

    def __init__(self):
        self.token_expiry_hours = 24

    def generate_verification_token(self) -> str:
        return secrets.token_urlsafe(32)

    async def create_verification_token(self, user_id: int) -> str:
        token = self.generate_verification_token()
        now_utc = datetime.now(timezone.utc).isoformat()
        execute_query(
            "UPDATE users SET email_verification_token = ?, email_verification_expires = ?, email_verified = 0 WHERE id = ?",
            [token, now_utc, user_id],
        )
        return token

    async def verify_email(self, token: str) -> Optional[Dict[str, Any]]:
        result = execute_query(
            "SELECT id, email, name, email_verification_expires FROM users WHERE email_verification_token = ?",
            [token],
        )
        rows = parse_rows(result)
        if not rows:
            return None

        user = rows[0]

        expires_str = user.get("email_verification_expires")
        if expires_str:
            try:
                expires_dt = datetime.fromisoformat(expires_str)
                if expires_dt.tzinfo is None:
                    expires_dt = expires_dt.replace(tzinfo=timezone.utc)
                expiry_limit = expires_dt + timedelta(hours=self.token_expiry_hours)
                if datetime.now(timezone.utc) > expiry_limit:
                    execute_query(
                        "UPDATE users SET email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?",
                        [user["id"]],
                    )
                    logger.info("Verification token expired for user %s", user["id"])
                    return None
            except (ValueError, TypeError):
                pass

        execute_query(
            "UPDATE users SET email_verified = 1, is_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?",
            [user["id"]],
        )
        return user

    async def resend_verification_email(self, user_id: int) -> str:
        can, remaining = self._check_resend_limit(user_id)
        if not can:
            raise ValueError(
                f"Rate limit exceeded: max {_MAX_RESENDS_PER_HOUR} resends per hour. "
                f"Try again in {remaining} seconds."
            )

        token = await self.create_verification_token(user_id)
        self._record_resend(user_id)

        result = execute_query("SELECT email, name FROM users WHERE id = ?", [user_id])
        rows = parse_rows(result)
        if rows:
            user = rows[0]
            email_service.send_verification_email(
                to_email=user["email"],
                user_name=user["name"],
                verification_token=token,
            )

        return token

    async def send_verification_on_register(self, user_id: int, email: str, name: str) -> str:
        token = await self.create_verification_token(user_id)
        email_service.send_verification_email(
            to_email=email,
            user_name=name,
            verification_token=token,
        )
        logger.info("Verification email sent on registration for user %d", user_id)
        return token

    def _check_resend_limit(self, user_id: int) -> tuple:
        now = time.time()
        attempts = _RESEND_TRACKER.get(user_id, [])
        attempts = [t for t in attempts if now - t < 3600]
        _RESEND_TRACKER[user_id] = attempts

        if len(attempts) >= _MAX_RESENDS_PER_HOUR:
            oldest = attempts[0]
            remaining = int(3600 - (now - oldest))
            return False, max(remaining, 0)

        return True, 0

    def _record_resend(self, user_id: int) -> None:
        now = time.time()
        if user_id not in _RESEND_TRACKER:
            _RESEND_TRACKER[user_id] = []
        _RESEND_TRACKER[user_id] = [t for t in _RESEND_TRACKER[user_id] if now - t < 3600]
        _RESEND_TRACKER[user_id].append(now)

    async def get_verification_status(self, user_id: int) -> Dict[str, Any]:
        result = execute_query(
            "SELECT email_verified, is_verified, email_verification_token, email_verification_expires FROM users WHERE id = ?",
            [user_id],
        )
        rows = parse_rows(result)
        if not rows:
            return {
                "is_verified": False,
                "has_pending_token": False,
                "token_age_minutes": None,
                "can_resend": False,
                "resend_cooldown_seconds": 0,
            }

        user = rows[0]
        is_verified = bool(user.get("email_verified") or user.get("is_verified"))
        has_token = bool(user.get("email_verification_token"))

        token_age_minutes = None
        can_resend = False
        cooldown = 0

        if has_token:
            expires_str = user.get("email_verification_expires")
            if expires_str:
                try:
                    created_dt = datetime.fromisoformat(expires_str)
                    if created_dt.tzinfo is None:
                        created_dt = created_dt.replace(tzinfo=timezone.utc)
                    token_age_minutes = int((datetime.now(timezone.utc) - created_dt).total_seconds() / 60)
                except (ValueError, TypeError):
                    pass

            can, remaining = self._check_resend_limit(user_id)
            can_resend = can
            cooldown = remaining

        return {
            "is_verified": is_verified,
            "has_pending_token": has_token,
            "token_age_minutes": token_age_minutes,
            "can_resend": can_resend,
            "resend_cooldown_seconds": cooldown,
        }

    async def is_token_valid(self, user_id: int) -> bool:
        result = execute_query(
            "SELECT email_verification_token, email_verification_expires FROM users WHERE id = ?",
            [user_id],
        )
        rows = parse_rows(result)
        if not rows:
            return False
        user = rows[0]
        token = user.get("email_verification_token")
        if not token:
            return False

        expires_str = user.get("email_verification_expires")
        if expires_str:
            try:
                created_dt = datetime.fromisoformat(expires_str)
                if created_dt.tzinfo is None:
                    created_dt = created_dt.replace(tzinfo=timezone.utc)
                expiry_limit = created_dt + timedelta(hours=self.token_expiry_hours)
                if datetime.now(timezone.utc) > expiry_limit:
                    return False
            except (ValueError, TypeError):
                pass

        return True

    async def ensure_consistency(self, user_id: int) -> Dict[str, Any]:
        result = execute_query(
            "SELECT email_verified, is_verified FROM users WHERE id = ?",
            [user_id],
        )
        rows = parse_rows(result)
        if not rows:
            return {"user_id": user_id, "consistent": False, "error": "User not found"}

        user = rows[0]
        email_verified = bool(user.get("email_verified"))
        is_verified = bool(user.get("is_verified"))

        if email_verified != is_verified:
            resolved = email_verified
            execute_query(
                "UPDATE users SET is_verified = ? WHERE id = ?",
                [1 if resolved else 0, user_id],
            )
            logger.info(
                "Consistency fix: user %d email_verified=%s, is_verified=%s -> set both to %s",
                user_id, email_verified, is_verified, resolved,
            )
            return {
                "user_id": user_id,
                "consistent": False,
                "was_inconsistent": True,
                "email_verified": resolved,
                "is_verified": resolved,
                "fixed": True,
            }

        return {
            "user_id": user_id,
            "consistent": True,
            "was_inconsistent": False,
            "email_verified": email_verified,
            "is_verified": is_verified,
        }


email_verification_service = EmailVerificationService()
