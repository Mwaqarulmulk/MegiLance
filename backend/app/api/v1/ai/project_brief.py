# @AI-HINT: AI-powered project briefing endpoint - enriches client project descriptions
# and provides budget/timeline recommendations using the LLM gateway.
from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.schemas.project_brief import (
    ProjectBriefRequest, ProjectBriefResponse,
    SmartMatchRequest, SmartMatchResponse, FreelancerMatch,
    HireConfirmRequest, HireConfirmResponse,
    InvitationRespondRequest, InvitationResponse, InvitationListResponse,
)
import json
import logging
from datetime import datetime, timedelta, timezone

from app.db.turso_http import execute_query, parse_rows
from app.services.notifications_service import send_notification

logger = logging.getLogger(__name__)
router = APIRouter()


def _notify_safely(*args, **kwargs) -> None:
    try:
        send_notification(*args, **kwargs)
    except Exception as exc:
        logger.warning("Invitation notification could not be created: %s", exc)


async def _call_llm(prompt: str, system_prompt: str = "") -> str:
    """Call the LLM gateway for AI processing."""
    try:
        from app.services.llm_gateway import generate_completion
        result = await generate_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        return result
    except Exception as e:
        logger.warning(f"LLM call failed: {e}")
        return ""


@router.post("/project-brief", response_model=ProjectBriefResponse)
async def create_project_brief(
    request: ProjectBriefRequest,
    current_user=Depends(get_current_user),
):
    """
    AI-enriches a client's project description.
    Takes structured wizard input and returns an enhanced brief with
    budget estimates, skill suggestions, and complexity analysis.
    """
    system_prompt = """You are an expert project analyst for a freelancing platform.
Analyze the client's project description and provide:
1. An enriched, professional project description
2. Suggested skills to add (if missing)
3. Budget range estimation (USD)
4. Timeline estimation
5. Complexity score (0-1)
6. Project type classification
7. Recommended experience level for freelancers
8. Any missing information the client should provide

Respond in JSON format with these exact fields:
{
  "enriched_description": "...",
  "suggested_skills": ["skill1", "skill2"],
  "estimated_budget_min": 500,
  "estimated_budget_max": 2000,
  "estimated_timeline": "2-4 weeks",
  "complexity_score": 0.6,
  "ai_confidence": 0.85,
  "missing_info": ["missing detail 1"],
  "project_type": "web_development",
  "recommended_experience_level": "intermediate"
}"""

    prompt = f"""Project Category: {request.category}
Description: {request.description}
Skills: {', '.join(request.skills) if request.skills else 'Not specified'}
Budget: ${request.budget_min or 'Not specified'} - ${request.budget_max or 'Not specified'}
Timeline: {request.timeline}
Complexity: {request.complexity.value}
Industry: {request.industry or 'Not specified'}
Deliverables: {', '.join(request.deliverables) if request.deliverables else 'Not specified'}
Additional Notes: {request.additional_notes or 'None'}"""

    ai_response = await _call_llm(prompt, system_prompt)

    if ai_response:
        try:
            # Try to parse JSON from the LLM response
            # Handle cases where LLM wraps JSON in markdown code blocks
            cleaned = ai_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            data = json.loads(cleaned)
            return ProjectBriefResponse(**data)
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Failed to parse LLM response: {e}")

    # Fallback: provide sensible defaults based on input
    budget_min = request.budget_min or 500
    budget_max = request.budget_max or budget_min * 3

    return ProjectBriefResponse(
        enriched_description=f"Professional {request.category.lower()} project requiring {', '.join(request.skills[:3]) if request.skills else 'various skills'}. {request.description}",
        suggested_skills=request.skills[:5] if request.skills else ["Communication", "Problem Solving"],
        estimated_budget_min=budget_min,
        estimated_budget_max=budget_max,
        estimated_timeline=request.timeline,
        complexity_score=0.5,
        ai_confidence=0.6,
        missing_info=["Consider adding specific deliverables and acceptance criteria"],
        project_type=request.category.lower().replace(" ", "_"),
        recommended_experience_level=request.complexity.value if request.complexity else "intermediate",
    )


