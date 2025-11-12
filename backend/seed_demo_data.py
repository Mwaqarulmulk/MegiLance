#!/usr/bin/env python3
"""
Seed demo data for professor presentation
"""
import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Add app to path for password hashing
sys.path.insert(0, '/app')
from app.core.security import get_password_hash

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not set!")
    sys.exit(1)

print("\n🌱 Seeding Demo Data")
print("=" * 60)

engine = create_engine(DATABASE_URL)

# Demo passwords (all same for easy demo: "Demo123!")
demo_password = get_password_hash("Demo123!")

# 1. Create demo users
users = [
    {
        'email': 'admin@megilance.com',
        'name': 'System Admin',
        'user_type': 'admin',
        'bio': 'Platform administrator',
        'skills': 'Platform Management,System Administration',
        'hourly_rate': 0,
        'account_balance': 0,
    },
    {
        'email': 'client1@megilance.com',
        'name': 'John Smith',
        'user_type': 'client',
        'bio': 'Tech startup CEO looking for talented developers',
        'skills': None,
        'hourly_rate': None,
        'account_balance': 5000,
    },
    {
        'email': 'client2@megilance.com',
        'name': 'Sarah Johnson',
        'user_type': 'client',
        'bio': 'Small business owner needing website development',
        'skills': None,
        'hourly_rate': None,
        'account_balance': 3000,
    },
    {
        'email': 'freelancer1@megilance.com',
        'name': 'Alex Chen',
        'user_type': 'freelancer',
        'bio': 'Full-stack developer with 5 years experience in React, Node.js, and Oracle databases',
        'skills': 'React,Node.js,TypeScript,Oracle,Python,Docker',
        'hourly_rate': 75,
        'account_balance': 2500,
    },
    {
        'email': 'freelancer2@megilance.com',
        'name': 'Maria Garcia',
        'user_type': 'freelancer',
        'bio': 'UI/UX Designer and Frontend Developer specializing in modern web applications',
        'skills': 'UI/UX Design,React,Next.js,Figma,Tailwind CSS',
        'hourly_rate': 60,
        'account_balance': 1800,
    },
    {
        'email': 'freelancer3@megilance.com',
        'name': 'David Kumar',
        'user_type': 'freelancer',
        'bio': 'Python backend developer with expertise in FastAPI and database optimization',
        'skills': 'Python,FastAPI,PostgreSQL,Oracle,Redis,Docker',
        'hourly_rate': 65,
        'account_balance': 3200,
    },
]

print("\n👥 Creating users...")
with engine.connect() as conn:
    for user in users:
        sql = text("""
            INSERT INTO users (email, hashed_password, name, user_type, bio, skills, 
                             hourly_rate, account_balance, is_active, is_verified)
            VALUES (:email, :password, :name, :user_type, :bio, :skills, 
                    :hourly_rate, :account_balance, 1, 1)
        """)
        try:
            conn.execute(sql, {
                'email': user['email'],
                'password': demo_password,
                'name': user['name'],
                'user_type': user['user_type'],
                'bio': user['bio'],
                'skills': user['skills'],
                'hourly_rate': user['hourly_rate'],
                'account_balance': user['account_balance'],
            })
            conn.commit()
            print(f"  ✅ {user['name']} ({user['user_type']})")
        except Exception as e:
            print(f"  ⚠️  {user['email']}: {e}")

# 2. Create skills
skills = [
    {'name': 'Python', 'category': 'Programming', 'sort_order': 1},
    {'name': 'JavaScript', 'category': 'Programming', 'sort_order': 2},
    {'name': 'React', 'category': 'Frontend', 'sort_order': 3},
    {'name': 'Node.js', 'category': 'Backend', 'sort_order': 4},
    {'name': 'Oracle Database', 'category': 'Database', 'sort_order': 5},
    {'name': 'Docker', 'category': 'DevOps', 'sort_order': 6},
    {'name': 'UI/UX Design', 'category': 'Design', 'sort_order': 7},
    {'name': 'TypeScript', 'category': 'Programming', 'sort_order': 8},
]

print("\n🏷️  Creating skills...")
with engine.connect() as conn:
    for skill in skills:
        sql = text("""
            INSERT INTO skills (name, category, sort_order, is_active)
            VALUES (:name, :category, :sort_order, 1)
        """)
        try:
            conn.execute(sql, skill)
            conn.commit()
            print(f"  ✅ {skill['name']}")
        except Exception as e:
            pass  # Skill might already exist

