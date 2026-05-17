"""
Migration: Add enhanced portfolio fields
Adds tags, category, featured, views, likes, client_name, completion_date, tech_stack to portfolio_items

Usage:
    cd backend
    python -m scripts.migrations.003_enhance_portfolio
    OR
    python scripts/migrations/003_enhance_portfolio.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.turso_http import execute_query

MIGRATION_SQL = [
    # Tags as JSON text column
    "ALTER TABLE portfolio_items ADD COLUMN tags TEXT DEFAULT '[]'",
    # Category for filtering
    "ALTER TABLE portfolio_items ADD COLUMN category TEXT DEFAULT ''",
    # Featured flag for highlighting best work
    "ALTER TABLE portfolio_items ADD COLUMN featured INTEGER DEFAULT 0",
    # Views counter for analytics
    "ALTER TABLE portfolio_items ADD COLUMN views INTEGER DEFAULT 0",
    # Likes counter for engagement
    "ALTER TABLE portfolio_items ADD COLUMN likes INTEGER DEFAULT 0",
    # Client name for credibility
    "ALTER TABLE portfolio_items ADD COLUMN client_name TEXT DEFAULT ''",
    # Completion date for timeline
    "ALTER TABLE portfolio_items ADD COLUMN completion_date TEXT",
    # Tech stack as JSON array
    "ALTER TABLE portfolio_items ADD COLUMN tech_stack TEXT DEFAULT '[]'",
    # Thumbnail for gallery view
    "ALTER TABLE portfolio_items ADD COLUMN thumbnail_url TEXT DEFAULT ''",
    # Live demo URL
    "ALTER TABLE portfolio_items ADD COLUMN demo_url TEXT DEFAULT ''",
    # GitHub/repository URL
    "ALTER TABLE portfolio_items ADD COLUMN repo_url TEXT DEFAULT ''",
    # Role/position on the project
    "ALTER TABLE portfolio_items ADD COLUMN role TEXT DEFAULT ''",
    # Project outcome/results
    "ALTER TABLE portfolio_items ADD COLUMN results TEXT DEFAULT ''",
    # Visibility: public, private, unlisted
    "ALTER TABLE portfolio_items ADD COLUMN visibility TEXT DEFAULT 'public'",
]


def run_migration():
    print("Running portfolio enhancement migration...")
    for sql in MIGRATION_SQL:
        try:
            execute_query(sql)
            col = sql.split("ADD COLUMN ")[1].split(" ")[0]
            print(f"  ✅ Added column: {col}")
        except Exception as e:
            col = sql.split("ADD COLUMN ")[1].split(" ")[0]
            print(f"  ⚠️ Column {col} may already exist: {e}")
    print("Migration complete!")


if __name__ == "__main__":
    run_migration()
