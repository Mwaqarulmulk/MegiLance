from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class IncomeCalcRequest(BaseModel):
    income_type: str = "hourly"
    rate: float = 0
    hours_per_week: int = 40
    weeks_per_year: int = 48
    days_per_week: int = 5
    projects_per_year: int = 6
    avg_project_value: float = 5000
    monthly_retainer: float = 0
    retainer_clients: int = 0
    country: str = "us"
    state_tax_rate: float = 0
    monthly_expenses: Optional[Dict[str, float]] = None
    savings_goal_percent: float = 20
    emergency_fund_months: int = 6
    retirement_contribution_percent: float = 10
    vacation_weeks: int = 4
    sick_days: int = 5


COUNTRY_DATA = {
    "us": {"label": "United States", "currency": "USD", "self_employment": 15.3, "federal_brackets": [(11000, 0.10), (44725, 0.12), (95375, 0.22), (182100, 0.24), (231250, 0.32), (578125, 0.35), (float('inf'), 0.37)], "standard_deduction": 14600},
    "uk": {"label": "United Kingdom", "currency": "GBP", "self_employment": 9, "federal_brackets": [(12570, 0.0), (50270, 0.20), (125140, 0.40), (float('inf'), 0.45)], "standard_deduction": 0},
    "ca": {"label": "Canada", "currency": "CAD", "self_employment": 9.9, "federal_brackets": [(53359, 0.15), (106717, 0.205), (165430, 0.26), (235675, 0.29), (float('inf'), 0.33)], "standard_deduction": 15705},
    "au": {"label": "Australia", "currency": "AUD", "self_employment": 0, "federal_brackets": [(18200, 0.0), (45000, 0.19), (120000, 0.325), (180000, 0.37), (float('inf'), 0.45)], "standard_deduction": 0},
    "pk": {"label": "Pakistan", "currency": "PKR", "self_employment": 0, "federal_brackets": [(600000, 0.0), (1200000, 0.025), (2400000, 0.125), (3600000, 0.20), (6000000, 0.25), (12000000, 0.325), (float('inf'), 0.35)], "standard_deduction": 0},
    "in": {"label": "India", "currency": "INR", "self_employment": 0, "federal_brackets": [(300000, 0.0), (600000, 0.05), (900000, 0.10), (1200000, 0.15), (1500000, 0.20), (float('inf'), 0.30)], "standard_deduction": 50000},
    "de": {"label": "Germany", "currency": "EUR", "self_employment": 18.6, "federal_brackets": [(11004, 0.0), (17005, 0.14), (66760, 0.24), (277825, 0.42), (float('inf'), 0.45)], "standard_deduction": 0},
    "ng": {"label": "Nigeria", "currency": "NGN", "self_employment": 0, "federal_brackets": [(300000, 0.07), (600000, 0.11), (1100000, 0.15), (1600000, 0.19), (3200000, 0.21), (float('inf'), 0.24)], "standard_deduction": 0},
}


@router.get("/options")
def get_options():
    countries = [{"key": k, "label": v["label"], "currency": v["currency"]} for k, v in COUNTRY_DATA.items()]
    return {
        "countries": countries,
        "expense_categories": [
            {"key": "housing", "label": "Housing", "description": "Rent, mortgage, utilities", "icon": "home"},
            {"key": "transport", "label": "Transportation", "description": "Car, public transit, fuel", "icon": "car"},
            {"key": "food", "label": "Food & Groceries", "description": "Daily meals and groceries", "icon": "utensils"},
            {"key": "health", "label": "Health Insurance", "description": "Medical, dental, vision", "icon": "heart"},
            {"key": "equipment", "label": "Equipment", "description": "Computer, desk, chair", "icon": "monitor"},
            {"key": "software", "label": "Software & Tools", "description": "Subscriptions, licenses", "icon": "layers"},
            {"key": "education", "label": "Education", "description": "Courses, books, training", "icon": "book"},
            {"key": "marketing", "label": "Marketing", "description": "Advertising, networking", "icon": "trending-up"},
            {"key": "office", "label": "Office Space", "description": "Co-working, office supplies", "icon": "briefcase"},
            {"key": "legal", "label": "Legal & Accounting", "description": "Legal fees, accountant", "icon": "shield"},
            {"key": "misc", "label": "Miscellaneous", "description": "Other business expenses", "icon": "more-horizontal"},
        ],
        "income_types": [
            {"key": "hourly", "label": "Hourly Rate"},
            {"key": "daily", "label": "Day Rate"},
            {"key": "project", "label": "Project-Based"},
            {"key": "retainer", "label": "Monthly Retainer"},
            {"key": "mixed", "label": "Mixed Income"},
        ],
    }


