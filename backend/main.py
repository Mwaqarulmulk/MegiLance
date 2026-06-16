# @AI-HINT: This is the main entry point for the MegiLance FastAPI backend.

import json
import logging
import mimetypes
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager

from app.api.routers import api_router
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.db.init_db import init_db
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

# Initialize Sentry for error tracking and performance monitoring
settings = get_settings()
if settings.sentry_dsn and settings.sentry_dsn != "":
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration

        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            traces_sample_rate=1.0 if settings.debug else 0.1,
            profiles_sample_rate=0.5,
            integrations=[
                StarletteIntegration(transaction_style="url"),
                FastApiIntegration(transaction_style="url"),
            ],
            send_default_pii=False,
        )
        logging.getLogger("megilance").info("sentry.initialized")
    except Exception as e:
        logging.getLogger("megilance").warning(f"sentry.init_failed: {e}")

# Track application start time for uptime reporting
_APP_START_TIME = time.time()


# Configure logging
class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            base["request_id"] = record.request_id
        if hasattr(record, "path"):
            base["path"] = record.path
        return json.dumps(base)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("megilance")
logger.setLevel(logging.INFO)
logger.handlers = [handler]
logger.propagate = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.turso_http import execute_query
    from app.db.turso_http_async import execute_query_async, AsyncTursoHTTP

    # Startup
    try:
        result = await execute_query_async("SELECT 1")
        if result:
            logger.info("startup.database_initialized via Turso HTTP API")
        else:
            logger.warning("startup.turso_http_test_failed")
        logger.info("startup.mongodb_disabled - using Turso/SQLite only")

        # Initialize persistent token blacklist table and cleanup expired entries
        try:
            from app.services.token_blacklist_service import init_token_blacklist

            init_token_blacklist()
            logger.info("startup.token_blacklist_initialized")
        except Exception as e:
            logger.warning(f"startup.token_blacklist_init_warning: {e}")

        # Ensure database indexes exist for common query patterns
        try:
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
                "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
                "CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)",
                "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)",
                "CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id)",
                "CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id)",
                "CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)",
                "CREATE INDEX IF NOT EXISTS idx_milestones_contract_id ON milestones(contract_id)",
                "CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)",
                "CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)",
                "CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token)",
                "CREATE INDEX IF NOT EXISTS idx_users_verify_token ON users(email_verification_token)",
            ]
            for idx_sql in indexes:
                try:
                    execute_query(idx_sql)
                except Exception as e:
                    logger.debug(f"startup.index_skip: {e}")
            logger.info("startup.indexes_ensured")
        except Exception as e:
            logger.warning(f"startup.indexes_warning: {e}")

        # Start background schedulers
        try:
            from app.services.escrow_autodial import start_escrow_scheduler

            start_escrow_scheduler()

            from app.services.milestone_deadline_loop import start_overdue_scheduler

            start_overdue_scheduler()
            logger.info("startup.escrow_scheduler_started")
        except Exception as e:
            logger.warning(f"startup.escrow_scheduler_warning: {e}")

        # Ensure wallet tables are initialized on startup (P0-9 / FIX-6)
        try:
            from app.services.wallet_service import ensure_wallet_tables

            ensure_wallet_tables()
            logger.info("startup.wallet_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.wallet_tables_warning: {e}")

        # Ensure contract acknowledgment columns exist (P0-4 / FIX-3)
        try:
            contract_cols = [
                ("freelancer_acknowledged", "INTEGER DEFAULT 0"),
                ("freelancer_acknowledged_at", "TEXT"),
            ]
            existing_res = execute_query("PRAGMA table_info(contracts)")
            existing_cols = set()
            if existing_res and existing_res.get("rows"):
                for row in existing_res["rows"]:
                    existing_cols.add(row[1]["value"])
            for col_name, col_type in contract_cols:
                if col_name not in existing_cols:
                    execute_query(f"ALTER TABLE contracts ADD COLUMN {col_name} {col_type}")
            logger.info("startup.contract_columns_ensured")
        except Exception as e:
            logger.warning(f"startup.contract_columns_warning: {e}")

        # Ensure auth token columns exist on users table (reset, verification)
        try:
            auth_cols = [
                ("password_reset_token", "TEXT"),
                ("password_reset_expires", "TEXT"),
                ("email_verification_token", "TEXT"),
            ]
            existing_res = execute_query("PRAGMA table_info(users)")
            existing_cols = set()
            if existing_res and existing_res.get("rows"):
                for row in existing_res["rows"]:
                    existing_cols.add(row[1]["value"])
            for col_name, col_type in auth_cols:
                if col_name not in existing_cols:
                    execute_query(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            logger.info("startup.auth_columns_ensured")
        except Exception as e:
            logger.warning(f"startup.auth_columns_warning: {e}")

        # Ensure milestone columns exist (submission_notes, approval_notes) (P0-3)
        try:
            milestone_cols = [
                ("submission_notes", "TEXT"),
                ("approval_notes", "TEXT"),
                ("rejection_notes", "TEXT"),
                ("deliverables", "TEXT"),
                ("submitted_at", "TEXT"),
                ("approved_at", "TEXT"),
            ]
            existing_res = execute_query("PRAGMA table_info(milestones)")
            existing_cols = set()
            if existing_res and existing_res.get("rows"):
                for row in existing_res["rows"]:
                    existing_cols.add(row[1]["value"])
            for col_name, col_type in milestone_cols:
                if col_name not in existing_cols:
                    execute_query(f"ALTER TABLE milestones ADD COLUMN {col_name} {col_type}")
            logger.info("startup.milestone_columns_ensured")
        except Exception as e:
            logger.warning(f"startup.milestone_columns_warning: {e}")

        # Ensure gamification tables exist
        try:
            now = __import__("datetime").datetime.utcnow().isoformat()
            execute_query("""CREATE TABLE IF NOT EXISTS badges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                points INTEGER NOT NULL DEFAULT 0,
                tier TEXT NOT NULL DEFAULT 'bronze',
                created_at TEXT NOT NULL
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS user_badges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                badge_id INTEGER NOT NULL,
                earned_at TEXT NOT NULL,
                UNIQUE(user_id, badge_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(badge_id) REFERENCES badges(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)")
            execute_query("""CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                xp INTEGER NOT NULL DEFAULT 0,
                category TEXT,
                created_at TEXT NOT NULL
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS user_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                achievement_id INTEGER NOT NULL,
                unlocked_at TEXT NOT NULL,
                UNIQUE(user_id, achievement_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(achievement_id) REFERENCES achievements(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)")
            # Seed default badges if none exist
            cnt = execute_query("SELECT COUNT(*) as c FROM badges")
            if cnt and cnt.get("rows") and (cnt["rows"][0][0].get("value", 0) if isinstance(cnt["rows"][0][0], dict) else cnt["rows"][0][0]) == 0:
                default_badges = [
                    ("First Contract", "Complete your first contract", "🏆", 100, "bronze"),
                    ("Five Star", "Receive a 5-star review", "⭐", 200, "silver"),
                    ("Top Earner", "Earn over $1,000 total", "💰", 500, "gold"),
                    ("Speed Demon", "Deliver a project early", "⚡", 150, "silver"),
                    ("Reliable Pro", "Complete 10 contracts", "🎯", 1000, "gold"),
                ]
                for name, desc, icon, pts, tier in default_badges:
                    try:
                        execute_query("INSERT OR IGNORE INTO badges (name, description, icon, points, tier, created_at) VALUES (?, ?, ?, ?, ?, ?)", [name, desc, icon, pts, tier, now])
                    except Exception:
                        pass
            # Seed default achievements if none exist
            cnt = execute_query("SELECT COUNT(*) as c FROM achievements")
            if cnt and cnt.get("rows") and (cnt["rows"][0][0].get("value", 0) if isinstance(cnt["rows"][0][0], dict) else cnt["rows"][0][0]) == 0:
                default_achievements = [
                    ("Profile Complete", "Fill out all profile fields", 50, "profile"),
                    ("First Proposal", "Submit your first proposal", 75, "projects"),
                    ("Community Member", "Create your first community post", 25, "community"),
                    ("Contract Winner", "Win your first project bid", 200, "projects"),
                    ("Reviewed", "Receive your first review", 100, "reputation"),
                ]
                for name, desc, xp, cat in default_achievements:
                    try:
                        execute_query("INSERT OR IGNORE INTO achievements (name, description, xp, category, created_at) VALUES (?, ?, ?, ?, ?)", [name, desc, xp, cat, now])
                    except Exception:
                        pass
            logger.info("startup.gamification_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.gamification_tables_warning: {e}")

        # Ensure community tables exist
        try:
            now = __import__("datetime").datetime.utcnow().isoformat()
            execute_query("""CREATE TABLE IF NOT EXISTS community_hubs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                member_count INTEGER NOT NULL DEFAULT 0,
                post_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS community_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                hub_id TEXT NOT NULL DEFAULT 'general',
                post_type TEXT NOT NULL DEFAULT 'discussion',
                author_id INTEGER NOT NULL,
                likes_count INTEGER NOT NULL DEFAULT 0,
                comments_count INTEGER NOT NULL DEFAULT 0,
                views_count INTEGER NOT NULL DEFAULT 0,
                is_pinned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                FOREIGN KEY(author_id) REFERENCES users(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_community_posts_hub_id ON community_posts(hub_id)")
            execute_query("""CREATE TABLE IF NOT EXISTS community_post_likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(post_id, user_id),
                FOREIGN KEY(post_id) REFERENCES community_posts(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS community_post_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                author_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(post_id) REFERENCES community_posts(id),
                FOREIGN KEY(author_id) REFERENCES users(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_community_post_comments_post_id ON community_post_comments(post_id)")
            # Seed default hubs if none exist
            cnt = execute_query("SELECT COUNT(*) as c FROM community_hubs")
            if cnt and cnt.get("rows") and (cnt["rows"][0][0].get("value", 0) if isinstance(cnt["rows"][0][0], dict) else cnt["rows"][0][0]) == 0:
                default_hubs = [
                    ("general", "General", "General discussions about freelancing and MegiLance", "💬"),
                    ("tips", "Tips & Tricks", "Share your best freelancing tips and advice", "💡"),
                    ("showcase", "Showcase", "Show off your work and portfolio", "🎨"),
                    ("jobs", "Job Board", "Share and discuss job opportunities", "📋"),
                    ("tech", "Tech Talk", "Discuss technology, tools, and development", "💻"),
                ]
                for hid, name, desc, icon in default_hubs:
                    try:
                        execute_query("INSERT OR IGNORE INTO community_hubs (id, name, description, icon, member_count, post_count, created_at) VALUES (?, ?, ?, ?, 0, 0, ?)", [hid, name, desc, icon, now])
                    except Exception:
                        pass
            logger.info("startup.community_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.community_tables_warning: {e}")

        # Ensure gig marketplace tables exist
        try:
            execute_query("""CREATE TABLE IF NOT EXISTS gigs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                description TEXT,
                category_id INTEGER,
                subcategory TEXT,
                tags TEXT,
                basic_price REAL NOT NULL DEFAULT 0,
                standard_price REAL,
                premium_price REAL,
                basic_delivery_days INTEGER NOT NULL DEFAULT 3,
                standard_delivery_days INTEGER,
                premium_delivery_days INTEGER,
                basic_revisions INTEGER NOT NULL DEFAULT 1,
                standard_revisions INTEGER,
                premium_revisions INTEGER,
                basic_description TEXT,
                standard_description TEXT,
                premium_description TEXT,
                images TEXT,
                requirements TEXT,
                status TEXT NOT NULL DEFAULT 'draft',
                orders_count INTEGER NOT NULL DEFAULT 0,
                average_rating REAL NOT NULL DEFAULT 0,
                reviews_count INTEGER NOT NULL DEFAULT 0,
                impressions_count INTEGER NOT NULL DEFAULT 0,
                clicks_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(seller_id) REFERENCES users(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_gigs_seller_id ON gigs(seller_id)")
            execute_query("CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status)")
            execute_query("""CREATE TABLE IF NOT EXISTS gig_faqs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gig_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY(gig_id) REFERENCES gigs(id) ON DELETE CASCADE
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS gig_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gig_id INTEGER NOT NULL,
                buyer_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                package_type TEXT NOT NULL DEFAULT 'basic',
                price REAL NOT NULL,
                delivery_days INTEGER NOT NULL,
                revisions INTEGER NOT NULL DEFAULT 1,
                requirements TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                due_date TEXT,
                completed_at TEXT,
                cancelled_at TEXT,
                cancel_reason TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(gig_id) REFERENCES gigs(id),
                FOREIGN KEY(buyer_id) REFERENCES users(id),
                FOREIGN KEY(seller_id) REFERENCES users(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_gig_orders_buyer_id ON gig_orders(buyer_id)")
            execute_query("CREATE INDEX IF NOT EXISTS idx_gig_orders_seller_id ON gig_orders(seller_id)")
            execute_query("""CREATE TABLE IF NOT EXISTS gig_deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                message TEXT,
                attachments TEXT,
                revision_number INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(order_id) REFERENCES gig_orders(id) ON DELETE CASCADE
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS gig_revisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                requested_by INTEGER NOT NULL,
                message TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(order_id) REFERENCES gig_orders(id) ON DELETE CASCADE,
                FOREIGN KEY(requested_by) REFERENCES users(id)
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS gig_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gig_id INTEGER NOT NULL,
                order_id INTEGER NOT NULL UNIQUE,
                reviewer_id INTEGER NOT NULL,
                rating REAL NOT NULL,
                comment TEXT,
                seller_response TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(gig_id) REFERENCES gigs(id),
                FOREIGN KEY(order_id) REFERENCES gig_orders(id),
                FOREIGN KEY(reviewer_id) REFERENCES users(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_gig_reviews_gig_id ON gig_reviews(gig_id)")
            logger.info("startup.gig_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.gig_tables_warning: {e}")

        # Ensure external projects tables exist
        try:
            execute_query("""CREATE TABLE IF NOT EXISTS external_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                company TEXT,
                company_logo TEXT,
                description TEXT,
                description_plain TEXT,
                category TEXT,
                source TEXT NOT NULL,
                source_id TEXT,
                project_type TEXT,
                experience_level TEXT,
                budget_min REAL,
                budget_max REAL,
                budget_currency TEXT DEFAULT 'USD',
                location TEXT,
                apply_url TEXT,
                trust_score REAL DEFAULT 0.5,
                is_verified INTEGER DEFAULT 0,
                tags TEXT,
                views_count INTEGER NOT NULL DEFAULT 0,
                clicks_count INTEGER NOT NULL DEFAULT 0,
                scraped_at TEXT NOT NULL,
                posted_at TEXT,
                expires_at TEXT
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_external_projects_source ON external_projects(source)")
            execute_query("""CREATE TABLE IF NOT EXISTS external_project_saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                project_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, project_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS external_project_clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                user_id INTEGER,
                ip_address TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS external_project_flags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                reason TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, project_id),
                FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS scrape_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                started_at TEXT,
                completed_at TEXT,
                projects_scraped INTEGER DEFAULT 0,
                error_message TEXT,
                created_at TEXT NOT NULL
            )""")
            logger.info("startup.external_projects_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.external_projects_tables_warning: {e}")

        # Ensure advanced referral tables exist
        try:
            execute_query("""CREATE TABLE IF NOT EXISTS referral_campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                reward_amount REAL NOT NULL DEFAULT 0,
                reward_type TEXT NOT NULL DEFAULT 'fixed',
                max_referrals INTEGER,
                starts_at TEXT,
                ends_at TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS referral_milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER,
                referrals_required INTEGER NOT NULL,
                reward_amount REAL NOT NULL,
                reward_description TEXT,
                FOREIGN KEY(campaign_id) REFERENCES referral_campaigns(id) ON DELETE CASCADE
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS referral_milestone_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                milestone_id INTEGER NOT NULL,
                achieved_at TEXT NOT NULL,
                UNIQUE(user_id, milestone_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(milestone_id) REFERENCES referral_milestones(id)
            )""")
            logger.info("startup.referral_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.referral_tables_warning: {e}")

        # Ensure token blacklist table exists
        try:
            execute_query("""CREATE TABLE IF NOT EXISTS token_blacklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jti TEXT NOT NULL UNIQUE,
                user_id INTEGER,
                expires_at TEXT NOT NULL,
                blacklisted_at TEXT NOT NULL
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti)")
            execute_query("CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at)")
            logger.info("startup.token_blacklist_table_ensured")
        except Exception as e:
            logger.warning(f"startup.token_blacklist_table_warning: {e}")

        # Ensure supplementary tables exist (fraud alerts, notifications prefs, api keys, etc.)
        _supplementary_tables = [
            ("""CREATE TABLE IF NOT EXISTS fraud_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL DEFAULT 'low',
                description TEXT,
                metadata TEXT,
                is_resolved INTEGER DEFAULT 0,
                resolved_by INTEGER,
                resolved_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "fraud_alerts"),
            ("""CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id INTEGER PRIMARY KEY,
                email_notifications INTEGER DEFAULT 1,
                push_notifications INTEGER DEFAULT 1,
                proposal_alerts INTEGER DEFAULT 1,
                project_alerts INTEGER DEFAULT 1,
                message_alerts INTEGER DEFAULT 1,
                payment_alerts INTEGER DEFAULT 1,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "notification_preferences"),
            ("""CREATE TABLE IF NOT EXISTS api_keys (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                key_hash TEXT NOT NULL,
                key_preview TEXT NOT NULL,
                permissions TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                last_used_at TEXT,
                expires_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "api_keys"),
            ("""CREATE TABLE IF NOT EXISTS webhooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                secret TEXT,
                events TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "webhooks"),
            ("""CREATE TABLE IF NOT EXISTS webhook_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                webhook_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                payload TEXT,
                status TEXT DEFAULT 'pending',
                attempts INTEGER DEFAULT 0,
                last_attempt_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
            )""", "webhook_events"),
            ("""CREATE TABLE IF NOT EXISTS activity_feed (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                actor_id INTEGER,
                activity_type TEXT NOT NULL,
                entity_type TEXT,
                entity_id INTEGER,
                description TEXT,
                metadata TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "activity_feed"),
            ("""CREATE TABLE IF NOT EXISTS availability_settings (
                user_id INTEGER PRIMARY KEY,
                timezone TEXT DEFAULT 'UTC',
                is_available INTEGER DEFAULT 1,
                weekly_hours INTEGER DEFAULT 40,
                hourly_rate REAL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "availability_settings"),
            ("""CREATE TABLE IF NOT EXISTS availability_weekly_pattern (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "availability_weekly_pattern"),
            ("""CREATE TABLE IF NOT EXISTS availability_blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                reason TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "availability_blocks"),
            ("""CREATE TABLE IF NOT EXISTS branding_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                key TEXT NOT NULL,
                value TEXT,
                updated_at TEXT NOT NULL
            )""", "branding_config"),
            ("""CREATE TABLE IF NOT EXISTS feature_flags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                is_enabled INTEGER DEFAULT 0,
                rollout_percentage INTEGER DEFAULT 0,
                conditions TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )""", "feature_flags"),
            ("""CREATE TABLE IF NOT EXISTS email_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                subject TEXT NOT NULL,
                body_html TEXT NOT NULL,
                body_text TEXT,
                variables TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )""", "email_templates"),
            ("""CREATE TABLE IF NOT EXISTS integrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider TEXT NOT NULL,
                provider_id TEXT,
                access_token TEXT,
                refresh_token TEXT,
                token_expires_at TEXT,
                metadata TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "integrations"),
            ("""CREATE TABLE IF NOT EXISTS job_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                keywords TEXT,
                category TEXT,
                min_budget REAL,
                max_budget REAL,
                skills TEXT,
                is_active INTEGER DEFAULT 1,
                last_sent_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "job_alerts"),
            ("""CREATE TABLE IF NOT EXISTS payout_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                method_type TEXT NOT NULL,
                is_default INTEGER DEFAULT 0,
                details TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "payout_methods"),
            ("""CREATE TABLE IF NOT EXISTS phone_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                phone_number TEXT NOT NULL,
                code TEXT NOT NULL,
                is_verified INTEGER DEFAULT 0,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "phone_verifications"),
            ("""CREATE TABLE IF NOT EXISTS portfolio_showcase (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                media_urls TEXT,
                skills TEXT,
                project_url TEXT,
                likes_count INTEGER DEFAULT 0,
                is_featured INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "portfolio_showcase"),
            ("""CREATE TABLE IF NOT EXISTS proposal_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                is_default INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "proposal_templates"),
            ("""CREATE TABLE IF NOT EXISTS rate_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                service_name TEXT NOT NULL,
                description TEXT,
                rate REAL NOT NULL,
                rate_type TEXT DEFAULT 'hourly',
                currency TEXT DEFAULT 'USD',
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "rate_cards"),
            ("""CREATE TABLE IF NOT EXISTS saved_searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                query TEXT,
                filters TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "saved_searches"),
            ("""CREATE TABLE IF NOT EXISTS skill_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill TEXT NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                difficulty TEXT DEFAULT 'medium',
                created_at TEXT NOT NULL
            )""", "skill_questions"),
            ("""CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                plan TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                billing_cycle TEXT DEFAULT 'monthly',
                current_period_start TEXT,
                current_period_end TEXT,
                cancelled_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "subscriptions"),
            ("""CREATE TABLE IF NOT EXISTS subscription_invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscription_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                paid_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "subscription_invoices"),
            ("""CREATE TABLE IF NOT EXISTS support_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                is_internal INTEGER DEFAULT 0,
                attachments TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(ticket_id) REFERENCES support_tickets(id),
                FOREIGN KEY(sender_id) REFERENCES users(id)
            )""", "support_messages"),
            ("""CREATE TABLE IF NOT EXISTS teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                owner_id INTEGER NOT NULL,
                avatar_url TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(owner_id) REFERENCES users(id)
            )""", "teams"),
            ("""CREATE TABLE IF NOT EXISTS team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT DEFAULT 'member',
                joined_at TEXT NOT NULL,
                UNIQUE(team_id, user_id),
                FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "team_members"),
            ("""CREATE TABLE IF NOT EXISTS team_invitations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_id INTEGER NOT NULL,
                email TEXT NOT NULL,
                role TEXT DEFAULT 'member',
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
            )""", "team_invitations"),
            ("""CREATE TABLE IF NOT EXISTS video_calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id TEXT NOT NULL UNIQUE,
                host_id INTEGER NOT NULL,
                title TEXT,
                status TEXT DEFAULT 'waiting',
                started_at TEXT,
                ended_at TEXT,
                recording_url TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(host_id) REFERENCES users(id)
            )""", "video_calls"),
            ("""CREATE TABLE IF NOT EXISTS video_call_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                call_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                joined_at TEXT,
                left_at TEXT,
                FOREIGN KEY(call_id) REFERENCES video_calls(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "video_call_participants"),
            ("""CREATE TABLE IF NOT EXISTS workflows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                trigger_type TEXT NOT NULL,
                trigger_config TEXT,
                actions TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "workflows"),
            ("""CREATE TABLE IF NOT EXISTS workflow_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                triggered_at TEXT NOT NULL,
                completed_at TEXT,
                error TEXT,
                metadata TEXT,
                FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
            )""", "workflow_logs"),
            ("""CREATE TABLE IF NOT EXISTS legal_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_type TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                version TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                effective_date TEXT,
                created_at TEXT NOT NULL
            )""", "legal_documents"),
            ("""CREATE TABLE IF NOT EXISTS legal_acceptances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                document_id INTEGER NOT NULL,
                accepted_at TEXT NOT NULL,
                ip_address TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(document_id) REFERENCES legal_documents(id)
            )""", "legal_acceptances"),
            ("""CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT,
                is_active INTEGER DEFAULT 1,
                subscribed_at TEXT NOT NULL,
                unsubscribed_at TEXT
            )""", "newsletter_subscribers"),
            ("""CREATE TABLE IF NOT EXISTS organizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                owner_id INTEGER NOT NULL,
                logo_url TEXT,
                website TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(owner_id) REFERENCES users(id)
            )""", "organizations"),
            ("""CREATE TABLE IF NOT EXISTS organization_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                org_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT DEFAULT 'member',
                joined_at TEXT NOT NULL,
                UNIQUE(org_id, user_id),
                FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "organization_members"),
            ("""CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                author_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                parent_id INTEGER,
                likes_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                FOREIGN KEY(author_id) REFERENCES users(id)
            )""", "comments"),
            ("""CREATE TABLE IF NOT EXISTS review_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                review_id INTEGER NOT NULL UNIQUE,
                responder_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(review_id) REFERENCES reviews(id),
                FOREIGN KEY(responder_id) REFERENCES users(id)
            )""", "review_responses"),
            ("""CREATE TABLE IF NOT EXISTS feedback_votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                vote INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, entity_type, entity_id)
            )""", "feedback_votes"),
            ("""CREATE TABLE IF NOT EXISTS user_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                feedback_type TEXT NOT NULL,
                content TEXT NOT NULL,
                rating INTEGER,
                page_url TEXT,
                created_at TEXT NOT NULL
            )""", "user_feedback"),
            ("""CREATE TABLE IF NOT EXISTS user_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author_id INTEGER NOT NULL,
                target_user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                is_private INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY(author_id) REFERENCES users(id),
                FOREIGN KEY(target_user_id) REFERENCES users(id)
            )""", "user_notes"),
            ("""CREATE TABLE IF NOT EXISTS user_tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                tag TEXT NOT NULL,
                added_by INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "user_tags"),
            ("""CREATE TABLE IF NOT EXISTS file_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                file_url TEXT NOT NULL,
                file_name TEXT,
                file_size INTEGER,
                version INTEGER DEFAULT 1,
                uploaded_by INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(uploaded_by) REFERENCES users(id)
            )""", "file_versions"),
            ("""CREATE TABLE IF NOT EXISTS flagged_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                flagged_by INTEGER NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'pending',
                reviewed_by INTEGER,
                reviewed_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(flagged_by) REFERENCES users(id)
            )""", "flagged_items"),
            ("""CREATE TABLE IF NOT EXISTS contact_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'new',
                created_at TEXT NOT NULL
            )""", "contact_submissions"),
            ("""CREATE TABLE IF NOT EXISTS compliance_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                rule_type TEXT NOT NULL,
                conditions TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            )""", "compliance_rules"),
            ("""CREATE TABLE IF NOT EXISTS compliance_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                rule_id INTEGER,
                status TEXT DEFAULT 'pending',
                details TEXT,
                created_at TEXT NOT NULL
            )""", "compliance_reports"),
            ("""CREATE TABLE IF NOT EXISTS disputes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contract_id INTEGER NOT NULL,
                raised_by INTEGER NOT NULL,
                dispute_type VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                evidence TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                assigned_to INTEGER,
                created_at DATETIME NOT NULL,
                resolved_at DATETIME,
                resolution TEXT,
                resolution_amount NUMERIC(12,2),
                updated_at DATETIME NOT NULL,
                FOREIGN KEY(contract_id) REFERENCES contracts(id),
                FOREIGN KEY(raised_by) REFERENCES users(id),
                FOREIGN KEY(assigned_to) REFERENCES users(id)
            )""", "disputes"),
            ("""CREATE TABLE IF NOT EXISTS dispute_evidence (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dispute_id INTEGER NOT NULL,
                submitted_by INTEGER NOT NULL,
                evidence_type TEXT NOT NULL,
                content TEXT,
                file_url TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(dispute_id) REFERENCES disputes(id),
                FOREIGN KEY(submitted_by) REFERENCES users(id)
            )""", "dispute_evidence"),
            ("""CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                event_type TEXT NOT NULL,
                entity_type TEXT,
                entity_id INTEGER,
                description TEXT,
                ip_address TEXT,
                metadata TEXT,
                created_at TEXT NOT NULL
            )""", "audit_events"),
            ("""CREATE TABLE IF NOT EXISTS communication_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER,
                recipient_id INTEGER,
                channel TEXT NOT NULL,
                subject TEXT,
                content TEXT,
                status TEXT DEFAULT 'sent',
                created_at TEXT NOT NULL
            )""", "communication_log"),
            ("""CREATE TABLE IF NOT EXISTS skill_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill TEXT NOT NULL,
                score INTEGER NOT NULL,
                passed INTEGER DEFAULT 0,
                answers TEXT,
                completed_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "skill_assessments"),
            ("""CREATE TABLE IF NOT EXISTS knowledge_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                slug TEXT UNIQUE,
                author_id INTEGER,
                is_published INTEGER DEFAULT 0,
                views_count INTEGER DEFAULT 0,
                helpful_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )""", "knowledge_articles"),
            ("""CREATE TABLE IF NOT EXISTS article_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id INTEGER NOT NULL,
                user_id INTEGER,
                is_helpful INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(article_id) REFERENCES knowledge_articles(id) ON DELETE CASCADE
            )""", "article_ratings"),
            ("""CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                template_type TEXT NOT NULL,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                variables TEXT,
                is_global INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )""", "templates"),
            ("""CREATE TABLE IF NOT EXISTS data_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                request_type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                processed_at TEXT,
                download_url TEXT,
                expires_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""", "data_requests"),
            ("""CREATE TABLE IF NOT EXISTS data_retention_policies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL UNIQUE,
                retention_days INTEGER NOT NULL,
                description TEXT,
                updated_at TEXT NOT NULL
            )""", "data_retention_policies"),
        ]
        _failed_tables = []
        for ddl, table_name in _supplementary_tables:
            try:
                execute_query(ddl)
            except Exception as te:
                _failed_tables.append(table_name)
                logger.debug(f"startup.table_skip {table_name}: {te}")
        if _failed_tables:
            logger.warning(f"startup.supplementary_tables_partial_failure: {_failed_tables}")
        else:
            logger.info("startup.supplementary_tables_initialized")

        # Ensure chatbot tables exist (AI support system)
        try:
            execute_query("""CREATE TABLE IF NOT EXISTS chatbot_conversations (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                state TEXT NOT NULL DEFAULT 'active',
                context TEXT DEFAULT '{}',
                intents_detected TEXT DEFAULT '[]',
                sentiment_history TEXT DEFAULT '[]',
                escalated INTEGER DEFAULT 0,
                escalated_at TEXT,
                ticket_id TEXT,
                closed_at TEXT,
                resolution TEXT,
                started_at TEXT NOT NULL,
                last_activity TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )""")
            execute_query("""CREATE TABLE IF NOT EXISTS chatbot_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                intent TEXT,
                sentiment TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(conversation_id) REFERENCES chatbot_conversations(id)
            )""")
            execute_query("CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conv ON chatbot_messages(conversation_id)")
            execute_query("""CREATE TABLE IF NOT EXISTS chatbot_tickets (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                conversation_id TEXT,
                subject TEXT NOT NULL,
                description TEXT,
                priority TEXT DEFAULT 'medium',
                category TEXT DEFAULT 'general',
                status TEXT DEFAULT 'open',
                intents_detected TEXT DEFAULT '[]',
                sentiment_summary TEXT,
                conversation_summary TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(conversation_id) REFERENCES chatbot_conversations(id)
            )""")
            logger.info("startup.chatbot_tables_initialized")
        except Exception as e:
            logger.warning(f"startup.chatbot_tables_warning: {e}")

    except Exception as e:
        logger.error(f"startup.database_failed error={e}")
        # Always fail fast if DB is unreachable to prevent healthy-looking broken app
        raise RuntimeError("Database startup failed. Halting application.")
    yield
    # Shutdown — clean up caches and resources
    try:
        try:
            from app.services.escrow_autodial import stop_escrow_scheduler

            stop_escrow_scheduler()

            from app.services.milestone_deadline_loop import stop_overdue_scheduler

            stop_overdue_scheduler()
            logger.info("shutdown.escrow_scheduler_stopped")
        except Exception:
            pass

        with _idempotency_lock:
            _idempotency_cache.clear()
        from app.core.security import _user_cache, _user_cache_lock

        with _user_cache_lock:
            _user_cache.clear()
        logger.info("shutdown.caches_cleared")
    except Exception as e:
        logger.warning(f"shutdown.cleanup_warning: {e}")
    logger.info("shutdown.complete")


app = FastAPI(
    title="MegiLance API",
    description="""
    MegiLance Backend API

    AI-Powered Freelancing Platform connecting top talent with global opportunities.

    Key Features:
    - AI-Powered Freelancer Matching
    - Blockchain-Based Escrow Payments
    - Secure Authentication & Role Management
    - Real-time Messaging & Notifications
    - Gig Marketplace & Seller Tiers
    - Multi-Currency Payment Support
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    redirect_slashes=False,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# Bounded idempotency cache using OrderedDict for O(1) LRU eviction
import threading
from collections import OrderedDict

