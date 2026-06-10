from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ContractGenerateRequest(BaseModel):
    contract_type: str = "service_agreement"
    client_name: str = ""
    client_email: str = ""
    freelancer_name: str = ""
    freelancer_email: str = ""
    project_title: str = ""
    project_description: str = ""
    total_amount: float = 0
    currency: str = "USD"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    payment_schedule: str = "milestone"
    jurisdiction: str = "US"
    selected_clauses: Optional[List[str]] = None


@router.get("/options")
def get_options():
    return {
        "contract_types": [
            {"key": "service_agreement", "label": "Service Agreement", "description": "Standard freelance service contract", "icon": "file-text", "common_for": ["web_development", "design", "consulting"]},
            {"key": "nda", "label": "Non-Disclosure Agreement", "description": "Protect confidential information", "icon": "shield", "common_for": ["consulting", "development"]},
            {"key": "fixed_price", "label": "Fixed Price Contract", "description": "Deliverables-based agreement", "icon": "dollar-sign", "common_for": ["design", "writing", "development"]},
            {"key": "retainer", "label": "Retainer Agreement", "description": "Ongoing monthly engagement", "icon": "calendar", "common_for": ["consulting", "marketing"]},
        ],
        "clause_categories": [
            {"key": "payment", "label": "Payment Terms", "count": 4},
            {"key": "intellectual_property", "label": "Intellectual Property", "count": 3},
            {"key": "confidentiality", "label": "Confidentiality", "count": 2},
            {"key": "termination", "label": "Termination", "count": 3},
            {"key": "liability", "label": "Liability & Indemnity", "count": 2},
        ],
        "jurisdictions": [
            {"key": "US", "label": "United States"},
            {"key": "GB", "label": "United Kingdom"},
            {"key": "CA", "label": "Canada"},
            {"key": "AU", "label": "Australia"},
            {"key": "DE", "label": "Germany"},
            {"key": "PK", "label": "Pakistan"},
        ],
    }


CLAUSE_DB = {
    "payment_net_30": {"key": "payment_net_30", "category": "payment", "label": "Net 30 Payment", "description": "Client shall pay within 30 days of invoice"},
    "payment_upfront": {"key": "payment_upfront", "category": "payment", "label": "50% Upfront", "description": "50% of total fee due upon signing, remainder on completion"},
    "payment_milestone": {"key": "payment_milestone", "category": "payment", "label": "Milestone Payments", "description": "Payment released upon milestone completion and approval"},
    "ip_transfer": {"key": "ip_transfer", "category": "intellectual_property", "label": "IP Transfer", "description": "All intellectual property transfers to client upon full payment"},
    "ip_retained": {"key": "ip_retained", "category": "intellectual_property", "label": "IP Retained", "description": "Freelancer retains IP; grants client perpetual license"},
    "work_for_hire": {"key": "work_for_hire", "category": "intellectual_property", "label": "Work for Hire", "description": "All work product is considered work made for hire"},
    "mutual_nda": {"key": "mutual_nda", "category": "confidentiality", "label": "Mutual NDA", "description": "Both parties agree to protect confidential information"},
    " unilateral_nda": {"key": "unilateral_nda", "category": "confidentiality", "label": "One-Way NDA", "description": "Freelancer agrees to protect client's confidential information"},
    "termination_convenience": {"key": "termination_convenience", "category": "termination", "label": "Termination for Convenience", "description": "Either party may terminate with 14 days written notice"},
    "termination_cause": {"key": "termination_cause", "category": "termination", "label": "Termination for Cause", "description": "Immediate termination for material breach"},
    "limitation_liability": {"key": "limitation_liability", "category": "liability", "label": "Limitation of Liability", "description": "Total liability limited to the contract value"},
}


