#!/usr/bin/env python3
"""Test user registration INSERT"""

from app.db.turso_http import execute_query
from app.core.security import get_password_hash
from datetime import datetime, timezone
import json

# Test password hashing
password = "TestPass123!"
hashed = get_password_hash(password)
print(f"✓ Password hashed: {len(hashed)} chars")

# Test INSERT
now = datetime.now(timezone.utc).isoformat()
try:
    result = execute_query(
        """INSERT INTO users (email, hashed_password, is_active, name, user_type, 
           bio, skills, hourly_rate, profile_image_url, location, profile_data, joined_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            "inserttest@example.com",
            hashed,
            1,
            "Insert Test",
            "freelancer",
            "",
            "",
            0,
            "",
            "",
            None,
            now
        ]
    )
    print(f"✓ INSERT result: {result}")
    
    # Verify user was created
    check = execute_query(
        "SELECT id, email, name, user_type FROM users WHERE email = ?",
        ["inserttest@example.com"]
    )
    print(f"✓ User created: {check}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
