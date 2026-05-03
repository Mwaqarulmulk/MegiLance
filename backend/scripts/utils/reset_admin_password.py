# Reset admin password in Turso database
from app.db.turso_http import execute_query, parse_rows
from app.core.security import get_password_hash, verify_password

# Set a new password for admin
new_password = "Admin@123"
new_hash = get_password_hash(new_password)

print(f"Generating new password hash for: {new_password}")
print(f"New hash: {new_hash}")

# Update admin password
result = execute_query(
    "UPDATE users SET hashed_password = ? WHERE email = ?",
    [new_hash, "admin@megilance.com"]
)
print(f"\nUpdate result: {result}")

# Verify the update worked
result = execute_query('SELECT hashed_password FROM users WHERE email = ?', ['admin@megilance.com'])
rows = parse_rows(result)
if rows:
    stored_hash = rows[0].get('hashed_password')
    print(f"\nStored hash after update: {stored_hash}")
    
    # Verify the password works
    verified = verify_password(new_password, stored_hash)
    print(f"Password verification: {'SUCCESS' if verified else 'FAILED'}")
else:
    print("Could not verify update")

# Also update demo users with known passwords
demo_users = [
    ("client1@example.com", "Client@123"),
    ("freelancer1@example.com", "Freelancer@123"),
]

print("\n\nUpdating demo user passwords:")
for email, password in demo_users:
    pw_hash = get_password_hash(password)
    execute_query("UPDATE users SET hashed_password = ? WHERE email = ?", [pw_hash, email])
    print(f"  {email} -> {password}")

print("\n\n=== Login Credentials ===")
print("Admin:      admin@megilance.com / Admin@123")
print("Client:     client1@example.com / Client@123")
print("Freelancer: freelancer1@example.com / Freelancer@123")
