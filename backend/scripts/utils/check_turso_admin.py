# Check admin user in Turso database
from app.db.turso_http import execute_query, parse_rows
from app.core.security import verify_password, get_password_hash

# Check if admin user exists
result = execute_query('SELECT id, email, hashed_password, is_active, role FROM users WHERE email = ?', ['admin@megilance.com'])
if result:
    rows = parse_rows(result)
    if rows:
        print('Admin user found:')
        for row in rows:
            print(f"  ID: {row.get('id')}")
            print(f"  Email: {row.get('email')}")
            print(f"  Role: {row.get('role')}")
            print(f"  Is Active: {row.get('is_active')}")
            hashed_pw = row.get('hashed_password')
            print(f"  Password Hash: {hashed_pw[:60] if hashed_pw else 'None'}...")
            
            # Test password verification
            test_passwords = ['admin123', 'Admin123', 'Admin@123', 'password', 'Password123']
            print("\nTesting common passwords:")
            for pwd in test_passwords:
                try:
                    match = verify_password(pwd, hashed_pw)
                    print(f"  '{pwd}': {'MATCH!' if match else 'no match'}")
                    if match:
                        print(f"\n>>> Found working password: {pwd}")
                        break
                except Exception as e:
                    print(f"  '{pwd}': error - {e}")
    else:
        print('No admin user found in Turso database')
else:
    print('Query failed')

# Also list all users
print("\n\nAll users in database:")
result = execute_query('SELECT id, email, role, is_active FROM users LIMIT 20')
if result:
    rows = parse_rows(result)
    for row in rows:
        print(f"  {row.get('id')}: {row.get('email')} (role={row.get('role')}, active={row.get('is_active')})")
