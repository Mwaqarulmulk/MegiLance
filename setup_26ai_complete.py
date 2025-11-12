#!/usr/bin/env python3
"""Complete 26ai setup with sample data"""
import oracledb
from datetime import datetime, timedelta

print("🔄 Setting up 26ai database...\n")

conn = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilanceai_high',
    config_dir='/wallet', wallet_location='/wallet', wallet_password='MegiLance2025!Wallet'
)
c = conn.cursor()

# Create sample users
print("📊 Creating users...")
users_data = [
    ('client1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyBsSDVc8H1e', 'John Smith', 'client'),
    ('client2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyBsSDVc8H1e', 'Sarah Johnson', 'client'),
    ('freelancer1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyBsSDVc8H1e', 'Mike Developer', 'freelancer'),
    ('freelancer2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyBsSDVc8H1e', 'Lisa Designer', 'freelancer'),
    ('admin@megilance.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyBsSDVc8H1e', 'Admin User', 'client'),
]

for email, pwd, name, role in users_data:
    c.execute('''INSERT INTO users (email,hashed_password,full_name,role,profile_data,is_active,is_verified,created_at,updated_at)
                 VALUES (:1,:2,:3,:4,NULL,1,1,:5,:6)''',
              [email, pwd, name, role, datetime.now(), datetime.now()])
print(f"   ✅ {len(users_data)} users created")

# Create skills
print("\n📊 Creating skills...")
skills_data = [
    ('Python', 'Programming'),
    ('JavaScript', 'Programming'),
    ('React', 'Frontend'),
    ('Node.js', 'Backend'),
    ('FastAPI', 'Backend'),
    ('PostgreSQL', 'Database'),
    ('UI/UX Design', 'Design'),
    ('Mobile Development', 'Development'),
]

for name, category in skills_data:
    c.execute('INSERT INTO skills (name,category,created_at) VALUES (:1,:2,:3)',
              [name, category, datetime.now()])
print(f"   ✅ {len(skills_data)} skills created")

conn.commit()

# Get user IDs
c.execute("SELECT id, role FROM users ORDER BY id")
users = c.fetchall()
clients = [u[0] for u in users if u[1] == 'client']
freelancers = [u[0] for u in users if u[1] == 'freelancer']

# Create projects
print("\n📊 Creating projects...")
projects_data = [
    ('E-commerce Platform', 'Build modern online store with payment integration', 5000, 8000, 60),
    ('Mobile Food Delivery App', 'iOS/Android app with real-time tracking', 10000, 15000, 90),
    ('API Integration Project', 'Integrate third-party APIs into FastAPI backend', 3000, 5000, 30),
]

for title, desc, bmin, bmax, days in projects_data:
    deadline = datetime.now() + timedelta(days=days)
    c.execute('''INSERT INTO projects (title,description,budget_min,budget_max,deadline,status,client_id,created_at,updated_at)
                 VALUES (:1,:2,:3,:4,:5,'open',:6,:7,:8)''',
              [title, desc, bmin, bmax, deadline, clients[0], datetime.now(), datetime.now()])
print(f"   ✅ {len(projects_data)} projects created")

conn.commit()

# Get project IDs
c.execute("SELECT id FROM projects ORDER BY id")
projects = [r[0] for r in c.fetchall()]

# Create proposals
print("\n📊 Creating proposals...")
proposals_data = [
    ('Experienced in e-commerce. Can deliver all features.', 7000, 45),
    ('Mobile dev specialist. Built 10+ delivery apps.', 12500, 75),
    ('FastAPI expert. Integrated 20+ APIs successfully.', 4000, 20),
]

for i, (letter, bid, days) in enumerate(proposals_data):
    c.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,bid_amount,delivery_time,status,created_at,updated_at)
                 VALUES (:1,:2,:3,:4,:5,'pending',:6,:7)''',
              [projects[i], freelancers[0], letter, bid, days, datetime.now(), datetime.now()])
print(f"   ✅ {len(proposals_data)} proposals created")

conn.commit()

# Verify
print("\n📊 Final database status:")
for table in ['users', 'skills', 'projects', 'proposals']:
    c.execute(f'SELECT COUNT(*) FROM {table}')
    print(f"   {table.upper()}: {c.fetchone()[0]}")

conn.close()
print("\n🎉 26ai database setup complete!")
