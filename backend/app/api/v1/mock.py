from fastapi import APIRouter, HTTPException
from app.core.json_loader import read_json


router = APIRouter()


@router.get("/dashboard")
def get_dashboard() -> dict:
    try:
        return read_json("dashboard.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="dashboard.json not found")


@router.get("/messages")
def get_messages() -> list[dict]:
    try:
        return read_json("messages.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="messages.json not found")


@router.get("/projects")
def get_projects() -> list[dict]:
    try:
        return read_json("projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="projects.json not found")


@router.get("/payments")
def get_payments() -> dict:
    try:
        return read_json("payments.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="payments.json not found")


@router.get("/user")
def get_user() -> dict:
    try:
        return read_json("user.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="user.json not found")


@router.get("/admin/dashboard")
def admin_dashboard() -> dict:
    try:
        return read_json("admin_dashboard.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_dashboard.json not found")


@router.get("/admin/users")
def admin_users() -> list[dict]:
    try:
        return read_json("users.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="users.json not found")


@router.get("/admin/projects")
def admin_projects() -> list[dict]:
    try:
        return read_json("admin_projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_projects.json not found")


@router.get("/admin/payments")
def admin_payments() -> dict:
    try:
        return read_json("admin_payments.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_payments.json not found")


@router.get("/admin/support")
def admin_support() -> dict:
    try:
        return read_json("admin_support_tickets.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_support_tickets.json not found")


@router.get("/admin/ai-monitoring")
def admin_ai_monitoring() -> dict:
    try:
        return read_json("admin_ai_monitoring.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_ai_monitoring.json not found")


@router.get("/admin/settings")
def admin_settings() -> dict:
    try:
        return read_json("admin_settings.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_settings.json not found")
