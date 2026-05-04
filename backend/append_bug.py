import os

file_path = "E:/MegiLance/backend/app/api/v1/core_domain/support_tickets.py"
with open(file_path, "a") as f:
    f.write("""

@router.post("/auto-detect-bug")
def auto_report_bug(
    bug_data: dict,
    current_user: User = Depends(get_current_active_user)
):
    \"\"\"Auto-report bugs caught from frontend telemetry (user submit + auto).\"\"\"
    try:
        from app.db.turso_http import get_turso_http
        turso = get_turso_http()
        subject = f"AUTO-DETECT: {bug_data.get('error_type', 'Unknown')}"[:200]
        desc = f"Path: {bug_data.get('path', 'Unknown')}\\nMsg: {bug_data.get('message', 'No details')}\\nStack: {bug_data.get('stack', '')}"[:2000]
        
        turso.execute(
            \"\"\"INSERT INTO support_tickets 
               (user_id, subject, description, category, priority, status, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))\"\"\",
            [current_user.id, subject, desc, "auto_detect", "high", "open"]
        )
        return {"status": "Bug logged successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to write bug report")
""")
print("Successfully appended!")
