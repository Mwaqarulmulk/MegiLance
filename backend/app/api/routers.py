# @AI-HINT: Central router registry - aggregates all v1 API routers into master router
from fastapi import APIRouter

from .v1.ai import (
    ai_advanced,
    ai_matching,
    ai_services,
    ai_writing,
    chatbot,
    client_assistant,
    fraud_detection,
    skill_analyzer,
)
from .v1.chat import comments, messages, video_communication, websocket
from .v1.core_domain import (
    activity_feed,
    admin_fraud_alerts,
    analytics,
    mongo_blogs,
    analytics_dashboard,
    analytics_pro,
    assessments,
    audit,
    availability_calendar,
    backup_restore,
    blog,
    branding,
    client,
    communication,
    community,
    compliance,
    contact,
    contract_builder,
    contract_builder_standalone,
    custom_fields,
    custom_statuses,
    data_analytics_export,
    email_templates,
    escrow_pro,
    expense_tax_calculator,
    export_import,
    external_projects,
    feature_flags,
    file_versions,
    gamification,
    health,
    i18n,
    income_calculator,
    integrations,
    interviews,
    invoice_generator,
    invoice_tax,
    job_alerts,
    knowledge_base,
    learning_center,
    legal_documents,
    marketplace,
    moderation,
    newsletter,
    notes_tags,
    notification_preferences,
    notifications,
    notifications_pro,
    organizations,
    portal_endpoints,
    portfolio_builder,
    price_estimator,
    proposal_templates,
    proposal_writer,
    public_profiles,
    push_notifications,
    rate_advisor,
    rate_cards,
    rate_limiting,
    realtime_notifications,
    referrals,
    reports,
    review_responses,
    saved_searches,
    scheduler,
    scope_change,
    scope_planner,
    search,
    search_advanced,
    security,
    seller_stats,
    skill_graph,
    support_tickets,
    system_status,
    tags,
    talent_invitations,
    teams,
    templates,
    time_entries,
    timezone,
    uploads,
    utils,
    video_calls,
    webhooks,
    workflow_automation,
    workroom,
)
from .v1.identity import admin, api_keys, auth, social_login, users, verification
from .v1.payments_domain import (
    escrow,
    invoices,
    multi_currency,
    pakistan_payments,
    payout_methods,
    payments,
    refunds,
    stripe,
    subscription_billing,
    wallet,
)
from .v1.projects_domain import (
    categories,
    contracts,
    favorites,
    freelancers,
    gigs,
    milestones,
    portfolio,
    projects,
    proposals,
    skills,
)
from .v1.reviews_domain import disputes, reviews, user_feedback

api_router = APIRouter()

# Core services
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(system_status.router, prefix="/status", tags=["status"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    websocket.router, prefix="/ws", tags=["websocket"]
)  # WebSocket status

# User management
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(job_alerts.router, prefix="/job-alerts", tags=["job-alerts"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])  # Admin endpoints

# Project workflow
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(milestones.router, prefix="/milestones", tags=["milestones"])
api_router.include_router(
    scope_change.router, prefix="/scope-changes", tags=["scope-changes"]
)

# Communication
api_router.include_router(messages.router, prefix="", tags=["messages"])
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["notifications"]
)

# Reviews and disputes
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(disputes.router, prefix="/disputes", tags=["disputes"])

# Payments and portfolio
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(stripe.router, prefix="/stripe", tags=["stripe"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])


