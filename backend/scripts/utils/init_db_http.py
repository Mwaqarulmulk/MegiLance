import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from app.db.turso_http import get_turso_http

def init_db():
    print("Initializing database using Turso HTTP API...")
    
    try:
        client = get_turso_http()
    except Exception as e:
        print(f"Failed to initialize Turso client: {e}")
        return

    schema_path = Path(__file__).parent / "turso_schema.sql"
    if not schema_path.exists():
        print(f"Schema file not found: {schema_path}")
        return

    with open(schema_path, "r") as f:
        sql_content = f.read()

    # Split by semicolon, but be careful about semicolons in strings/triggers
    # For this simple schema, splitting by ";\n" or just ";" might work if formatted well.
    # The provided schema has ";\n\n" or ";\n" mostly.
    
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    success_count = 0
    error_count = 0
    
    for stmt in statements:
        try:
            # Skip empty statements
            if not stmt:
                continue
                
            print(f"Executing: {stmt[:50]}...")
            client.execute(stmt)
            success_count += 1
        except Exception as e:
            if "already exists" in str(e):
                print(f"  -> Table/Index already exists (skipping)")
            else:
                print(f"  -> Error: {e}")
                error_count += 1

    print(f"\nInitialization complete.")
    print(f"Success: {success_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    init_db()
