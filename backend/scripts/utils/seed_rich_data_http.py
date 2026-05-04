import os
import sys
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.turso_http import get_turso_http
from app.core.security import get_password_hash

def seed_rich_data():
    print("Seeding rich data using Turso HTTP API...")
    try:
        client = get_turso_http()
    except Exception as e:
        print(f"Failed to initialize Turso client: {e}")
        return

    hashed_password = get_password_hash("Password123")
    now_str = datetime.now().isoformat()
    
    # 1. Create Freelancers with Skills
    freelancers = [
        {
            "name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "skills": ["React", "Next.js", "TypeScript", "Node.js"],
            "title": "Senior React Developer",
            "rate": 85.0,
            "bio": "Expert in React ecosystem with 5 years of experience."
        },
        {
            "name": "Marcus Johnson",
            "email": "marcus.j@example.com",
            "skills": ["Figma", "UI/UX", "Design Systems", "Prototyping"],
            "title": "Lead UI/UX Designer",
            "rate": 95.0,
            "bio": "Creating beautiful and functional user interfaces."
        },
        {
            "name": "Elena Rodriguez",
            "email": "elena.r@example.com",
            "skills": ["Python", "Django", "FastAPI", "AWS"],
            "title": "Backend Architect",
            "rate": 110.0,
            "bio": "Scalable backend solutions and cloud infrastructure."
        },
        {
            "name": "David Kim",
            "email": "david.k@example.com",
            "skills": ["Flutter", "Dart", "Mobile", "iOS", "Android"],
            "title": "Mobile App Developer",
            "rate": 75.0,
            "bio": "Cross-platform mobile development specialist."
        },
        {
            "name": "Jessica Lee",
            "email": "jessica.l@example.com",
            "skills": ["Vue.js", "Nuxt", "JavaScript", "CSS"],
            "title": "Frontend Developer",
            "rate": 65.0,
            "bio": "Pixel-perfect frontend implementation."
        }
    ]
    
    for f in freelancers:
        # Check if exists
        res = client.execute("SELECT id FROM users WHERE email = ?", [f["email"]])
        if not res.get("rows"):
            client.execute("""
                INSERT INTO users (
                    email, hashed_password, name, user_type, role, is_active, 
                    skills, hourly_rate, bio, created_at, updated_at, joined_at,
                    is_verified, email_verified, two_factor_enabled, account_balance
                ) VALUES (
                    ?, ?, ?, 'Freelancer', 'freelancer', 1,
                    ?, ?, ?, ?, ?, ?,
                    1, 1, 0, 0.0
                )
            """, [
                f["email"],
                hashed_password,
                f["name"],
                json.dumps(f["skills"]),
                f["rate"],
                f["bio"],
                now_str, now_str, now_str
            ])
            print(f"Created freelancer: {f['name']}")
    
    # 2. Get Demo Client ID
    res = client.execute("SELECT id FROM users WHERE email = 'client@demo.com'")
    rows = res.get("rows", [])
    if not rows:
        print("Creating demo client...")
        client.execute("""
            INSERT INTO users (
                email, hashed_password, name, user_type, role, is_active, 
                created_at, updated_at, joined_at,
                is_verified, email_verified, two_factor_enabled, account_balance
            )
            VALUES (
                'client@demo.com', ?, 'Demo Client', 'Client', 'client', 1, 
                ?, ?, ?,
                1, 1, 0, 0.0
            )
        """, [hashed_password, now_str, now_str, now_str])
        res = client.execute("SELECT id FROM users WHERE email = 'client@demo.com'")
        rows = res.get("rows", [])
    
    # Extract ID from row (format depends on Turso response, usually list of values or dict with type/value)
    # TursoHTTP helper returns rows as list of lists of values (if using execute_query helper)
    # But client.execute returns raw Turso format: rows: [[{"type": "text", "value": "1"}]]
    # Wait, TursoHTTP.execute returns: {"columns": [...], "rows": [[val1, val2], ...]}
    # Let's check TursoHTTP._execute_remote again.
    # It returns result.get("rows", []) which is list of rows.
    # Turso API returns rows as array of arrays of values.
    
    client_id = rows[0][0] if rows else None
    # Handle if value is dict {"type": "text", "value": "..."}
    if isinstance(client_id, dict):
        client_id = client_id.get("value")
        
    if not client_id:
        print("Failed to get client ID")
        return

    # 3. Create Projects for Client
    projects = [
        {
            "title": "E-commerce Platform Redesign",
            "description": "Looking for a React expert to redesign our shop.",
            "skills": ["React", "TypeScript", "Tailwind"],
            "budget_min": 4000,
            "budget_max": 6000,
            "status": "in_progress",
            "category": "Web Development"
        },
        {
            "title": "Mobile App for Delivery",
            "description": "Need a Flutter developer for a delivery app.",
            "skills": ["Flutter", "Mobile", "API"],
            "budget_min": 7000,
            "budget_max": 9000,
            "status": "open",
            "category": "Mobile Development"
        },
        {
            "title": "Corporate Brand Identity",
            "description": "Rebranding for our tech startup.",
            "skills": ["Figma", "Branding", "Logo Design"],
            "budget_min": 2000,
            "budget_max": 3000,
            "status": "completed",
            "category": "Design"
        }
    ]
    
    for p in projects:
        res = client.execute("SELECT id FROM projects WHERE title = ? AND client_id = ?", [p["title"], client_id])
        if not res.get("rows"):
            client.execute("""
                INSERT INTO projects (
                    title, description, client_id, budget_min, budget_max, status, 
                    skills, category, created_at, updated_at,
                    budget_type, experience_level, estimated_duration
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    'Fixed', 'Intermediate', '1-3 months'
                )
            """, [
                p["title"],
                p["description"],
                client_id,
                p["budget_min"],
                p["budget_max"],
                p["status"],
                json.dumps(p["skills"]),
                p["category"],
                now_str, now_str
            ])
            print(f"Created project: {p['title']}")

    # 4. Create Payments (Transactions)
    try:
        client.execute("SELECT 1 FROM payments LIMIT 1")
        payments_exist = True
    except:
        payments_exist = False
        print("Payments table might not exist or is empty.")

    if payments_exist:
        # Get a freelancer ID
        res = client.execute("SELECT id FROM users WHERE user_type = 'Freelancer' LIMIT 1")
        rows = res.get("rows", [])
        freelancer_id = rows[0][0] if rows else None
        if isinstance(freelancer_id, dict):
            freelancer_id = freelancer_id.get("value")
        
        if freelancer_id:
            transactions = [
                {"amount": 1250.00, "desc": "Milestone 1: Design Phase", "status": "completed", "date": (datetime.now() - timedelta(days=2)).isoformat()},
                {"amount": 500.00, "desc": "Initial Deposit", "status": "completed", "date": (datetime.now() - timedelta(days=15)).isoformat()},
                {"amount": 2500.00, "desc": "Project Completion", "status": "pending", "date": (datetime.now() - timedelta(days=1)).isoformat()}
            ]
            
            for t in transactions:
                res = client.execute("SELECT id FROM payments WHERE amount = ? AND description = ?", [t["amount"], t["desc"]])
                if not res.get("rows"):
                    client.execute("""
                        INSERT INTO payments (
                            amount, status, description, from_user_id, to_user_id,
                            created_at, updated_at, freelancer_amount, payment_type, payment_method,
                            platform_fee
                        ) VALUES (
                            ?, ?, ?, ?, ?,
                            ?, ?, ?, 'project', 'usdc',
                            0.0
                        )
                    """, [
                        t["amount"],
                        t["status"],
                        t["desc"],
                        client_id,
                        freelancer_id,
                        t["date"],
                        t["date"],
                        t["amount"]
                    ])
                    print(f"Created transaction: {t['desc']}")

    print("Rich data seeding complete!")

if __name__ == "__main__":
    seed_rich_data()
