# @AI-HINT: Workroom router — Kanban board, file sharing, discussions for contract collaboration
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.services import workroom_service as ws

router = APIRouter()

UPLOAD_DIR = os.environ.get("WORKROOM_UPLOAD_DIR", "/tmp/workroom_files")


def _ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def _check_contract_access(contract_id: int, user_id: int):
    """Raise 403/404 if user is not a party to this contract."""
    parties = ws.get_contract_parties(contract_id)
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")
    if user_id not in (parties["client_id"], parties["freelancer_id"]):
        raise HTTPException(status_code=403, detail="Access denied to this contract")
    return parties


# ==================== Kanban Board ====================

@router.get("/contracts/{contract_id}/board")
async def get_board(contract_id: int, current_user=Depends(get_current_user)):
    _check_contract_access(contract_id, current_user.id)
    return ws.get_board_tasks(contract_id)


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    column: str = "todo"
    priority: str = "medium"
    assignee_id: Optional[int] = None
    due_date: Optional[str] = None
    labels: list[str] = []


@router.post("/contracts/{contract_id}/tasks", status_code=201)
async def create_task(contract_id: int, body: TaskCreate, current_user=Depends(get_current_user)):
    _check_contract_access(contract_id, current_user.id)
    now = datetime.now(timezone.utc).isoformat()
    order_index = ws.get_next_order_index(contract_id, body.column)
    labels_json = json.dumps(body.labels)
    task_id = ws.create_task(
        contract_id=contract_id,
        title=body.title,
        description=body.description,
        column=body.column,
        priority=body.priority,
        assignee_id=body.assignee_id,
        created_by=current_user.id,
        due_date=body.due_date,
        labels_json=labels_json,
        order_index=order_index,
        now=now,
    )
    ws.log_activity(contract_id, current_user.id, "task_created", "task", task_id,
                    f"Created task: {body.title}")
    return {"id": task_id, "message": "Task created"}


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[str] = None
    labels: Optional[list[str]] = None
    order_index: Optional[int] = None


@router.patch("/tasks/{task_id}")
async def update_task(task_id: int, body: TaskUpdate, current_user=Depends(get_current_user)):
    task_info = ws.get_task_info(task_id)
    if not task_info:
        raise HTTPException(status_code=404, detail="Task not found")
    _check_contract_access(task_info["contract_id"], current_user.id)

    now = datetime.now(timezone.utc).isoformat()
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return {"message": "No changes"}

    set_parts = []
    params = []
    field_map = {"column": "column_name"}
    for key, value in updates.items():
        db_key = field_map.get(key, key)
        if key == "labels":
            set_parts.append(f"{db_key} = ?")
            params.append(json.dumps(value))
        else:
            set_parts.append(f"{db_key} = ?")
            params.append(value)
    set_parts.append("updated_at = ?")
    params.append(now)
    params.append(task_id)

    ws.update_task_fields(task_id, ", ".join(set_parts), params)
    ws.log_activity(task_info["contract_id"], current_user.id, "task_updated", "task", task_id, "Updated task")
    return {"message": "Task updated"}


class MoveTask(BaseModel):
    column: str
    order_index: int = 0


@router.post("/tasks/{task_id}/move")
async def move_task(task_id: int, body: MoveTask, current_user=Depends(get_current_user)):
    task_info = ws.get_task_info(task_id)
    if not task_info:
        raise HTTPException(status_code=404, detail="Task not found")
    _check_contract_access(task_info["contract_id"], current_user.id)

    now = datetime.now(timezone.utc).isoformat()
    is_completed = 1 if body.column == "done" else 0
    completed_at = now if body.column == "done" else None
    ws.move_task(task_id, body.column, body.order_index, is_completed, completed_at, now)
    ws.log_activity(task_info["contract_id"], current_user.id, "task_moved", "task", task_id,
                    f"Moved task to {body.column}")
    return {"message": "Task moved"}


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: int, current_user=Depends(get_current_user)):
    task_info = ws.get_task_for_delete(task_id)
    if not task_info:
        raise HTTPException(status_code=404, detail="Task not found")
    _check_contract_access(task_info["contract_id"], current_user.id)
    ws.delete_task_and_comments(task_id)
    ws.log_activity(task_info["contract_id"], current_user.id, "task_deleted", "task", task_id,
                    f"Deleted task: {task_info['title']}")


# ==================== File Sharing ====================

@router.get("/contracts/{contract_id}/files")
async def get_files(contract_id: int, current_user=Depends(get_current_user)):
    _check_contract_access(contract_id, current_user.id)
    return ws.list_contract_files(contract_id)