# 3. Create demo projects
print("\n📋 Creating projects...")
with engine.connect() as conn:
    # Get client IDs
    client1_id = conn.execute(text("SELECT id FROM users WHERE email = 'client1@megilance.com'")).scalar()
    client2_id = conn.execute(text("SELECT id FROM users WHERE email = 'client2@megilance.com'")).scalar()
    
    projects = [
        {
            'title': 'E-commerce Platform Development',
            'description': 'Need a full-stack developer to build a modern e-commerce platform using React and Node.js with Oracle database backend. Must have experience with payment integration and responsive design.',
            'category': 'Web Development',
            'budget_min': 5000,
            'budget_max': 8000,
            'budget_type': 'fixed',
            'experience_level': 'expert',
            'estimated_duration': '3 months',
            'skills': 'React,Node.js,Oracle Database,Docker',
            'client_id': client1_id,
            'status': 'open',
        },
        {
            'title': 'UI/UX Redesign for SaaS Product',
            'description': 'Looking for a talented UI/UX designer to redesign our SaaS dashboard. Need modern, clean interface with focus on user experience. Figma experience required.',
            'category': 'Design',
            'budget_min': 2000,
            'budget_max': 3500,
            'budget_type': 'fixed',
            'experience_level': 'intermediate',
            'estimated_duration': '1 month',
            'skills': 'UI/UX Design,Figma,React',
            'client_id': client1_id,
            'status': 'open',
        },
        {
            'title': 'Business Website Development',
            'description': 'Small business needs a professional website with contact forms, service pages, and blog. Simple, clean design required.',
            'category': 'Web Development',
            'budget_min': 1500,
            'budget_max': 2500,
            'budget_type': 'fixed',
            'experience_level': 'entry',
            'estimated_duration': '2 weeks',
            'skills': 'React,Next.js,UI/UX Design',
            'client_id': client2_id,
            'status': 'open',
        },
    ]
    
    project_ids = []
    for project in projects:
        sql = text("""
            INSERT INTO projects (title, description, category, budget_min, budget_max,
                                budget_type, experience_level, estimated_duration, skills,
                                client_id, status)
            VALUES (:title, :description, :category, :budget_min, :budget_max,
                    :budget_type, :experience_level, :estimated_duration, :skills,
                    :client_id, :status)
        """)
        try:
            result = conn.execute(sql, project)
            conn.commit()
            # Get the inserted ID
            project_id = conn.execute(text("SELECT MAX(id) FROM projects")).scalar()
            project_ids.append(project_id)
            print(f"  ✅ {project['title']}")
        except Exception as e:
            print(f"  ⚠️  {project['title']}: {e}")

# 4. Create proposals
print("\n💼 Creating proposals...")
with engine.connect() as conn:
    freelancer1_id = conn.execute(text("SELECT id FROM users WHERE email = 'freelancer1@megilance.com'")).scalar()
    freelancer2_id = conn.execute(text("SELECT id FROM users WHERE email = 'freelancer2@megilance.com'")).scalar()
    freelancer3_id = conn.execute(text("SELECT id FROM users WHERE email = 'freelancer3@megilance.com'")).scalar()
    
    proposals = [
        {
            'project_id': project_ids[0] if len(project_ids) > 0 else 1,
            'freelancer_id': freelancer1_id,
            'cover_letter': 'I have extensive experience building e-commerce platforms with React, Node.js, and Oracle databases. I can deliver this project within the timeline with high quality code.',
            'estimated_hours': 200,
            'hourly_rate': 75,
            'availability': 'immediate',
            'status': 'submitted',
        },
        {
            'project_id': project_ids[1] if len(project_ids) > 1 else 2,
            'freelancer_id': freelancer2_id,
            'cover_letter': 'I specialize in UI/UX design for SaaS products. I will create modern, intuitive designs in Figma and can implement them in React as well.',
            'estimated_hours': 80,
            'hourly_rate': 60,
            'availability': '1-2 weeks',
            'status': 'submitted',
        },
        {
            'project_id': project_ids[2] if len(project_ids) > 2 else 3,
            'freelancer_id': freelancer2_id,
            'cover_letter': 'Perfect fit for your business website! I can create a clean, professional site using Next.js with all the features you need.',
            'estimated_hours': 40,
            'hourly_rate': 60,
            'availability': 'immediate',
            'status': 'submitted',
        },
    ]
    
    for proposal in proposals:
        sql = text("""
            INSERT INTO proposals (project_id, freelancer_id, cover_letter, estimated_hours,
                                 hourly_rate, availability, status)
            VALUES (:project_id, :freelancer_id, :cover_letter, :estimated_hours,
                    :hourly_rate, :availability, :status)
        """)
        try:
            conn.execute(sql, proposal)
            conn.commit()
            print(f"  ✅ Proposal for project {proposal['project_id']}")
        except Exception as e:
            print(f"  ⚠️  Proposal: {e}")

# Summary
print("\n" + "=" * 60)
print("✅ Demo data seeded successfully!")
print("\n📊 Summary:")
with engine.connect() as conn:
    user_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    skill_count = conn.execute(text("SELECT COUNT(*) FROM skills")).scalar()
    project_count = conn.execute(text("SELECT COUNT(*) FROM projects")).scalar()
    proposal_count = conn.execute(text("SELECT COUNT(*) FROM proposals")).scalar()
    
    print(f"  👥 Users: {user_count}")
    print(f"  🏷️  Skills: {skill_count}")
    print(f"  📋 Projects: {project_count}")
    print(f"  💼 Proposals: {proposal_count}")

print("\n🔐 Demo Login Credentials:")
print("  All passwords: Demo123!")
print("\n  Admin:       admin@megilance.com")
print("  Client 1:    client1@megilance.com (John Smith)")
print("  Client 2:    client2@megilance.com (Sarah Johnson)")
print("  Freelancer 1: freelancer1@megilance.com (Alex Chen)")
print("  Freelancer 2: freelancer2@megilance.com (Maria Garcia)")
print("  Freelancer 3: freelancer3@megilance.com (David Kumar)")

print("\n🌐 URLs:")
print("  Frontend:  http://localhost:3000")
print("  Backend:   http://localhost:8000/api/docs")
print("  Health:    http://localhost:8000/api/health/live")

print("\n=" * 60 + "\n")
