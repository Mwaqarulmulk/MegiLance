from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class IncomeCalcRequest(BaseModel):
    hourly_rate: float = 0
    hours_per_week: int = 40
    weeks_per_year: int = 50
    country: str = "US"
    currency: str = "USD"
    expense_categories: Optional[List[dict]] = None


@router.get("/options")
def get_options():
    return {
        "countries": [
            {"key": "US", "label": "United States", "currency": "USD"},
            {"key": "GB", "label": "United Kingdom", "currency": "GBP"},
            {"key": "CA", "label": "Canada", "currency": "CAD"},
            {"key": "AU", "label": "Australia", "currency": "AUD"},
            {"key": "PK", "label": "Pakistan", "currency": "PKR"},
            {"key": "IN", "label": "India", "currency": "INR"},
            {"key": "DE", "label": "Germany", "currency": "EUR"},
            {"key": "NG", "label": "Nigeria", "currency": "NGN"},
        ],
        "expense_categories": [
            {"key": "housing", "label": "Housing", "description": "Rent, mortgage, utilities", "icon": "home"},
            {"key": "transport", "label": "Transportation", "description": "Car, public transit, fuel", "icon": "car"},
            {"key": "food", "label": "Food & Groceries", "description": "Daily meals and groceries", "icon": "utensils"},
            {"key": "health", "label": "Health Insurance", "description": "Medical, dental, vision", "icon": "heart"},
            {"key": "equipment", "label": "Equipment", "description": "Computer, desk, chair", "icon": "monitor"},
            {"key": "software", "label": "Software & Tools", "description": "Subscriptions, licenses", "icon": "layers"},
            {"key": "education", "label": "Education", "description": "Courses, books, training", "icon": "book"},
            {"key": "taxes", "label": "Taxes", "description": "Estimated tax provisions", "icon": "file-text"},
        ],
        "income_types": [
            {"key": "freelance", "label": "Freelance / Contract"},
            {"key": "salary", "label": "Full-time Salary"},
            {"key": "passive", "label": "Passive Income"},
        ],
    }


@router.post("/calculate")
def calculate_income(req: IncomeCalcRequest):
    now = datetime.now(timezone.utc)
    gross_annual = req.hourly_rate * req.hours_per_week * req.weeks_per_year
    gross_monthly = gross_annual / 12
    gross_weekly = gross_annual / 52

    # Tax estimates by country
    tax_rates = {
        "US": {"self_employment": 15.3, "federal": 22, "state": 5},
        "GB": {"self_employment": 9, "federal": 20, "state": 0},
        "CA": {"self_employment": 9.9, "federal": 15, "state": 10},
        "AU": {"self_employment": 0, "federal": 19, "state": 0},
        "PK": {"self_employment": 0, "federal": 5, "state": 0},
        "IN": {"self_employment": 0, "federal": 10, "state": 5},
        "DE": {"self_employment": 18.6, "federal": 14, "state": 8},
        "NG": {"self_employment": 0, "federal": 10, "state": 0},
    }
    rates = tax_rates.get(req.country, tax_rates["US"])

    se_tax = gross_annual * rates["self_employment"] / 100
    fed_tax = gross_annual * rates["federal"] / 100
    state_tax = gross_annual * rates["state"] / 100
    total_tax = se_tax + fed_tax + state_tax
    net_annual = gross_annual - total_tax
    net_monthly = net_annual / 12

    effective_rate = (total_tax / gross_annual * 100) if gross_annual > 0 else 0

    return {
        "income": {
            "gross_annual": round(gross_annual, 2),
            "gross_monthly": round(gross_monthly, 2),
            "gross_weekly": round(gross_weekly, 2),
            "gross_hourly": req.hourly_rate,
        },
        "expenses": {
            "total_monthly": 0,
            "categories": [],
        },
        "taxes": {
            "self_employment_tax": round(se_tax, 2),
            "federal_tax": round(fed_tax, 2),
            "state_tax": round(state_tax, 2),
            "total_tax": round(total_tax, 2),
        },
        "net_income": {
            "annual": round(net_annual, 2),
            "monthly": round(net_monthly, 2),
            "weekly": round(net_annual / 52, 2),
            "hourly": round(net_annual / (req.hours_per_week * req.weeks_per_year), 2) if req.hours_per_week and req.weeks_per_year else 0,
        },
        "effective_rates": {
            "tax_rate": round(effective_rate, 1),
            "self_employment_rate": rates["self_employment"],
            "federal_rate": rates["federal"],
            "state_rate": rates["state"],
        },
        "savings": {
            "recommended_monthly": round(net_monthly * 0.2, 2),
            "recommended_annual": round(net_annual * 0.2, 2),
        },
        "health": {
            "score": 75 if net_annual > 40000 else 50 if net_annual > 25000 else 30,
            "level": "good" if net_annual > 40000 else "moderate" if net_annual > 25000 else "needs_improvement",
            "insights": [
                f"Your effective tax rate is {round(effective_rate, 1)}%",
                f"Net monthly income: ${round(net_monthly, 2):,.2f}",
            ],
        },
        "rate_recommendations": {
            "suggested_hourly": round(req.hourly_rate * 1.15, 2),
            "premium_rate": round(req.hourly_rate * 1.5, 2),
        },
        "meta": {
            "country": req.country,
            "currency": req.currency,
            "calculated_at": now.isoformat(),
        },
    }
