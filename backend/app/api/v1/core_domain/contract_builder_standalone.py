from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ContractGenerateRequest(BaseModel):
    contract_type: str = "freelance_service"
    party_a_name: str = ""
    party_b_name: str = ""
    jurisdiction: str = "us_federal"
    payment_schedule: str = "milestone"
    total_value: float = 0
    currency: str = "USD"
    scope_description: str = ""
    selected_clauses: Optional[List[str]] = None


@router.get("/options")
def get_options():
    return {
        "contract_types": {
            "freelance_service": "Freelance Service Agreement",
            "nda": "Non-Disclosure Agreement (NDA)",
            "fixed_price": "Fixed Price Contract",
            "retainer": "Retainer Agreement",
        },
        "jurisdictions": {
            "us_federal": "United States (Federal)",
            "us_ca": "United States (California)",
            "us_ny": "United States (New York)",
            "uk": "United Kingdom",
            "ca": "Canada",
            "au": "Australia",
            "de": "Germany",
            "pk": "Pakistan",
            "in": "India",
        },
        "payment_schedules": {
            "milestone": "Milestone-Based",
            "upfront": "50% Upfront, 50% on Completion",
            "net_30": "Net 30 (Payment within 30 days)",
            "weekly": "Weekly Payments",
            "monthly": "Monthly Payments",
            "upon_completion": "Upon Completion",
        },
    }


CLAUSE_DB = {
    "payment_net_30": {"id": "payment_net_30", "category": "payment", "title": "Net 30 Payment Terms", "description": "Client shall pay within 30 days of invoice date. Late payments accrue 1.5% monthly interest."},
    "payment_upfront": {"id": "payment_upfront", "category": "payment", "title": "50% Upfront Payment", "description": "50% of total fee due upon signing, remainder due upon completion and final deliverables."},
    "payment_milestone": {"id": "payment_milestone", "category": "payment", "title": "Milestone-Based Payments", "description": "Payment released upon milestone completion and written client approval. Each milestone has defined deliverables."},
    "ip_transfer": {"id": "ip_transfer", "category": "intellectual_property", "title": "IP Transfer to Client", "description": "All intellectual property, source code, designs, and work product transfer to Client upon full payment."},
    "ip_retained": {"id": "ip_retained", "category": "intellectual_property", "title": "IP Retained by Freelancer", "description": "Freelancer retains all intellectual property rights. Client receives perpetual, non-exclusive license to use deliverables."},
    "work_for_hire": {"id": "work_for_hire", "category": "intellectual_property", "title": "Work for Hire", "description": "All work product created under this agreement is considered work made for hire under copyright law."},
    "mutual_nda": {"id": "mutual_nda", "category": "confidentiality", "title": "Mutual Non-Disclosure", "description": "Both parties agree to protect confidential information shared during the engagement for 3 years."},
    "unilateral_nda": {"id": "unilateral_nda", "category": "confidentiality", "title": "One-Way NDA", "description": "Freelancer agrees to protect Client's confidential information. Obligations survive for 3 years."},
    "termination_convenience": {"id": "termination_convenience", "category": "termination", "title": "Termination for Convenience", "description": "Either party may terminate with 14 days written notice. Client pays for work completed to date."},
    "termination_cause": {"id": "termination_cause", "category": "termination", "title": "Termination for Cause", "description": "Immediate termination permitted for material breach that remains uncured for 7 days after written notice."},
    "limitation_liability": {"id": "limitation_liability", "category": "liability", "title": "Limitation of Liability", "description": "Total liability of either party shall not exceed the total contract value. Neither party liable for indirect damages."},
}


@router.get("/clauses/{contract_type}")
def get_clauses(contract_type: str):
    type_clause_map = {
        "freelance_service": ["payment_milestone", "ip_transfer", "mutual_nda", "termination_convenience", "limitation_liability"],
        "nda": ["unilateral_nda", "termination_cause", "limitation_liability"],
        "fixed_price": ["payment_milestone", "ip_transfer", "termination_convenience", "limitation_liability"],
        "retainer": ["payment_upfront", "ip_retained", "mutual_nda", "termination_convenience", "limitation_liability"],
    }
    clause_keys = type_clause_map.get(contract_type, type_clause_map["freelance_service"])
    clauses = [CLAUSE_DB[k] for k in clause_keys if k in CLAUSE_DB]
    return {"clauses": clauses}