# Time tracking, invoices, and escrow
api_router.include_router(time_entries.router, prefix="/time-entries", tags=["time-tracking"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(escrow.router, prefix="/escrow", tags=["escrow"])

# Categories, tags, and favorites
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

# Support and refunds
api_router.include_router(support_tickets.router, prefix="/support-tickets", tags=["support"])
api_router.include_router(refunds.router, prefix="/refunds", tags=["refunds"])

# Search functionality
api_router.include_router(search.router, prefix="", tags=["search"])
api_router.include_router(
    search_advanced.router, prefix="", tags=["search-advanced"]
)  # Turso FTS5 search

# Real-time notifications
api_router.include_router(
    realtime_notifications.router, prefix="/realtime", tags=["realtime"]
)

# AI-powered matching
api_router.include_router(ai_matching.router, prefix="/matching", tags=["ai-matching"])

# Gamification
api_router.include_router(gamification.router, prefix="", tags=["gamification"])

# Analytics and reporting
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Advanced Analytics Pro - ML predictions and BI
api_router.include_router(
    analytics_pro.router, prefix="/analytics-pro", tags=["analytics-pro"]
)

# File uploads and client tools
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(client.router, prefix="/client", tags=["client"])

# AI services
api_router.include_router(ai_services.router, prefix="/ai", tags=["ai"])

# AI Price Estimator - General-purpose pricing intelligence (public)
api_router.include_router(
    price_estimator.router, prefix="/price-estimator", tags=["price-estimator"]
)

# Standalone Public Tools
api_router.include_router(
    invoice_generator.router, prefix="/invoice-generator", tags=["invoice-generator"]
)
api_router.include_router(
    contract_builder_standalone.router,
    prefix="/contract-builder-standalone",
    tags=["contract-builder-standalone"],
)
api_router.include_router(
    income_calculator.router, prefix="/income-calculator", tags=["income-calculator"]
)
api_router.include_router(
    scope_planner.router, prefix="/scope-planner", tags=["scope-planner"]
)
api_router.include_router(
    expense_tax_calculator.router,
    prefix="/expense-tax-calculator",
    tags=["expense-tax-calculator"],
)

# AI Parallel Tools
api_router.include_router(
    skill_analyzer.router, prefix="/skill-analyzer", tags=["skill-analyzer"]
)
api_router.include_router(
    rate_advisor.router, prefix="/rate-advisor", tags=["rate-advisor"]
)
api_router.include_router(
    proposal_writer.router, prefix="/proposal-writer", tags=["proposal-writer"]
)

# Skill Assessments - Professional skill verification
api_router.include_router(
    assessments.router, prefix="/assessments", tags=["assessments"]
)

# Video Interviews - WebRTC video calling
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])

# Identity Verification - KYC workflow
api_router.include_router(
    verification.router, prefix="/verification", tags=["verification"]
)

# Portal endpoints (client and freelancer dashboards)
api_router.include_router(portal_endpoints.router, prefix="/portal", tags=["portals"])

# Advanced Escrow Pro - Stripe integration with milestones
api_router.include_router(escrow_pro.router, prefix="/escrow-pro", tags=["escrow-pro"])

# Notification Center Pro - Multi-channel notifications
api_router.include_router(
    notifications_pro.router, prefix="/notifications-pro", tags=["notifications-pro"]
)

# AI Chatbot - Intelligent support automation
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])

# AI Client Assistant - Agentic tool-calling assistant for clients
api_router.include_router(
    client_assistant.router, prefix="/ai", tags=["AI Client Assistant"]
)

# Team Collaboration - Agency and team management
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])

# Audit Trail - Compliance and security logging
api_router.include_router(audit.router, prefix="/audit-trail", tags=["audit"])

# Export/Import - Data portability and GDPR compliance
api_router.include_router(
    export_import.router, prefix="/export-import", tags=["export-import"]
)

# Internationalization (i18n) - Multi-language support
api_router.include_router(i18n.router, prefix="/i18n", tags=["i18n"])

# Rate Limiting Pro - Advanced API rate limiting
api_router.include_router(
    rate_limiting.router, prefix="/rate-limits", tags=["rate-limits"]
)

# Webhooks - Third-party integrations
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

# Background Task Scheduler - Job queue management
api_router.include_router(scheduler.router, prefix="/scheduler", tags=["scheduler"])

# Report Generation - PDF/Excel exports
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])

# Referral System - User acquisition rewards
api_router.include_router(referrals.router, prefix="/referrals", tags=["referrals"])

# Content Moderation - AI-powered content safety
api_router.include_router(moderation.router, prefix="/moderation", tags=["moderation"])