@router.get("/clauses/{contract_type}")
def get_clauses(contract_type: str):
    type_clause_map = {
        "service_agreement": ["payment_net_30", "ip_transfer", "mutual_nda", "termination_convenience", "limitation_liability"],
        "nda": ["unilateral_nda", "termination_cause", "limitation_liability"],
        "fixed_price": ["payment_milestone", "ip_transfer", "termination_convenience", "limitation_liability"],
        "retainer": ["payment_upfront", "ip_retained", "mutual_nda", "termination_convenience", "limitation_liability"],
    }
    clause_keys = type_clause_map.get(contract_type, type_clause_map["service_agreement"])
    clauses = [CLAUSE_DB[k] for k in clause_keys if k in CLAUSE_DB]
    return {"clauses": clauses}


@router.post("/generate")
def generate_contract(req: ContractGenerateRequest):
    now = datetime.now(timezone.utc)
    selected = req.selected_clauses or []

    parties = {
        "client": {"name": req.client_name, "email": req.client_email},
        "freelancer": {"name": req.freelancer_name, "email": req.freelancer_email},
    }

    clauses_content = []
    for ck in selected:
        if ck in CLAUSE_DB:
            c = CLAUSE_DB[ck]
            clauses_content.append({
                "key": c["key"],
                "category": c["category"],
                "label": c["label"],
                "content": c["description"],
            })

    contract_text = (
        f"SERVICE AGREEMENT\n\n"
        f"This agreement is entered into between {req.client_name} ('Client') and "
        f"{req.freelancer_name} ('Freelancer').\n\n"
        f"PROJECT: {req.project_title}\n"
        f"DESCRIPTION: {req.project_description}\n"
        f"TOTAL VALUE: {req.currency} {req.total_amount:,.2f}\n"
        f"START DATE: {req.start_date or now.strftime('%Y-%m-%d')}\n"
        f"END DATE: {req.end_date or 'To be determined'}\n\n"
        f"PAYMENT SCHEDULE: {req.payment_schedule.replace('_', ' ').title()}\n\n"
    )
    for c in clauses_content:
        contract_text += f"\n{c['label'].upper()}\n{c['content']}\n"

    contract_text += (
        f"\nGOVERNING LAW: This agreement shall be governed by the laws of {req.jurisdiction}.\n"
        f"\nSIGNED electronically on {now.strftime('%Y-%m-%d')}.\n"
    )

    completeness = min(100, 40 + len(selected) * 12 + (20 if req.total_amount > 0 else 0))

    risk_items = []
    if "limitation_liability" not in selected:
        risk_items.append({"clause": "Limitation of Liability", "risk": "high", "note": "Recommended for all contracts"})
    if "ip_transfer" not in selected and "work_for_hire" not in selected:
        risk_items.append({"clause": "IP Ownership", "risk": "high", "note": "No IP clause selected"})
    if "termination_convenience" not in selected and "termination_cause" not in selected:
        risk_items.append({"clause": "Termination", "risk": "medium", "note": "No termination clause"})

    return {
        "contract": contract_text,
        "parties": parties,
        "terms": {
            "start_date": req.start_date or now.strftime("%Y-%m-%d"),
            "end_date": req.end_date,
            "payment_schedule": req.payment_schedule,
        },
        "financial": {
            "total_amount": req.total_amount,
            "currency": req.currency,
            "payment_schedule": req.payment_schedule,
        },
        "scope": {
            "title": req.project_title,
            "description": req.project_description,
        },
        "clauses": clauses_content,
        "selected_clause_keys": selected,
        "risk_analysis": {
            "overall_risk": "low" if len(risk_items) == 0 else "medium" if len(risk_items) <= 1 else "high",
            "items": risk_items,
        },
        "completeness": {
            "score": completeness,
            "level": "excellent" if completeness > 80 else "good" if completeness > 60 else "needs_improvement",
            "missing": [r["clause"] for r in risk_items],
        },
        "meta": {
            "contract_type": req.contract_type,
            "jurisdiction": req.jurisdiction,
            "generated_at": now.isoformat(),
        },
    }