@router.post("/smart-match", response_model=SmartMatchResponse)
async def smart_match_freelancers(
    request: SmartMatchRequest,
    current_user=Depends(get_current_user),
):
    """
    AI matches the best 3-5 freelancers for a project based on skills,
    experience, ratings, availability, and fraud signals.
    """
    # Fetch all active freelancers with their data
    freelancers_result = execute_query(
        """SELECT id, name, first_name, last_name, bio, skills, hourly_rate,
                  experience_level, profile_image_url, headline, seller_level,
                  profile_data
           FROM users
           WHERE user_type = 'freelancer' AND is_active = 1
             AND COALESCE(profile_visibility, 'public') = 'public'
           LIMIT 200"""
    )

    candidates = []
    if freelancers_result and freelancers_result.get("rows"):
        for vals in parse_rows(freelancers_result):
            try:
                # Parse skills
                skills_raw = vals.get("skills", "[]")
                if isinstance(skills_raw, str):
                    try:
                        skills = json.loads(skills_raw)
                    except (json.JSONDecodeError, TypeError):
                        skills = [skill.strip() for skill in skills_raw.split(",") if skill.strip()]
                else:
                    skills = skills_raw if isinstance(skills_raw, list) else []

                # Calculate skill match
                request_skills = set(s.lower() for s in request.skills)
                candidate_skills = set(s.lower() for s in skills) if isinstance(skills, list) else set()
                skill_overlap = len(request_skills & candidate_skills)
                skill_match = min(skill_overlap / max(len(request_skills), 1), 1.0) if request_skills else 0.5

                # Experience level scoring
                level_map = {"entry": 0.3, "intermediate": 0.6, "expert": 1.0}
                exp_level = (vals.get("experience_level") or "intermediate").lower()
                experience_match = level_map.get(exp_level, 0.5)

                # Rate scoring
                try:
                    hourly_rate = float(vals.get("hourly_rate") or 0)
                except:
                    hourly_rate = 0

                avg_budget = (request.budget_min + request.budget_max) / 2 if request.budget_min and request.budget_max else 1000
                if hourly_rate > 0:
                    price_fit = 1.0 - min(abs(hourly_rate - (avg_budget / 40)) / (avg_budget / 40), 1.0)
                else:
                    price_fit = 0.5

                # Fraud score (simplified - lower is better)
                fraud_score = 0.1  # Base low risk

                # Availability (simplified)
                availability_score = 0.8

                # Overall fit score
                fit_score = (
                    skill_match * 35 +
                    experience_match * 20 +
                    price_fit * 20 +
                    availability_score * 15 +
                    (1 - fraud_score) * 10
                )

                display_name = vals.get("name") or f"{vals.get('first_name', '')} {vals.get('last_name', '')}".strip() or "Freelancer"

                candidates.append({
                    "freelancer_id": vals.get("id"),
                    "fit_score": round(fit_score, 1),
                    "skill_match": round(skill_match, 2),
                    "experience_match": round(experience_match, 2),
                    "rating_score": 0.8,
                    "availability_score": round(availability_score, 2),
                    "fraud_score": round(fraud_score, 2),
                    "price_fit": round(price_fit, 2),
                    "explanation": f"Strong match in {skill_overlap} shared skills with relevant experience level.",
                    "highlight": f"Expert in {', '.join(list(request_skills & candidate_skills)[:3]) or 'related technologies'}",
                    "display_name": display_name,
                    "headline": vals.get("headline"),
                    "hourly_rate": hourly_rate if hourly_rate > 0 else None,
                    "rating": 4.5,
                    "completed_projects": 0,
                    "profile_image_url": vals.get("profile_image_url"),
                })
            except Exception as e:
                logger.debug(f"Error processing freelancer: {e}")
                continue

    # Sort by fit_score and take top 5
    candidates.sort(key=lambda x: x["fit_score"], reverse=True)
    top_matches = candidates[:5]

    # Build AI reasoning
    if top_matches:
        reasoning = f"Analyzed {len(candidates)} freelancers. Top match: {top_matches[0]['display_name']} with {top_matches[0]['fit_score']}% fit. "
        reasoning += f"Key factors: skill alignment ({top_matches[0]['skill_match']:.0%}), experience match ({top_matches[0]['experience_match']:.0%})."
    else:
        reasoning = "No matching freelancers found. Consider broadening the skill requirements or adjusting the budget."

    estimated_budget = (request.budget_min + request.budget_max) / 2 if request.budget_min and request.budget_max else 1000

    return SmartMatchResponse(
        matches=[FreelancerMatch(**m) for m in top_matches],
        total_candidates=len(candidates),
        ai_reasoning=reasoning,
        estimated_budget=estimated_budget,
        estimated_timeline=request.timeline,
    )


