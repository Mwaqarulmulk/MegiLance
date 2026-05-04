import sys
import os

# Set pythonpath
sys.path.append(os.getcwd())

from app.db.turso_http import execute_query, parse_rows

def get_test_users():
    res = execute_query('SELECT id, email, role, status FROM users LIMIT 100')
    users = parse_rows(res)
    
    roles = ['client', 'freelancer', 'admin']
    selected = {}
    
    for role in roles:
        role_users = [u for u in users if u.get('role') == role]
        if role_users:
            selected[role] = role_users[:2]
            print(f"Role: {role.upper()}")
            for u in selected[role]:
                print(f"  - {u['email']} (Status: {u['status']})")
        else:
            print(f"Role: {role.upper()} - NO USERS FOUND")

if __name__ == "__main__":
    get_test_users()
