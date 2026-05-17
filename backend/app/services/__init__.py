"""
MegiLance Backend Services Layer.

ARCHITECTURE NOTE:
- All services use Turso HTTP API (turso_http.py / turso_http_async.py) for DB access
- SQLAlchemy ORM models are schema reference only — not used at runtime
- Services are organized by domain: auth, payments, projects, AI, etc.
- Each service module exports functions that handle business logic
- Services should be imported by route handlers (api/routers), not called directly by clients

MIGRATION GUIDE:
- New services should use `from app.db.turso_http_async import execute_query_async`
- Existing services using `execute_query` from turso_http.py work but are synchronous
- Gradually migrate to async: replace `execute_query` → `execute_query_async` + `await`

SERVICE CATEGORIES:
- Identity & Auth: auth_service, users_service, social_login, identity_verification
- Projects: projects_service, proposals_service, contracts_service, milestones_service
- Payments: payments_service, escrow_service, wallet_service, stripe_service
- Communication: messages_service, notifications_service, email_service
- Reviews & Disputes: reviews_service, disputes_service
- Search: search_service, search_fts, saved_searches
- AI/ML: ai_chatbot, ai_writing, matching_engine, fraud_detection, llm_gateway
- Analytics: analytics_service, advanced_analytics, reports
- Gig Marketplace: gig_order, gig_delivery, gig_review
- Infrastructure: uploads_service, webhooks, scheduler, backup_restore
"""
