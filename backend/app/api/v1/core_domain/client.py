# @AI-HINT: Client domain router — client-specific endpoints
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS client_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            freelancer_id INTEGER NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(client_id, freelancer_id)
        )
    """, [])


_ensure_table()


class FavoriteCreate(BaseModel):
    freelancer_id: int
    notes: Optional[str] = None


# ── 1. Dashboard ──────────────────────────────────────────────────────────────

@router.get("/dashboard")
def get_client_dashboard(current_user=Depends(get_current_user)):
    active_projects = parse_rows(execute_query(
        "SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = 'open'",
        [current_user.id],
    ))
    active_contracts = parse_rows(execute_query(
        "SELECT COUNT(*) as count FROM contracts WHERE client_id = ? AND status = 'active'",
        [current_user.id],
    ))
    pending_proposals = parse_rows(execute_query(
        "SELECT COUNT(*) as count FROM proposals pr JOIN projects p ON pr.project_id = p.id WHERE p.client_id = ? AND pr.status = 'submitted'",
        [current_user.id],
    ))
    total_spent = parse_rows(execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ? AND p.status = 'completed'",
        [current_user.id],
    ))
    balance = parse_rows(execute_query(
        "SELECT account_balance FROM users WHERE id = ?",
        [current_user.id],
    ))
    recent_proposals = parse_rows(execute_query(
        """SELECT pr.id, pr.bid_amount, pr.status, pr.created_at,
                  u.name as freelancer_name, u.profile_image_url, p.title as project_title
           FROM proposals pr
           JOIN projects p ON pr.project_id = p.id
           LEFT JOIN users u ON pr.freelancer_id = u.id
           WHERE p.client_id = ? AND pr.status = 'submitted'
           ORDER BY pr.created_at DESC LIMIT 5""",
        [current_user.id],
    ))

    return {
        "active_projects": active_projects[0]["count"] if active_projects else 0,
        "active_contracts": active_contracts[0]["count"] if active_contracts else 0,
        "pending_proposals": pending_proposals[0]["count"] if pending_proposals else 0,
        "total_spent": total_spent[0]["total"] if total_spent else 0,
        "account_balance": balance[0]["account_balance"] if balance else 0,
        "recent_proposals": recent_proposals if recent_proposals else [],
    }


# ── 2. Projects list ──────────────────────────────────────────────────────────

@router.get("/projects")
def get_client_projects(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    where = "WHERE p.client_id = ?"
    params: list = [current_user.id]

    if status_filter:
        where += " AND p.status = ?"
        params.append(status_filter)

    count_result = parse_rows(execute_query(
        f"SELECT COUNT(*) as count FROM projects p {where}",
        params,
    ))
    total = count_result[0]["count"] if count_result else 0

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = parse_rows(execute_query(
        f"""SELECT p.id, p.title, p.description, p.category, p.budget_type,
                   p.budget_min, p.budget_max, p.status, p.proposals_count,
                   p.views_count, p.created_at,
                   (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = p.id AND pr.status = 'submitted') as open_proposals,
                   (SELECT COUNT(*) FROM contracts c WHERE c.project_id = p.id AND c.status = 'active') as active_contracts
            FROM projects p
            {where}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    ))

    return {
        "items": result if result else [],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ── 3. Hiring pipeline ───────────────────────────────────────────────────────

@router.get("/hiring")
def get_client_hiring(current_user=Depends(get_current_user)):
    proposals_received = parse_rows(execute_query(
        """SELECT pr.id, pr.bid_amount, pr.delivery_time, pr.status, pr.created_at,
                  u.name as freelancer_name, u.profile_image_url, u.seller_level,
                  p.title as project_title, p.id as project_id
           FROM proposals pr
           JOIN projects p ON pr.project_id = p.id
           LEFT JOIN users u ON pr.freelancer_id = u.id
           WHERE p.client_id = ? AND pr.status IN ('submitted', 'accepted')
           ORDER BY pr.created_at DESC""",
        [current_user.id],
    ))
    interviews = parse_rows(execute_query(
        """SELECT iv.id, iv.scheduled_at, iv.status, iv.notes,
                  u.name as freelancer_name, u.profile_image_url,
                  p.title as project_title
           FROM interviews iv
           JOIN contracts c ON iv.contract_id = c.id
           JOIN projects p ON c.project_id = p.id
           LEFT JOIN users u ON c.freelancer_id = u.id
           WHERE c.client_id = ? AND iv.status IN ('scheduled', 'completed')
           ORDER BY iv.scheduled_at DESC""",
        [current_user.id],
    ))
    active_contracts = parse_rows(execute_query(
        """SELECT c.id, c.amount, c.status, c.start_date,
                  u.name as freelancer_name, u.profile_image_url,
                  p.title as project_title
           FROM contracts c
           JOIN projects p ON c.project_id = p.id
           LEFT JOIN users u ON c.freelancer_id = u.id
           WHERE c.client_id = ? AND c.status = 'active'
           ORDER BY c.start_date DESC""",
        [current_user.id],
    ))

    return {
        "proposals_received": proposals_received if proposals_received else [],
        "interviews": interviews if interviews else [],
        "active_contracts": active_contracts if active_contracts else [],
        "summary": {
            "total_proposals": len(proposals_received) if proposals_received else 0,
            "total_interviews": len(interviews) if interviews else 0,
            "total_active": len(active_contracts) if active_contracts else 0,
        },
    }


# ── 4. Spending analytics ─────────────────────────────────────────────────────

@router.get("/spending")
def get_client_spending(
    months: int = Query(6, ge=1, le=24),
    current_user=Depends(get_current_user),
):
    monthly_spending = []
    for i in range(months - 1, -1, -1):
        month_start = (datetime.now(timezone.utc) - timedelta(days=30 * i)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        month_end = (month_start + timedelta(days=32)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        result = parse_rows(execute_query(
            """SELECT COALESCE(SUM(p.amount), 0) as total
               FROM payments p
               JOIN contracts c ON p.contract_id = c.id
               WHERE c.client_id = ? AND p.status = 'completed'
                 AND p.created_at >= ? AND p.created_at < ?""",
            [current_user.id, month_start.isoformat(), month_end.isoformat()],
        ))
        total = result[0]["total"] if result else 0
        monthly_spending.append({
            "month": month_start.strftime("%b %Y"),
            "amount": total,
        })

    category_spending = parse_rows(execute_query(
        """SELECT p.category,
                  COALESCE(SUM(pm.amount), 0) as total
           FROM projects p
           JOIN contracts c ON c.project_id = p.id
           JOIN payments pm ON pm.contract_id = c.id
           WHERE p.client_id = ? AND pm.status = 'completed'
           GROUP BY p.category
           ORDER BY total DESC""",
        [current_user.id],
    ))

    total_spent = parse_rows(execute_query(
        "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN contracts c ON p.contract_id = c.id WHERE c.client_id = ? AND p.status = 'completed'",
        [current_user.id],
    ))

    return {
        "monthly": monthly_spending,
        "by_category": category_spending if category_spending else [],
        "total_spent": total_spent[0]["total"] if total_spent else 0,
    }


# ── 5. Favorites list ─────────────────────────────────────────────────────────

@router.get("/favorites")
def get_client_favorites(current_user=Depends(get_current_user)):
    result = parse_rows(execute_query(
        """SELECT cf.id, cf.freelancer_id, cf.notes, cf.created_at,
                  u.name as freelancer_name, u.profile_image_url, u.tagline,
                  u.hourly_rate, u.seller_level, u.skills,
                  (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.reviewee_id = u.id) as avg_rating,
                  (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = u.id) as review_count
           FROM client_favorites cf
           LEFT JOIN users u ON cf.freelancer_id = u.id
           WHERE cf.client_id = ?
           ORDER BY cf.created_at DESC""",
        [current_user.id],
    ))
    return {"items": result if result else []}


# ── 6. Add favorite ───────────────────────────────────────────────────────────

@router.post("/favorites")
def add_favorite(request: FavoriteCreate, current_user=Depends(get_current_user)):
    existing = parse_rows(execute_query(
        "SELECT id FROM users WHERE id = ?",
        [request.freelancer_id],
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Freelancer not found")

    duplicate = parse_rows(execute_query(
        "SELECT id FROM client_favorites WHERE client_id = ? AND freelancer_id = ?",
        [current_user.id, request.freelancer_id],
    ))
    if duplicate:
        raise HTTPException(status_code=409, detail="Freelancer already in favorites")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO client_favorites (client_id, freelancer_id, notes, created_at) VALUES (?, ?, ?, ?)",
        [current_user.id, request.freelancer_id, request.notes or "", now],
    )

    logger.info(f"Favorite added client={current_user.id} freelancer={request.freelancer_id}")
    return {"message": "Freelancer added to favorites", "id": result.get("last_insert_rowid")}


# ── 7. Remove favorite ────────────────────────────────────────────────────────

@router.delete("/favorites/{freelancer_id}")
def remove_favorite(freelancer_id: int, current_user=Depends(get_current_user)):
    existing = parse_rows(execute_query(
        "SELECT id FROM client_favorites WHERE client_id = ? AND freelancer_id = ?",
        [current_user.id, freelancer_id],
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Favorite not found")

    execute_query(
        "DELETE FROM client_favorites WHERE client_id = ? AND freelancer_id = ?",
        [current_user.id, freelancer_id],
    )

    return {"message": "Freelancer removed from favorites"}


# ── 8. Recommendations ────────────────────────────────────────────────────────

@router.get("/recommendations")
def get_client_recommendations(
    category: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    project_skills = parse_rows(execute_query(
        "SELECT skills FROM projects WHERE client_id = ? ORDER BY created_at DESC LIMIT 3",
        [current_user.id],
    ))
    skill_keywords = []
    for row in project_skills:
        if row.get("skills"):
            for s in row["skills"].split(","):
                s = s.strip()
                if s:
                    skill_keywords.append(s)

    existing_fav = parse_rows(execute_query(
        "SELECT freelancer_id FROM client_favorites WHERE client_id = ?",
        [current_user.id],
    ))
    fav_ids = [f["freelancer_id"] for f in existing_fav] if existing_fav else []
    fav_placeholders = ",".join("?" * max(len(fav_ids), 1)) if fav_ids else "0"

    if category:
        where_extra = f"AND (u.skills LIKE ? OR u.industry_focus LIKE ?)"
        params_extra = [f"%{category}%", f"%{category}%"]
    else:
        where_extra = ""
        params_extra = []

    fav_filter = f"AND u.id NOT IN ({fav_placeholders})" if fav_ids else ""

    result = parse_rows(execute_query(
        f"""SELECT u.id, u.name, u.profile_image_url, u.tagline, u.hourly_rate,
                   u.seller_level, u.skills, u.experience_level, u.location,
                   (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.reviewee_id = u.id) as avg_rating,
                   (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = u.id) as review_count,
                   (SELECT COUNT(*) FROM contracts c WHERE c.freelancer_id = u.id AND c.status = 'completed') as completed_projects
            FROM users u
            WHERE u.user_type = 'freelancer' AND u.is_active = 1
            {fav_filter}
            {where_extra}
            ORDER BY avg_rating DESC, completed_projects DESC
            LIMIT ?""",
        fav_ids + params_extra + [limit],
    ))

    scored = []
    for r in (result or []):
        score = (r.get("avg_rating") or 0) * 20
        score += min((r.get("completed_projects") or 0) * 3, 30)
        level = r.get("seller_level") or "new_seller"
        level_bonus = {"platinum": 15, "gold": 12, "silver": 8, "bronze": 5}.get(level, 0)
        score += level_bonus
        r["match_score"] = round(score, 1)
        scored.append(r)

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {"recommendations": scored[:limit]}


# ── 9. Activity feed ──────────────────────────────────────────────────────────

@router.get("/activity")
def get_client_activity(
    type_filter: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    where = "WHERE af.user_id = ?"
    params: list = [current_user.id]

    if type_filter:
        where += " AND af.type = ?"
        params.append(type_filter)

    params.append(limit)

    result = parse_rows(execute_query(
        f"""SELECT af.id, af.type, af.title, af.message, af.link, af.is_read, af.created_at
           FROM activity_feed af
           {where}
           ORDER BY af.created_at DESC
           LIMIT ?""",
        params,
    ))

    return {"items": result if result else []}
