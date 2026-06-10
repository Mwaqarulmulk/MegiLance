# @AI-HINT: Multi-currency router — currency conversion and preferences
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import logging
import httpx
import time

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

# Fallback rates (used if live API fails)
FALLBACK_RATES = {
    "USD": {"EUR": 0.92, "GBP": 0.79, "PKR": 278.50, "INR": 83.12, "AED": 3.67, "SAR": 3.75, "CAD": 1.36, "AUD": 1.53},
    "EUR": {"USD": 1.09, "GBP": 0.86, "PKR": 303.15, "INR": 90.45, "AED": 3.99, "SAR": 4.08, "CAD": 1.48, "AUD": 1.66},
    "GBP": {"USD": 1.27, "EUR": 1.16, "PKR": 352.81, "INR": 105.18, "AED": 4.64, "SAR": 4.74, "CAD": 1.72, "AUD": 1.94},
}

# Cache for live rates (refresh every 15 minutes)
_rate_cache: dict = {"rates": None, "timestamp": 0}
_CACHE_TTL = 900  # 15 minutes


async def _fetch_live_rates(base: str = "USD") -> Optional[dict]:
    """Fetch live exchange rates from free API with cache."""
    now = time.time()
    if _rate_cache["rates"] and (now - _rate_cache["timestamp"]) < _CACHE_TTL:
        cached = _rate_cache["rates"].get(base)
        if cached:
            return cached

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"https://api.exchangerate-api.com/v4/latest/{base}")
            resp.raise_for_status()
            data = resp.json()
            rates = data.get("rates", {})
            _rate_cache["rates"] = _rate_cache["rates"] or {}
            _rate_cache["rates"][base] = rates
            _rate_cache["timestamp"] = now
            return rates
    except Exception as e:
        logger.warning(f"Failed to fetch live exchange rates: {e}")
        return None


SUPPORTED_CURRENCIES = [
    {"code": "USD", "name": "US Dollar", "symbol": "$"},
    {"code": "EUR", "name": "Euro", "symbol": "\u20ac"},
    {"code": "GBP", "name": "British Pound", "symbol": "\u00a3"},
    {"code": "PKR", "name": "Pakistani Rupee", "symbol": "\u20a8"},
    {"code": "INR", "name": "Indian Rupee", "symbol": "\u20b9"},
    {"code": "AED", "name": "UAE Dirham", "symbol": "d.AED"},
    {"code": "SAR", "name": "Saudi Riyal", "symbol": "SAR"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "A$"},
]


@router.get("/currencies")
async def get_supported_currencies():
    return {"currencies": SUPPORTED_CURRENCIES}


@router.get("/rates")
async def get_exchange_rates(base: str = Query("USD")):
    live_rates = await _fetch_live_rates(base)
    if live_rates:
        filtered = {k: v for k, v in live_rates.items() if k in [c["code"] for c in SUPPORTED_CURRENCIES]}
        return {"base": base, "rates": filtered, "source": "live"}
    fallback = FALLBACK_RATES.get(base, {})
    return {"base": base, "rates": fallback, "source": "fallback"}


@router.get("/convert")
async def convert_currency(
    amount: float = Query(..., gt=0),
    from_currency: str = Query("USD"),
    to_currency: str = Query("EUR"),
):
    if from_currency == to_currency:
        return {"amount": amount, "from": from_currency, "to": to_currency, "result": amount, "rate": 1, "source": "same"}

    # Try live rate first
    live_rates = await _fetch_live_rates(from_currency)
    rate = None
    source = "fallback"

    if live_rates and to_currency in live_rates:
        rate = live_rates[to_currency]
        source = "live"
    else:
        # Try cross-rate via USD
        if live_rates and "USD" in live_rates:
            to_usd = 1.0 / live_rates.get("USD", 1)
            live_to = await _fetch_live_rates("USD")
            if live_to and to_currency in live_to:
                rate = to_usd * live_to[to_currency]
                source = "live_cross"

    if rate is None:
        rate = FALLBACK_RATES.get(from_currency, {}).get(to_currency)
        if not rate:
            usd_rate = FALLBACK_RATES.get(from_currency, {}).get("USD", 1)
            to_rate = FALLBACK_RATES.get("USD", {}).get(to_currency, 1)
            rate = usd_rate * to_rate

    result = amount * rate
    return {
        "amount": amount,
        "from": from_currency,
        "to": to_currency,
        "result": round(result, 2),
        "rate": round(rate, 6),
        "source": source,
    }


@router.get("/preference")
async def get_preferred_currency(current_user=Depends(get_current_user)):
    result = execute_query("SELECT preferred_currency FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    currency = rows[0].get("preferred_currency") if rows else "USD"
    return {"currency": currency or "USD"}


@router.put("/preference")
async def set_preferred_currency(data: dict, current_user=Depends(get_current_user)):
    currency = data.get("currency", "USD")
    valid_codes = [c["code"] for c in SUPPORTED_CURRENCIES]
    if currency not in valid_codes:
        raise HTTPException(status_code=400, detail=f"Unsupported currency. Valid: {valid_codes}")
    execute_query("UPDATE users SET preferred_currency = ? WHERE id = ?", [currency, current_user.id])
    return {"message": "Preferred currency updated", "currency": currency}
