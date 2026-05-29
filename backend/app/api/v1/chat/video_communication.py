# @AI-HINT: Video communication router — video call management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class VideoCallCreate(BaseModel):
    title: str
    participants: list[int]
    scheduled_at: Optional[str] = None
    duration_minutes: int = 30

class VideoCallUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def list_video_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT vc.id, vc.title, vc.host_id, vc.status, vc.scheduled_at, vc.duration_minutes,
                  vc.room_url, vc.notes, vc.created_at, vc.updated_at
           FROM video_calls vc
           WHERE vc.host_id = ? OR vc.id IN (
               SELECT call_id FROM video_call_participants WHERE user_id = ?
           )
           ORDER BY vc.scheduled_at DESC
           LIMIT ? OFFSET ?""",
        [current_user.id, current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/")
async def create_video_call(request: VideoCallCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    room_id = secrets.token_urlsafe(16)
    room_url = f"https://meet.megilance.com/{room_id}"

    result = execute_query(
        "INSERT INTO video_calls (host_id, title, status, scheduled_at, duration_minutes, room_url, created_at, updated_at) VALUES (?, ?, 'scheduled', ?, ?, ?, ?, ?)",
        [current_user.id, request.title, request.scheduled_at, request.duration_minutes, room_url, now, now],
    )
    call_id = result.get("last_insert_rowid")

    for participant_id in request.participants:
        execute_query(
            "INSERT INTO video_call_participants (call_id, user_id, status) VALUES (?, ?, 'invited')",
            [call_id, participant_id],
        )

    return {"message": "Video call created", "call_id": call_id, "room_url": room_url}


@router.get("/{call_id}")
async def get_video_call(call_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, host_id, title, status, scheduled_at, duration_minutes, room_url, notes, created_at, updated_at FROM video_calls WHERE id = ?",
        [call_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Video call not found")

    participants = execute_query(
        "SELECT vcp.user_id, u.name, u.profile_image_url, vcp.status FROM video_call_participants vcp LEFT JOIN users u ON vcp.user_id = u.id WHERE vcp.call_id = ?",
        [call_id],
    )
    rows[0]["participants"] = parse_rows(participants) or []
    return rows[0]


@router.put("/{call_id}")
async def update_video_call(call_id: int, request: VideoCallUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), call_id]

    execute_query(f"UPDATE video_calls SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Video call updated"}


@router.post("/{call_id}/join")
async def join_video_call(call_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, host_id, room_url, status FROM video_calls WHERE id = ?",
        [call_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Video call not found")

    call = rows[0]

    # Check if user is a participant (host or invited)
    is_host = call["host_id"] == current_user.id
    if not is_host:
        participant_result = execute_query(
            "SELECT id FROM video_call_participants WHERE call_id = ? AND user_id = ?",
            [call_id, current_user.id],
        )
        if not participant_result or not participant_result.get("rows"):
            raise HTTPException(status_code=403, detail="You are not invited to this video call")

    execute_query(
        "UPDATE video_call_participants SET status = 'joined' WHERE call_id = ? AND user_id = ?",
        [call_id, current_user.id],
    )
    return {"room_url": call["room_url"], "status": call["status"]}


@router.post("/{call_id}/end")
async def end_video_call(call_id: int, current_user=Depends(get_current_user)):
    # Only the host can end a video call
    result = execute_query(
        "SELECT id, host_id FROM video_calls WHERE id = ?",
        [call_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Video call not found")

    if rows[0]["host_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can end a video call")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE video_calls SET status = 'ended', updated_at = ? WHERE id = ?",
        [now, call_id],
    )
    return {"message": "Video call ended"}
