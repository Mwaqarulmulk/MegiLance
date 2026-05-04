import os
import sys
import json

# Add current directory to path
sys.path.append(os.getcwd())

from app.db.turso_http import get_turso_http

def main():
    try:
        db = get_turso_http()
        # Fetch users to use as test subjects
        result = db.execute("SELECT id, email, role, is_active FROM users LIMIT 20")
        print("DATABASE_USERS_START")
        # result is a dict with 'columns' and 'rows'
        print(json.dumps(result, indent=2))
        print("DATABASE_USERS_END")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    main()
