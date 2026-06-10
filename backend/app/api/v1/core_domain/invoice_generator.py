from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import logging
import math

logger = logging.getLogger(__name__)

router = APIRouter()


class InvoiceItem(BaseModel):
    description: str
    quantity: float = 1
    unit: str = "hours"
    rate: float = 0


class InvoiceGenerateRequest(BaseModel):
    items: List[InvoiceItem]
    sender_name: str = ""
    sender_email: str = ""
    sender_address: str = ""
    sender_phone: str = ""
    recipient_name: str = ""
    recipient_email: str = ""
    recipient_address: str = ""
    currency: str = "usd"
    tax_rate: float = 0
    tax_type: str = "percentage"
    discount_type: str = "none"
    discount_value: float = 0
    template: str = "professional"
    payment_terms: str = "net_30"
    notes: str = ""
    issue_date: Optional[str] = None


@router.get("/options")
def get_options():
    return {
        "currencies": [
            {"key": "usd", "symbol": "$", "name": "US Dollar"},
            {"key": "eur", "symbol": "\u20ac", "name": "Euro"},
            {"key": "gbp", "symbol": "\u00a3", "name": "British Pound"},
            {"key": "pkr", "symbol": "PKR", "name": "Pakistani Rupee"},
            {"key": "cad", "symbol": "C$", "name": "Canadian Dollar"},
            {"key": "aud", "symbol": "A$", "name": "Australian Dollar"},
        ],
        "tax_rates": [
            {"key": "none", "label": "No Tax", "rate": 0, "type": "none"},
            {"key": "standard", "label": "Standard (15%)", "rate": 15, "type": "percentage"},
            {"key": "reduced", "label": "Reduced (5%)", "rate": 5, "type": "percentage"},
            {"key": "zero", "label": "Zero Rated (0%)", "rate": 0, "type": "percentage"},
            {"key": "custom", "label": "Custom Rate", "rate": 0, "type": "percentage"},
        ],
        "templates": [
            {"key": "professional", "label": "Professional", "description": "Clean, business-focused design", "accent_color": "#1976d2"},
            {"key": "modern", "label": "Modern", "description": "Minimalist with bold accents", "accent_color": "#7c3aed"},
            {"key": "creative", "label": "Creative", "description": "Colorful and expressive", "accent_color": "#f59e0b"},
            {"key": "simple", "label": "Simple", "description": "Basic, no-frills layout", "accent_color": "#374151"},
        ],
        "payment_terms": [
            {"key": "due_on_receipt", "label": "Due on Receipt", "days": 0},
            {"key": "net_7", "label": "Net 7", "days": 7},
            {"key": "net_14", "label": "Net 14", "days": 14},
            {"key": "net_30", "label": "Net 30", "days": 30},
            {"key": "net_60", "label": "Net 60", "days": 60},
        ],
    }


@router.post("/generate")
def generate_invoice(req: InvoiceGenerateRequest):
    now = datetime.now(timezone.utc)
    issue_date = req.issue_date or now.strftime("%Y-%m-%d")

    term_days_map = {
        "due_on_receipt": 0, "net_7": 7, "net_14": 14, "net_30": 30, "net_60": 60,
    }
    term_days = term_days_map.get(req.payment_terms, 30)
    due_date = (now + timedelta(days=term_days)).strftime("%Y-%m-%d")

    currency_data = {
        "usd": {"code": "USD", "symbol": "$", "name": "US Dollar", "decimal_places": 2, "position": "before"},
        "eur": {"code": "EUR", "symbol": "\u20ac", "name": "Euro", "decimal_places": 2, "position": "before"},
        "gbp": {"code": "GBP", "symbol": "\u00a3", "name": "British Pound", "decimal_places": 2, "position": "before"},
        "pkr": {"code": "PKR", "symbol": "PKR", "name": "Pakistani Rupee", "decimal_places": 0, "position": "before"},
    }
    currency = currency_data.get(req.currency, currency_data["usd"])

    items_data = []
    subtotal = 0
    for i, item in enumerate(req.items):
        total = round(item.quantity * item.rate, 2)
        subtotal += total
        items_data.append({
            "index": i + 1,
            "description": item.description,
            "quantity": item.quantity,
            "unit": item.unit,
            "rate": item.rate,
            "total": total,
        })

    discount_amount = 0
    if req.discount_type == "percentage":
        discount_amount = round(subtotal * (req.discount_value / 100), 2)
    elif req.discount_type == "fixed":
        discount_amount = req.discount_value

    taxable_amount = subtotal - discount_amount
    tax_amount = round(taxable_amount * (req.tax_rate / 100), 2) if req.tax_type == "percentage" else 0
    grand_total = round(taxable_amount + tax_amount, 2)

    template_data = {
        "professional": {"key": "professional", "label": "Professional", "accent_color": "#1976d2"},
        "modern": {"key": "modern", "label": "Modern", "accent_color": "#7c3aed"},
        "creative": {"key": "creative", "label": "Creative", "accent_color": "#f59e0b"},
        "simple": {"key": "simple", "label": "Simple", "accent_color": "#374151"},
    }

    inv_number = f"INV-{now.strftime('%Y%m%d')}-{now.microsecond % 10000:04d}"

    return {
        "invoice": {
            "number": inv_number,
            "issue_date": issue_date,
            "due_date": due_date,
            "payment_terms": req.payment_terms,
            "status": "draft",
        },
        "sender": {
            "name": req.sender_name,
            "email": req.sender_email,
            "address": req.sender_address,
            "phone": req.sender_phone,
        },
        "recipient": {
            "name": req.recipient_name,
            "email": req.recipient_email,
            "address": req.recipient_address,
        },
        "items": items_data,
        "calculations": {
            "subtotal": subtotal,
            "discount": {"type": req.discount_type, "value": req.discount_value, "amount": discount_amount, "label": f"{req.discount_type} discount"},
            "taxable_amount": taxable_amount,
            "tax": {"preset": req.tax_rate, "rate": req.tax_rate, "amount": tax_amount, "label": f"Tax ({req.tax_rate}%)", "type": req.tax_type},
            "grand_total": grand_total,
            "amount_in_words": _number_to_words(grand_total, currency["code"]),
        },
        "currency": currency,
        "template": template_data.get(req.template, template_data["professional"]),
        "notes": req.notes,
        "summary": {
            "item_count": len(items_data),
            "total_hours": sum(i.quantity for i in req.items if i.unit == "hours") or None,
            "avg_item_value": round(subtotal / len(items_data), 2) if items_data else 0,
            "effective_tax_rate": req.tax_rate,
            "discount_savings": discount_amount,
        },
        "meta": {"generated_at": now.isoformat()},
    }


def _number_to_words(amount: float, currency_code: str = "USD") -> str:
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if amount == 0:
        return f"Zero {currency_code}"

    n = int(amount)
    parts = []
    if n >= 1000:
        parts.append(f"{ones[n // 1000]} Thousand")
        n %= 1000
    if n >= 100:
        parts.append(f"{ones[n // 100]} Hundred")
        n %= 100
    if n >= 20:
        t = tens[n // 10]
        o = ones[n % 10]
        parts.append(f"{t} {o}".strip())
    elif n > 0:
        parts.append(ones[n])

    integer_part = " ".join(parts).strip()
    cents = round((amount - int(amount)) * 100)
    if cents:
        return f"{integer_part} and {cents}/100 {currency_code}"
    return f"{integer_part} {currency_code}"
