# @AI-HINT: Script to reset all demo user passwords to Password123
import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_password_hash = pwd_context.hash("Password123")

conn = sqlite3.connect('local_dev.db')
c = conn.cursor()

# Update all users with the new password
c.execute("UPDATE users SET hashed_password = ?", (new_password_hash,))
affected = c.rowcount
conn.commit()

print(f"Updated {affected} user passwords to Password123")

# Verify
c.execute("SELECT email, hashed_password FROM users LIMIT 3")
for row in c.fetchall():
    is_valid = pwd_context.verify("Password123", row[1])
    print(f"  {row[0]}: Password123 valid = {is_valid}")

conn.close()
