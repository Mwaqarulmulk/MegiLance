"""
Apply Alembic-generated migration SQL to Turso via HTTP API.

Usage:
    # Generate migration SQL
    alembic upgrade --sql head > migration.sql

    # Apply it
    python scripts/apply_migration.py migration.sql

    # Apply single revision
    python scripts/apply_migration.py --revision 85124def9342
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.turso_http import execute_query


def apply_sql_file(filepath: str) -> None:
    with open(filepath, 'r') as f:
        sql = f.read()

    statements = [s.strip() for s in sql.split(';') if s.strip()]
    for stmt in statements:
        try:
            execute_query(stmt)
            print(f"OK: {stmt[:80]}...")
        except Exception as e:
            print(f"FAIL: {stmt[:80]}... => {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/apply_migration.py <sql_file>")
        sys.exit(1)
    apply_sql_file(sys.argv[1])
