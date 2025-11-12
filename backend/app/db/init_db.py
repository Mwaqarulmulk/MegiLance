import subprocess
import sys
from pathlib import Path
from sqlalchemy import Engine
from app.db.base import Base
from app.models import user, project, proposal, contract, portfolio, payment  # noqa: F401  ensure models are imported


def init_db(engine: Engine) -> None:
    """Initialize database: run migrations and create tables."""
    
    # SKIP AUTO-MIGRATIONS FOR DEMO - Manual setup used
    print("ℹ️  Skipping auto-migrations (manual schema setup for demo)")
    
    # Tables are created manually via create_minimal_schema.py
    # Seed data is loaded manually via seed_demo_data.py
    # This prevents startup crashes from migration issues
    
    print("✅ Database initialization skipped (using manual setup)")