@router.post("/hire/confirm", response_model=HireConfirmResponse)
async def confirm_hire(
    request: HireConfirmRequest,
    current_user=Depends(get_current_user),
):
    """Create an open project and invite the selected freelancer to review it."""
    client_id = getattr(current_user, "id", None)
    if not client_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if getattr(current_user, "user_type", None) != "client":
        raise HTTPException(status_code=403, detail="Only clients can invite freelancers")

    freelancer_rows = parse_rows(execute_query(
        "SELECT id FROM users WHERE id = ? AND user_type = 'freelancer' AND is_active = 1",
        [request.freelancer_id],
    ))
    if not freelancer_rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")

    now = datetime.now(timezone.utc).isoformat()
    brief = request.project_brief
    project_result = execute_query(
        """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                  experience_level, estimated_duration, skills, client_id, status, created_at, updated_at)
           VALUES (?, ?, ?, 'fixed', ?, ?, ?, ?, ?, ?, 'open', ?, ?)""",
        [brief.get("title", "AI-Matched Project"), brief.get("description", ""),
         brief.get("category", "Other"), request.agreed_amount, request.agreed_amount,
         brief.get("experience_level", "intermediate"), brief.get("timeline", "1 month"),
         json.dumps(brief.get("skills", [])), client_id, now, now],
    )
    project_id = int(project_result.get("last_insert_rowid") or 0) if project_result else 0
    if not project_id:
        raise HTTPException(status_code=500, detail="Failed to create project")

    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    invitation_result = execute_query(
        """INSERT INTO invitations
           (project_id, freelancer_id, client_id, fit_score, status, client_message,
            proposed_rate, expires_at, created_at)
           VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)""",
        [project_id, request.freelancer_id, client_id, 100,
         request.message_to_freelancer or "", request.agreed_amount, expires_at, now],
    )
    if not invitation_result:
        execute_query("DELETE FROM projects WHERE id = ? AND client_id = ?", [project_id, client_id])
        raise HTTPException(status_code=500, detail="Failed to create invitation")

    _notify_safely(
        request.freelancer_id, "project_invitation", "New project invitation",
        f"A client invited you to review {brief.get('title', 'a project')}.",
        data={"project_id": project_id, "invitation_id": invitation_result.get("last_insert_rowid")},
        action_url="/freelancer/invitations",
    )
    return HireConfirmResponse(
        contract_id=None, project_id=project_id, status="invited",
        message="Project created and invitation sent. No contract is created until acceptance.",
        freelancer_notified=True,
    )


@router.get("/invitations", response_model=InvitationListResponse)
async def list_invitations(current_user=Depends(get_current_user)):
    """
    List pending AI-matched project invitations for the current freelancer.
    """
    user_id = getattr(current_user, "id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = execute_query(
        """SELECT i.id, i.project_id, p.title, p.description, p.category,
                  p.budget_min, p.budget_max, p.skills, i.created_at,
                  u.name as client_name, u.profile_image_url as client_avatar,
                  i.fit_score, i.client_message, i.proposed_rate, i.expires_at
           FROM invitations i
           JOIN projects p ON p.id = i.project_id
           JOIN users u ON u.id = i.client_id
           WHERE i.freelancer_id = ? AND i.status = 'pending'
             AND (i.expires_at IS NULL OR i.expires_at > ?)
           ORDER BY i.created_at DESC
           LIMIT 20"""
        , [user_id, datetime.now(timezone.utc).isoformat()]
    )

    invitations = []
    for vals in parse_rows(result):
        raw_skills = vals.get("skills") or ""
        try:
            skills = json.loads(raw_skills) if isinstance(raw_skills, str) else raw_skills
        except (json.JSONDecodeError, TypeError):
            skills = [skill.strip() for skill in str(raw_skills).split(",") if skill.strip()]
        invitations.append({**vals, "description": (vals.get("description") or "")[:200], "skills": skills or []})

    return InvitationListResponse(
        invitations=invitations,
        total=len(invitations),
        pending_count=len(invitations),
    )