_IDEMPOTENCY_TTL = 3600  # 1 hour
_IDEMPOTENCY_MAX_SIZE = 5000
_idempotency_cache: OrderedDict[str, tuple[int, bytes, float]] = OrderedDict()
_idempotency_lock = threading.Lock()
_idempotency_evict_counter = [0]  # Mutable container for thread-safe atomic increment


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        start = time.time()

        # Idempotency key support for mutating requests
        idempotency_key = request.headers.get("X-Idempotency-Key")
        cache_key = None
        if idempotency_key and request.method in ("POST", "PUT", "PATCH"):
            cache_key = f"{request.method}:{request.url.path}:{idempotency_key}"
            with _idempotency_lock:
                cached = _idempotency_cache.get(cache_key)
                if cached:
                    cached_status, body_bytes, cached_at = cached
                    if time.time() - cached_at < _IDEMPOTENCY_TTL:
                        _idempotency_cache.move_to_end(cache_key)
                        response = Response(
                            content=body_bytes,
                            status_code=cached_status,
                            media_type="application/json",
                        )
                        response.headers["X-Request-Id"] = request_id
                        response.headers["X-Idempotent-Replayed"] = "true"
                        return response
                    else:
                        del _idempotency_cache[cache_key]

        response = None
        try:
            response = await call_next(request)

            # Idempotency write-back: cache response body so duplicate requests get the same reply
            if cache_key is not None:
                chunks = []
                async for chunk in response.body_iterator:
                    chunks.append(chunk)
                body_bytes = b"".join(chunks)
                with _idempotency_lock:
                    _idempotency_cache[cache_key] = (
                        response.status_code,
                        body_bytes,
                        time.time(),
                    )
                    _idempotency_cache.move_to_end(cache_key)
                # Rebuild the response since we fully consumed body_iterator
                orig_headers = {
                    k: v
                    for k, v in response.headers.items()
                    if k.lower() not in ("content-length", "transfer-encoding")
                }
                response = Response(
                    content=body_bytes,
                    status_code=response.status_code,
                    headers=orig_headers,
                )

            return response
        finally:
            duration_ms = int((time.time() - start) * 1000)
            client_ip = request.headers.get("X-Forwarded-For", "").split(",")[
                0
            ].strip() or (request.client.host if request.client else "unknown")
            extra = logging.LoggerAdapter(
                logger, {"request_id": request_id, "path": request.url.path}
            )
            status_code = response.status_code if response else "error"
            extra.info(
                f"request.complete method={request.method} path={request.url.path} duration_ms={duration_ms} status={status_code} client_ip={client_ip}"
            )
            if response is not None:
                response.headers["X-Request-Id"] = request_id
                response.headers["X-Response-Time"] = f"{duration_ms}ms"

            # Periodic eviction (thread-safe): every 100 requests
            with _idempotency_lock:
                _idempotency_evict_counter[0] += 1
                if _idempotency_evict_counter[0] >= 100:
                    _idempotency_evict_counter[0] = 0
                    now = time.time()
                    # Remove expired from front (oldest first in OrderedDict)
                    while _idempotency_cache:
                        key, (_, _, ts) = next(iter(_idempotency_cache.items()))
                        if now - ts > _IDEMPOTENCY_TTL:
                            _idempotency_cache.popitem(last=False)
                        else:
                            break
                    # Hard cap
                    while len(_idempotency_cache) > _IDEMPOTENCY_MAX_SIZE:
                        _idempotency_cache.popitem(last=False)


