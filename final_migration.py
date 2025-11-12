#!/usr/bin/env python3
import oracledb
import sys

print("🔄 Migrating data from 19c to 26ai database...")

# Connect to source (19c)
try:
    src = oracledb.connect(
        user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', 
        dsn='megilancedb_high',
        config_dir='/wallet19', wallet_location='/wallet19',
        wallet_password='MegiLance2025!Wallet'
    )
    print("✅ Connected to 19c database")
except Exception as e:
    print(f"❌ Failed to connect to 19c: {e}")
    sys.exit(1)

# Connect to target (26ai)
try:
    tgt = oracledb.connect(
        user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!',
        dsn='megilanceai_high',
        config_dir='/wallet26', wallet_location='/wallet26',
        wallet_password='MegiLance2025!Wallet'
    )
    print("✅ Connected to 26ai database")
except Exception as e:
    print(f"❌ Failed to connect to 26ai: {e}")
    sys.exit(1)

sc = src.cursor()
tc = tgt.cursor()

# Migrate SKILLS
print("\n📊 Migrating SKILLS...")
sc.execute('SELECT * FROM skills ORDER BY id')
src_skills_cols = [d[0] for d in sc.description]
skills = sc.fetchall()
for skill in skills:
    skill_dict = dict(zip([c.lower() for c in src_skills_cols], skill))
    tc.execute('INSERT INTO skills (name,category,created_at) VALUES (:1,:2,:3)',
              (skill_dict.get('name'), skill_dict.get('category'), skill_dict.get('created_at')))
print(f"   ✅ {len(skills)} skills migrated")

# Migrate USERS
print("\n📊 Migrating USERS...")
sc.execute('SELECT * FROM users ORDER BY id')
srccols = [d[0].lower() for d in sc.description]
users = sc.fetchall()
for u in users:
    ud = dict(zip(srccols, u))
    tc.execute('''INSERT INTO users (email,hashed_password,full_name,role,
                  profile_data,is_active,is_verified,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,NULL,:5,:6,:7,:8)''',
              (ud.get('email'), ud.get('hashed_password'), ud.get('full_name'),
               ud.get('role') or 'client', ud.get('is_active',1), ud.get('is_verified',0),
               ud.get('created_at'), ud.get('updated_at')))
tgt.commit()
print(f"   ✅ {len(users)} users migrated")

# Get user ID mapping for foreign keys
tc.execute('SELECT id, email FROM users ORDER BY id')
user_rows = tc.fetchall()
tc.execute('SELECT * FROM users ORDER BY id')
src_user_cols = [d[0].lower() for d in sc.description]
sc.execute('SELECT * FROM users ORDER BY id')
src_users = sc.fetchall()
user_map = {}
for idx, (new_row, old_row) in enumerate(zip(user_rows, src_users)):
    old_dict = dict(zip(src_user_cols, old_row))
    user_map[old_dict.get('id')] = new_row[0]

# Migrate PROJECTS
print("\n📊 Migrating PROJECTS...")
sc.execute('SELECT * FROM projects ORDER BY id')
srccols = [d[0].lower() for d in sc.description]
projects = sc.fetchall()
for proj in projects:
    pd = dict(zip(srccols, proj))
    new_client_id = user_map.get(pd.get('client_id'))
    tc.execute('''INSERT INTO projects (title,description,budget_min,budget_max,
                  deadline,status,client_id,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9)''',
              (pd.get('title'), pd.get('description'), pd.get('budget_min'),
               pd.get('budget_max'), pd.get('deadline'), pd.get('status','open'),
               new_client_id, pd.get('created_at'), pd.get('updated_at')))
tgt.commit()
print(f"   ✅ {len(projects)} projects migrated")

# Migrate PROPOSALS
print("\n📊 Migrating PROPOSALS...")
sc.execute('SELECT * FROM proposals ORDER BY id')
srccols = [d[0].lower() for d in sc.description]
proposals = sc.fetchall()
# Get project/user mappings
tc.execute('SELECT id FROM projects ORDER BY id')
proj_rows = tc.fetchall()
proj_map = {}
for idx, prow in enumerate(proj_rows):
    sc.execute('SELECT id FROM projects ORDER BY id')
    old_projs = sc.fetchall()
    if idx < len(old_projs):
        proj_map[old_projs[idx][0]] = prow[0]

for prop in proposals:
    propd = dict(zip(srccols, prop))
    new_proj_id = proj_map.get(propd.get('project_id'))
    new_freelancer_id = user_map.get(propd.get('freelancer_id'))
    tc.execute('''INSERT INTO proposals (project_id,freelancer_id,cover_letter,
                  bid_amount,delivery_time,status,created_at,updated_at) 
                  VALUES (:1,:2,:3,:4,:5,:6,:7,:8)''',
              (new_proj_id, new_freelancer_id, propd.get('cover_letter'),
               propd.get('bid_amount'), propd.get('delivery_time'),
               propd.get('status','pending'), propd.get('created_at'),
               propd.get('updated_at')))
tgt.commit()
print(f"   ✅ {len(proposals)} proposals migrated")

# Commit all changes
tgt.commit()
print("\n✅ Migration complete!")

# Verify data
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
print("\n🎉 All done!")

tgt.commit()

# Verify
print("\n✅ MIGRATION VERIFICATION:")
tc.execute('SELECT COUNT(*) FROM users')
print(f"   Users: {tc.fetchone()[0]}")
tc.execute('SELECT COUNT(*) FROM skills')
print(f"   Skills: {tc.fetchone()[0]}")
tc.execute('SELECT COUNT(*) FROM projects')
print(f"   Projects: {tc.fetchone()[0]}")
tc.execute('SELECT COUNT(*) FROM proposals')
print(f"   Proposals: {tc.fetchone()[0]}")

src.close()
tgt.close()

print("\n🎉 DATA MIGRATION TO 26ai COMPLETED SUCCESSFULLY!")
