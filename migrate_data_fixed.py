#!/usr/bin/env python3
"""
Migrate data using SELECT * to handle whatever columns exist
"""
import oracledb

print("🔄 Migrating data from 19c to 23ai...")

source = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilancedb_high',
    config_dir='/app/oracle-wallet', wallet_location='/app/oracle-wallet',
    wallet_password='MegiLance2025!Wallet'
)

target = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilanceai_high',
    config_dir='/app/oracle-wallet-23ai', wallet_location='/app/oracle-wallet-23ai',
    wallet_password='MegiLance2025!Wallet'
)

src_cur = source.cursor()
tgt_cur = target.cursor()

# Migrate SKILLS (no dependencies)
print("\n📊 Migrating SKILLS...")
src_cur.execute("SELECT * FROM skills ORDER BY id")
skills = src_cur.fetchall()
cols = [d[0] for d in src_cur.description]
placeholders = ','.join([f':{i+1}' for i in range(len(cols))])
for skill in skills:
    tgt_cur.execute(f"INSERT INTO skills ({','.join(cols)}) VALUES ({placeholders})", skill)
print(f"   ✅ Migrated {len(skills)} skills")

# Migrate USERS
print("\n📊 Migrating USERS...")
src_cur.execute("SELECT * FROM users ORDER BY id")
users = src_cur.fetchall()
src_cols = [d[0].lower() for d in src_cur.description]
print(f"   Source columns: {src_cols}")

# Map to target columns (id, email, hashed_password, full_name, role, profile_data, is_active, is_verified, created_at, updated_at)
for user in users:
    user_dict = dict(zip(src_cols, user))
    tgt_cur.execute("""
        INSERT INTO users (id, email, hashed_password, full_name, role, profile_data, is_active, is_verified, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, NULL, :6, :7, :8, :9)
    """, (
        user_dict.get('id'),
        user_dict.get('email'),
        user_dict.get('hashed_password'),
        user_dict.get('full_name'),
        user_dict.get('role'),
        user_dict.get('is_active', 1),
        user_dict.get('is_verified', 0),
        user_dict.get('created_at'),
        user_dict.get('updated_at')
    ))
print(f"   ✅ Migrated {len(users)} users")

# Migrate PROJECTS
print("\n📊 Migrating PROJECTS...")
src_cur.execute("SELECT * FROM projects ORDER BY id")
projects = src_cur.fetchall()
src_cols = [d[0].lower() for d in src_cur.description]
for project in projects:
    proj_dict = dict(zip(src_cols, project))
    tgt_cur.execute("""
        INSERT INTO projects (id, title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
    """, (
        proj_dict.get('id'),
        proj_dict.get('title'),
        proj_dict.get('description'),
        proj_dict.get('budget_min'),
        proj_dict.get('budget_max'),
        proj_dict.get('deadline'),
        proj_dict.get('status', 'open'),
        proj_dict.get('client_id'),
        proj_dict.get('created_at'),
        proj_dict.get('updated_at')
    ))
print(f"   ✅ Migrated {len(projects)} projects")

# Migrate PROPOSALS
print("\n📊 Migrating PROPOSALS...")
src_cur.execute("SELECT * FROM proposals ORDER BY id")
proposals = src_cur.fetchall()
src_cols = [d[0].lower() for d in src_cur.description]
for proposal in proposals:
    prop_dict = dict(zip(src_cols, proposal))
    tgt_cur.execute("""
        INSERT INTO proposals (id, project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)
    """, (
        prop_dict.get('id'),
        prop_dict.get('project_id'),
        prop_dict.get('freelancer_id'),
        prop_dict.get('cover_letter'),
        prop_dict.get('bid_amount'),
        prop_dict.get('delivery_time'),
        prop_dict.get('status', 'pending'),
        prop_dict.get('created_at'),
        prop_dict.get('updated_at')
    ))
print(f"   ✅ Migrated {len(proposals)} proposals")

target.commit()

# Verify
print("\n📊 Verifying migration...")
tgt_cur.execute("SELECT COUNT(*) FROM users"); print(f"   ✅ USERS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM skills"); print(f"   ✅ SKILLS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM projects"); print(f"   ✅ PROJECTS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM proposals"); print(f"   ✅ PROPOSALS: {tgt_cur.fetchone()[0]}")

src_cur.close()
tgt_cur.close()
source.close()
target.close()

print("\n🎉 Data migration completed successfully!")