def calculate_progressive_tax(gross: float, brackets: list) -> float:
    tax = 0
    prev_limit = 0
    for limit, rate in brackets:
        taxable = min(gross, limit) - prev_limit
        if taxable > 0:
            tax += taxable * rate
        prev_limit = limit
        if gross <= limit:
            break
    return tax


@router.post("/calculate")
def calculate_income(req: IncomeCalcRequest):
    now = datetime.now(timezone.utc)
    country_data = COUNTRY_DATA.get(req.country, COUNTRY_DATA["us"])
    currency = country_data["currency"]
    working_weeks = req.weeks_per_year - req.vacation_weeks
    billable_hours_year = req.hours_per_week * working_weeks
    billable_weeks = working_weeks

    # Calculate gross income by type
    gross_annual = 0
    breakdown = []

    if req.income_type in ("hourly", "mixed"):
        hourly_income = req.rate * req.hours_per_week * working_weeks
        gross_annual += hourly_income
        breakdown.append({"source": "Hourly Rate", "annual": round(hourly_income, 2), "detail": f"${req.rate}/hr x {req.hours_per_week}hrs x {working_weeks}wks"})

    if req.income_type in ("daily", "mixed"):
        daily_income = req.rate * req.days_per_week * working_weeks * 52 / req.weeks_per_year
        gross_annual += daily_income
        breakdown.append({"source": "Day Rate", "annual": round(daily_income, 2), "detail": f"${req.rate}/day x {req.days_per_week}days x {working_weeks}wks"})

    if req.income_type in ("project", "mixed"):
        project_income = req.projects_per_year * req.avg_project_value
        gross_annual += project_income
        breakdown.append({"source": "Project Income", "annual": round(project_income, 2), "detail": f"{req.projects_per_year} projects x ${req.avg_project_value:,.0f}"})

    if req.income_type in ("retainer", "mixed"):
        retainer_income = req.monthly_retainer * req.retainer_clients * 12
        gross_annual += retainer_income
        breakdown.append({"source": "Retainer Income", "annual": round(retainer_income, 2), "detail": f"${req.monthly_retainer:,.0f}/mo x {req.retainer_clients} clients"})

    gross_monthly = gross_annual / 12

    # Tax calculation
    brackets = country_data["federal_brackets"]
    se_tax_rate = country_data["self_employment"]
    se_tax = gross_annual * se_tax_rate / 100
    federal_tax = calculate_progressive_tax(gross_annual, brackets)
    state_tax = gross_annual * req.state_tax_rate / 100
    total_tax = se_tax + federal_tax + state_tax
    effective_rate = round(total_tax / gross_annual * 100, 1) if gross_annual > 0 else 0
    net_annual = gross_annual - total_tax
    net_monthly = net_annual / 12
    net_weekly = net_annual / 52
    net_daily = net_annual / (working_weeks * (req.hours_per_week / 8)) if working_weeks > 0 else 0

    # Effective rates
    hourly_effective = net_annual / billable_hours_year if billable_hours_year > 0 else 0
    daily_effective = net_annual / (billable_weeks * (req.hours_per_week / 8)) if billable_weeks > 0 and req.hours_per_week > 0 else 0

    # Expenses
    total_monthly_expenses = sum(req.monthly_expenses.values()) if req.monthly_expenses else 0
    total_annual_expenses = total_monthly_expenses * 12
    expense_ratio = round(total_monthly_expenses / net_monthly * 100, 1) if net_monthly > 0 else 0
    expense_breakdown = []
    for k, v in (req.monthly_expenses or {}).items():
        if v > 0:
            expense_breakdown.append({"category": k, "monthly": v, "annual": round(v * 12, 2), "label": k.replace("_", " ").title()})

    # Savings
    monthly_savings = net_monthly * (req.savings_goal_percent / 100)
    annual_savings = monthly_savings * 12
    monthly_retirement = net_monthly * (req.retirement_contribution_percent / 100)
    emergency_fund_target = total_monthly_expenses * req.emergency_fund_months
    disposable_monthly = net_monthly - total_monthly_expenses - monthly_savings - monthly_retirement

    # Financial health score
    health_score = 50
    health_insights = []
    if gross_annual > 100000:
        health_score += 15
        health_insights.append({"type": "success", "title": "Strong Income", "message": "Your gross income is above average for freelancers"})
    elif gross_annual < 30000:
        health_score -= 10
        health_insights.append({"type": "warning", "title": "Low Income", "message": "Consider increasing rates or finding higher-value clients"})

    if effective_rate < 25:
        health_score += 10
        health_insights.append({"type": "success", "title": "Low Tax Burden", "message": f"Your effective tax rate of {effective_rate}% is favorable"})
    elif effective_rate > 40:
        health_score -= 5
        health_insights.append({"type": "warning", "title": "High Tax Burden", "message": "Consider tax optimization strategies"})

    if expense_ratio < 50:
        health_score += 10
        health_insights.append({"type": "success", "title": "Healthy Expense Ratio", "message": "Your expenses are well-managed relative to income"})
    elif expense_ratio > 80:
        health_score -= 10
        health_insights.append({"type": "danger", "title": "High Expenses", "message": "Your expenses consume most of your income"})

    if disposable_monthly > 0:
        health_score += 10
        health_insights.append({"type": "success", "title": "Positive Cash Flow", "message": f"You have ${disposable_monthly:,.0f}/mo disposable income after expenses and savings"})
    else:
        health_score -= 15
        health_insights.append({"type": "danger", "title": "Negative Cash Flow", "message": "Expenses and savings goals exceed your net income"})

    if req.savings_goal_percent >= 20:
        health_score += 5
        health_insights.append({"type": "success", "title": "Good Savings Rate", "message": "You're saving a healthy percentage of income"})

    health_score = max(0, min(100, health_score))
    health_level = "excellent" if health_score >= 85 else "good" if health_score >= 65 else "moderate" if health_score >= 45 else "needs_improvement"

    # Rate recommendations
    monthly_expenses_total = total_monthly_expenses + monthly_savings + monthly_retirement
    annual_expenses_total = monthly_expenses_total * 12
    total_tax_on_target = annual_expenses_total / (1 - effective_rate / 100) if effective_rate < 100 else annual_expenses_total * 2
    break_even_hourly = total_tax_on_target / billable_hours_year if billable_hours_year > 0 else 0
    comfortable_hourly = break_even_hourly * 1.3
    premium_hourly = break_even_hourly * 1.8

    return {
        "income": {
            "gross_annual": round(gross_annual, 2),
            "gross_monthly": round(gross_monthly, 2),
            "breakdown": breakdown,
        },
        "expenses": {
            "annual": round(total_annual_expenses, 2),
            "monthly": round(total_monthly_expenses, 2),
            "breakdown": expense_breakdown,
            "expense_ratio": expense_ratio,
        },
        "taxes": {
            "income_tax": round(federal_tax, 2),
            "self_employment_tax": round(se_tax, 2),
            "state_tax": round(state_tax, 2),
            "total_tax": round(total_tax, 2),
            "effective_rate": effective_rate,
            "quarterly_estimate": round(total_tax / 4, 2),
            "country": country_data["label"],
            "currency": currency,
        },
        "net_income": {
            "annual": round(net_annual, 2),
            "monthly": round(net_monthly, 2),
            "weekly": round(net_weekly, 2),
            "daily": round(net_daily, 2),
        },
        "effective_rates": {
            "hourly": round(hourly_effective, 2),
            "daily": round(daily_effective, 2),
            "billable_hours_year": billable_hours_year,
            "billable_weeks": billable_weeks,
        },
        "savings": {
            "monthly_savings": round(monthly_savings, 2),
            "annual_savings": round(annual_savings, 2),
            "monthly_retirement": round(monthly_retirement, 2),
            "emergency_fund_target": round(emergency_fund_target, 2),
            "disposable_monthly": round(disposable_monthly, 2),
        },
        "health": {
            "score": health_score,
            "level": health_level,
            "insights": health_insights,
        },
        "rate_recommendations": {
            "break_even_hourly": round(break_even_hourly, 2),
            "comfortable_hourly": round(comfortable_hourly, 2),
            "premium_hourly": round(premium_hourly, 2),
        },
        "meta": {
            "currency": currency,
            "country": country_data["label"],
        },
    }
