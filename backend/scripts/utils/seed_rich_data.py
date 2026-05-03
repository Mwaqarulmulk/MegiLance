import os
import sys
import json
import random
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import get_engine
from sqlalchemy import text
from app.core.security import get_password_hash

def seed_rich_data():
    engine = get_engine()
    hashed_password = get_password_hash("Password123")
    
    with engine.connect() as conn:
        print("Seeding rich data...")
        
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
            exists = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": f["email"]}).scalar()
            if not exists:
                conn.execute(text("""
                    INSERT INTO users (
                        email, hashed_password, name, user_type, role, is_active, 
                        skills, hourly_rate, bio, created_at, updated_at, joined_at,
                        is_verified, email_verified, two_factor_enabled, account_balance
                    ) VALUES (
                        :email, :pwd, :name, 'Freelancer', 'freelancer', 1,
                        :skills, :rate, :bio, :now, :now, :now,
                        1, 1, 0, 0.0
                    )
                """), {
                    "email": f["email"],
                    "pwd": hashed_password,
                    "name": f["name"],
                    "skills": json.dumps(f["skills"]),
                    "rate": f["rate"],
                    "bio": f["bio"],
                    "now": datetime.now()
                })
                print(f"Created freelancer: {f['name']}")
        
        # 2. Get Demo Client ID
        client_id = conn.execute(text("SELECT id FROM users WHERE email = 'client@demo.com'")).scalar()
        if not client_id:
            print("Creating demo client...")
            conn.execute(text("""
                INSERT INTO users (
                    email, hashed_password, name, user_type, role, is_active, 
                    created_at, updated_at, joined_at,
                    is_verified, email_verified, two_factor_enabled, account_balance
                )
                VALUES (
                    'client@demo.com', :pwd, 'Demo Client', 'Client', 'client', 1, 
                    :now, :now, :now,
                    1, 1, 0, 0.0
                )
            """), {"pwd": hashed_password, "now": datetime.now()})
            client_id = conn.execute(text("SELECT id FROM users WHERE email = 'client@demo.com'")).scalar()
        
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
            exists = conn.execute(text("SELECT id FROM projects WHERE title = :title AND client_id = :cid"), 
                                {"title": p["title"], "cid": client_id}).scalar()
            if not exists:
                conn.execute(text("""
                    INSERT INTO projects (
                        title, description, client_id, budget_min, budget_max, status, 
                        skills, category, created_at, updated_at,
                        budget_type, experience_level, estimated_duration
                    ) VALUES (
                        :title, :desc, :cid, :bmin, :bmax, :status,
                        :skills, :cat, :now, :now,
                        'Fixed', 'Intermediate', '1-3 months'
                    )
                """), {
                    "title": p["title"],
                    "desc": p["description"],
                    "cid": client_id,
                    "bmin": p["budget_min"],
                    "bmax": p["budget_max"],
                    "status": p["status"],
                    "skills": json.dumps(p["skills"]),
                    "cat": p["category"],
                    "now": datetime.now()
                })
                print(f"Created project: {p['title']}")

        # 4. Create Payments (Transactions)
        # Check if payments table exists
        try:
            conn.execute(text("SELECT 1 FROM payments LIMIT 1"))
            payments_exist = True
        except:
            payments_exist = False
            print("Payments table might not exist or is empty.")

        if payments_exist:
            # Get a freelancer ID
            freelancer_id = conn.execute(text("SELECT id FROM users WHERE user_type = 'Freelancer' LIMIT 1")).scalar()
            
            transactions = [
                {"amount": 1250.00, "desc": "Milestone 1: Design Phase", "status": "completed", "date": datetime.now() - timedelta(days=2)},
                {"amount": 500.00, "desc": "Initial Deposit", "status": "completed", "date": datetime.now() - timedelta(days=15)},
                {"amount": 2500.00, "desc": "Project Completion", "status": "pending", "date": datetime.now() - timedelta(days=1)}
            ]
            
            for t in transactions:
                # Simple check to avoid duplicates if run multiple times
                exists = conn.execute(text("SELECT id FROM payments WHERE amount = :amt AND description = :desc"), 
                                    {"amt": t["amount"], "desc": t["desc"]}).scalar()
                if not exists and freelancer_id:
                    conn.execute(text("""
                        INSERT INTO payments (
                            amount, status, description, from_user_id, to_user_id,
                            created_at, updated_at, freelancer_amount, payment_type, payment_method,
                            platform_fee
                        ) VALUES (
                            :amt, :status, :desc, :pid, :fid,
                            :date, :date, :amt, 'project', 'usdc',
                            0.0
                        )
                    """), {
                        "amt": t["amount"],
                        "status": t["status"],
                        "desc": t["desc"],
                        "pid": client_id,
                        "fid": freelancer_id,
                        "date": t["date"]
                    })
                    print(f"Created transaction: {t['desc']}")

        conn.commit()
        print("Rich data seeding complete!")

if __name__ == "__main__":
    seed_rich_data()
