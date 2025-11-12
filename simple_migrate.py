#!/usr/bin/env python3
import oracledb
import sys

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
print("\n📊 Migrating USERS...")
sc.execute('SELECT id, email, hashed_password, name, user_type, is_active, is_verified, created_at, updated_at FROM users ORDER BY id')
old_users = sc.fetchall()
user_id_map = {}
for u in old_users:
    old_id = u[0]
    tc.execute('''INSERT INTO users (email,hashed_password,full_name,role,
                  profile_data,is_active,is_verified,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,NULL,:5,:6,:7,:8) RETURNING id INTO :new_id''',
              [u[1], u[2], u[3], u[4] or 'client', u[5], u[6], u[7], u[8], tc.var(oracledb.NUMBER)])
    new_id = tc.bindvars[0].getvalue()[0]
    user_id_map[old_id] = new_id
tgt.commit()
print(f"   ✅ {len(old_users)} users migrated")

# Migrate PROJECTS (with ID tracking)
print("\n📊 Migrating PROJECTS...")
sc.execute('SELECT id, title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at FROM projects ORDER BY id')
old_projects = sc.fetchall()
project_id_map = {}
for p in old_projects:
    old_id = p[0]
    new_client_id = user_id_map.get(p[7])
    tc.execute('''INSERT INTO projects (title,description,budget_min,budget_max,
                  deadline,status,client_id,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9) RETURNING id INTO :new_id''',
              [p[1], p[2], p[3], p[4], p[5], p[6] or 'open', new_client_id, p[8], p[9], tc.var(oracledb.NUMBER)])
    new_id = tc.bindvars[0].getvalue()[0]
    project_id_map[old_id] = new_id
tgt.commit()
print(f"   ✅ {len(old_projects)} projects migrated")

# Migrate PROPOSALS
print("\n📊 Migrating PROPOSALS...")
sc.execute('SELECT project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at FROM proposals ORDER BY id')
proposals = sc.fetchall()
for prop in proposals:
    new_proj_id = project_id_map.get(prop[0])
    new_freelancer_id = user_id_map.get(prop[1])
    tc.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,
                  bid_amount,delivery_time,status,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8)''',
              [new_proj_id, new_freelancer_id, prop[2], prop[3], prop[4], prop[5] or 'pending', prop[6], prop[7]])
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
