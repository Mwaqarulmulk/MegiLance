# @AI-HINT: Temporary script to verify demo user passwords
from app.db.session import get_db
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
db = next(get_db())

demo_emails = ['admin@megilance.com', 'client@demo.com', 'freelancer@demo.com']
test_passwords = ['Password123', 'admin123', 'password', 'Password123!', 'Demo123!', 'admin', 'megilance', 'demo', 'demo123']

for email in demo_emails:
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"\n=== {email} ===")
        print(f"  Has password: {bool(user.hashed_password)}")
        if user.hashed_password:
            print(f"  Hash: {user.hashed_password[:30]}...")
            found = False
            for pwd in test_passwords:
                try:
                    result = pwd_context.verify(pwd, user.hashed_password)
                    if result:
                        print(f"  ✓ MATCH: '{pwd}'")
                        found = True
                        break
                except Exception as e:
                    print(f"  Error with '{pwd}': {e}")
            if not found:
                print(f"  ✗ NO PASSWORD MATCH FOUND!")
