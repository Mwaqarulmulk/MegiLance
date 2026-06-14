# @AI-HINT: Client-specific service layer - all database operations for client dashboard endpoints
from datetime import datetime, timezone
from typing import List
import logging

from app.db.turso_http import execute_query, to_str, to_float, extract_value, parse_date, parse_rows

logger = logging.getLogger("megilance")


def get_client_projects(client_id) -> List[dict]:
    """Get client projects with transformed data structure for frontend."""
    result = execute_query(
        """SELECT id, title, status, budget_min, budget_max, created_at, updated_at
           FROM projects WHERE client_id = ?
           ORDER BY created_at DESC""",
        [client_id]
    )

    if not result or not result.get("rows"):
        return []

    transformed_projects = []
    for row in result["rows"]:
        project_id = extract_value(row[0])
        status_val = to_str(row[2])
        budget_min = to_float(row[3]) or 0
        budget_max = to_float(row[4]) or 0

        status_map = {
            "open": "Pending",
            "in_progress": "In Progress",
            "completed": "Completed",
            "cancelled": "Cancelled"
        }

        budget = budget_max or budget_min or 0
        updated_at = parse_date(row[6]) or parse_date(row[5])

        progress = _calculate_project_progress(project_id)
        paid = _calculate_project_paid(project_id)
        freelancers = _get_project_freelancers(project_id)

        transformed_project = {
            "id": f"PROJ-{project_id:03d}" if project_id else None,
            "title": to_str(row[1]),
            "status": status_map.get(status_val, "Pending"),
            "progress": progress,
            "budget": budget,
            "paid": paid,
            "freelancers": freelancers,
            "updatedAt": updated_at.isoformat() if updated_at else None
        }
        transformed_projects.append(transformed_project)

    return transformed_projects


def _calculate_project_progress(project_id) -> int:
    """Calculate project progress from milestones."""
    if not project_id:
        return 0
    contract_result = execute_query(
        "SELECT id FROM contracts WHERE project_id = ? LIMIT 1",
        [project_id]
    )
    if not contract_result or not contract_result.get("rows"):
        return 0
    contract_id = extract_value(contract_result["rows"][0][0])
    if not contract_id:
        return 0
    milestone_result = execute_query(
        """SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
           FROM milestones WHERE contract_id = ?""",
        [contract_id]
    )
    if not milestone_result or not milestone_result.get("rows"):
        return 0
    total_count = extract_value(milestone_result["rows"][0][0]) or 0
    completed_count = extract_value(milestone_result["rows"][0][1]) or 0
    if total_count and total_count > 0:
        return int((completed_count / total_count) * 100)
    return 0


def _calculate_project_paid(project_id) -> float:
    """Calculate total paid amount for a project."""
    if not project_id:
        return 0
    contract_result = execute_query(
        "SELECT id FROM contracts WHERE project_id = ? LIMIT 1",
        [project_id]
    )
    if not contract_result or not contract_result.get("rows"):
        return 0
    contract_id = extract_value(contract_result["rows"][0][0])
    if not contract_id:
        return 0
    payment_result = execute_query(
        """SELECT SUM(amount) FROM payments
           WHERE contract_id = ? AND status = 'completed'""",
        [contract_id]
    )
    if not payment_result or not payment_result.get("rows"):
        return 0
    paid_val = to_float(payment_result["rows"][0][0])
    if paid_val:
        return paid_val
    return 0


def _get_project_freelancers(project_id) -> List[dict]:
    """Get freelancers from accepted proposals for a project."""
    if not project_id:
        return []
    freelancer_result = execute_query(
        """SELECT DISTINCT u.id, u.name, u.profile_image_url
           FROM users u
           JOIN proposals p ON p.freelancer_id = u.id
           WHERE p.project_id = ? AND p.status = 'accepted'""",
        [project_id]
    )
    freelancers = []
    if freelancer_result and freelancer_result.get("rows"):
        for fl_row in freelancer_result["rows"]:
            fl_id = extract_value(fl_row[0])
            fl_name = to_str(fl_row[1])
            fl_image = to_str(fl_row[2])
            if fl_id:
                freelancers.append({
                    "id": fl_id,
                    "name": fl_name or "Unknown",
                    "avatar": fl_image
                })
    return freelancers


def get_client_payments(user_id) -> List[dict]:
    """Get client payments with transformed data structure for frontend."""
    result = execute_query(
        """SELECT p.id, p.to_user_id, p.from_user_id, p.amount, p.status, p.description, p.created_at,
                  proj.title as project_title,
                  u.name as freelancer_name,
                  u.profile_image_url as freelancer_avatar
           FROM payments p
           LEFT JOIN contracts c ON p.contract_id = c.id
           LEFT JOIN projects proj ON c.project_id = proj.id
           LEFT JOIN users u ON c.freelancer_id = u.id
           WHERE p.to_user_id = ? OR p.from_user_id = ?
           ORDER BY p.created_at DESC""",
        [user_id, user_id]
    )

    if not result or not result.get("rows"):
        return []

    transformed_payments = []
    for row in result["rows"]:
        payment_id = extract_value(row[0])
        to_user_id_val = extract_value(row[1])
        amount = to_float(row[3]) or 0
        status_val = to_str(row[4])

        payment_type = "Payment" if to_user_id_val == user_id else "Refund"
        created_at = parse_date(row[6])

        project_title = to_str(row[7]) or "Untitled Project"
        freelancer_name = to_str(row[8]) or "Unknown Freelancer"
        freelancer_avatar = to_str(row[9])

        transformed_payments.append({
            "id": str(payment_id) if payment_id else None,
            "date": created_at.isoformat() if created_at else None,
            "description": to_str(row[5]),
            "amount": str(amount),
            "status": status_val.capitalize() if status_val else "Pending",
            "type": payment_type,
            "project": project_title,
            "freelancer": freelancer_name,
            "freelancerAvatarUrl": freelancer_avatar
        })

    return transformed_payments


