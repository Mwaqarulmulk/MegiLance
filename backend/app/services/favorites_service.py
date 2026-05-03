# @AI-HINT: Favorites service layer - all database operations for favorites endpoints
from datetime import datetime, timezone
from typing import List, Optional

from app.db.turso_http import execute_query, parse_rows


def check_favorite_exists(user_id, target_type: str, target_id) -> bool:
    """Check if a favorite already exists."""
    result = execute_query(
        "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [user_id, target_type, target_id]
    )
    return bool(result and result.get("rows"))


def verify_target_exists(target_type: str, target_id) -> bool:
    """Verify that the target entity exists. Returns False if not found."""
    if target_type == "project":
        result = execute_query("SELECT id FROM projects WHERE id = ?", [target_id])
    elif target_type == "freelancer":
        result = execute_query(
            "SELECT id FROM users WHERE id = ? AND LOWER(user_type) = 'freelancer'",
            [target_id]
        )
    else:
        return False
    return bool(result and result.get("rows"))


def create_favorite(user_id, target_type: str, target_id) -> dict:
    """Create a new favorite entry. Returns the created favorite data. Raises RuntimeError on failure."""
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO favorites (user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?)",
        [user_id, target_type, target_id, now]
    )

    if not result:
        raise RuntimeError("Failed to create favorite")

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = 0
    if id_result and id_result.get("rows"):
        id_rows = parse_rows(id_result)
        if id_rows:
            new_id = id_rows[0].get("id", 0)

    return {
        "id": new_id,
        "user_id": user_id,
        "target_type": target_type,
        "target_id": target_id,
        "created_at": now
    }


def list_favorites(user_id, target_type: Optional[str] = None) -> List[dict]:
    """List user's favorites, optionally filtered by type."""
    if target_type:
        result = execute_query(
            """SELECT id, user_id, target_type, target_id, created_at
               FROM favorites WHERE user_id = ? AND target_type = ?
               ORDER BY created_at DESC""",
            [user_id, target_type]
        )
    else:
        result = execute_query(
            """SELECT id, user_id, target_type, target_id, created_at
               FROM favorites WHERE user_id = ?
               ORDER BY created_at DESC""",
            [user_id]
        )

    if not result:
        return []

    return parse_rows(result)


def get_favorite_by_id(favorite_id: int) -> Optional[dict]:
    """Get a favorite by its ID. Returns None if not found."""
    result = execute_query(
        "SELECT id, user_id, target_type, target_id FROM favorites WHERE id = ?",
        [favorite_id]
    )

    if not result or not result.get("rows"):
        return None

    rows = parse_rows(result)
    return rows[0] if rows else None


def delete_favorite_by_id(favorite_id: int) -> None:
    """Delete a favorite by its ID."""
    execute_query("DELETE FROM favorites WHERE id = ?", [favorite_id])


def find_favorite_by_target(user_id, target_type: str, target_id) -> bool:
    """Check if a favorite exists by user, type, and target ID."""
    result = execute_query(
        "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [user_id, target_type, target_id]
    )
    return bool(result and result.get("rows"))


def delete_favorite_by_target(user_id, target_type: str, target_id) -> None:
    """Delete a favorite by user, type, and target ID."""
    execute_query(
        "DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [user_id, target_type, target_id]
    )


def check_is_favorited(user_id, target_type: str, target_id) -> dict:
    """Check if an item is favorited and return status with favorite_id."""
    result = execute_query(
        "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [user_id, target_type, target_id]
    )

    is_favorited = bool(result and result.get("rows") and len(result["rows"]) > 0)
    favorite_id = None

    if is_favorited:
        rows = parse_rows(result)
        if rows:
            favorite_id = rows[0].get("id")

    return {
        "is_favorited": is_favorited,
        "favorite_id": favorite_id
    }