app.add_middleware(RequestIDMiddleware)

# Configure CORS - restrict in production
cors_origins = settings.backend_cors_origins
if settings.environment == "production":
    if "*" in cors_origins:
        logger.warning(
            "SECURITY: CORS wildcard (*) detected in production - restricting to localhost only"
        )
        cors_origins = ["http://localhost:3000"]  # Force safe default
    elif not cors_origins:
        logger.error("CRITICAL: No CORS origins configured in production")
        raise ValueError("CORS origins must be explicitly configured in production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Idempotency-Key",
        "X-Request-Id",
    ],  # Restrict headers
    expose_headers=[
        "X-Request-Id",
        "X-Total-Count",
        "X-Response-Time",
        "X-Idempotent-Replayed",
    ],
    max_age=3600,
)


# Add security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # Allow Swagger UI CDN resources for API docs
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastapi.tiangolo.com"
        )
        # Note: Cookie security flags (Secure, HttpOnly, SameSite) should be set
        # on individual set_cookie() calls, not as a blanket header override.
        return response


app.add_middleware(SecurityHeadersMiddleware)

# GZip compression for responses > 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)


# Request body size limit middleware (10MB default)
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    MAX_BODY_SIZE = 10 * 1024 * 1024  # 10MB

    async def dispatch(self, request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={
                    "detail": "Request body too large. Maximum size is 10MB.",
                    "error_type": "PayloadTooLarge",
                },
            )
        return await call_next(request)


