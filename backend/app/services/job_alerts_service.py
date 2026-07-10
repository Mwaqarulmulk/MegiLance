# @AI-HINT: Service layer for job alerts - handles all DB operations for saved job alert subscriptions

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from app.db.turso_http import execute_query, parse_rows


def get_alerts_for_user(user_id: int) -> List[Dict[str, Any]]:
    """Get all job alerts for a user, ordered by creation date descending."""
    result = execute_query(
        "SELECT id, user_id, keywords, frequency, is_ai_powered, created_at, updated_at "
        "FROM job_alerts WHERE user_id = ? ORDER BY created_at DESC",
        [user_id]
    )
    alerts = []
    if result and result.get("rows"):
        for row in parse_rows(result):
            row["is_ai_powered"] = bool(row.get("is_ai_powered"))
            alerts.append(row)
    return alerts


def create_alert(user_id: int, keywords: str, frequency: str, is_ai_powered: bool) -> Optional[Dict[str, Any]]:
    """Create a new job alert. Returns the created alert dict or None on failure."""
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        """INSERT INTO job_alerts (user_id, keywords, frequency, is_ai_powered, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        [user_id, keywords, frequency, is_ai_powered, now, now]
    )

    if not result:
        return None

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = 0
    if id_result and id_result.get("rows"):
        id_rows = parse_rows(id_result)
        if id_rows:
            new_id = id_rows[0].get("id", 0)

    return {
        "id": new_id,
        "user_id": user_id,
        "keywords": keywords,
        "frequency": frequency,
        "is_ai_powered": is_ai_powered,
        "created_at": now,
        "updated_at": now,
    }


def get_alert_owner(alert_id: int) -> Optional[int]:
    """Get the owner user_id of a job alert. Returns None if not found."""
    result = execute_query("SELECT user_id FROM job_alerts WHERE id = ?", [alert_id])
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    return rows[0]["user_id"]


def delete_alert(alert_id: int) -> None:
    """Delete a job alert by ID."""
    execute_query("DELETE FROM job_alerts WHERE id = ?", [alert_id])


def get_alert_by_id(alert_id: int) -> Optional[Dict[str, Any]]:
    """Get a full job alert by ID. Returns None if not found."""
    result = execute_query("SELECT * FROM job_alerts WHERE id = ?", [alert_id])
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    alert = rows[0]
    alert["is_ai_powered"] = bool(alert.get("is_ai_powered"))
    return alert


def update_alert(
    alert_id: int,
    keywords: Optional[str] = None,
    frequency: Optional[str] = None,
    is_ai_powered: Optional[bool] = None,
) -> Optional[Dict[str, Any]]:
    """Update a job alert's fields and return the updated alert."""
    updates = []
    params = []
    now = datetime.now(timezone.utc).isoformat()

    if keywords is not None:
        updates.append("keywords = ?")
        params.append(keywords)

    if frequency is not None:
        updates.append("frequency = ?")
        params.append(frequency)

    if is_ai_powered is not None:
        updates.append("is_ai_powered = ?")
        params.append(is_ai_powered)

    updates.append("updated_at = ?")
    params.append(now)
    params.append(alert_id)

    execute_query(f"UPDATE job_alerts SET {', '.join(updates)} WHERE id = ?", params)

    return get_alert_by_id(alert_id)
