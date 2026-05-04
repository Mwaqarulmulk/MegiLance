# @AI-HINT: Service layer for file upload database operations
# Handles all DB queries related to user avatars, portfolio images, and documents

from app.db.turso_http import execute_query, to_str
from datetime import datetime, timezone
from typing import Optional


def get_user_avatar_url(user_id) -> Optional[str]:
    """Fetch the current profile image URL for a user."""
    result = execute_query(
        "SELECT profile_image_url FROM users WHERE id = ?",
        [user_id]
    )
    if result and result.get("rows"):
        return to_str(result["rows"][0][0])
    return None


def update_user_avatar(user_id, relative_path: str) -> None:
    """Update the user's profile image URL in the database."""
    execute_query(
        "UPDATE users SET profile_image_url = ?, updated_at = ? WHERE id = ?",
        [relative_path, datetime.now(timezone.utc).isoformat(), user_id]
    )


def clear_user_avatar(user_id) -> None:
    """Remove the user's profile image reference from the database."""
    execute_query(
        "UPDATE users SET profile_image_url = NULL, updated_at = ? WHERE id = ?",
        [datetime.now(timezone.utc).isoformat(), user_id]
    )
