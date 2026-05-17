"""
Alembic environment configuration.

ARCHITECTURE NOTE:
- sqlalchemy-libsql is NOT installed in production
- All runtime DB access goes through Turso HTTP API (turso_http.py / turso_http_async.py)
- ORM models are schema reference only — NOT used at runtime
- Alembic runs in OFFLINE mode by default, generating SQL migration scripts
- Apply migrations via: python scripts/apply_migration.py <revision_id>
"""

from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool
from app.core.config import get_settings
from app.db.base import Base

# Import all models to register them with Base.metadata
from app.models import (
    User, Skill, UserSkill, Project, Proposal, Contract, Payment,
    PortfolioItem, Message, Conversation, Notification, Review,
    Dispute, Milestone, UserSession, AuditLog,
    Category, Tag, ProjectTag, TimeEntry, Invoice, Escrow,
    Favorite, SupportTicket, Refund, Gig, GigOrder, GigReview,
    GigRevision, GigDelivery, GigFaq, SellerStats,
    TalentInvitation, Referral, ExternalProject,
)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()

# Use Turso HTTP URL for schema generation context
if settings.turso_database_url and settings.turso_auth_token:
    turso_url = settings.turso_database_url.replace("libsql://", "sqlite+libsql://")
    config.set_main_option("sqlalchemy.url", turso_url)

target_metadata = Base.metadata

# Check if sqlalchemy-libsql is available for online migrations
_has_libsql = False
try:
    import sqlalchemy_libsql  # noqa: F401
    _has_libsql = True
except ImportError:
    pass


def run_migrations_offline() -> None:
    """Generate SQL migration scripts without connecting to DB."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against live database (requires sqlalchemy-libsql)."""
    if not _has_libsql:
        raise RuntimeError(
            "sqlalchemy-libsql is not installed. "
            "Install it with: pip install sqlalchemy-libsql\n"
            "Or use: alembic upgrade --sql head  (offline mode)"
        )
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
elif not _has_libsql:
    run_migrations_offline()
else:
    run_migrations_online()
