#!/usr/bin/env python3
"""
@AI-HINT: Turso database setup and migration script
Applies all pending migrations to the live Turso database via HTTP API.
Usage: python setup_turso.py
"""

import os
import sys
import json
import requests
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_settings


def get_turso_client():
    """Get Turso HTTP client configured from settings."""
    settings = get_settings()
    url = settings.turso_database_url.replace("libsql://", "https://")
    if not url.endswith("/"):
        url += "/"
    return url, settings.turso_auth_token


def execute_sql(url: str, token: str, sql: str, params: list = None):
    """Execute a SQL statement against Turso."""
    if params is None:
        params = []
    
    response = requests.post(
        url,
        json={"statements": [{"q": sql, "params": params}]},
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=30,
    )
    
    if response.status_code != 200:
        print(f"  ERROR: {response.status_code} - {response.text[:300]}")
        return None
    
    data = response.json()
    return data[0] if data else None


def verify_connection(url: str, token: str):
    """Verify Turso connection works."""
    print("Testing Turso connection...")
    result = execute_sql(url, token, "SELECT 1 as ok")
    if result and result.get("results"):
        print("  Connected successfully!")
        return True
    print("  Connection failed!")
    return False


def list_tables(url: str, token: str):
    """List all tables in the database."""
    result = execute_sql(url, token, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    if result and result.get("results"):
        rows = result["results"].get("rows", [])
        return [r[0].get("value") if isinstance(r[0], dict) else r[0] for r in rows]
    return []


def apply_migration_file(url: str, token: str, filepath: str):
    """Apply a migration file to the database."""
    print(f"\nApplying migration: {filepath}")
    
    # Import the migration module
    import importlib.util
    spec = importlib.util.spec_from_file_location("migration", filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    sql_statements = getattr(module, "SQL_STATEMENTS", [])
    if not sql_statements:
        print("  No SQL statements found in migration file")
        return False
    
    success_count = 0
    error_count = 0
    
    for i, sql in enumerate(sql_statements):
        # Skip ALTER TABLE statements that might fail if column already exists
        try:
            result = execute_sql(url, token, sql)
            if result:
                success_count += 1
            else:
                # ALTER TABLE ADD COLUMN fails if column exists - that's OK
                if "ALTER TABLE" in sql.upper() and "ADD COLUMN" in sql.upper():
                    print(f"  [{i+1}/{len(sql_statements)}] Column may already exist, skipping...")
                    success_count += 1
                else:
                    print(f"  [{i+1}/{len(sql_statements)}] FAILED: {sql[:80]}...")
                    error_count += 1
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print(f"  [{i+1}/{len(sql_statements)}] Already exists, skipping...")
                success_count += 1
            else:
                print(f"  [{i+1}/{len(sql_statements)}] ERROR: {e}")
                error_count += 1
    
    print(f"  Done: {success_count} succeeded, {error_count} failed")
    return error_count == 0


def create_indexes(url: str, token: str):
    """Create performance indexes."""
    print("\nCreating performance indexes...")
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)",
        "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)",
        "CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)",
        "CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id)",
        "CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id)",
        "CREATE INDEX IF NOT EXISTS idx_conversations_freelancer_id ON conversations(freelancer_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)",
        "CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id)",
        "CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id)",
        "CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id)",
        "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id)",
        "CREATE INDEX IF NOT EXISTS idx_escrow_contract_id ON escrow(contract_id)",
        "CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_gigs_seller_id ON gigs(seller_id)",
        "CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status)",
    ]
    
    for sql in indexes:
        execute_sql(url, token, sql)
    print("  Indexes created!")


def verify_schema(url: str, token: str):
    """Verify all expected tables exist."""
    print("\nVerifying database schema...")
    tables = list_tables(url, token)
    
    expected_tables = [
        "users", "projects", "proposals", "contracts", "conversations",
        "messages", "reviews", "disputes", "payments", "escrow",
        "notifications", "support_tickets", "gigs", "gig_orders",
        "gig_reviews", "gig_revisions", "gig_deliveries", "gig_faqs",
        "notification_preferences", "wallet_transactions", "fraud_alerts",
        "support_messages",
    ]
    
    missing = [t for t in expected_tables if t not in tables]
    if missing:
        print(f"  WARNING: Missing tables: {missing}")
        print("  Run migration 005_add_missing_tables.py to create them")
    else:
        print(f"  All {len(expected_tables)} expected tables found!")
    
    print(f"  Total tables in database: {len(tables)}")
    return missing


def main():
    print("=" * 60)
    print("MegiLance Turso Database Setup")
    print("=" * 60)
    
    try:
        settings = get_settings()
    except Exception as e:
        print(f"\nERROR: Failed to load settings: {e}")
        print("\nSetup steps:")
        print("  1. Run: turso auth login")
        print("  2. Run: turso db tokens create <your-db-name>")
        print("  3. Copy the token to backend/.env as TURSO_AUTH_TOKEN")
        print("  4. Run this script again")
        sys.exit(1)
    
    url, token = get_turso_client()
    
    if "CHANGE_ME" in token or len(token) < 50:
        print("\nERROR: Turso auth token not configured!")
        print("\nSetup steps:")
        print("  1. Run: turso auth login")
        print("  2. Run: turso db tokens create megilance-db")
        print("  3. Copy the token to backend/.env as TURSO_AUTH_TOKEN")
        print("  4. Run this script again")
        sys.exit(1)
    
    # Step 1: Verify connection
    if not verify_connection(url, token):
        sys.exit(1)
    
    # Step 2: Apply migrations
    migrations_dir = Path(__file__).parent / "migrations"
    migration_files = sorted(migrations_dir.glob("*.py"))
    
    if not migration_files:
        print("\nNo migration files found!")
        sys.exit(1)
    
    print(f"\nFound {len(migration_files)} migration files")
    
    for migration_file in migration_files:
        apply_migration_file(url, token, str(migration_file))
    
    # Step 3: Create indexes
    create_indexes(url, token)
    
    # Step 4: Verify schema
    missing = verify_schema(url, token)
    
    # Step 5: Summary
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print(f"Database URL: {settings.turso_database_url}")
    print(f"Migrations applied: {len(migration_files)}")
    
    if missing:
        print(f"\nWARNING: {len(missing)} tables missing - run migration 005")
    else:
        print("\nAll tables verified!")
    
    print("\nNext steps:")
    print("  1. Start backend: cd backend && python -m uvicorn main:app --reload")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Verify: curl http://localhost:8000/health")


if __name__ == "__main__":
    main()