def get_client_freelancers(client_id) -> List[dict]:
    """Get freelancers that have worked with the client."""
    result = execute_query(
        """SELECT DISTINCT u.id, u.name, u.first_name, u.last_name, u.bio, u.hourly_rate, u.skills, u.profile_image_url, u.location
           FROM users u
           INNER JOIN contracts c ON c.freelancer_id = u.id
           WHERE c.client_id = ?
           LIMIT 20""",
        [client_id]
    )

    if not result or not result.get("rows"):
        return []

    freelancers = []
    for row in result["rows"]:
        freelancer_id = extract_value(row[0])
        name = to_str(row[1])
        if not name:
            first = to_str(row[2]) or ""
            last = to_str(row[3]) or ""
            name = f"{first} {last}".strip() or "Unknown"

        bio = to_str(row[4])
        title = bio.split('.')[0][:50] + "..." if bio else "Freelancer"

        hourly_rate = to_float(row[5]) or 0
        skills_str = to_str(row[6])
        skills = skills_str.split(",") if skills_str else []

        profile_image_url = to_str(row[7])
        location = to_str(row[8]) or "Remote"

        completed_count = _get_freelancer_completed_count(freelancer_id)
        avg_rating = _get_freelancer_avg_rating(freelancer_id)

        is_verified = completed_count >= 3 and avg_rating >= 4.0

        freelancers.append({
            "id": f"freelancer_{freelancer_id}",
            "name": name,
            "title": title,
            "rating": avg_rating or 4.5,
            "hourlyRate": f"${hourly_rate}/hr",
            "skills": skills[:5],
            "completedProjects": completed_count,
            "avatarUrl": profile_image_url,
            "location": location,
            "availability": "Contract",
            "isVerified": is_verified,
            "matchScore": min(95, 70 + (completed_count * 2) + int(avg_rating * 3))
        })

    return freelancers


def _get_freelancer_completed_count(freelancer_id) -> int:
    """Get completed contract count for a freelancer."""
    count_result = execute_query(
        "SELECT COUNT(*) FROM contracts WHERE freelancer_id = ? AND status = 'completed'",
        [freelancer_id]
    )
    if count_result and count_result.get("rows"):
        return extract_value(count_result["rows"][0][0]) or 0
    return 0


def _get_freelancer_avg_rating(freelancer_id) -> float:
    """Get average rating for a freelancer."""
    rating_result = execute_query(
        "SELECT AVG(rating) FROM reviews WHERE reviewee_id = ?",
        [freelancer_id]
    )
    if rating_result and rating_result.get("rows"):
        return to_float(rating_result["rows"][0][0]) or 0
    return 0


def get_client_reviews(user_id) -> List[dict]:
    """Get reviews for the client."""
    result = execute_query(
        """SELECT r.id, r.rating, r.comment, r.created_at, p.title, u.name, u.first_name, u.last_name, u.profile_image_url
           FROM reviews r
           LEFT JOIN projects p ON r.project_id = p.id
           LEFT JOIN users u ON r.reviewer_id = u.id
           WHERE r.reviewee_id = ?
           ORDER BY r.created_at DESC
           LIMIT 20""",
        [user_id]
    )

    if not result or not result.get("rows"):
        return []

    reviews = []
    for row in result["rows"]:
        review_id = extract_value(row[0])
        rating = extract_value(row[1]) or 0
        created_at = parse_date(row[3])

        freelancer_name = to_str(row[5])
        if not freelancer_name:
            first = to_str(row[6]) or ""
            last = to_str(row[7]) or ""
            freelancer_name = f"{first} {last}".strip() or "Anonymous"

        freelancer_avatar = to_str(row[8])

        reviews.append({
            "id": f"review_{review_id}",
            "projectTitle": to_str(row[4]) or "Project",
            "freelancerName": freelancer_name,
            "rating": rating,
            "comment": to_str(row[2]),
            "date": created_at.strftime("%Y-%m-%d") if created_at else None,
            "avatarUrl": freelancer_avatar
        })

    return reviews


def create_job(client_id, job_data: dict) -> dict:
    """Create a new job posting. Returns dict with id on success, raises RuntimeError on failure."""
    now = datetime.now(timezone.utc).isoformat()
    skills = ",".join(job_data.get("skills", []))
    budget = job_data.get("budget", 0)

    result = execute_query(
        """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max, experience_level, estimated_duration, skills, client_id, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'Intermediate', ?, ?, ?, 'open', ?, ?)""",
        [
            job_data.get("title", ""),
            job_data.get("description", ""),
            job_data.get("category", ""),
            job_data.get("budgetType", "Fixed"),
            budget,
            budget,
            job_data.get("timeline", ""),
            skills,
            client_id,
            now,
            now
        ]
    )

    if not result:
        raise RuntimeError("Failed to create job")

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    rows = parse_rows(id_result) if id_result else []
    project_id = int(rows[0]["id"]) if rows else None

    return {
        "id": f"job_{project_id}",
        "message": "Job submitted successfully."
    }
