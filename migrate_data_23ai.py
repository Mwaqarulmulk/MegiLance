#!/usr/bin/env python3
"""
Migrate all data from 19c to 23ai database
"""
import oracledb
from datetime import datetime

print("🔄 Migrating data from 19c to 23ai...")

# Source: 19c
source = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilancedb_high',
    config_dir='/app/oracle-wallet', wallet_location='/app/oracle-wallet',
    wallet_password='MegiLance2025!Wallet'
)

# Target: 23ai
target = oracledb.connect(
    user='ADMIN', password='Bfw5ZvHQXjkDb!3lAa1!', dsn='megilanceai_high',
    config_dir='/app/oracle-wallet-23ai', wallet_location='/app/oracle-wallet-23ai',
    wallet_password='MegiLance2025!Wallet'
)

src_cur = source.cursor()
tgt_cur = target.cursor()

# Migrate USERS
print("\n📊 Migrating USERS...")
src_cur.execute("SELECT id, email, hashed_password, full_name, role, profile_data, is_active, is_verified, created_at, updated_at FROM users ORDER BY id")
users = src_cur.fetchall()
for user in users:
    tgt_cur.execute("""
        INSERT INTO users (id, email, hashed_password, full_name, role, profile_data, is_active, is_verified, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
    """, user)
print(f"   ✅ Migrated {len(users)} users")

# Migrate SKILLS
print("\n📊 Migrating SKILLS...")
src_cur.execute("SELECT id, name, category, created_at FROM skills ORDER BY id")
skills = src_cur.fetchall()
for skill in skills:
    tgt_cur.execute("""
        INSERT INTO skills (id, name, category, created_at)
        VALUES (:1, :2, :3, :4)
    """, skill)
print(f"   ✅ Migrated {len(skills)} skills")

# Migrate PROJECTS
print("\n📊 Migrating PROJECTS...")
src_cur.execute("SELECT id, title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at FROM projects ORDER BY id")
projects = src_cur.fetchall()
for project in projects:
    tgt_cur.execute("""
        INSERT INTO projects (id, title, description, budget_min, budget_max, deadline, status, client_id, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
    """, project)
print(f"   ✅ Migrated {len(projects)} projects")

# Migrate PROPOSALS
print("\n📊 Migrating PROPOSALS...")
src_cur.execute("SELECT id, project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at FROM proposals ORDER BY id")
proposals = src_cur.fetchall()
for proposal in proposals:
    tgt_cur.execute("""
        INSERT INTO proposals (id, project_id, freelancer_id, cover_letter, bid_amount, delivery_time, status, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)
    """, proposal)
print(f"   ✅ Migrated {len(proposals)} proposals")

# Migrate CONTRACTS (if any)
print("\n📊 Migrating CONTRACTS...")
src_cur.execute("SELECT id, project_id, freelancer_id, client_id, amount, status, start_date, end_date, terms, created_at, updated_at FROM contracts ORDER BY id")
contracts = src_cur.fetchall()
for contract in contracts:
    tgt_cur.execute("""
        INSERT INTO contracts (id, project_id, freelancer_id, client_id, amount, status, start_date, end_date, terms, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11)
    """, contract)
print(f"   ✅ Migrated {len(contracts)} contracts")

# Migrate PAYMENTS (if any)
print("\n📊 Migrating PAYMENTS...")
src_cur.execute("SELECT id, contract_id, amount, status, payment_method, transaction_id, created_at, updated_at FROM payments ORDER BY id")
payments = src_cur.fetchall()
for payment in payments:
    tgt_cur.execute("""
        INSERT INTO payments (id, contract_id, amount, status, payment_method, transaction_id, created_at, updated_at)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
    """, payment)
print(f"   ✅ Migrated {len(payments)} payments")

target.commit()

# Verify
print("\n📊 Verifying migration...")
tgt_cur.execute("SELECT COUNT(*) FROM users")
print(f"   ✅ USERS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM skills")
print(f"   ✅ SKILLS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM projects")
print(f"   ✅ PROJECTS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM proposals")
print(f"   ✅ PROPOSALS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM contracts")
print(f"   ✅ CONTRACTS: {tgt_cur.fetchone()[0]}")
tgt_cur.execute("SELECT COUNT(*) FROM payments")
print(f"   ✅ PAYMENTS: {tgt_cur.fetchone()[0]}")

src_cur.close()
tgt_cur.close()
source.close()
target.close()

print("\n🎉 Data migration completed successfully!")
print(f"   Total records migrated: {len(users) + len(skills) + len(projects) + len(proposals) + len(contracts) + len(payments)}")