@router.post("/generate")
def generate_contract(req: ContractGenerateRequest):
    now = datetime.now(timezone.utc)
    selected = req.selected_clauses or []

    # Build clause content
    clauses_content = []
    for ck in selected:
        if ck in CLAUSE_DB:
            c = CLAUSE_DB[ck]
            clauses_content.append({
                "id": c["id"],
                "category": c["category"],
                "title": c["title"],
                "content": c["description"],
            })

    # Generate contract document
    contract_type_label = {
        "freelance_service": "FREELANCE SERVICE AGREEMENT",
        "nda": "NON-DISCLOSURE AGREEMENT",
        "fixed_price": "FIXED PRICE CONTRACT",
        "retainer": "RETAINER AGREEMENT",
    }.get(req.contract_type, "SERVICE AGREEMENT")

    payment_label = req.payment_schedule.replace("_", " ").title()

    contract_text = f"""{contract_type_label}

This agreement is entered into as of {now.strftime('%B %d, %Y')} between:

CLIENT: {req.party_a_name or '[Client Name]'}
FREELANCER: {req.party_b_name or '[Freelancer Name]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SCOPE OF WORK

{req.scope_description or '[Scope of work description to be provided]'}

2. COMPENSATION

Total Contract Value: {req.currency} {req.total_value:,.2f}
Payment Schedule: {payment_label}

3. TERMS AND CONDITIONS

"""
    for i, c in enumerate(clauses_content, 1):
        contract_text += f"3.{i} {c['title'].upper()}\n{c['content']}\n\n"

    contract_text += f"""4. GOVERNING LAW

This agreement shall be governed by the laws of {req.jurisdiction.replace('_', ' ').title()}.

5. SIGNATURES

This agreement may be executed electronically. Digital signatures are binding.

Client: ________________________    Date: {now.strftime('%Y-%m-%d')}
{req.party_a_name}

Freelancer: ________________________    Date: {now.strftime('%Y-%m-%d')}
{req.party_b_name}
"""

    # Risk analysis
    risk_items = []
    if "limitation_liability" not in selected:
        risk_items.append({"clause": "Limitation of Liability", "risk": "high", "note": "No liability cap — strongly recommended for all contracts"})
    if "ip_transfer" not in selected and "work_for_hire" not in selected:
        risk_items.append({"clause": "IP Ownership", "risk": "high", "note": "No IP clause — ownership of work product is undefined"})
    if "termination_convenience" not in selected and "termination_cause" not in selected:
        risk_items.append({"clause": "Termination", "risk": "medium", "note": "No termination clause — no clear exit strategy"})
    if "mutual_nda" not in selected and "unilateral_nda" not in selected and req.contract_type != "nda":
        risk_items.append({"clause": "Confidentiality", "risk": "medium", "note": "No NDA — confidential information may not be protected"})

    completeness = min(100, 30 + len(selected) * 12 + (15 if req.total_value > 0 else 0) + (15 if req.scope_description else 0) + (10 if req.party_a_name and req.party_b_name else 0))

    risk_level = "low" if len(risk_items) == 0 else "medium" if len(risk_items) <= 2 else "high"

    return {
        "document": contract_text,
        "analysis": {
            "completeness_score": completeness,
            "risk_level": risk_level,
            "risk_items": risk_items,
            "clause_count": len(clauses_content),
        },
        "parties": {
            "client": req.party_a_name,
            "freelancer": req.party_b_name,
        },
        "terms": {
            "contract_type": req.contract_type,
            "jurisdiction": req.jurisdiction,
            "payment_schedule": req.payment_schedule,
        },
        "financial": {
            "total_amount": req.total_value,
            "currency": req.currency,
        },
        "clauses": clauses_content,
    }
