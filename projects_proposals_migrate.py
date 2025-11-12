#!/usr/bin/env python3
import oracledb
from datetime import timedelta

print("🔄 Migrating PROJECTS and PROPOSALS...")

# Single connection approach - keep connection open minimal time
src = oracledb.connect(user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilancedb_high',
                       config_dir='/wallet19', wallet_location='/wallet19', wallet_password='MegiLance2025!Wallet')
tgt = oracledb.connect(user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilanceai_high',
                       config_dir='/wallet26', wallet_location='/wallet26', wallet_password='MegiLance2025!Wallet')

sc, tc = src.cursor(), tgt.cursor()

# Get user ID mapping from both databases
print("Getting user mapping...")
sc.execute('SELECT id FROM users ORDER BY id')
src_user_ids = [r[0] for r in sc]
tc.execute('SELECT id FROM users ORDER BY id')
tgt_user_ids = [r[0] for r in tc]
user_map = {src_user_ids[i]: tgt_user_ids[i] for i in range(len(src_user_ids))}
print(f"Mapped {len(user_map)} users")

# Migrate PROJECTS
print("\n📊 Migrating PROJECTS...")
sc.execute('SELECT title, description, budget_min, budget_max, client_id, status, created_at, updated_at FROM projects ORDER BY id')
projects_data = sc.fetchall()
print(f"Fetched {len(projects_data)} projects from 19c")

proj_count = 0
for p in projects_data:
    deadline = p[6] + timedelta(days=30) if p[6] else None
    try:
        bmin = float(p[2]) if p[2] else None
    except:
        bmin = None
    try:
        bmax = float(p[3]) if p[3] else None
    except:
        bmax = None
    client_id = user_map.get(p[4])
    tc.execute('''INSERT INTO projects (title,description,budget_min,budget_max,deadline,status,client_id,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9)''',
              [p[0], p[1], bmin, bmax, deadline, p[5] or 'open', client_id, p[6], p[7]])
    proj_count += 1

tgt.commit()
print(f"✅ {proj_count} projects migrated")

# Get project mapping
sc.execute('SELECT id FROM projects ORDER BY id')
src_proj_ids = [r[0] for r in sc]
tc.execute('SELECT id FROM projects ORDER BY id')
tgt_proj_ids = [r[0] for r in tc]
proj_map = {src_proj_ids[i]: tgt_proj_ids[i] for i in range(len(src_proj_ids))}

# Migrate PROPOSALS
print("\n📊 Migrating PROPOSALS...")
sc.execute('SELECT project_id, freelancer_id, cover_letter, estimated_hours, hourly_rate, status, created_at, updated_at FROM proposals ORDER BY id')
proposals_data = sc.fetchall()
print(f"Fetched {len(proposals_data)} proposals from 19c")

prop_count = 0
for prop in proposals_data:
    proj_id = proj_map.get(prop[0])
    freelancer_id = user_map.get(prop[1])
    bid = (prop[3] or 0) * (prop[4] or 0) if prop[3] and prop[4] else None
    tc.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,bid_amount,delivery_time,status,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8)''',
              [proj_id, freelancer_id, prop[2], bid, prop[3], prop[5] or 'pending', prop[6], prop[7]])
    prop_count += 1

tgt.commit()
print(f"✅ {prop_count} proposals migrated")

# Verify
print("\n📊 Final counts:")
for table in ['users', 'skills', 'projects', 'proposals']:
    tc.execute(f'SELECT COUNT(*) FROM {table}')
    print(f"   {table.upper()}: {tc.fetchone()[0]}")

src.close()
tgt.close()

print("\n🎉 Migration complete!")
