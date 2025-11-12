#!/usr/bin/env python3
"""
Populate 26ai database with sample projects and proposals
Since migration from 19c failed due to Oracle Free Tier connection limits,
this script creates fresh test data in the 26ai database.
"""
import oracledb
from datetime import datetime, timedelta

print("🔄 Populating 26ai database with sample data...\n")

# Connect to 26ai
conn = oracledb.connect(
    user='ADMIN',
    password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/wallet',
    wallet_location='/wallet',
    wallet_password='MegiLance2025!Wallet'
)
cursor = conn.cursor()

# Get existing users
cursor.execute("SELECT id, email, role FROM users ORDER BY id")
users = cursor.fetchall()
print(f"📊 Found {len(users)} existing users:")
for u in users:
    print(f"   ID {u[0]}: {u[1]} ({u[2]})")

# Find client and freelancer users
clients = [u for u in users if u[2] == 'client']
freelancers = [u for u in users if u[2] == 'freelancer']

if not clients:
    print("\n⚠️  No client users found - using first user as client")
    clients = [users[0]]
if not freelancers:
    print("\n⚠️  No freelancer users found - using last user as freelancer")
    freelancers = [users[-1]]

print(f"\n📊 Will create projects for {len(clients)} client(s)")
print(f"📊 Will create proposals from {len(freelancers)} freelancer(s)\n")

# Sample projects data
sample_projects = [
    {
        'title': 'Build E-commerce Website',
        'description': 'Need a modern e-commerce platform with payment integration, inventory management, and responsive design.',
        'budget_min': 5000.00,
        'budget_max': 8000.00,
        'deadline': datetime.now() + timedelta(days=60),
        'status': 'open'
    },
    {
        'title': 'Mobile App Development - iOS & Android',
        'description': 'Develop a cross-platform mobile app for food delivery service. Must include real-time tracking, payment gateway, and user reviews.',
        'budget_min': 10000.00,
        'budget_max': 15000.00,
        'deadline': datetime.now() + timedelta(days=90),
        'status': 'open'
    },
    {
        'title': 'API Integration and Backend Development',
        'description': 'Integrate third-party APIs (Stripe, SendGrid, AWS S3) into existing FastAPI backend. Need clean code and documentation.',
        'budget_min': 3000.00,
        'budget_max': 5000.00,
        'deadline': datetime.now() + timedelta(days=30),
        'status': 'open'
    }
]

# Insert projects
print("📊 Creating sample projects...")
for i, proj in enumerate(sample_projects):
    client_id = clients[i % len(clients)][0]  # Rotate through clients
    cursor.execute('''
        INSERT INTO projects (title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)
    ''', [
        proj['title'],
        proj['description'],
        proj['budget_min'],
        proj['budget_max'],
        proj['deadline'],
        proj['status'],
        client_id,
        datetime.now(),
        datetime.now()
    ])
    print(f"   ✅ Created: {proj['title']}")

conn.commit()

# Get project IDs
cursor.execute("SELECT id FROM projects ORDER BY id")
project_ids = [row[0] for row in cursor.fetchall()]
print(f"\n📊 Created {len(project_ids)} projects")

# Sample proposals
print("\n📊 Creating sample proposals...")
sample_proposals = [
    {
        'cover_letter': 'I have 5+ years of experience building e-commerce platforms. I can deliver a fully functional site with all requested features.',
        'bid_amount': 7000.00,
        'delivery_time': 45,
        'status': 'pending'
    },
    {
        'cover_letter': 'Experienced mobile developer specializing in React Native. Built 10+ food delivery apps. Can provide references.',
        'bid_amount': 12500.00,
        'delivery_time': 75,
        'status': 'pending'
    },
    {
        'cover_letter': 'Backend specialist with FastAPI expertise. Successfully integrated 20+ third-party APIs in production systems.',
        'bid_amount': 4000.00,
        'delivery_time': 20,
        'status': 'pending'
    }
]

for i, proposal in enumerate(sample_proposals):
    project_id = project_ids[i % len(project_ids)]
    freelancer_id = freelancers[i % len(freelancers)][0]
    
    cursor.execute('''
        INSERT INTO proposals (project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
    ''', [
        project_id,
        freelancer_id,
        proposal['cover_letter'],
        proposal['bid_amount'],
        proposal['delivery_time'],
        proposal['status'],
        datetime.now(),
        datetime.now()
    ])
    print(f"   ✅ Created proposal for Project ID {project_id}")

conn.commit()

# Final verification
print("\n📊 Final database status:")
for table in ['users', 'skills', 'projects', 'proposals']:
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    print(f"   {table.upper()}: {count}")

conn.close()
print("\n🎉 Sample data created successfully!")
print("\n📝 Next steps:")
print("   1. Test backend API connection")
print("   2. Delete old 19c database")
print("   3. Start using 26ai database with AI features!")
