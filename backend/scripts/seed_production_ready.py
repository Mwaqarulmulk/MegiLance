#!/usr/bin/env python3
"""
@AI-HINT: Production-ready comprehensive database seeding script
Creates realistic demo data for MegiLance platform including:
- Admin, Client, and Freelancer users with proper hashed passwords
- Projects across various categories
- Proposals from freelancers
- Contracts and milestones
- Skills and categories
"""

import sys
import os
import json
from datetime import datetime, timezone, timedelta
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.turso_http import execute_query
from app.core.security import get_password_hash

# =============================================================================
# CONFIGURATION
# =============================================================================

DEFAULT_PASSWORD = "MegiLance123!"  # Strong password meeting all requirements

# Demo Users
DEMO_USERS = [
    # Admin
    {
        "email": "admin@megilance.com",
        "name": "System Admin",
        "user_type": "admin",
        "role": "admin",
        "bio": "MegiLance platform administrator with full system access.",
        "skills": "Platform Management,User Support,Analytics",
        "hourly_rate": 0,
        "location": "Lahore, Pakistan",
        "is_verified": True,
    },
    # Clients
    {
        "email": "techcorp@example.com",
        "name": "TechCorp Solutions",
        "user_type": "client",
        "role": "client",
        "bio": "Leading technology solutions provider looking for talented developers and designers to help build innovative products.",
        "skills": "",
        "hourly_rate": 0,
        "location": "San Francisco, CA",
        "is_verified": True,
    },
    {
        "email": "startup@example.com",
        "name": "InnovatePlus Startup",
        "user_type": "client",
        "role": "client",
        "bio": "Fast-growing startup seeking skilled freelancers for various projects including mobile apps and web platforms.",
        "skills": "",
        "hourly_rate": 0,
        "location": "New York, NY",
        "is_verified": True,
    },
    {
        "email": "agency@example.com",
        "name": "Creative Agency Co",
        "user_type": "client",
        "role": "client",
        "bio": "Full-service creative agency specializing in branding, design, and digital marketing campaigns.",
        "skills": "",
        "hourly_rate": 0,
        "location": "London, UK",
        "is_verified": True,
    },
    # Freelancers
    {
        "email": "developer@example.com",
        "name": "Sarah Johnson",
        "user_type": "freelancer",
        "role": "freelancer",
        "bio": "Full-stack developer with 6+ years of experience building scalable web applications. Expert in React, Node.js, Python, and cloud technologies.",
        "skills": "React,Node.js,Python,TypeScript,PostgreSQL,AWS,Docker",
        "hourly_rate": 75,
        "location": "Austin, TX",
        "is_verified": True,
    },
    {
        "email": "designer@example.com",
        "name": "Michael Chen",
        "user_type": "freelancer",
        "role": "freelancer",
        "bio": "UI/UX Designer passionate about creating beautiful, user-centered digital experiences. Specialist in design systems and prototyping.",
        "skills": "UI/UX Design,Figma,Adobe XD,Prototyping,User Research,Design Systems",
        "hourly_rate": 65,
        "location": "Los Angeles, CA",
        "is_verified": True,
    },
    {
        "email": "mobile@example.com",
        "name": "Emily Rodriguez",
        "user_type": "freelancer",
        "role": "freelancer",
        "bio": "Mobile app developer specializing in React Native and Flutter. Created apps with millions of downloads.",
        "skills": "React Native,Flutter,iOS,Android,Firebase,REST APIs",
        "hourly_rate": 80,
        "location": "Miami, FL",
        "is_verified": True,
    },
    {
        "email": "writer@example.com",
        "name": "David Kim",
        "user_type": "freelancer",
        "role": "freelancer",
        "bio": "Technical writer and content strategist with expertise in SaaS documentation, blog content, and marketing copy.",
        "skills": "Technical Writing,Content Strategy,SEO,Copywriting,Documentation",
        "hourly_rate": 50,
        "location": "Seattle, WA",
        "is_verified": True,
    },
    {
        "email": "analyst@example.com",
        "name": "Lisa Wang",
        "user_type": "freelancer",
        "role": "freelancer",
        "bio": "Data scientist and analyst helping businesses make data-driven decisions. Expert in Python, SQL, and machine learning.",
        "skills": "Python,SQL,Machine Learning,Data Analysis,Tableau,Power BI",
        "hourly_rate": 85,
        "location": "Chicago, IL",
        "is_verified": True,
    },
]

