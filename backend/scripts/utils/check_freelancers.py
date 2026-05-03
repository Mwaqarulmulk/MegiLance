# @AI-HINT: Script to check freelancer passwords
import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

conn = sqlite3.connect('local_dev.db')
c = conn.cursor()

# Check freelancers
c.execute("SELECT id, email, hashed_password, user_type FROM users WHERE email LIKE '%freelancer%'")
rows = c.fetchall()

print("Checking freelancer accounts:")
for row in rows:
    uid, email, hashed_pw, user_type = row
    if hashed_pw:
        try:
            is_valid = pwd_context.verify("Password123", hashed_pw)
            print(f"{email}: Password123 valid = {is_valid}, user_type = {user_type}")
        except Exception as e:
            print(f"{email}: Error verifying - {e}")
    else:
        print(f"{email}: No password set")

conn.close()
