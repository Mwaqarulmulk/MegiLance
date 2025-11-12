#!/usr/bin/env python3
import oracledb
import sys
from datetime import datetime, timedelta

print("🔄 Migrating data from 19c to 26ai database...")

# Connect to source (19c)
src = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', 
    dsn='megilancedb_high',
    config_dir='/wallet19', wallet_location='/wallet19',
    wallet_password='MegiLance2025!Wallet'
)
sc = src.cursor()
print("✅ Connected to 19c database")

# Connect to target (26ai)
tgt = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/wallet26', wallet_location='/wallet26',
    wallet_password='MegiLance2025!Wallet'
)
tc = tgt.cursor()
print("✅ Connected to 26ai database")

# Migrate SKILLS
print("\n📊 Migrating SKILLS...")
sc.execute('SELECT name, category, created_at FROM skills ORDER BY id')
skills = sc.fetchall()
for s in skills:
    tc.execute('INSERT INTO skills (name,category,created_at) VALUES (:1,:2,:3)', s)
tgt.commit()
print(f"   ✅ {len(skills)} skills migrated")

# Migrate USERS (with ID tracking)
# 19c: id, email, hashed_password, name, user_type, bio, skills, hourly_rate, account_balance, is_active, is_verified, created_at, updated_at
# 26ai: id, email, hashed_password, full_name, role, profile_data, is_active, is_verified, created_at, updated_at
print("\n📊 Migrating USERS...")
sc.execute('SELECT id, email, hashed_password, name, user_type, is_active, is_verified, created_at, updated_at FROM users ORDER BY id')
old_users = sc.fetchall()
user_id_map = {}
for u in old_users:
    old_id = u[0]
    new_id_var = tc.var(oracledb.NUMBER)
    tc.execute('''INSERT INTO users (email,hashed_password,full_name,role,
                  profile_data,is_active,is_verified,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,NULL,:5,:6,:7,:8) RETURNING id INTO :9''',
              [u[1], u[2], u[3], u[4] or 'client', u[5], u[6], u[7], u[8], new_id_var])
    new_id = new_id_var.getvalue()[0]
    user_id_map[old_id] = new_id
tgt.commit()
print(f"   ✅ {len(old_users)} users migrated")

# Migrate PROJECTS (with ID tracking and field mapping)
# 19c: id, title, description, category, budget_min, budget_max, budget_type, experience_level, estimated_duration, skills, client_id, status, created_at, updated_at
# 26ai: id, title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at
print("\n📊 Migrating PROJECTS...")
sc.execute('SELECT id, title, description, budget_min, budget_max, client_id, status, created_at, updated_at FROM projects ORDER BY id')
old_projects = sc.fetchall()
project_id_map = {}
for p in old_projects:
    old_id = p[0]
    new_client_id = user_id_map.get(p[5])
    # Set deadline to 30 days from created_at
    deadline = p[7] + timedelta(days=30) if p[7] else None
    # Convert budget to numbers, handle non-numeric values
    try:
        budget_min = float(p[3]) if p[3] else None
    except (ValueError, TypeError):
        budget_min = None
    try:
        budget_max = float(p[4]) if p[4] else None
    except (ValueError, TypeError):
        budget_max = None
    new_id_var = tc.var(oracledb.NUMBER)
    tc.execute('''INSERT INTO projects (title,description,budget_min,budget_max,
                  deadline,status,client_id,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9) RETURNING id INTO :10''',
              [p[1], p[2], budget_min, budget_max, deadline, p[6] or 'open', new_client_id, p[7], p[8], new_id_var])
    new_id = new_id_var.getvalue()[0]
    project_id_map[old_id] = new_id
tgt.commit()
print(f"   ✅ {len(old_projects)} projects migrated")

# Migrate PROPOSALS (with field mapping)
# 19c: id, project_id, freelancer_id, cover_letter, estimated_hours, hourly_rate, availability, attachments, status, created_at, updated_at
# 26ai: id, project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at
print("\n📊 Migrating PROPOSALS...")
sc.execute('SELECT project_id, freelancer_id, cover_letter, estimated_hours, hourly_rate, status, created_at, updated_at FROM proposals ORDER BY id')
proposals = sc.fetchall()
for prop in proposals:
    new_proj_id = project_id_map.get(prop[0])
    new_freelancer_id = user_id_map.get(prop[1])
    # Calculate bid_amount from estimated_hours * hourly_rate
    bid_amount = (prop[3] or 0) * (prop[4] or 0) if prop[3] and prop[4] else None
    delivery_time = prop[3]  # Use estimated_hours as delivery_time
    tc.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,
                  bid_amount,delivery_time,status,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8)''',
              [new_proj_id, new_freelancer_id, prop[2], bid_amount, delivery_time, prop[5] or 'pending', prop[6], prop[7]])
tgt.commit()
print(f"   ✅ {len(proposals)} proposals migrated")

# Final verification
print("\n📊 Verification:")
tc.execute("SELECT COUNT(*) FROM users")
print(f"   Users: {tc.fetchone()[0]}")
tc.execute("SELECT COUNT(*) FROM skills")
print(f"   Skills: {tc.fetchone()[0]}")
tc.execute("SELECT COUNT(*) FROM projects")
print(f"   Projects: {tc.fetchone()[0]}")
tc.execute("SELECT COUNT(*) FROM proposals")
print(f"   Proposals: {tc.fetchone()[0]}")

src.close()
tgt.close()
print("\n🎉 Migration complete!")