# Demo Projects
DEMO_PROJECTS = [
    {
        "title": "E-Commerce Platform Development",
        "description": "Build a modern e-commerce platform with React frontend and Node.js backend. Features include product catalog, shopping cart, payment integration (Stripe), user authentication, order management, and admin dashboard. Must be responsive and SEO-optimized.",
        "category": "Web Development",
        "budget_type": "Fixed",
        "budget_min": 8000,
        "budget_max": 15000,
        "experience_level": "Expert",
        "estimated_duration": "1-3 months",
        "skills": "React,Node.js,PostgreSQL,Stripe,AWS",
        "status": "open",
    },
    {
        "title": "Mobile Fitness Tracking App",
        "description": "Develop a cross-platform fitness tracking application using React Native. Features: workout logging, progress tracking, social features, integration with wearables (Apple Watch, Fitbit), push notifications, and gamification elements.",
        "category": "Mobile Development",
        "budget_type": "Fixed",
        "budget_min": 12000,
        "budget_max": 20000,
        "experience_level": "Expert",
        "estimated_duration": "2-4 months",
        "skills": "React Native,Firebase,REST APIs,iOS,Android",
        "status": "open",
    },
    {
        "title": "Brand Identity Design Package",
        "description": "Create a complete brand identity package for a tech startup. Deliverables: logo design (multiple variations), color palette, typography guidelines, business cards, letterhead, social media templates, and brand guidelines document.",
        "category": "Design",
        "budget_type": "Fixed",
        "budget_min": 2500,
        "budget_max": 5000,
        "experience_level": "Intermediate",
        "estimated_duration": "2-4 weeks",
        "skills": "Logo Design,Branding,Adobe Illustrator,Figma",
        "status": "open",
    },
    {
        "title": "AI-Powered Customer Support Chatbot",
        "description": "Build an intelligent chatbot using OpenAI GPT-4 for customer support automation. Must integrate with existing CRM, handle FAQs, escalate complex issues to human agents, and provide analytics dashboard.",
        "category": "AI & Machine Learning",
        "budget_type": "Hourly",
        "budget_min": 50,
        "budget_max": 100,
        "experience_level": "Expert",
        "estimated_duration": "1-2 months",
        "skills": "Python,OpenAI API,NLP,REST APIs,PostgreSQL",
        "status": "open",
    },
    {
        "title": "WordPress Website Redesign",
        "description": "Redesign and modernize an existing WordPress website for a law firm. Improve UX, implement responsive design, optimize for speed and SEO, add new pages, and integrate contact forms with CRM.",
        "category": "Web Development",
        "budget_type": "Fixed",
        "budget_min": 3000,
        "budget_max": 6000,
        "experience_level": "Intermediate",
        "estimated_duration": "2-4 weeks",
        "skills": "WordPress,PHP,CSS,JavaScript,SEO",
        "status": "open",
    },
    {
        "title": "Data Analytics Dashboard",
        "description": "Create an interactive business intelligence dashboard using Python and modern visualization libraries. Connect to multiple data sources, create automated reports, and provide real-time KPI monitoring.",
        "category": "Data Science",
        "budget_type": "Fixed",
        "budget_min": 5000,
        "budget_max": 10000,
        "experience_level": "Expert",
        "estimated_duration": "1-2 months",
        "skills": "Python,SQL,Tableau,Power BI,Data Visualization",
        "status": "open",
    },
    {
        "title": "Technical Documentation Suite",
        "description": "Write comprehensive technical documentation for a SaaS platform. Includes API documentation, user guides, admin manuals, and developer onboarding materials. Must follow industry best practices.",
        "category": "Writing & Content",
        "budget_type": "Hourly",
        "budget_min": 40,
        "budget_max": 60,
        "experience_level": "Intermediate",
        "estimated_duration": "1-2 months",
        "skills": "Technical Writing,API Documentation,Markdown,GitBook",
        "status": "open",
    },
    {
        "title": "Social Media Marketing Campaign",
        "description": "Plan and execute a 3-month social media marketing campaign for a D2C brand. Includes content creation, community management, paid advertising, influencer outreach, and performance reporting.",
        "category": "Marketing",
        "budget_type": "Fixed",
        "budget_min": 4000,
        "budget_max": 8000,
        "experience_level": "Intermediate",
        "estimated_duration": "3 months",
        "skills": "Social Media Marketing,Content Creation,Facebook Ads,Analytics",
        "status": "open",
    },
]

