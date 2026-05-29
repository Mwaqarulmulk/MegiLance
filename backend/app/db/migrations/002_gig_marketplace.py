"""
@AI-HINT: Database migration script for Gig Marketplace features
Creates tables for Fiverr-style gigs, orders, reviews, seller stats, and talent invitations
"""

import logging
from pathlib import Path
from app.db.turso_http import execute_query

logger = logging.getLogger(__name__)


def apply_migration():
    """Apply gig_marketplace_schema.sql migration"""
    logger.info("Starting database migration for Gig Marketplace...")

    # Read schema file
    schema_path = Path(__file__).parent / "gig_marketplace_schema.sql"

    if not schema_path.exists():
        logger.warning(f"Schema file not found: {schema_path}")
        return False

    logger.info(f"Reading schema from: {schema_path}")
    schema_sql = schema_path.read_text(encoding="utf-8")

    # Split SQL statements
    statements = []
    current_statement = []

    for line in schema_sql.split('\n'):
        if line.strip().startswith('--') or not line.strip():
            continue

        current_statement.append(line)

        if line.strip().endswith(';'):
            stmt = '\n'.join(current_statement)
            statements.append(stmt)
            current_statement = []

    logger.info(f"Found {len(statements)} SQL statements to execute")

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
            elif 'CREATE INDEX' in stmt:
                parts = stmt.split('CREATE INDEX IF NOT EXISTS')
                if len(parts) > 1:
                    index_name = parts[1].split(' ON')[0].strip()
                    logger.info(f"  [{i}/{len(statements)}] Created index: {index_name}")

        except Exception as e:
            error_str = str(e)
            if 'already exists' in error_str.lower() or 'duplicate' in error_str.lower():
                success_count += 1
            else:
                logger.warning(f"  [{i}/{len(statements)}] Error: {error_str[:100]}")
                error_count += 1

    logger.info(f"Migration complete: {success_count}/{len(statements)} statements executed, {error_count} errors")
    return error_count == 0


if __name__ == "__main__":
    apply_migration()
