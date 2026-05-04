#!/usr/bin/env python
"""Quick script to check database tables and data"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'local.db')
print(f"Database path: {db_path}")
print(f"File exists: {os.path.exists(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print(f"\nExisting tables ({len(tables)}):")
    for t in tables:
        table_name = t[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  - {table_name}: {count} rows")
    
    conn.close()
else:
    print("Database file does not exist!")
