"""
@AI-HINT: Database migration script to apply advanced features schema
Creates 25+ new tables for MFA, multi-currency, AI, security, and video features
Uses Turso HTTP API instead of SQLAlchemy for compatibility with Turso cloud database.
"""

import logging
from pathlib import Path
from app.db.turso_http import execute_query, parse_rows

logger = logging.getLogger(__name__)


def apply_migration():
    """Apply advanced_schema.sql migration"""
    logger.info("Starting database migration for advanced features...")

    # Read schema file
    schema_path = Path(__file__).parent / "advanced_schema.sql"

    if not schema_path.exists():
        logger.warning(f"Schema file not found: {schema_path}")
        return False

    logger.info(f"Reading schema from: {schema_path}")
    schema_sql = schema_path.read_text(encoding="utf-8")

    # Split SQL statements (Turso/SQLite executes one at a time)
    statements = []
    current_statement = []

    for line in schema_sql.split('\n'):
        # Skip comments and empty lines
        if line.strip().startswith('--') or not line.strip():
            continue

        current_statement.append(line)

        # Check if statement is complete
        if line.strip().endswith(';'):
            stmt = '\n'.join(current_statement)
            statements.append(stmt)
            current_statement = []

    logger.info(f"Found {len(statements)} SQL statements to execute")

    # Execute each statement
    success_count = 0
    error_count = 0

    for i, stmt in enumerate(statements, 1):
        try:
            execute_query(stmt)
            success_count += 1

            if 'CREATE TABLE' in stmt:
                parts = stmt.split('CREATE TABLE IF NOT EXISTS')
                if len(parts) > 1:
                    table_name = parts[1].split('(')[0].strip()
                    logger.info(f"  [{i}/{len(statements)}] Created table: {table_name}")
                else:
                    logger.info(f"  [{i}/{len(statements)}] Executed CREATE TABLE")
            elif 'CREATE INDEX' in stmt:
                parts = stmt.split('CREATE INDEX IF NOT EXISTS')
                if len(parts) > 1:
                    index_name = parts[1].split(' ON')[0].strip()
                    logger.info(f"  [{i}/{len(statements)}] Created index: {index_name}")
                else:
                    logger.info(f"  [{i}/{len(statements)}] Executed CREATE INDEX")
            else:
                logger.info(f"  [{i}/{len(statements)}] Executed statement")

        except Exception as e:
            error_str = str(e)
            if 'already exists' in error_str.lower() or 'duplicate' in error_str.lower():
                success_count += 1
            else:
                logger.warning(f"  [{i}/{len(statements)}] Error: {error_str[:100]}")
                error_count += 1

    logger.info(f"Migration complete: {success_count}/{len(statements)} statements executed, {error_count} errors")
    return error_count == 0


def rollback_migration():
    """Rollback migration by dropping all advanced feature tables"""
    logger.info("Rolling back database migration...")

    tables_to_drop = [
        'user_sessions', 'price_suggestions', 'skill_matches', 'quality_assessments',
        'fraud_alerts', 'whiteboard_sessions', 'screen_share_sessions', 'video_recordings',
        'video_call_participants', 'video_calls', 'crypto_transactions', 'crypto_wallets',
        'transactions', 'exchange_rates', 'ip_whitelist', 'security_events',
        'mfa_backup_codes', 'mfa_methods'
    ]

    for table in tables_to_drop:
        try:
            execute_query(f"DROP TABLE IF EXISTS {table}")
        except Exception:
            pass

    logger.info("Rollback complete")
    return True


if __name__ == "__main__":
    import sys
    command = sys.argv[1] if len(sys.argv) > 1 else 'apply'

    if command == 'apply':
        success = apply_migration()
    elif command == 'rollback':
        success = rollback_migration()
    else:
        print(f"Unknown command: {command}. Use: apply, rollback")
        success = False

    sys.exit(0 if success else 1)