# Newsletter - Email subscription
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["newsletter"])

# Bulk Operations - Batch processing


# Saved Searches - Persistent search queries
api_router.include_router(
    saved_searches.router, prefix="/saved-searches", tags=["saved-searches"]
)

# Activity Feed - User timeline and social features
api_router.include_router(
    activity_feed.router, prefix="/activity", tags=["activity-feed"]
)

# API Keys - Developer API management
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])

# Comments - Threaded discussions
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])

# File Versions - Document version control
api_router.include_router(
    file_versions.router, prefix="/file-versions", tags=["file-versions"]
)

# Custom Fields - Dynamic entity metadata
api_router.include_router(
    custom_fields.router, prefix="/custom-fields", tags=["custom-fields"]
)

# Templates - Reusable project/proposal/contract templates
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])

# Organizations - Multi-tenant workspace management
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])

# Notification Preferences - Granular notification settings
api_router.include_router(
    notification_preferences.router, tags=["notification-preferences"]
)

# Email Templates - Customizable email templates
api_router.include_router(email_templates.router, prefix="/email-templates", tags=["email-templates"])

# Integrations Hub - Third-party service integrations
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])

# Mobile Push Notifications - FCM/APNs
api_router.include_router(push_notifications.router, tags=["push-notifications"])

# Invoice & Tax Management - Professional invoicing
api_router.include_router(invoice_tax.router, tags=["invoice-tax"])

# Contract Builder - Visual contract creation
api_router.include_router(contract_builder.router, prefix="/contract-builder", tags=["contract-builder"])

# Skill Graph - Skill relationships and endorsements
api_router.include_router(skill_graph.router, tags=["skill-graph"])

# AI Writing Assistant - Content generation
api_router.include_router(ai_writing.router, prefix="/ai-writing", tags=["ai-writing"])

# Social Login - OAuth2 social authentication
api_router.include_router(social_login.router, tags=["social-login"])

# Timezone Management - Smart timezone handling
api_router.include_router(timezone.router, tags=["timezone"])

# Backup & Restore - Data backup and restoration
api_router.include_router(backup_restore.router, tags=["backup-restore"])

# Portfolio Builder - Professional portfolio creation
api_router.include_router(portfolio_builder.router, tags=["portfolio-builder"])

# Compliance Center - GDPR and regulatory compliance
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])

# Contact Form - Customer inquiries
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])

# Learning Center - Tutorials and courses
api_router.include_router(learning_center.router, tags=["learning-center"])

# Fraud Detection - AI-powered fraud prevention
api_router.include_router(fraud_detection.router, tags=["fraud-detection"])

# Analytics Dashboard - Business intelligence
api_router.include_router(analytics_dashboard.router, tags=["analytics-dashboard"])

# Marketplace - Advanced search and discovery
api_router.include_router(marketplace.router, tags=["marketplace"])

# Subscription & Billing - Premium plans and payments
api_router.include_router(subscription_billing.router, prefix="/subscriptions", tags=["subscriptions"])

# Legal Document Center - NDAs, contracts, e-signatures
api_router.include_router(legal_documents.router, prefix="/legal-documents", tags=["legal-documents"])

# Knowledge Base & FAQ - Help center
api_router.include_router(knowledge_base.router, prefix="/knowledge-base", tags=["knowledge-base"])

# Workflow Automation - Triggers and automated actions
api_router.include_router(workflow_automation.router, prefix="/workflows", tags=["workflows"])

# User Feedback - NPS surveys and feature requests
api_router.include_router(user_feedback.router, prefix="/user-feedback", tags=["user-feedback"])


# Data Analytics Export - BI and reporting exports
api_router.include_router(data_analytics_export.router, tags=["data-export"])

# Availability Calendar - Freelancer scheduling
api_router.include_router(availability_calendar.router, prefix="/availability", tags=["availability"])

# Review Responses - Business owner replies
api_router.include_router(review_responses.router, prefix="/review-responses", tags=["review-responses"])