@router.post("/contracts/{contract_id}/files", status_code=201)
async def upload_file(
    contract_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user=Depends(get_current_user),
):
    _check_contract_access(contract_id, current_user.id)
    _ensure_upload_dir()

    ext = os.path.splitext(file.filename or "")[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    now = datetime.now(timezone.utc).isoformat()
    ws.insert_file_record(
        contract_id=contract_id,
        uploaded_by=current_user.id,
        unique_filename=unique_filename,
        original_name=file.filename or unique_filename,
        file_path=file_path,
        file_size=file_size,
        content_type=file.content_type or "application/octet-stream",
        description=description,
        now=now,
    )
    ws.log_activity(contract_id, current_user.id, "file_uploaded", "file", None,
                    f"Uploaded file: {file.filename}")
    return {"message": "File uploaded", "filename": unique_filename, "size": file_size}


@router.get("/files/{file_id}/download")
async def download_file(file_id: int, current_user=Depends(get_current_user)):
    file_info = ws.get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    _check_contract_access(file_info["contract_id"], current_user.id)
    ws.increment_download_count(file_id)
    return {
        "file_path": file_info["file_path"],
        "original_name": file_info["original_name"],
        "message": "File info retrieved"
    }


@router.delete("/files/{file_id}", status_code=204)
async def delete_file(file_id: int, current_user=Depends(get_current_user)):
    file_info = ws.get_file_for_delete(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    _check_contract_access(file_info["contract_id"], current_user.id)
    if file_info["uploaded_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can delete this file")

    if os.path.exists(file_info["file_path"]):
        os.remove(file_info["file_path"])
    ws.delete_file_record(file_id)
    ws.log_activity(file_info["contract_id"], current_user.id, "file_deleted", "file", file_id,
                    f"Deleted file: {file_info['original_name']}")


# ==================== Discussions ====================

@router.get("/contracts/{contract_id}/discussions")
async def get_discussions(
    contract_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _check_contract_access(contract_id, current_user.id)
    skip = (page - 1) * page_size
    return ws.list_contract_discussions(contract_id, limit=page_size, skip=skip)


class DiscussionCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False


@router.post("/contracts/{contract_id}/discussions", status_code=201)
async def create_discussion(
    contract_id: int, body: DiscussionCreate, current_user=Depends(get_current_user)
):
    _check_contract_access(contract_id, current_user.id)
    now = datetime.now(timezone.utc).isoformat()
    ws.create_discussion_record(
        contract_id=contract_id,
        user_id=current_user.id,
        title=body.title,
        content=body.content,
        is_pinned=body.is_pinned,
        now=now,
    )
    ws.log_activity(contract_id, current_user.id, "discussion_created", "discussion", None,
                    f"Started discussion: {body.title}")
    return {"message": "Discussion created"}


@router.get("/discussions/{discussion_id}")
async def get_discussion(discussion_id: int, current_user=Depends(get_current_user)):
    discussion = ws.get_discussion_detail(discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    _check_contract_access(discussion["contract_id"], current_user.id)
    replies = ws.get_discussion_replies(discussion_id)
    discussion["replies"] = replies
    return discussion


class ReplyCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


@router.post("/discussions/{discussion_id}/replies", status_code=201)
async def add_reply(
    discussion_id: int, body: ReplyCreate, current_user=Depends(get_current_user)
):
    contract_id = ws.get_discussion_contract_id(discussion_id)
    if not contract_id:
        raise HTTPException(status_code=404, detail="Discussion not found")
    _check_contract_access(contract_id, current_user.id)
    now = datetime.now(timezone.utc).isoformat()
    ws.create_reply_record(
        discussion_id=discussion_id,
        user_id=current_user.id,
        parent_id=body.parent_id,
        content=body.content,
        now=now,
    )
    ws.log_activity(contract_id, current_user.id, "reply_added", "discussion", discussion_id,
                    "Added a reply")
    return {"message": "Reply added"}


# ==================== Activity & Summary ====================

@router.get("/contracts/{contract_id}/activity")
async def get_activity(
    contract_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _check_contract_access(contract_id, current_user.id)
    skip = (page - 1) * page_size
    return ws.get_activity_feed(contract_id, limit=page_size, skip=skip)


@router.get("/contracts/{contract_id}/summary")
async def get_summary(contract_id: int, current_user=Depends(get_current_user)):
    _check_contract_access(contract_id, current_user.id)
    return ws.get_workroom_summary_data(contract_id)
