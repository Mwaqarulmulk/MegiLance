# @AI-HINT: Video calls router — video communication management
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


class VideoCallCreate(BaseModel):
    participant_ids: list[int]
    call_type: str = "one_on_one"
    scheduled_at: Optional[str] = None
    enable_recording: bool = False


@router.post("/calls")
async def create_video_call(request: VideoCallCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    room_id = f"room-{secrets.token_hex(8)}"

    participant_ids = [p for p in request.participant_ids if p > 0]
    if current_user.id not in participant_ids:
        participant_ids.insert(0, current_user.id)

    result = execute_query(
        "INSERT INTO video_calls (creator_id, room_id, call_type, scheduled_at, enable_recording, status, created_at) VALUES (?, ?, ?, ?, ?, 'waiting', ?)",
        [current_user.id, room_id, request.call_type, request.scheduled_at, 1 if request.enable_recording else 0, now],
    )
    call_id = result.get("last_insert_rowid")

    for pid in participant_ids:
        execute_query(
            "INSERT INTO video_call_participants (call_id, user_id, status) VALUES (?, ?, 'invited')",
            [call_id, pid],
        )

    return {"message": "Video call created", "call_id": call_id, "room_id": room_id, "room_url": f"/video-calls/{room_id}"}


@router.get("/calls")
async def get_video_calls(
    limit: int = Query(50, ge=1, le=100),
    room_id: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    if room_id:
        result = execute_query(
            "SELECT id, creator_id, room_id, call_type, status, started_at, ended_at, created_at FROM video_calls WHERE room_id = ?",
            [room_id],
        )
        rows = parse_rows(result)
        return {"items": rows if rows else [], "total": len(rows) if rows else 0}

    result = execute_query(
        """SELECT vc.id, vc.room_id, vc.call_type, vc.status, vc.started_at, vc.ended_at, vc.created_at,
                  u.name as creator_name
           FROM video_calls vc
           JOIN video_call_participants vcp ON vc.id = vcp.call_id
           LEFT JOIN users u ON vc.creator_id = u.id
           WHERE vcp.user_id = ?
           ORDER BY vc.created_at DESC
           LIMIT ?""",
        [current_user.id, limit],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/calls/{call_id}/join")
async def join_video_call(call_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE video_call_participants SET status = 'joined', joined_at = ? WHERE call_id = ? AND user_id = ?",
        [now, call_id, current_user.id],
    )
    execute_query(
        "UPDATE video_calls SET status = 'active', started_at = ? WHERE id = ? AND status = 'waiting'",
        [now, call_id],
    )

    result = execute_query("SELECT room_id FROM video_calls WHERE id = ?", [call_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Call not found")

    return {"message": "Joined call", "room_id": rows[0]["room_id"]}


@router.post("/calls/{call_id}/end")
async def end_video_call(call_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE video_calls SET status = 'ended', ended_at = ? WHERE id = ? AND creator_id = ?",
        [now, call_id, current_user.id],
    )
    return {"message": "Call ended"}


@router.get("/calls/{call_id}")
async def get_video_call(call_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, room_id, call_type, status, started_at, ended_at, enable_recording, created_at FROM video_calls WHERE id = ?",
        [call_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Call not found")
    return rows[0]