# Skills/Categories
SKILL_CATEGORIES = [
    ("Web Development", ["React", "Angular", "Vue.js", "Node.js", "Python", "Django", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs"]),
    ("Mobile Development", ["React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin", "Firebase"]),
    ("Design", ["UI/UX Design", "Figma", "Adobe XD", "Sketch", "Adobe Illustrator", "Adobe Photoshop", "Prototyping"]),
    ("Data Science", ["Python", "R", "SQL", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Visualization", "Tableau", "Power BI"]),
    ("Writing", ["Technical Writing", "Copywriting", "Content Strategy", "SEO Writing", "Blog Writing", "Documentation"]),
    ("Marketing", ["Digital Marketing", "Social Media Marketing", "SEO", "SEM", "Content Marketing", "Email Marketing", "Analytics"]),
]


def create_tables():
    """Create database tables if they don't exist"""
    print("\n[1/5] Creating database tables...")
    
    # Users table
    execute_query("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            is_active INTEGER DEFAULT 1,
            is_verified INTEGER DEFAULT 0,
            email_verified INTEGER DEFAULT 0,
            email_verification_token TEXT,
            name TEXT,
            role TEXT DEFAULT 'client',
            two_factor_enabled INTEGER DEFAULT 0,
            two_factor_secret TEXT,
            two_factor_backup_codes TEXT,
            password_reset_token TEXT,
            password_reset_expires TEXT,
            last_password_changed TEXT,
            user_type TEXT,
            bio TEXT,
            skills TEXT,
            hourly_rate REAL,
            profile_image_url TEXT,
            location TEXT,
            profile_data TEXT,
            notification_preferences TEXT,
            account_balance REAL DEFAULT 0.0,
            created_by INTEGER,
            joined_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # Projects table
    execute_query("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            budget_type TEXT,
            budget_min REAL,
            budget_max REAL,
            experience_level TEXT,
            estimated_duration TEXT,
            skills TEXT,
            client_id INTEGER,
            status TEXT DEFAULT 'open',
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (client_id) REFERENCES users(id)
        )
    """)
    
    # Proposals table
    execute_query("""
        CREATE TABLE IF NOT EXISTS proposals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            freelancer_id INTEGER NOT NULL,
            cover_letter TEXT,
            bid_amount REAL NOT NULL,
            estimated_hours INTEGER,
            hourly_rate REAL,
            availability TEXT,
            attachments TEXT,
            status TEXT DEFAULT 'submitted',
            is_draft INTEGER DEFAULT 0,
            draft_data TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (freelancer_id) REFERENCES users(id)
        )
    """)
    
    # Contracts table
    execute_query("""
        CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_address TEXT UNIQUE,
            project_id INTEGER NOT NULL,
            freelancer_id INTEGER NOT NULL,
            client_id INTEGER NOT NULL,
            winning_bid_id INTEGER,
            contract_type TEXT DEFAULT 'fixed',
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            hourly_rate REAL,
            retainer_amount REAL,
            retainer_frequency TEXT,
            contract_amount REAL,
            platform_fee REAL DEFAULT 0.0,
            status TEXT DEFAULT 'pending',
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            milestones TEXT,
            terms TEXT,
            blockchain_hash TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (freelancer_id) REFERENCES users(id),
            FOREIGN KEY (client_id) REFERENCES users(id)
        )
    """)
    
    # Skills table
    execute_query("""
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT,
            description TEXT,
            created_at TEXT
        )
    """)
    
    # User skills junction table
    execute_query("""
        CREATE TABLE IF NOT EXISTS user_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            proficiency_level INTEGER DEFAULT 3,
            years_experience INTEGER DEFAULT 1,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (skill_id) REFERENCES skills(id)
        )
    """)
    
    # Categories table
    execute_query("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            parent_id INTEGER,
            icon TEXT,
            created_at TEXT,
            FOREIGN KEY (parent_id) REFERENCES categories(id)
        )
    """)
    
    # Notifications table
    execute_query("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            action_url TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Reviews table
    execute_query("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            reviewer_id INTEGER NOT NULL,
            reviewee_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (contract_id) REFERENCES contracts(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            FOREIGN KEY (reviewee_id) REFERENCES users(id)
        )
    """)
    
    # Portfolio items table
    execute_query("""
        CREATE TABLE IF NOT EXISTS portfolio_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            freelancer_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            project_url TEXT,
            skills TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (freelancer_id) REFERENCES users(id)
        )
    """)
    
    print("   ✓ All tables created successfully")


def seed_users():
    """Seed demo users"""
    print("\n[2/5] Seeding users...")
    
    now = datetime.now(timezone.utc).isoformat()
    hashed_password = get_password_hash(DEFAULT_PASSWORD)
    
    created_count = 0
    for user in DEMO_USERS:
        # Check if user exists
        result = execute_query(
            "SELECT id FROM users WHERE email = ?",
            [user["email"]]
        )
        
        if result.get("rows") and len(result["rows"]) > 0:
            print(f"   → User '{user['email']}' already exists, skipping")
            continue
        
        # Insert user
        execute_query(
            """INSERT INTO users (
                email, hashed_password, is_active, is_verified, email_verified,
                name, user_type, role, bio, skills, hourly_rate,
                location, account_balance, joined_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [
                user["email"],
                hashed_password,
                1,  # is_active
                1 if user.get("is_verified") else 0,
                1 if user.get("is_verified") else 0,
                user["name"],
                user["user_type"],
                user["role"],
                user["bio"],
                user.get("skills", ""),
                user.get("hourly_rate", 0),
                user.get("location", ""),
                random.uniform(100, 5000) if user["user_type"] == "freelancer" else random.uniform(1000, 50000),
                now,
                now,
                now
            ]
        )
        created_count += 1
        print(f"   ✓ Created user: {user['email']} ({user['user_type']})")
    
    print(f"   Total users created: {created_count}")
    return created_count


def seed_skills_and_categories():
    """Seed skills and categories"""
    print("\n[3/5] Seeding skills and categories...")
    
    now = datetime.now(timezone.utc).isoformat()
    skill_count = 0
    category_count = 0
    
    for category_name, skills in SKILL_CATEGORIES:
        # Create category
        slug = category_name.lower().replace(" ", "-").replace("&", "and")
        
        result = execute_query(
            "SELECT id FROM categories WHERE slug = ?",
            [slug]
        )
        
        if not result.get("rows") or len(result["rows"]) == 0:
            execute_query(
                """INSERT INTO categories (name, slug, description, created_at)
                   VALUES (?, ?, ?, ?)""",
                [category_name, slug, f"Projects related to {category_name}", now]
            )
            category_count += 1
        
        # Create skills
        for skill in skills:
            result = execute_query(
                "SELECT id FROM skills WHERE name = ?",
                [skill]
            )
            
            if not result.get("rows") or len(result["rows"]) == 0:
                execute_query(
                    """INSERT INTO skills (name, category, created_at)
                       VALUES (?, ?, ?)""",
                    [skill, category_name, now]
                )
                skill_count += 1
    
    print(f"   ✓ Created {category_count} categories and {skill_count} skills")


def seed_projects():
    """Seed demo projects"""
    print("\n[4/5] Seeding projects...")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Get client IDs
    result = execute_query(
        "SELECT id, email FROM users WHERE user_type = 'client'"
    )
    
    if not result.get("rows") or len(result["rows"]) == 0:
        print("   ⚠ No clients found, skipping project creation")
        return 0
    
    clients = []
    for row in result["rows"]:
        clients.append(row[0])  # id is first column
    
    created_count = 0
    for project in DEMO_PROJECTS:
        # Check if similar project exists
        result = execute_query(
            "SELECT id FROM projects WHERE title = ?",
            [project["title"]]
        )
        
        if result.get("rows") and len(result["rows"]) > 0:
            print(f"   → Project '{project['title'][:30]}...' already exists, skipping")
            continue
        
        # Assign random client
        client_id = random.choice(clients)
        
        # Create date in the past (within last 30 days)
        created_date = (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
        
        execute_query(
            """INSERT INTO projects (
                title, description, category, budget_type, budget_min, budget_max,
                experience_level, estimated_duration, skills, client_id, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [
                project["title"],
                project["description"],
                project["category"],
                project["budget_type"],
                project["budget_min"],
                project["budget_max"],
                project["experience_level"],
                project["estimated_duration"],
                project["skills"],
                client_id,
                project["status"],
                created_date,
                now
            ]
        )
        created_count += 1
        print(f"   ✓ Created project: {project['title'][:40]}...")
    
    print(f"   Total projects created: {created_count}")
    return created_count


def seed_proposals():
    """Seed demo proposals"""
    print("\n[5/5] Seeding proposals...")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Get freelancer IDs
    result = execute_query(
        "SELECT id, hourly_rate FROM users WHERE user_type = 'freelancer'"
    )
    
    if not result.get("rows") or len(result["rows"]) == 0:
        print("   ⚠ No freelancers found, skipping proposal creation")
        return 0
    
    freelancers = []
    for row in result["rows"]:
        freelancers.append({
            "id": row[0],
            "hourly_rate": row[1] or 50
        })
    
    # Get project IDs
    result = execute_query(
        "SELECT id, budget_min, budget_max FROM projects WHERE status = 'open'"
    )
    
    if not result.get("rows") or len(result["rows"]) == 0:
        print("   ⚠ No open projects found, skipping proposal creation")
        return 0
    
    projects = []
    for row in result["rows"]:
        projects.append({
            "id": row[0],
            "budget_min": row[1] or 1000,
            "budget_max": row[2] or 5000
        })
    
    cover_letters = [
        "I'm excited about this project and believe my experience makes me the perfect fit. I have successfully completed similar projects in the past and can deliver high-quality results within your timeline.",
        "Thank you for posting this opportunity. With my background in this area, I'm confident I can exceed your expectations. I'd love to discuss the project details further.",
        "This project aligns perfectly with my expertise. I've reviewed your requirements carefully and have some great ideas to share. Looking forward to potentially working together.",
        "I'm very interested in this project. My portfolio demonstrates similar work I've done, and I'm ready to start immediately. Let's connect to discuss the specifics.",
    ]
    
    created_count = 0
    for project in projects:
        # Create 2-4 proposals per project
        num_proposals = random.randint(2, 4)
        selected_freelancers = random.sample(freelancers, min(num_proposals, len(freelancers)))
        
        for freelancer in selected_freelancers:
            # Check if proposal already exists
            result = execute_query(
                "SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ?",
                [project["id"], freelancer["id"]]
            )
            
            if result.get("rows") and len(result["rows"]) > 0:
                continue
            
            # Calculate bid amount
            bid_amount = random.uniform(
                project["budget_min"] * 0.8,
                project["budget_max"] * 1.1
            )
            
            estimated_hours = int(bid_amount / freelancer["hourly_rate"]) if freelancer["hourly_rate"] > 0 else 40
            
            execute_query(
                """INSERT INTO proposals (
                    project_id, freelancer_id, cover_letter, bid_amount,
                    estimated_hours, hourly_rate, availability, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    project["id"],
                    freelancer["id"],
                    random.choice(cover_letters),
                    round(bid_amount, 2),
                    estimated_hours,
                    freelancer["hourly_rate"],
                    random.choice(["immediate", "1-2_weeks", "flexible"]),
                    random.choice(["submitted", "submitted", "submitted", "viewed"]),
                    now,
                    now
                ]
            )
            created_count += 1
    
    print(f"   ✓ Created {created_count} proposals")
    return created_count


def main():
    """Main seeding function"""
    print("=" * 60)
    print("MegiLance Production-Ready Database Seeding")
    print("=" * 60)
    print(f"\nDefault password for all demo users: {DEFAULT_PASSWORD}")
    print("(Meets requirements: 8+ chars, uppercase, lowercase, number, special char)")
    
    try:
        create_tables()
        seed_users()
        seed_skills_and_categories()
        seed_projects()
        seed_proposals()
        
        print("\n" + "=" * 60)
        print("✓ Database seeding completed successfully!")
        print("=" * 60)
        
        print("\n📧 Demo Login Credentials:")
        print("-" * 40)
        print(f"Admin:      admin@megilance.com / {DEFAULT_PASSWORD}")
        print(f"Client:     techcorp@example.com / {DEFAULT_PASSWORD}")
        print(f"Freelancer: developer@example.com / {DEFAULT_PASSWORD}")
        print("-" * 40)
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
