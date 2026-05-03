import sqlite3

conn = sqlite3.connect('local_dev.db')
cursor = conn.cursor()
cursor.execute('PRAGMA table_info(users)')
cols = cursor.fetchall()
print("Users table columns:")
for c in cols:
    print(f"  {c[1]:20} {c[2]:15} {'NOT NULL' if c[3] else 'NULL':10} default={c[4]}")
    
# Try to manually insert a user
from app.core.security import get_password_hash
from datetime import datetime, timezone

email = "manual@example.com"
password = "TestPass123!"
hashed = get_password_hash(password)
now = datetime.now(timezone.utc).isoformat()

try:
    cursor.execute("""
        INSERT INTO users (email, hashed_password, is_active, is_verified, name, user_type, joined_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [email, hashed, 1, 0, "Manual Test", "freelancer", now])
    conn.commit()
    print(f"\n✓ Manually inserted user: {email}")
    
    # Verify
    cursor.execute("SELECT id, email, name, user_type FROM users WHERE email = ?", [email])
    row = cursor.fetchone()
    print(f"✓ User found: ID={row[0]}, email={row[1]}, name={row[2]}, type={row[3]}")
    
except Exception as e:
    print(f"\n✗ Insert failed: {e}")
    import traceback
    traceback.print_exc()

conn.close()