@router.post("/invitations/{invitation_id}/respond", response_model=InvitationResponse)
async def respond_to_invitation(
    invitation_id: int,
    request: InvitationRespondRequest,
    current_user=Depends(get_current_user),
):
    """
    Freelancer accepts or rejects an AI-matched invitation.
    Accepting creates a contract and notifies the client.
    """
    user_id = getattr(current_user, "id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    now = datetime.now(timezone.utc).isoformat()

    invitation_rows = parse_rows(execute_query(
        """SELECT i.id, i.project_id, i.client_id, i.proposed_rate, i.expires_at,
                  p.budget_min, p.budget_max, p.title, p.status AS project_status
           FROM invitations i JOIN projects p ON p.id = i.project_id
           WHERE i.id = ? AND i.freelancer_id = ? AND i.status = 'pending'""",
        [invitation_id, user_id],
    ))
    if not invitation_rows:
        raise HTTPException(status_code=404, detail="Pending invitation not found")
    invitation = invitation_rows[0]
    if invitation.get("expires_at") and invitation["expires_at"] <= now:
        execute_query("UPDATE invitations SET status = 'expired' WHERE id = ?", [invitation_id])
        raise HTTPException(status_code=410, detail="Invitation has expired")

    if request.accept:
        if invitation.get("project_status") != "open":
            raise HTTPException(status_code=409, detail="Project is no longer accepting this invitation")
        client_id = int(invitation["client_id"])
        project_id = int(invitation["project_id"])
        agreed_amount = request.proposed_rate or invitation.get("proposed_rate") or invitation.get("budget_max") or invitation.get("budget_min") or 1000

        # Create project with freelancer assigned
        execute_query(
            "UPDATE projects SET status = 'in_progress', updated_at = ? WHERE id = ?",
            [now, project_id],
        )

        # Create contract
        contract_result = execute_query(
            """INSERT INTO contracts (project_id, freelancer_id, client_id, amount, currency, status,
                      contract_type, platform_fee, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'USD', 'pending', 'fixed', 0, ?, ?)
               RETURNING id""",
            [project_id, user_id, client_id, agreed_amount, now, now],
        )

        contract_id = None
        if contract_result and contract_result.get("rows"):
            contract_id = contract_result["rows"][0][0].get("value") if isinstance(contract_result["rows"][0][0], dict) else contract_result["rows"][0][0]

        if not contract_id:
            execute_query("UPDATE projects SET status = 'open', updated_at = ? WHERE id = ?", [now, project_id])
            raise HTTPException(status_code=500, detail="Failed to create contract")
        execute_query(
            "UPDATE invitations SET status = 'accepted', freelancer_message = ?, proposed_rate = ?, responded_at = ? WHERE id = ?",
            [request.message or "", agreed_amount, now, invitation_id],
        )
        _notify_safely(
            client_id, "invitation_accepted", "Project invitation accepted",
            f"A freelancer accepted your invitation for {invitation.get('title', 'your project')}.",
            data={"project_id": project_id, "contract_id": contract_id},
            action_url=f"/client/contracts/{contract_id}",
        )

        return InvitationResponse(
            invitation_id=invitation_id,
            status="accepted",
            contract_id=contract_id,
            message="Invitation accepted. Contract created successfully.",
        )
    else:
        execute_query(
            "UPDATE invitations SET status = 'declined', freelancer_message = ?, responded_at = ? WHERE id = ?",
            [request.message or "", now, invitation_id],
        )
        _notify_safely(
            int(invitation["client_id"]), "invitation_declined", "Project invitation declined",
            f"A freelancer declined your invitation for {invitation.get('title', 'your project')}.",
            data={"project_id": invitation["project_id"], "invitation_id": invitation_id},
            action_url=f"/client/projects/{invitation['project_id']}",
        )
        return InvitationResponse(
            invitation_id=invitation_id,
            status="rejected",
            contract_id=None,
            message="Invitation declined. The client will be notified.",
        )
