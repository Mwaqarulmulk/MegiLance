# @AI-HINT: Production-ready database seeding script for MegiLance
"""
Comprehensive Database Seeding Script for MegiLance
Creates all necessary demo data for testing and demonstration:
- Admin, Client, and Freelancer users
- Skills and Categories
- Projects with various statuses
- Proposals
- Contracts
- Portfolio items
- Reviews
- Messages
"""

import sys
import os
from datetime import datetime, timezone, timedelta
import json
import random
import hashlib
import secrets

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.turso_http import get_turso_http
from app.core.security import get_password_hash


def generate_uuid():
    """Generate a simple unique ID"""
    return secrets.token_hex(8)


def seed_database():
    """Main seeding function"""
    print("=" * 60)
    print("MegiLance Production Database Seeder")
    print("=" * 60)
    
    try:
        turso = get_turso_http()
        print("[OK] Connected to Turso database")
    except Exception as e:
        print(f"[ERROR] Failed to connect to Turso: {e}")
        return False
    
    # Default password for all demo users (meets all requirements)
    DEFAULT_PASSWORD = "Demo123!@#"
    hashed_password = get_password_hash(DEFAULT_PASSWORD)
    now = datetime.now(timezone.utc).isoformat()
    
    print(f"\n[INFO] Default password for all demo users: {DEFAULT_PASSWORD}")
    
    # ========================================
    # 1. CREATE CATEGORIES
    # ========================================
    print("\n[1/8] Creating categories...")
    categories = [
        ("Web Development", "Building websites and web applications"),
        ("Mobile Apps", "iOS and Android application development"),
        ("UI/UX Design", "User interface and experience design"),
        ("Data Science", "Data analysis, visualization, and insights"),
        ("AI/ML", "Artificial intelligence and machine learning"),
        ("DevOps", "Infrastructure, deployment, and operations"),
        ("Content Writing", "Blog posts, articles, and copywriting"),
        ("Video Production", "Video editing, animation, and production"),
        ("Digital Marketing", "SEO, social media, and online marketing"),
        ("Graphic Design", "Logos, branding, and visual design"),
    ]
    
    for cat_name, cat_desc in categories:
        try:
            turso.execute(
                "INSERT OR IGNORE INTO categories (name, description, created_at) VALUES (?, ?, ?)",
                [cat_name, cat_desc, now]
            )
        except Exception as e:
            print(f"   [WARN] Category '{cat_name}': {e}")
    print(f"   [OK] Created {len(categories)} categories")
    
    # ========================================
    # 2. CREATE SKILLS
    # ========================================
    print("\n[2/8] Creating skills...")
    skills = [
        # Web Development
        ("JavaScript", "Web Development", "expert"),
        ("TypeScript", "Web Development", "expert"),
        ("React", "Web Development", "expert"),
        ("Next.js", "Web Development", "advanced"),
        ("Vue.js", "Web Development", "advanced"),
        ("Node.js", "Web Development", "expert"),
        ("Python", "Web Development", "expert"),
        ("Django", "Web Development", "advanced"),
        ("FastAPI", "Web Development", "advanced"),
        ("PHP", "Web Development", "intermediate"),
        ("Laravel", "Web Development", "intermediate"),
        # Mobile
        ("React Native", "Mobile Apps", "advanced"),
        ("Flutter", "Mobile Apps", "advanced"),
        ("Swift", "Mobile Apps", "expert"),
        ("Kotlin", "Mobile Apps", "expert"),
        # Design
        ("Figma", "UI/UX Design", "expert"),
        ("Adobe XD", "UI/UX Design", "advanced"),
        ("Sketch", "UI/UX Design", "advanced"),
        ("Photoshop", "Graphic Design", "expert"),
        ("Illustrator", "Graphic Design", "expert"),
        # Data/AI
        ("Python (Data)", "Data Science", "expert"),
        ("TensorFlow", "AI/ML", "advanced"),
        ("PyTorch", "AI/ML", "advanced"),
        ("SQL", "Data Science", "expert"),
        ("Tableau", "Data Science", "advanced"),
        # DevOps
        ("Docker", "DevOps", "expert"),
        ("Kubernetes", "DevOps", "advanced"),
        ("AWS", "DevOps", "expert"),
        ("Azure", "DevOps", "advanced"),
        ("CI/CD", "DevOps", "advanced"),
    ]
    
    for skill_name, category, level in skills:
        try:
            turso.execute(
                "INSERT OR IGNORE INTO skills (name, category, level, created_at) VALUES (?, ?, ?, ?)",
                [skill_name, category, level, now]
            )
        except Exception as e:
            print(f"   [WARN] Skill '{skill_name}': {e}")
    print(f"   [OK] Created {len(skills)} skills")
    
    # ========================================
    # 3. CREATE USERS
    # ========================================
    print("\n[3/8] Creating users...")
    
    users = [
        # Admin users
        {
            "email": "admin@megilance.com",
            "name": "System Administrator",
            "user_type": "admin",
            "role": "admin",
            "bio": "Platform administrator with full access to all features.",
            "is_verified": 1,
        },
        # Client users
        {
            "email": "client@megilance.com",
            "name": "Tech Innovations Inc.",
            "user_type": "client",
            "role": "client",
            "bio": "Leading technology company looking for talented freelancers to build innovative solutions.",
            "location": "San Francisco, CA",
            "is_verified": 1,
        },
        {
            "email": "john.client@example.com",
            "name": "John Smith",
            "user_type": "client",
            "role": "client",
            "bio": "Startup founder seeking skilled developers for various projects.",
            "location": "New York, NY",
            "is_verified": 1,
        },
        {
            "email": "sarah.client@example.com",
            "name": "Sarah Johnson",
            "user_type": "client",
            "role": "client",
            "bio": "Marketing agency owner looking for creative talent.",
            "location": "Los Angeles, CA",
            "is_verified": 1,
        },
        # Freelancer users
        {
            "email": "freelancer@megilance.com",
            "name": "Alex Developer",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Full-stack developer with 8+ years of experience in React, Node.js, and Python. Passionate about building scalable web applications.",
            "skills": "JavaScript,TypeScript,React,Node.js,Python,PostgreSQL",
            "hourly_rate": 75.0,
            "location": "Austin, TX",
            "is_verified": 1,
        },
        {
            "email": "maria.designer@example.com",
            "name": "Maria Garcia",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Senior UI/UX designer specializing in creating beautiful and intuitive user experiences. Expert in Figma and design systems.",
            "skills": "Figma,Adobe XD,UI/UX Design,Prototyping,Design Systems",
            "hourly_rate": 85.0,
            "location": "Miami, FL",
            "is_verified": 1,
        },
        {
            "email": "david.mobile@example.com",
            "name": "David Chen",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Mobile app developer expert in React Native and Flutter. Built 50+ apps with millions of downloads.",
            "skills": "React Native,Flutter,Swift,Kotlin,Firebase",
            "hourly_rate": 90.0,
            "location": "Seattle, WA",
            "is_verified": 1,
        },
        {
            "email": "emma.data@example.com",
            "name": "Emma Wilson",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Data scientist with expertise in machine learning and AI. PhD in Computer Science from MIT.",
            "skills": "Python,TensorFlow,PyTorch,SQL,Data Analysis,Machine Learning",
            "hourly_rate": 120.0,
            "location": "Boston, MA",
            "is_verified": 1,
        },
        {
            "email": "james.writer@example.com",
            "name": "James Thompson",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Professional content writer and copywriter with 10+ years of experience in tech industry.",
            "skills": "Content Writing,Copywriting,SEO,Technical Writing,Blog Posts",
            "hourly_rate": 50.0,
            "location": "Chicago, IL",
            "is_verified": 1,
        },
    ]
    
    user_ids = {}
    for user in users:
        try:
            # Check if user exists
            result = turso.execute("SELECT id FROM users WHERE email = ?", [user["email"]])
            if result.get("rows") and len(result["rows"]) > 0:
                user_ids[user["email"]] = result["rows"][0][0]
                print(f"   [SKIP] User {user['email']} already exists")
                continue
            
            turso.execute(
                """INSERT INTO users (
                    email, hashed_password, is_active, is_verified, email_verified,
                    name, user_type, role, bio, skills, hourly_rate,
                    location, two_factor_enabled, account_balance,
                    joined_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    user["email"],
                    hashed_password,
                    1,  # is_active
                    user.get("is_verified", 0),
                    user.get("is_verified", 0),  # email_verified
                    user["name"],
                    user["user_type"],
                    user["role"],
                    user.get("bio", ""),
                    user.get("skills", ""),
                    user.get("hourly_rate", 0),
                    user.get("location", ""),
                    0,  # two_factor_enabled
                    0.0,  # account_balance
                    now,
                    now,
                    now,
                ]
            )
            
            # Get the user ID
            result = turso.execute("SELECT id FROM users WHERE email = ?", [user["email"]])
            if result.get("rows"):
                user_ids[user["email"]] = result["rows"][0][0]
            
            print(f"   [OK] Created user: {user['email']} ({user['user_type']})")
        except Exception as e:
            print(f"   [ERROR] User {user['email']}: {e}")
    
    # ========================================
    # 4. CREATE PROJECTS
    # ========================================
    print("\n[4/8] Creating projects...")
    
    # Get client IDs
    client_id_1 = user_ids.get("client@megilance.com", 1)
    client_id_2 = user_ids.get("john.client@example.com", 2)
    client_id_3 = user_ids.get("sarah.client@example.com", 3)
    
    projects = [
        {
            "title": "E-commerce Platform Development",
            "description": "We need a full-featured e-commerce platform with React frontend, Node.js backend, and PostgreSQL database. Features include user authentication, product catalog, shopping cart, payment integration (Stripe), order management, and admin dashboard.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 5000,
            "budget_max": 15000,
            "experience_level": "expert",
            "estimated_duration": "1-3 months",
            "skills": "React,Node.js,PostgreSQL,Stripe,Redux",
            "client_id": client_id_1,
            "status": "open",
        },
        {
            "title": "Mobile App UI/UX Redesign",
            "description": "Looking for an experienced UI/UX designer to completely redesign our mobile banking app. Need modern, intuitive interface with focus on accessibility and user experience. Deliverables include wireframes, prototypes, and design system.",
            "category": "UI/UX Design",
            "budget_type": "fixed",
            "budget_min": 3000,
            "budget_max": 8000,
            "experience_level": "intermediate",
            "estimated_duration": "2-4 weeks",
            "skills": "Figma,UI/UX Design,Prototyping,Mobile Design",
            "client_id": client_id_2,
            "status": "open",
        },
        {
            "title": "AI Chatbot Development",
            "description": "Build an intelligent customer support chatbot using OpenAI GPT-4 API. Should handle common queries, escalate complex issues, and integrate with our existing CRM. Need experience with NLP and conversational AI.",
            "category": "AI/ML",
            "budget_type": "hourly",
            "budget_min": 80,
            "budget_max": 150,
            "experience_level": "expert",
            "estimated_duration": "1-2 months",
            "skills": "Python,OpenAI,NLP,FastAPI,Machine Learning",
            "client_id": client_id_1,
            "status": "open",
        },
        {
            "title": "React Native Cross-Platform App",
            "description": "Develop a fitness tracking app for iOS and Android using React Native. Features include workout logging, progress tracking, social features, and integration with health APIs (Apple Health, Google Fit).",
            "category": "Mobile Apps",
            "budget_type": "fixed",
            "budget_min": 8000,
            "budget_max": 20000,
            "experience_level": "expert",
            "estimated_duration": "2-3 months",
            "skills": "React Native,TypeScript,Firebase,REST API",
            "client_id": client_id_3,
            "status": "open",
        },
        {
            "title": "Data Analytics Dashboard",
            "description": "Create an interactive analytics dashboard to visualize sales data, customer metrics, and business KPIs. Should support real-time updates, custom date ranges, and export functionality.",
            "category": "Data Science",
            "budget_type": "fixed",
            "budget_min": 4000,
            "budget_max": 10000,
            "experience_level": "intermediate",
            "estimated_duration": "3-4 weeks",
            "skills": "Python,React,D3.js,SQL,Data Visualization",
            "client_id": client_id_2,
            "status": "open",
        },
        {
            "title": "WordPress Website Development",
            "description": "Build a professional portfolio website for a photography studio. Need custom theme, gallery functionality, booking system, and SEO optimization.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 1500,
            "budget_max": 3500,
            "experience_level": "entry",
            "estimated_duration": "1-2 weeks",
            "skills": "WordPress,PHP,CSS,SEO",
            "client_id": client_id_3,
            "status": "open",
        },
        {
            "title": "DevOps Pipeline Setup",
            "description": "Set up CI/CD pipeline using GitHub Actions, Docker, and AWS. Need automated testing, staging environment, and production deployment with zero-downtime releases.",
            "category": "DevOps",
            "budget_type": "hourly",
            "budget_min": 70,
            "budget_max": 120,
            "experience_level": "expert",
            "estimated_duration": "1-2 weeks",
            "skills": "Docker,AWS,GitHub Actions,Kubernetes,Terraform",
            "client_id": client_id_1,
            "status": "in_progress",
        },
        {
            "title": "Content Writing for Tech Blog",
            "description": "Need 20 high-quality blog posts about web development, cloud computing, and software engineering best practices. Each post should be 1500-2000 words with SEO optimization.",
            "category": "Content Writing",
            "budget_type": "fixed",
            "budget_min": 2000,
            "budget_max": 4000,
            "experience_level": "intermediate",
            "estimated_duration": "1-2 months",
            "skills": "Content Writing,SEO,Technical Writing",
            "client_id": client_id_2,
            "status": "in_progress",
        },
    ]
    
    project_ids = {}
    for i, project in enumerate(projects):
        try:
            turso.execute(
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
                    project["client_id"],
                    project["status"],
                    (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                    now,
                ]
            )
            project_ids[project["title"]] = i + 1
            print(f"   [OK] Created project: {project['title'][:40]}...")
        except Exception as e:
            print(f"   [ERROR] Project '{project['title'][:30]}': {e}")
    
    # ========================================
    # 5. CREATE PROPOSALS
    # ========================================
    print("\n[5/8] Creating proposals...")
    
    freelancer_id_1 = user_ids.get("freelancer@megilance.com", 5)
    freelancer_id_2 = user_ids.get("maria.designer@example.com", 6)
    freelancer_id_3 = user_ids.get("david.mobile@example.com", 7)
    
    proposals = [
        {
            "project_id": 1,  # E-commerce
            "freelancer_id": freelancer_id_1,
            "cover_letter": "I'm very excited about this e-commerce project. With 8+ years of experience in React and Node.js, I've built similar platforms that handle thousands of transactions daily. I can deliver a scalable, secure solution within your timeline.",
            "bid_amount": 12000,
            "estimated_duration": "2 months",
            "status": "pending",
        },
        {
            "project_id": 2,  # UI/UX
            "freelancer_id": freelancer_id_2,
            "cover_letter": "As a senior UI/UX designer with extensive experience in fintech apps, I understand the unique challenges of banking interfaces. I'll create an intuitive, accessible design that your users will love.",
            "bid_amount": 6000,
            "estimated_duration": "3 weeks",
            "status": "pending",
        },
        {
            "project_id": 4,  # React Native
            "freelancer_id": freelancer_id_3,
            "cover_letter": "I've built 50+ mobile apps with millions of downloads. This fitness app project is right up my alley. I can implement all features including health API integrations within your budget.",
            "bid_amount": 15000,
            "estimated_duration": "2.5 months",
            "status": "accepted",
        },
    ]
    
    for proposal in proposals:
        try:
            turso.execute(
                """INSERT INTO proposals (
                    project_id, freelancer_id, cover_letter, bid_amount,
                    estimated_duration, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    proposal["project_id"],
                    proposal["freelancer_id"],
                    proposal["cover_letter"],
                    proposal["bid_amount"],
                    proposal["estimated_duration"],
                    proposal["status"],
                    (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 14))).isoformat(),
                    now,
                ]
            )
            print(f"   [OK] Created proposal for project {proposal['project_id']}")
        except Exception as e:
            print(f"   [ERROR] Proposal: {e}")
    
    # ========================================
    # 6. CREATE CONTRACTS
    # ========================================
    print("\n[6/8] Creating contracts...")
    
    contracts = [
        {
            "project_id": 4,  # React Native project
            "client_id": client_id_3,
            "freelancer_id": freelancer_id_3,
            "title": "Fitness App Development Contract",
            "description": "Development of cross-platform fitness tracking mobile application",
            "amount": 15000,
            "status": "active",
            "start_date": (datetime.now(timezone.utc) - timedelta(days=14)).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
        },
        {
            "project_id": 7,  # DevOps
            "client_id": client_id_1,
            "freelancer_id": freelancer_id_1,
            "title": "DevOps Pipeline Setup Contract",
            "description": "Setup of CI/CD pipeline with Docker and AWS",
            "amount": 2500,
            "status": "active",
            "start_date": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        },
    ]
    
    for contract in contracts:
        try:
            turso.execute(
                """INSERT INTO contracts (
                    project_id, client_id, freelancer_id, title, description,
                    amount, status, start_date, end_date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    contract["project_id"],
                    contract["client_id"],
                    contract["freelancer_id"],
                    contract["title"],
                    contract["description"],
                    contract["amount"],
                    contract["status"],
                    contract["start_date"],
                    contract["end_date"],
                    now,
                    now,
                ]
            )
            print(f"   [OK] Created contract: {contract['title']}")
        except Exception as e:
            print(f"   [ERROR] Contract: {e}")
    
    # ========================================
    # 7. CREATE PORTFOLIO ITEMS
    # ========================================
    print("\n[7/8] Creating portfolio items...")
    
    portfolios = [
        {
            "freelancer_id": freelancer_id_1,
            "title": "E-commerce Platform for Fashion Brand",
            "description": "Built a complete e-commerce solution handling 10,000+ daily transactions with React, Node.js, and PostgreSQL.",
            "image_url": "/portfolio/ecommerce-fashion.jpg",
            "project_url": "https://example-fashion.com",
            "technologies": "React,Node.js,PostgreSQL,Stripe,AWS",
        },
        {
            "freelancer_id": freelancer_id_1,
            "title": "Real-time Analytics Dashboard",
            "description": "Developed a real-time analytics dashboard for a SaaS company, processing millions of events daily.",
            "image_url": "/portfolio/analytics-dashboard.jpg",
            "project_url": "https://example-analytics.com",
            "technologies": "React,D3.js,Node.js,Redis,WebSocket",
        },
        {
            "freelancer_id": freelancer_id_2,
            "title": "Banking App Redesign",
            "description": "Complete UI/UX redesign of a major bank's mobile app, increasing user engagement by 40%.",
            "image_url": "/portfolio/banking-app.jpg",
            "project_url": "https://dribbble.com/example",
            "technologies": "Figma,Principle,Design Systems",
        },
        {
            "freelancer_id": freelancer_id_3,
            "title": "Fitness Tracking App",
            "description": "Built a cross-platform fitness app with 500K+ downloads, featuring workout tracking and social features.",
            "image_url": "/portfolio/fitness-app.jpg",
            "project_url": "https://apps.apple.com/example",
            "technologies": "React Native,Firebase,HealthKit",
        },
    ]
    
    for portfolio in portfolios:
        try:
            turso.execute(
                """INSERT INTO portfolio_items (
                    freelancer_id, title, description, image_url, project_url,
                    technologies, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    portfolio["freelancer_id"],
                    portfolio["title"],
                    portfolio["description"],
                    portfolio["image_url"],
                    portfolio["project_url"],
                    portfolio["technologies"],
                    now,
                    now,
                ]
            )
            print(f"   [OK] Created portfolio: {portfolio['title']}")
        except Exception as e:
            print(f"   [ERROR] Portfolio: {e}")
    
    # ========================================
    # 8. CREATE REVIEWS
    # ========================================
    print("\n[8/8] Creating reviews...")
    
    reviews = [
        {
            "reviewer_id": client_id_3,
            "reviewee_id": freelancer_id_3,
            "project_id": 4,
            "rating": 5,
            "comment": "David is an exceptional developer! Delivered the app ahead of schedule with excellent code quality. Highly recommend!",
        },
        {
            "reviewer_id": freelancer_id_3,
            "reviewee_id": client_id_3,
            "project_id": 4,
            "rating": 5,
            "comment": "Sarah was a pleasure to work with. Clear requirements, quick feedback, and fair payment. Would love to work together again!",
        },
        {
            "reviewer_id": client_id_1,
            "reviewee_id": freelancer_id_1,
            "project_id": 7,
            "rating": 4,
            "comment": "Alex did a great job setting up our DevOps pipeline. Very knowledgeable and professional.",
        },
    ]
    
    for review in reviews:
        try:
            turso.execute(
                """INSERT INTO reviews (
                    reviewer_id, reviewee_id, project_id, rating, comment,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
                [
                    review["reviewer_id"],
                    review["reviewee_id"],
                    review["project_id"],
                    review["rating"],
                    review["comment"],
                    now,
                    now,
                ]
            )
            print(f"   [OK] Created review (rating: {review['rating']})")
        except Exception as e:
            print(f"   [ERROR] Review: {e}")
    
    # ========================================
    # SUMMARY
    # ========================================
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE!")
    print("=" * 60)
    print("\nDemo Accounts Created:")
    print("-" * 40)
    print(f"  Admin:      admin@megilance.com")
    print(f"  Client:     client@megilance.com")
    print(f"  Freelancer: freelancer@megilance.com")
    print(f"\n  Password:   {DEFAULT_PASSWORD}")
    print("-" * 40)
    print("\nYou can now log in with these accounts to test the platform!")
    
    return True


if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)
