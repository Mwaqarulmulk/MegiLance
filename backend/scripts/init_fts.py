import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.turso_http import execute_query

def init_fts():
    print("Initializing FTS tables...")
    
    sql_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "turso_fts.sql")
    
    with open(sql_file, "r") as f:
        sql_script = f.read()
        
    # Split by semicolon to execute statements one by one
    statements = sql_script.split(";")
    
    for stmt in statements:
        stmt = stmt.strip()
        if stmt:
            try:
                print(f"Executing: {stmt[:50]}...")
                execute_query(stmt, [])
            except Exception as e:
                print(f"Error executing statement: {e}")
                
    print("FTS initialization complete.")

if __name__ == "__main__":
    init_fts()
