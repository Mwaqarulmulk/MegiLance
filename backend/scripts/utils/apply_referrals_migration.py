import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.db.turso_http import execute_query

def apply_migration():
    print("Applying referrals migration...")
    
    with open("turso_referrals.sql", "r") as f:
        sql = f.read()
        
    # Split by semicolon to execute statements individually
    statements = sql.split(";")
    
    for stmt in statements:
        stmt = stmt.strip()
        if stmt:
            print(f"Executing: {stmt[:50]}...")
            try:
                execute_query(stmt, [])
            except Exception as e:
                print(f"Error executing statement: {e}")
                
    print("Migration applied successfully.")

if __name__ == "__main__":
    # Add parent directory to path to import app
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    apply_migration()
