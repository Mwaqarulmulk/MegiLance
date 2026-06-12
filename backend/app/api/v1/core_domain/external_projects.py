# @AI-HINT: External projects router — aggregated projects from external sources
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("")
async def list_external_projects(
    query: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    project_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    tags: Optional[str] = None,
    sort_by: str = Query("scraped_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    where = "WHERE 1=1"
    params: list = []

    if query:
        where += " AND (title LIKE ? OR description_plain LIKE ? OR company LIKE ?)"
        params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
    if category:
        where += " AND category = ?"
        params.append(category)
    if source:
        where += " AND source = ?"
        params.append(source)
    if project_type:
        where += " AND project_type = ?"
        params.append(project_type)
    if experience_level:
        where += " AND experience_level = ?"
        params.append(experience_level)
    if min_budget is not None:
        where += " AND (budget_max >= ? OR budget_min >= ?)"
        params.extend([min_budget, min_budget])
    if max_budget is not None:
        where += " AND budget_min <= ?"
        params.append(max_budget)
    if tags:
        where += " AND tags LIKE ?"
        params.append(f"%{tags}%")

    allowed_sorts = {"scraped_at", "posted_at", "budget_min", "budget_max", "trust_score", "views_count"}
    sort_col = sort_by if sort_by in allowed_sorts else "scraped_at"
    direction = "DESC" if sort_order == "desc" else "ASC"
    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    try:
        result = execute_query(
            f"SELECT id, title, company, company_logo, description_plain, category, source, "
            f"project_type, experience_level, budget_min, budget_max, budget_currency, "
            f"location, apply_url, trust_score, is_verified, tags, "
            f"views_count, clicks_count, scraped_at, posted_at "
            f"FROM external_projects {where} "
            f"ORDER BY {sort_col} {direction} "
            f"LIMIT ? OFFSET ?",
            params,
        )
        projects = parse_rows(result)

        count_params = params[:-2]
        count_result = execute_query(
            f"SELECT COUNT(*) as total FROM external_projects {where}",
            count_params,
        )
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

        sources_result = execute_query("SELECT DISTINCT source FROM external_projects", [])
        sources = [r["source"] for r in (parse_rows(sources_result) or [])]

        last_scraped_result = execute_query(
            "SELECT MAX(scraped_at) as last_scraped FROM external_projects", []
        )
        last_scraped_rows = parse_rows(last_scraped_result)
        last_scraped = last_scraped_rows[0]["last_scraped"] if last_scraped_rows else None

        return {
            "projects": projects if projects else [],
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_more": total > page * page_size,
            "sources": sources,
            "last_scraped": last_scraped,
        }
    except Exception as e:
        logger.error(f"Error listing external projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to list external projects")


@router.get("/categories")
async def get_categories():
    try:
        result = execute_query(
            "SELECT category, COUNT(*) as count FROM external_projects "
            "GROUP BY category ORDER BY count DESC",
            [],
        )
        rows = parse_rows(result)
        return {"categories": rows if rows else []}
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        return {"categories": []}


@router.get("/stats")
async def get_stats():
    try:
        total_result = execute_query("SELECT COUNT(*) as total FROM external_projects", [])
        total_rows = parse_rows(total_result)
        total = total_rows[0]["total"] if total_rows else 0

        source_result = execute_query(
            "SELECT source, COUNT(*) as count FROM external_projects GROUP BY source", []
        )
        source_rows = parse_rows(source_result)
        by_source = {r["source"]: r["count"] for r in source_rows} if source_rows else {}

        last_scraped_result = execute_query(
            "SELECT MAX(scraped_at) as last_scraped FROM external_projects", []
        )
        last_scraped_rows = parse_rows(last_scraped_result)
        last_scraped = last_scraped_rows[0]["last_scraped"] if last_scraped_rows else None

        avg_trust_result = execute_query(
            "SELECT AVG(trust_score) as avg_trust FROM external_projects", []
        )
        avg_trust_rows = parse_rows(avg_trust_result)
        avg_trust = round(float(avg_trust_rows[0]["avg_trust"] or 0), 2) if avg_trust_rows else 0

        return {
            "total": total,
            "by_source": by_source,
            "last_scraped": last_scraped,
            "avg_trust_score": avg_trust,
        }
    except Exception as e:
        logger.error(f"Error fetching external project stats: {e}")
        return {"total": 0, "by_source": {}, "last_scraped": None, "avg_trust_score": 0}


@router.get("/{project_id}")
async def get_external_project(project_id: int, current_user=Depends(get_current_user)):
    try:
        result = execute_query(
            "SELECT id, title, company, company_logo, description, description_plain, "
            "category, source, source_url, project_type, experience_level, "
            "budget_min, budget_max, budget_currency, budget_period, "
            "location, apply_url, trust_score, is_verified, is_flagged, tags, "
            "views_count, clicks_count, saves_count, scraped_at, posted_at "
            "FROM external_projects WHERE id = ?",
            [project_id],
        )
        rows = parse_rows(result)
        if not rows:
            raise HTTPException(status_code=404, detail="Project not found")

        execute_query(
            "UPDATE external_projects SET views_count = views_count + 1 WHERE id = ?",
            [project_id],
        )

        return rows[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching external project: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project")


@router.post("/scrape")
async def trigger_scrape(
    source: Optional[str] = Query(None, regex="^(remoteok|jobicy|arbeitnow|all)$"),
    current_user=Depends(require_admin),
):
    now = datetime.now(timezone.utc).isoformat()

    try:
        job_result = execute_query(
            "INSERT INTO scrape_jobs (source, status, triggered_by, created_at) VALUES (?, 'pending', ?, ?)",
            [source or "all", current_user.id, now],
        )
        job_id = job_result.get("last_insert_rowid") if job_result else None
    except Exception as e:
        logger.warning(f"scrape_jobs table not available: {e}")
        job_id = None

    sources_to_scrape = []
    if source and source != "all":
        sources_to_scrape = [source]
    else:
        sources_to_scrape = ["remoteok", "jobicy", "arbeitnow"]

    scraped_count = 0
    errors = []

    for src in sources_to_scrape:
        try:
            if src == "remoteok":
                scraped = _scrape_remoteok()
            elif src == "jobicy":
                scraped = _scrape_jobicy()
            elif src == "arbeitnow":
                scraped = _scrape_arbeitnow()
            else:
                continue
            scraped_count += scraped
        except Exception as e:
            logger.error(f"Error scraping {src}: {e}")
            errors.append({"source": src, "error": str(e)})

    if job_id:
        try:
            execute_query(
                "UPDATE scrape_jobs SET status = 'completed', projects_scraped = ?, completed_at = ? WHERE id = ?",
                [scraped_count, now, job_id],
            )
        except Exception:
            pass

    return {
        "message": "Scrape completed",
        "job_id": job_id,
        "sources": sources_to_scrape,
        "projects_scraped": scraped_count,
        "errors": errors,
    }


@router.post("/{project_id}/click")
async def track_click(project_id: int, current_user=Depends(get_current_user)):
    try:
        result = execute_query(
            "SELECT apply_url FROM external_projects WHERE id = ?", [project_id]
        )
        rows = parse_rows(result)
        if not rows:
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            "INSERT INTO external_project_clicks (project_id, user_id, clicked_at) VALUES (?, ?, ?)",
            [project_id, current_user.id, now],
        )
        execute_query(
            "UPDATE external_projects SET clicks_count = clicks_count + 1 WHERE id = ?",
            [project_id],
        )

        return {"apply_url": rows[0]["apply_url"], "tracked": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking click: {e}")
        raise HTTPException(status_code=500, detail="Failed to track click")


@router.post("/{project_id}/flag")
async def flag_project(
    project_id: int,
    reason: str = Query(...),
    current_user=Depends(get_current_user),
):
    now = datetime.now(timezone.utc).isoformat()
    try:
        result = execute_query(
            "SELECT id FROM external_projects WHERE id = ?", [project_id]
        )
        if not parse_rows(result):
            raise HTTPException(status_code=404, detail="Project not found")

        execute_query(
            "INSERT INTO external_project_flags (project_id, user_id, reason, created_at) VALUES (?, ?, ?, ?)",
            [project_id, current_user.id, reason, now],
        )
        execute_query(
            "UPDATE external_projects SET is_flagged = 1, flag_reason = ? WHERE id = ?",
            [reason, project_id],
        )

        return {"message": "Project flagged for review"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error flagging project: {e}")
        raise HTTPException(status_code=500, detail="Failed to flag project")


@router.post("/{project_id}/save")
async def save_project(project_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    try:
        existing = execute_query(
            "SELECT id FROM external_project_saves WHERE project_id = ? AND user_id = ?",
            [project_id, current_user.id],
        )
        if parse_rows(existing):
            execute_query(
                "DELETE FROM external_project_saves WHERE project_id = ? AND user_id = ?",
                [project_id, current_user.id],
            )
            execute_query(
                "UPDATE external_projects SET saves_count = MAX(0, saves_count - 1) WHERE id = ?",
                [project_id],
            )
            return {"saved": False}

        execute_query(
            "INSERT INTO external_project_saves (project_id, user_id, created_at) VALUES (?, ?, ?)",
            [project_id, current_user.id, now],
        )
        execute_query(
            "UPDATE external_projects SET saves_count = saves_count + 1 WHERE id = ?",
            [project_id],
        )
        return {"saved": True}
    except Exception as e:
        logger.error(f"Error saving project: {e}")
        raise HTTPException(status_code=500, detail="Failed to save project")


def _scrape_remoteok() -> int:
    """Scrape RemoteOK API and insert new projects."""
    import requests as req

    try:
        resp = req.get("https://remoteok.com/api", timeout=15)
        resp.raise_for_status()
        jobs = resp.json()
    except Exception as e:
        logger.error(f"RemoteOK API error: {e}")
        return 0

    count = 0
    for job in jobs:
        if not isinstance(job, dict) or not job.get("id"):
            continue
        source_id = f"remoteok_{job['id']}"
        existing = execute_query(
            "SELECT id FROM external_projects WHERE source_id = ?", [source_id]
        )
        if parse_rows(existing):
            continue

        tags = json.dumps(job.get("tags", []))
        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            "INSERT INTO external_projects "
            "(source, source_id, source_url, title, company, description, description_plain, "
            "category, tags, project_type, experience_level, "
            "budget_min, budget_max, budget_currency, location, apply_url, "
            "trust_score, scraped_at, posted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.6, ?, ?)",
            [
                "remoteok", source_id, f"https://remoteok.com/remote-jobs/{job.get('slug', job['id'])}",
                job.get("position", "Untitled"), job.get("company", "Unknown"),
                job.get("description", ""), job.get("description", ""),
                job.get("tags", ["Other"])[0] if job.get("tags") else "Other",
                tags, "remote", "any",
                job.get("salary_min"), job.get("salary_max"), "USD",
                job.get("location", "Remote"), job.get("url", ""),
                now, job.get("date", now),
            ],
        )
        count += 1

    return count


def _scrape_jobicy() -> int:
    """Scrape Jobicy remote jobs API."""
    import requests as req

    try:
        resp = req.get("https://jobicy.com/api/v2/remote-jobs?count=50&geo=usa&industry=tech&tag=", timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"Jobicy API error: {e}")
        return 0

    jobs = data.get("jobs", [])
    count = 0
    for job in jobs:
        source_id = f"jobicy_{job.get('id', '')}"
        existing = execute_query(
            "SELECT id FROM external_projects WHERE source_id = ?", [source_id]
        )
        if parse_rows(existing):
            continue

        salary_min = job.get("annualSalaryMin")
        salary_max = job.get("annualSalaryMax")
        now = datetime.now(timezone.utc).isoformat()

        execute_query(
            "INSERT INTO external_projects "
            "(source, source_id, source_url, title, company, description, description_plain, "
            "category, tags, project_type, experience_level, "
            "budget_min, budget_max, budget_currency, location, apply_url, "
            "trust_score, scraped_at, posted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.7, ?, ?)",
            [
                "jobicy", source_id, job.get("url", ""),
                job.get("jobTitle", "Untitled"), job.get("companyName", "Unknown"),
                job.get("jobDescription", ""), job.get("jobDescription", ""),
                job.get("jobIndustry", ["Other"])[0] if job.get("jobIndustry") else "Other",
                json.dumps(job.get("jobTags", [])),
                job.get("jobType", "remote"), job.get("jobExperienceLevel", "any"),
                salary_min, salary_max, "USD",
                job.get("jobGeo", "Remote"), job.get("url", ""),
                now, job.get("pubDate", now),
            ],
        )
        count += 1

    return count


def _scrape_arbeitnow() -> int:
    """Scrape Arbeitnow API."""
    import requests as req

    try:
        resp = req.get("https://www.arbeitnow.com/api/job-board-api", timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"Arbeitnow API error: {e}")
        return 0

    jobs = data.get("data", [])
    count = 0
    for job in jobs:
        source_id = f"arbeitnow_{job.get('id', '')}"
        existing = execute_query(
            "SELECT id FROM external_projects WHERE source_id = ?", [source_id]
        )
        if parse_rows(existing):
            continue

        tags = json.dumps(job.get("tags", []))
        now = datetime.now(timezone.utc).isoformat()
        is_remote = job.get("remote", False)

        execute_query(
            "INSERT INTO external_projects "
            "(source, source_id, source_url, title, company, description, description_plain, "
            "category, tags, project_type, experience_level, "
            "budget_min, budget_max, budget_currency, location, apply_url, "
            "trust_score, scraped_at, posted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.5, ?, ?)",
            [
                "arbeitnow", source_id, job.get("url", ""),
                job.get("title", "Untitled"), job.get("company_name", "Unknown"),
                job.get("description", ""), job.get("description", ""),
                "Other", tags,
                "remote" if is_remote else "onsite", "any",
                None, None, "USD",
                job.get("location", "Remote"), job.get("url", ""),
                now, job.get("created_at", now),
            ],
        )
        count += 1

    return count
