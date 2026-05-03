# @AI-HINT: Script to fix demo authentication by resetting passwords for demo users
"""
Fix Demo Authentication
This script resets the passwords for demo users to enable FYP evaluation
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.security import get_password_hash
from app.db.turso_http import execute_query


def fix_demo_passwords():
    """Reset demo user passwords to known values for FYP demonstration"""
    
    print("🔐 MegiLance Demo Auth Fixer")
    print("=" * 50)
    
    # Demo users with their passwords (must match frontend DevQuickLogin credentials)
    demo_users = [
        ("admin@megilance.com", "Admin@123", "Admin"),
        ("client1@example.com", "Client@123", "Client"),
        ("client2@example.com", "Client@123", "Client"),
        ("client3@example.com", "Client@123", "Client"),
        ("freelancer1@example.com", "Freelancer@123", "Freelancer"),
        ("freelancer2@example.com", "Freelancer@123", "Freelancer"),
        ("freelancer3@example.com", "Freelancer@123", "Freelancer"),
        ("freelancer4@example.com", "Freelancer@123", "Freelancer"),
        ("freelancer5@example.com", "Freelancer@123", "Freelancer"),
    ]
    
    success_count = 0
    
    for email, password, user_type in demo_users:
        try:
            # Hash the password
            hashed_password = get_password_hash(password)
            
            # Update in database
            result = execute_query(
                "UPDATE users SET hashed_password = ? WHERE email = ?",
                [hashed_password, email]
            )
            
            print(f"✅ {user_type}: {email} → password: {password}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Failed for {email}: {str(e)}")
    
    print()
    print("=" * 50)
    print(f"✨ Fixed {success_count}/{len(demo_users)} user passwords")
    print()
    print("📝 Demo Login Credentials:")
    print("-" * 50)
    print("Admin:      admin@megilance.com / Admin@123")
    print("Client:     client1@example.com / Client@123")
    print("Freelancer: freelancer1@example.com / Freelancer@123")
    print()
    
    return success_count == len(demo_users)


if __name__ == "__main__":
    success = fix_demo_passwords()
    sys.exit(0 if success else 1)