# Rate Cards - Freelancer pricing structures
api_router.include_router(rate_cards.router, prefix="/rate-cards", tags=["rate-cards"])

# Proposal Templates - Reusable proposal templates
api_router.include_router(proposal_templates.router, prefix="/proposal-templates", tags=["proposal-templates"])

# Notes & Tags - Organization and metadata
api_router.include_router(notes_tags.router, prefix="/notes-tags", tags=["notes-tags"])

# Custom Statuses - Workflow customization
api_router.include_router(custom_statuses.router, prefix="/custom-statuses", tags=["custom-statuses"])

# ========================================
# VERSION 2.0 ADVANCED FEATURES
# ========================================

# Advanced Security - MFA, risk-based auth, session management
api_router.include_router(
    security.router, prefix="/security", tags=["security-advanced"]
)

# Video Communication - WebRTC calls, screen sharing, whiteboard
api_router.include_router(video_communication.router, prefix="/video-comms", tags=["video-comms"])

# Multi-Currency Payments
api_router.include_router(
    multi_currency.router, prefix="/multicurrency", tags=["multicurrency"]
)

# Advanced AI - ML-powered features
api_router.include_router(
    ai_advanced.router, prefix="/ai-advanced", tags=["ai-advanced"]
)

# Admin Fraud Alerts - Real-time fraud monitoring
api_router.include_router(
    admin_fraud_alerts.router, prefix="/admin/fraud-alerts", tags=["admin-fraud"]
)

# ========================================
# BILLION DOLLAR UPGRADE FEATURES
# ========================================

# Community Hub - Q&A, Playbooks, Office Hours
api_router.include_router(community.router, prefix="/community", tags=["community"])

# Collaboration Workroom - Kanban, Files, Discussions
api_router.include_router(workroom.router, prefix="/workroom", tags=["workroom"])

# Feature Flags - A/B Testing and gradual rollouts
api_router.include_router(feature_flags.router, tags=["feature-flags"])

# Pakistan Payments - USDC, JazzCash, EasyPaisa, AirTM, Wise, Payoneer
# Stripe is NOT available in Pakistan - these are the alternatives
api_router.include_router(
    pakistan_payments.router, prefix="/pk-payments", tags=["pakistan-payments"]
)

# ============================================================================

# Blog & News
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])

# MongoDB-backed SEO blog articles (100 articles with full backlinking)
api_router.include_router(mongo_blogs.router, prefix="/blogs-mongo", tags=["blogs-mongo"])

# Public clients showcase (no auth required)


# Public freelancer profiles (no auth required - shareable profiles)
api_router.include_router(
    public_profiles.router, prefix="/freelancers", tags=["public-profiles"]
)

# ============================================================================
# FIVERR/UPWORK FEATURE PARITY - Gig Marketplace & Seller Tier System
# ============================================================================

# Gig Marketplace - Fiverr-style service packages with 3-tier pricing
api_router.include_router(gigs.router, prefix="/gigs", tags=["gigs"])

# Seller Stats & Tier System - Bronze to Platinum levels with JSS algorithm
api_router.include_router(
    seller_stats.router, prefix="/seller-stats", tags=["seller-stats"]
)

# Talent Invitations - Upwork-style invite-to-bid system
api_router.include_router(
    talent_invitations.router, prefix="/invitations", tags=["talent-invitations"]
)

# ============================================================================
# EXTERNAL PROJECT SCRAPER - Aggregate freelance projects from RemoteOK, Jobicy, Arbeitnow
# ============================================================================
api_router.include_router(
    external_projects.router, prefix="/external-projects", tags=["external-projects"]
)

# Communication - SMS, email, push notifications
api_router.include_router(communication.router, prefix="/communication", tags=["communication"])

# Branding - Organization branding and customization
api_router.include_router(branding.router, prefix="/branding", tags=["branding"])

# Video Calls - Video communication management
api_router.include_router(video_calls.router, prefix="/video", tags=["video-calls"])

# Payout Methods - Payment withdrawal methods
api_router.include_router(payout_methods.router, prefix="/payout-methods", tags=["payout-methods"])