app.add_middleware(RequestSizeLimitMiddleware)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    request_id = request.headers.get("X-Request-Id", "")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_type": "HTTPException",
            "status_code": exc.status_code,
            "request_id": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Return human-readable validation errors with field paths."""
    request_id = request.headers.get("X-Request-Id", "")
    errors = []
    for err in exc.errors():
        field = " → ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        errors.append(
            {
                "field": field or "unknown",
                "message": err.get("msg", "Validation error"),
                "type": err.get("type", "value_error"),
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "detail": f"{len(errors)} validation error(s)",
            "error_type": "ValidationError",
            "errors": errors,
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    import traceback

    request_id = request.headers.get("X-Request-Id", "")
    error_details = traceback.format_exc()
    logger.error(
        f"unhandled_exception type={type(exc).__name__} message={str(exc)} request_id={request_id} traceback={error_details.replace(chr(10), ' | ')}"
    )

    # Auto-capture for the admin issue monitor (best-effort, never raises)
    try:
        from app.api.v1.core_domain.error_reports import record_error
        record_error(
            source="backend",
            severity="high",
            error_type=type(exc).__name__,
            message=str(exc),
            stack=error_details,
            path=str(request.url.path),
            method=request.method,
            status_code=500,
            user_agent=request.headers.get("user-agent"),
            context={"request_id": request_id, "query": str(request.url.query)},
        )
    except Exception:
        pass

    # SECURITY: Never expose internal error details in production
    if settings.environment == "production":
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal server error occurred. Please try again later.",
                "error_type": "InternalError",
                "request_id": request_id,
            },
        )

    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc)[:200],  # Limit error detail length even in dev
            "error_type": type(exc).__name__,
            "request_id": request_id,
        },
    )


@app.get("/api")
def api_root():
    return {
        "message": "MegiLance API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
    }


@app.get("/api/v1/health")
@app.head("/api/v1/health")
@app.get("/health")
@app.head("/health")
async def do_health_check():
    return {"status": "ok"}


@app.get("/api/v1/health/live")
def health_live():
    return {
        "status": "ok",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.get("/api/v1/health/ready")
def health_ready():
    uptime_seconds = int(time.time() - _APP_START_TIME)
    base_info = {
        "version": "2.0.0",
        "environment": settings.environment,
        "uptime_seconds": uptime_seconds,
        "python_version": sys.version.split()[0],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    status_dict = {"status": "ready", "db": "ok", "components": {}}

    try:
        # Check Database
        if engine is not None:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            status_dict["components"]["db"] = "ok"
            status_dict["driver"] = "sqlalchemy"
        else:
            # Using Turso HTTP API
            from app.db.turso_http import execute_query

            result = execute_query("SELECT 1")
            if result is not None:
                status_dict["components"]["db"] = "ok"
                status_dict["driver"] = "turso_http"
            else:
                raise Exception("Turso HTTP query returned None")

        # Check External Storage Integration (S3/Cloudflare R2)
        if getattr(settings, "aws_access_key_id", None) and getattr(
            settings, "aws_bucket_name", None
        ):
            status_dict["components"]["storage"] = "configured"
        elif getattr(settings, "upload_dir", None):
            status_dict["components"]["storage"] = "local"
        else:
            status_dict["components"]["storage"] = "missing_configuration"

        # Check SMTP configuration
        if getattr(settings, "SMTP_USER", None) or getattr(settings, "RESEND_API_KEY", None):
            status_dict["components"]["email"] = "configured"
        else:
            status_dict["components"]["email"] = "missing_configuration"

        status_dict.update(base_info)
        return status_dict

    except Exception as e:
        logger.error(f"health.ready_failed error={e}")
        # SECURITY: Don't leak database error details in production
        error_detail = (
            str(e)
            if settings.environment != "production"
            else "Database connection failed"
        )
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "db_error": error_detail, **base_info},
        )


@app.get("/api/v1/health/metrics")
def health_metrics():
    """Operational metrics endpoint for monitoring."""
    uptime_seconds = int(time.time() - _APP_START_TIME)
    with _idempotency_lock:
        idempotency_cache_size = len(_idempotency_cache)
    try:
        from app.core.security import _user_cache, _user_cache_lock

        with _user_cache_lock:
            user_cache_size = len(_user_cache)
    except Exception:
        user_cache_size = -1
    return {
        "uptime_seconds": uptime_seconds,
        "idempotency_cache_size": idempotency_cache_size,
        "user_cache_size": user_cache_size,
        "inflight_requests_dedup": 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


from pathlib import Path

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Backward compatibility: expose endpoints on both /api and /api/v1.
# Many existing clients/tests (and some frontend paths) still call /api/*.
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")

# Mount Socket.IO ASGI app for real-time features (chat, notifications, presence)
# IMPORTANT: Must be mounted AFTER include_router so HTTP routes take priority.
try:
    from app.core.websocket import socket_app

    app.mount("/socket.io", socket_app)
    logger.info("startup.socketio_mounted at /socket.io")
except Exception as _sio_err:
    logger.warning(f"startup.socketio_mount_failed: {_sio_err}")
    logger.warning("Real-time WebSocket features will not work until this is resolved")

# Upload directory setup
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

_UPLOADS_BASE = Path(uploads_dir).resolve()
_INLINE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.get("/uploads/{file_path:path}")
async def serve_upload(file_path: str):
    """Serve uploaded files with proper Content-Disposition and security headers."""
    resolved = (_UPLOADS_BASE / file_path).resolve()
    # Prevent path traversal — use is_relative_to for cross-platform safety
    try:
        resolved.relative_to(_UPLOADS_BASE)
    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
    if not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    content_type, _ = mimetypes.guess_type(str(resolved))
    content_type = content_type or "application/octet-stream"

    # Images render inline; everything else forces download
    if content_type in _INLINE_MIME_TYPES:
        disposition = "inline"
    else:
        disposition = "attachment"

    return FileResponse(
        path=str(resolved),
        media_type=content_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{resolved.name}"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
