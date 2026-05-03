import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

conn = sqlite3.connect('local_dev.db')
cur = conn.cursor()
cur.execute("SELECT hashed_password FROM users WHERE email='admin@megilance.com'")
result = cur.fetchone()
conn.close()

if result:
    stored_hash = result[0]
    print(f"Hash found: {stored_hash[:60]}...")
    print(f"Password123 valid: {pwd_context.verify('Password123', stored_hash)}")
else:
    print("User not found!")
