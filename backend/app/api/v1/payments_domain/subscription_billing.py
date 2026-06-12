# @AI-HINT: Subscription & billing router — premium plans, subscription management, billing history
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

# Subscription plans
PLANS = {
    "free": {
        "id": "free",
        "name": "Free",
        "price": 0,
        "currency": "USD",
        "interval": "month",
        "features": ["5 proposals/month", "Basic profile", "Standard support"],
        "proposals_limit": 5,
        "featured_profile": False,
        "priority_support": False,
        "analytics": False,
    },
    "starter": {
        "id": "starter",
        "name": "Starter",
        "price": 9.99,
        "currency": "USD",
        "interval": "month",
        "features": ["20 proposals/month", "Enhanced profile", "Priority support", "Basic analytics"],
        "proposals_limit": 20,
        "featured_profile": False,
        "priority_support": True,
        "analytics": True,
    },
    "professional": {
        "id": "professional",
        "name": "Professional",
        "price": 29.99,
        "currency": "USD",
        "interval": "month",
        "features": ["Unlimited proposals", "Featured profile", "Priority support", "Advanced analytics", "Custom branding"],
        "proposals_limit": -1,  # unlimited
        "featured_profile": True,
        "priority_support": True,
        "analytics": True,
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 99.99,
        "currency": "USD",
        "interval": "month",
        "features": ["Everything in Professional", "Team seats", "API access", "Dedicated account manager", "Custom integrations"],
        "proposals_limit": -1,
        "featured_profile": True,
        "priority_support": True,
        "analytics": True,
    },
}


class SubscriptionCreate(BaseModel):
    plan_id: str
    payment_method: str = "stripe"


class SubscriptionUpdate(BaseModel):
    plan_id: Optional[str] = None
    cancel_at_period_end: Optional[bool] = None


@router.get("/plans")
async def list_plans():
    """List all available subscription plans"""
    return {"plans": list(PLANS.values())}


@router.get("/current")
async def get_current_subscription(current_user=Depends(get_current_user)):
    """Get the current user's subscription"""
    result = execute_query(
        """SELECT id, plan_id, status, current_period_start, current_period_end,
                  cancel_at_period_end, created_at
           FROM subscriptions
           WHERE user_id = ? ORDER BY created_at DESC LIMIT 1""",
        [current_user.id],
    )
    rows = parse_rows(result)

    if not rows:
        return {
            "subscription": None,
            "plan": PLANS["free"],
            "usage": {"proposals_used": 0, "proposals_limit": 5},
        }

    sub = rows[0]
    plan = PLANS.get(sub.get("plan_id", "free"), PLANS["free"])

    # Get proposal usage for current period
    usage_result = execute_query(
        """SELECT COUNT(*) as used FROM proposals
           WHERE freelancer_id = ? AND created_at >= ?""",
        [current_user.id, sub.get("current_period_start", "")],
    )
    usage_rows = parse_rows(usage_result)
    proposals_used = usage_rows[0].get("used", 0) if usage_rows else 0

    return {
        "subscription": sub,
        "plan": plan,
        "usage": {
            "proposals_used": proposals_used,
            "proposals_limit": plan["proposals_limit"],
        },
    }


@router.post("")
async def create_subscription(request: SubscriptionCreate, current_user=Depends(get_current_user)):
    """Create a new subscription"""
    if request.plan_id not in PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan_id}")

    plan = PLANS[request.plan_id]
    if plan["price"] == 0:
        raise HTTPException(status_code=400, detail="Cannot subscribe to free plan")

    # Check existing active subscription
    existing = execute_query(
        "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'",
        [current_user.id],
    )
    if existing and existing.get("rows") and parse_rows(existing):
        raise HTTPException(status_code=400, detail="You already have an active subscription. Cancel it first.")

    now = datetime.now(timezone.utc).isoformat()
    # Simulate period end (30 days from now)
    from datetime import timedelta
    period_end = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    result = execute_query(
        """INSERT INTO subscriptions (user_id, plan_id, status, current_period_start,
                  current_period_end, cancel_at_period_end, created_at)
           VALUES (?, ?, 'active', ?, ?, 0, ?)""",
        [current_user.id, request.plan_id, now, period_end, now],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create subscription")

    return {
        "message": f"Successfully subscribed to {plan['name']} plan",
        "subscription_id": result.get("last_insert_rowid"),
        "plan": plan,
    }


@router.put("/current")
async def update_subscription(request: SubscriptionUpdate, current_user=Depends(get_current_user)):
    """Update or change subscription plan"""
    result = execute_query(
        "SELECT id, plan_id FROM subscriptions WHERE user_id = ? AND status = 'active'",
        [current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="No active subscription found")

    sub = rows[0]

    if request.plan_id:
        if request.plan_id not in PLANS:
            raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan_id}")
        execute_query(
            "UPDATE subscriptions SET plan_id = ? WHERE id = ?",
            [request.plan_id, sub["id"]],
        )
        return {"message": f"Plan changed to {PLANS[request.plan_id]['name']}"}

    if request.cancel_at_period_end is not None:
        execute_query(
            "UPDATE subscriptions SET cancel_at_period_end = ? WHERE id = ?",
            [1 if request.cancel_at_period_end else 0, sub["id"]],
        )
        return {"message": "Subscription will cancel at period end" if request.cancel_at_period_end else "Subscription cancellation reversed"}

    raise HTTPException(status_code=400, detail="No update parameters provided")


@router.post("/cancel")
async def cancel_subscription(current_user=Depends(get_current_user)):
    """Cancel the current subscription immediately"""
    result = execute_query(
        "UPDATE subscriptions SET status = 'cancelled', cancelled_at = ? WHERE user_id = ? AND status = 'active'",
        [datetime.now(timezone.utc).isoformat(), current_user.id],
    )
    return {"message": "Subscription cancelled"}


@router.get("/billing-history")
async def get_billing_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """Get billing history for the current user"""
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT id, plan_id, amount, currency, status, description, created_at
           FROM subscription_invoices
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?""",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/webhook")
async def subscription_webhook(payload: dict):
    """Handle Stripe webhook for subscription events"""
    event_type = payload.get("type", "")
    data = payload.get("data", {}).get("object", {})

    logger.info(f"subscription_webhook event={event_type} subscription={data.get('id')}")

    # Handle different event types
    if event_type == "invoice.paid":
        # Record successful payment
        customer_id = data.get("customer")
        if customer_id:
            user_result = execute_query(
                "SELECT id FROM users WHERE stripe_customer_id = ?",
                [customer_id],
            )
            rows = parse_rows(user_result)
            if rows:
                now = datetime.now(timezone.utc).isoformat()
                execute_query(
                    """INSERT INTO subscription_invoices (user_id, plan_id, amount, currency, status, description, created_at)
                       VALUES (?, ?, ?, ?, 'paid', ?, ?)""",
                    [rows[0]["id"], data.get("subscription"), data.get("amount_paid", 0) / 100, data.get("currency", "usd").upper(), data.get("description", ""), now],
                )

    elif event_type == "customer.subscription.deleted":
        # Cancel subscription
        sub_id = data.get("id")
        if sub_id:
            execute_query(
                "UPDATE subscriptions SET status = 'cancelled', cancelled_at = ? WHERE stripe_subscription_id = ?",
                [datetime.now(timezone.utc).isoformat(), sub_id],
            )

    return {"received": True}
