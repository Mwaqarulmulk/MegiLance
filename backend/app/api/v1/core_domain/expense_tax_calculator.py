from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ExpenseCalcRequest(BaseModel):
    annual_income: float = 0
    deductions: Optional[List[dict]] = None
    expenses: Optional[List[dict]] = None
    country: str = "US"
    filing_status: str = "single"
    state: Optional[str] = None


@router.get("/options")
def get_options():
    return {
        "regions": [
            {"key": "US", "label": "United States", "currency": "USD"},
            {"key": "GB", "label": "United Kingdom", "currency": "GBP"},
            {"key": "CA", "label": "Canada", "currency": "CAD"},
            {"key": "AU", "label": "Australia", "currency": "AUD"},
            {"key": "PK", "label": "Pakistan", "currency": "PKR"},
            {"key": "IN", "label": "India", "currency": "INR"},
        ],
        "filing_statuses": [
            {"key": "single", "label": "Single"},
            {"key": "married_joint", "label": "Married Filing Jointly"},
            {"key": "married_separate", "label": "Married Filing Separately"},
            {"key": "head_of_household", "label": "Head of Household"},
        ],
        "deduction_categories": [
            {"key": "home_office", "label": "Home Office", "description": "Dedicated workspace deduction"},
            {"key": "equipment", "label": "Equipment & Supplies", "description": "Computer, desk, etc."},
            {"key": "software", "label": "Software & Subscriptions", "description": "Tools and licenses"},
            {"key": "education", "label": "Education & Training", "description": "Courses and certifications"},
            {"key": "travel", "label": "Travel & Transportation", "description": "Business travel"},
            {"key": "insurance", "label": "Insurance", "description": "Health, liability, etc."},
            {"key": "internet_phone", "label": "Internet & Phone", "description": "Business communication"},
            {"key": "marketing", "label": "Marketing & Advertising", "description": "Promotion costs"},
        ],
        "us_state_taxes": [
            {"key": "none", "label": "No State Tax", "rate": 0},
            {"key": "CA", "label": "California", "rate": 9.3},
            {"key": "NY", "label": "New York", "rate": 8.82},
            {"key": "TX", "label": "Texas", "rate": 0},
            {"key": "FL", "label": "Florida", "rate": 0},
            {"key": "WA", "label": "Washington", "rate": 0},
        ],
    }


@router.post("/calculate")
def calculate_expenses(req: ExpenseCalcRequest):
    now = datetime.now(timezone.utc)
    income = req.annual_income

    # US freelancer tax calculation
    se_tax_rate = 15.3
    se_tax = income * se_tax_rate / 100

    # Federal brackets (simplified 2024)
    brackets = [
        (11600, 0.10), (47150, 0.12), (100525, 0.22), (191950, 0.24),
        (243725, 0.32), (609350, 0.35), (float('inf'), 0.37),
    ]
    federal_tax = 0
    prev = 0
    for limit, rate in brackets:
        if income > prev:
            taxable = min(income, limit) - prev
            federal_tax += taxable * rate
        prev = limit

    # State tax
    state_tax = 0
    if req.state and req.state != "none":
        state_rates = {"CA": 0.093, "NY": 0.088, "TX": 0, "FL": 0, "WA": 0}
        state_tax = income * state_rates.get(req.state, 0.05)

    total_tax = se_tax + federal_tax + state_tax
    net_income = income - total_tax

    # Deductions
    total_deductions = sum(d.get("amount", 0) for d in (req.deductions or []))
    taxable_income = max(0, income - total_deductions)
    effective_rate = (total_tax / income * 100) if income > 0 else 0

    # Quarterly estimates
    quarterly_tax = total_tax / 4

    return {
        "income": {"gross_annual": income, "gross_monthly": round(income / 12, 2)},
        "deductions": {
            "total": total_deductions,
            "items": req.deductions or [],
            "taxable_income": taxable_income,
        },
        "expenses": {
            "total_annual": sum(e.get("amount", 0) for e in (req.expenses or [])),
            "items": req.expenses or [],
        },
        "taxes": {
            "self_employment_tax": round(se_tax, 2),
            "federal_income_tax": round(federal_tax, 2),
            "state_tax": round(state_tax, 2),
            "total_tax": round(total_tax, 2),
            "effective_rate": round(effective_rate, 1),
            "marginal_rate": 22 if income > 47150 else 12 if income > 11600 else 10,
        },
        "quarterly": {
            "estimated_payment": round(quarterly_tax, 2),
            "due_dates": ["Apr 15", "Jun 15", "Sep 15", "Jan 15"],
        },
        "net_income": {
            "annual": round(net_income, 2),
            "monthly": round(net_income / 12, 2),
            "weekly": round(net_income / 52, 2),
        },
        "profit_loss": {
            "revenue": income,
            "expenses": sum(e.get("amount", 0) for e in (req.expenses or [])),
            "net_profit": round(income - sum(e.get("amount", 0) for e in (req.expenses or [])), 2),
        },
        "year_over_year": {
            "current_year": round(net_income, 2),
            "projected_next_year": round(net_income * 1.05, 2),
        },
        "recommendations": [
            {"type": "deduction", "detail": f"Consider claiming home office deduction if applicable"},
            {"type": "retirement", "detail": "Max out SEP-IRA contributions ($69,000 limit for 2024) to reduce taxable income"},
            {"type": "quarterly", "detail": f"Set aside ${round(quarterly_tax, 2):,.2f} quarterly for estimated taxes"},
        ],
        "meta": {"country": req.country, "filing_status": req.filing_status, "state": req.state, "calculated_at": now.isoformat()},
    }
