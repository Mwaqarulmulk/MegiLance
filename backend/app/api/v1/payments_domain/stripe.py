# @AI-HINT: Stripe payments router — payment intents, webhooks, checkout sessions
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.core.config import get_settings
from app.core.rate_limit import api_rate_limit, strict_rate_limit

router = APIRouter()


class CreatePaymentIntent(BaseModel):
    amount: float
    currency: str = "usd"
    description: Optional[str] = None
    contract_id: Optional[int] = None

class CreateCheckoutSession(BaseModel):
    amount: float
    currency: str = "usd"
    success_url: str
    cancel_url: str
    description: Optional[str] = None


@router.post("/create-payment-intent")
@api_rate_limit()
async def create_payment_intent(request: Request, body: CreatePaymentIntent, current_user=Depends(get_current_user)):
    settings = get_settings()
    if not settings.STRIPE_SECRET_KEY:
        return {
            "mode": "mock",
            "client_secret": f"pi_mock_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}",
            "amount": body.amount,
            "currency": body.currency,
            "message": "Stripe not configured — using mock payment intent",
        }

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        intent = stripe.PaymentIntent.create(
            amount=int(body.amount * 100),
            currency=body.currency,
            description=body.description or f"Payment by user {current_user.id}",
            metadata={"user_id": str(current_user.id), "contract_id": str(body.contract_id or "")},
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": body.amount,
            "currency": body.currency,
        }
    except Exception as e:
        logger.error(f"stripe_create_payment_intent_error user={current_user.id} error={e}")
        raise HTTPException(status_code=500, detail="Payment processing failed. Please try again.")


@router.post("/create-checkout-session")
@api_rate_limit()
async def create_checkout_session(request: Request, body: CreateCheckoutSession, current_user=Depends(get_current_user)):
    settings = get_settings()
    if not settings.STRIPE_SECRET_KEY:
        return {
            "mode": "mock",
            "url": f"{body.success_url}?session_id=mock_{current_user.id}",
            "message": "Stripe not configured — using mock checkout",
        }

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": body.currency,
                    "product_data": {"name": body.description or "Payment"},
                    "unit_amount": int(body.amount * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=body.success_url,
            cancel_url=body.cancel_url,
            metadata={"user_id": str(current_user.id)},
        )
        return {"url": session.url, "session_id": session.id}
    except Exception as e:
        logger.error(f"stripe_checkout_error user={current_user.id} error={e}")
        raise HTTPException(status_code=500, detail="Checkout failed. Please try again.")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    settings = get_settings()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not settings.STRIPE_WEBHOOK_SECRET or not settings.STRIPE_SECRET_KEY:
        logger.warning("stripe_webhook_called_without_config: Rejecting — Stripe not configured")
        raise HTTPException(status_code=400, detail="Stripe webhook not configured")

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception as e:
        logger.error(f"stripe_webhook_signature_verification_failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.type == "payment_intent.succeeded":
        intent = event.data.object
        user_id = intent.metadata.get("user_id")
        contract_id = intent.metadata.get("contract_id")
        if user_id:
            now = datetime.now(timezone.utc).isoformat()
            amount_usd = intent.amount / 100
            uid = int(user_id)

            if contract_id:
                # Contract payment: credit the freelancer only (client already paid via Stripe)
                contract_id = int(contract_id)
                contract_result = execute_query(
                    "SELECT freelancer_id, client_id FROM contracts WHERE id = ?",
                    [contract_id],
                )
                from app.db.turso_http import parse_rows as _pr
                crows = _pr(contract_result)
                freelancer_id = crows[0].get("freelancer_id") if crows else None
                client_id = crows[0].get("client_id") if crows else None
                if freelancer_id:
                    execute_query(
                        "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
                        [amount_usd, int(freelancer_id)],
                    )
                    execute_query(
                        "INSERT INTO payments (contract_id, client_id, freelancer_id, amount, currency, payment_method, status, transaction_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'stripe', 'completed', ?, ?, ?)",
                        [contract_id, client_id or uid, int(freelancer_id), amount_usd, intent.currency or "usd", intent.id, now, now],
                    )
                    execute_query(
                        """INSERT INTO wallet_transactions (user_id, type, amount, currency, status, description, reference_id, created_at)
                           VALUES (?, 'escrow_release', ?, ?, 'completed', ?, ?, ?)""",
                        [int(freelancer_id), amount_usd, intent.currency or "USD",
                         f"Stripe payment for contract #{contract_id}", intent.id, now],
                    )
            else:
                # Standalone deposit: credit the paying user's wallet
                execute_query(
                    "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
                    [amount_usd, uid],
                )
                execute_query(
                    "INSERT INTO payments (contract_id, client_id, freelancer_id, amount, currency, payment_method, status, transaction_id, created_at, updated_at) VALUES (NULL, ?, NULL, ?, ?, 'stripe', 'completed', ?, ?, ?)",
                    [uid, amount_usd, intent.currency or "usd", intent.id, now, now],
                )
                execute_query(
                    """INSERT INTO wallet_transactions (user_id, type, amount, currency, status, description, reference_id, created_at)
                       VALUES (?, 'deposit', ?, ?, 'completed', ?, ?, ?)""",
                    [uid, amount_usd, intent.currency or "USD",
                     f"Stripe deposit (${amount_usd:.2f})", intent.id, now],
                )

    return {"received": True}


@router.get("/payment-methods")
async def list_payment_methods(current_user=Depends(get_current_user)):
    """List saved payment methods for the current user."""
    settings = get_settings()
    if not settings.STRIPE_SECRET_KEY:
        return {"payment_methods": []}

    # Get the Stripe customer ID from user profile
    user_result = execute_query(
        "SELECT stripe_customer_id FROM users WHERE id = ?",
        [current_user.id],
    )
    rows = parse_rows(user_result)
    stripe_customer_id = rows[0].get("stripe_customer_id") if rows else None

    if not stripe_customer_id:
        return {"payment_methods": [], "message": "No Stripe customer ID on file"}

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        methods = stripe.Customer.list_payment_methods(
            stripe_customer_id,
            type="card",
        )
        return {"payment_methods": [{"id": m.id, "brand": m.card.brand, "last4": m.card.last4, "exp_month": m.card.exp_month, "exp_year": m.card.exp_year} for m in methods.data]}
    except Exception as e:
        logger.error(f"stripe_list_methods_error user={current_user.id} error={e}")
        return {"payment_methods": [], "message": "Failed to load payment methods"}


@router.get("/transactions")
async def list_stripe_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT p.id, p.amount, p.currency, p.status, p.transaction_id, p.created_at FROM payments p WHERE p.client_id = ? AND p.payment_method = 'stripe' ORDER BY p.created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}
