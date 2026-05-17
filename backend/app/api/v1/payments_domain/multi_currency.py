# @AI-HINT: Multi-currency router — currency conversion and preferences
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

EXCHANGE_RATES = {
    "USD": {"EUR": 0.92, "GBP": 0.79, "PKR": 278.50, "INR": 83.12, "AED": 3.67, "SAR": 3.75, "CAD": 1.36, "AUD": 1.53},
    "EUR": {"USD": 1.09, "GBP": 0.86, "PKR": 303.15, "INR": 90.45, "AED": 3.99, "SAR": 4.08, "CAD": 1.48, "AUD": 1.66},
    "GBP": {"USD": 1.27, "EUR": 1.16, "PKR": 352.81, "INR": 105.18, "AED": 4.64, "SAR": 4.74, "CAD": 1.72, "AUD": 1.94},
}


@router.get("/currencies")
async def get_supported_currencies():
    return {
        "currencies": [
            {"code": "USD", "name": "US Dollar", "symbol": "$"},
            {"code": "EUR", "name": "Euro", "symbol": "€"},
            {"code": "GBP", "name": "British Pound", "symbol": "£"},
            {"code": "PKR", "name": "Pakistani Rupee", "symbol": "₨"},
            {"code": "INR", "name": "Indian Rupee", "symbol": "₹"},
            {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ"},
            {"code": "SAR", "name": "Saudi Riyal", "symbol": "﷼"},
            {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$"},
            {"code": "AUD", "name": "Australian Dollar", "symbol": "A$"},
        ]
    }


@router.get("/rates")
async def get_exchange_rates(base: str = Query("USD")):
    rates = EXCHANGE_RATES.get(base, {})
    return {"base": base, "rates": rates}


@router.get("/convert")
async def convert_currency(
    amount: float = Query(...),
    from_currency: str = Query("USD"),
    to_currency: str = Query("EUR"),
):
    if from_currency == to_currency:
        return {"amount": amount, "from": from_currency, "to": to_currency, "result": amount, "rate": 1}

    rate = EXCHANGE_RATES.get(from_currency, {}).get(to_currency)
    if not rate:
        usd_rate = EXCHANGE_RATES.get(from_currency, {}).get("USD", 1)
        to_rate = EXCHANGE_RATES.get("USD", {}).get(to_currency, 1)
        rate = usd_rate * to_rate

    result = amount * rate
    return {"amount": amount, "from": from_currency, "to": to_currency, "result": round(result, 2), "rate": rate}


@router.get("/preference")
async def get_preferred_currency(current_user=Depends(get_current_user)):
    result = execute_query("SELECT preferred_currency FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    currency = rows[0].get("preferred_currency") if rows else "USD"
    return {"currency": currency or "USD"}


@router.put("/preference")
async def set_preferred_currency(data: dict, current_user=Depends(get_current_user)):
    currency = data.get("currency", "USD")
    execute_query("UPDATE users SET preferred_currency = ? WHERE id = ?", [currency, current_user.id])
    return {"message": "Preferred currency updated", "currency": currency}
