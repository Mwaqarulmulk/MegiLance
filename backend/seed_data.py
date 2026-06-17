import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import uuid
from datetime import datetime, timedelta
import random
from passlib.context import CryptContext
from app.db.turso_http import execute_query

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_users():
    print("Seeding users (clients and freelancers)...")
    roles = ['admin', 'client', 'freelancer', 'client', 'freelancer', 'freelancer', 'freelancer', 'client']
    users = []
    
    for i in range(15):
        user_id = str(uuid.uuid4())
        role = random.choice(roles)
        if i == 0: role = 'admin'
        
        pw_hash = pwd_context.hash("Password123!")
        
        query = """
            INSERT INTO users (id, email, password_hash, role, user_type, is_active, is_verified, created_at, full_name)
            VALUES (?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, ?)
        """
        execute_query(query, [
            user_id,
            f"{role}{i}@example.com",
            pw_hash,
            role,
            role,
            f"Test {role.capitalize()} {i}"
        ])
        users.append({"id": user_id, "role": role})

    return users

def seed_profiles(users):
    print("Seeding profiles...")
    for user in users:
        if user['role'] == 'freelancer':
            query = """
                INSERT INTO profiles (id, user_id, bio, title, hourly_rate, availability, total_earnings, jobs_completed, created_at)
                VALUES (?, ?, ?, ?, ?, 'Available', 0, 0, CURRENT_TIMESTAMP)
            """
            execute_query(query, [
                str(uuid.uuid4()),
                user['id'],
                "I am a passionate software engineer with extensive experience in React and Node.js.",
                "Senior Full Stack Developer",
                random.randint(20, 100)
            ])

def seed_projects(users):
    print("Seeding projects...")
    clients = [u for u in users if u['role'] == 'client']
    if not clients: return []
    
    projects = []
    titles = [
        "Build a modern SaaS Dashboard",
        "React Native Mobile App for Delivery",
        "FastAPI Backend for AI Startup",
        "SEO Optimization for E-commerce Site",
        "UI/UX Design for Fintech App"
    ]
    
    for i in range(10):
        project_id = str(uuid.uuid4())
        client = random.choice(clients)
        
        query = """
            INSERT INTO projects (id, title, description, budget_min, budget_max, project_type, status, client_id, expected_duration, created_at)
            VALUES (?, ?, ?, ?, ?, 'fixed', 'open', ?, '1-3 months', CURRENT_TIMESTAMP)
        """
        b_min = random.choice([500, 1000, 2500, 5000])
        b_max = b_min * 2
        
        execute_query(query, [
            project_id,
            random.choice(titles) + f" #{i}",
            "We are looking for an experienced freelancer to help us build out our vision. Must have good communication skills and a solid portfolio.",
            b_min, b_max,
            client['id']
        ])
        projects.append(project_id)
        
    return projects

def seed_proposals(users, projects):
    print("Seeding proposals...")
    freelancers = [u for u in users if u['role'] == 'freelancer']
    if not freelancers or not projects: return
    
    for p_id in projects:
        num_proposals = random.randint(1, 5)
        bidders = random.sample(freelancers, min(num_proposals, len(freelancers)))
        
        for f in bidders:
            query = """
                INSERT INTO proposals (id, project_id, freelancer_id, bid_amount, estimated_duration, cover_letter, status, created_at)
                VALUES (?, ?, ?, ?, '2 months', ?, 'pending', CURRENT_TIMESTAMP)
            """
            execute_query(query, [
                str(uuid.uuid4()),
                p_id,
                f['id'],
                random.randint(500, 5000),
                "I am very interested in your project and I possess all the required skills to deliver it successfully."
            ])

if __name__ == "__main__":
    try:
        users = seed_users()
        seed_profiles(users)
        projects = seed_projects(users)
        seed_proposals(users, projects)
        print("Seeding complete!")
    except Exception as e:
        print(f"Error seeding data: {e}")