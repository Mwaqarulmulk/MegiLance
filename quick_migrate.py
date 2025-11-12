#!/usr/bin/env python3
import oracledb
from datetime import timedelta

print("🔄 Migrating data from 19c to 26ai...")

# Connect
src = oracledb.connect(user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilancedb_high',
                       config_dir='/wallet19', wallet_location='/wallet19', wallet_password='MegiLance2025!Wallet')
tgt = oracledb.connect(user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilanceai_high',
                       config_dir='/wallet26', wallet_location='/wallet26', wallet_password='MegiLance2025!Wallet')
sc, tc = src.cursor(), tgt.cursor()
print("✅ Connected\n")

# SKILLS
print("📊 SKILLS...")
sc.execute('SELECT name, category, created_at FROM skills ORDER BY id')
for s in sc:
    tc.execute('INSERT INTO skills (name,category,created_at) VALUES (:1,:2,:3)', s)
tgt.commit()
tc.execute('SELECT COUNT(*) FROM skills')
print(f"   ✅ {tc.fetchone()[0]} skills\n")

# USERS
print("📊 USERS...")
sc.execute('SELECT id, email, hashed_password, name, user_type, is_active, is_verified, created_at, updated_at FROM users ORDER BY id')
old_users = sc.fetchall()
for u in old_users:
    tc.execute('''INSERT INTO users (email,hashed_password,full_name,role,profile_data,is_active,is_verified,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,NULL,:5,:6,:7,:8)''',
              [u[1], u[2], u[3], u[4] or 'client', u[5], u[6], u[7], u[8]])
tgt.commit()
# Map old IDs to new IDs by email
tc.execute('SELECT id,email FROM users ORDER BY id')
new_users = tc.fetchall()
user_map = {old_users[i][0]: new_users[i][0] for i in range(len(old_users))}
print(f"   ✅ {len(new_users)} users\n")

# PROJECTS
print("📊 PROJECTS...")
sc.execute('SELECT id, title, description, budget_min, budget_max, client_id, status, created_at, updated_at FROM projects ORDER BY id')
old_projects = sc.fetchall()
for p in old_projects:
    deadline = p[7] + timedelta(days=30) if p[7] else None
    try:
        bmin = float(p[3]) if p[3] else None
    except:
        bmin = None
    try:
        bmax = float(p[4]) if p[4] else None
    except:
        bmax = None
    tc.execute('''INSERT INTO projects (title,description,budget_min,budget_max,deadline,status,client_id,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9)''',
              [p[1], p[2], bmin, bmax, deadline, p[6] or 'open', user_map.get(p[5]), p[7], p[8]])
tgt.commit()
# Map project IDs
tc.execute('SELECT id FROM projects ORDER BY id')
new_projects = tc.fetchall()
proj_map = {old_projects[i][0]: new_projects[i][0] for i in range(len(old_projects))}
print(f"   ✅ {len(new_projects)} projects\n")

# PROPOSALS
print("📊 PROPOSALS...")
sc.execute('SELECT project_id, freelancer_id, cover_letter, estimated_hours, hourly_rate, status, created_at, updated_at FROM proposals ORDER BY id')
count = 0
for prop in sc:
    bid = (prop[3] or 0) * (prop[4] or 0) if prop[3] and prop[4] else None
    tc.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,bid_amount,delivery_time,status,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8)''',
              [proj_map.get(prop[0]), user_map.get(prop[1]), prop[2], bid, prop[3], prop[5] or 'pending', prop[6], prop[7]])
    count += 1
tgt.commit()
print(f"   ✅ {count} proposals\n")

# Verify
print("📊 Final counts:")
for table in ['users', 'skills', 'projects', 'proposals']:
    tc.execute(f'SELECT COUNT(*) FROM {table}')
    print(f"   {table.upper()}: {tc.fetchone()[0]}")

src.close()
tgt.close()
print("\n🎉 Migration complete!")
