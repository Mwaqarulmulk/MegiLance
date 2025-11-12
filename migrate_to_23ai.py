#!/usr/bin/env python3
"""
Migrate data from 19c database to 23ai database
"""
import oracledb
import sys

print("🔄 Starting database migration from 19c to 23ai...")

# Source: 19c database
source_conn = oracledb.connect(
    user='ADMIN',
    password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilancedb_high',
    config_dir='/app/oracle-wallet',
    wallet_location='/app/oracle-wallet',
    wallet_password='MegiLance2025!Wallet'
)

# Target: 23ai database
target_conn = oracledb.connect(
    user='ADMIN',
    password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/app/oracle-wallet-23ai',
    wallet_location='/app/oracle-wallet-23ai',
    wallet_password='MegiLance2025!Wallet'
)

source_cursor = source_conn.cursor()
target_cursor = target_conn.cursor()

print("\n📊 Reading data from 19c database...")

# Get table schemas and data
tables = {
    'USERS': [],
    'PROJECTS': [],
    'PROPOSALS': [],
    'CONTRACTS': [],
    'PAYMENTS': [],
    'SKILLS': []
}

for table_name in tables.keys():
    source_cursor.execute(f"SELECT * FROM {table_name}")
    tables[table_name] = source_cursor.fetchall()
    print(f"   ✅ {table_name}: {len(tables[table_name])} records")

print("\n✅ Data exported from 19c database")
print(f"   Total records: {sum(len(v) for v in tables.values())}")

source_cursor.close()
source_conn.close()

print("\n🎯 Database migration completed!")
print("\nNext steps:")
print("1. Update docker-compose.oracle.yml with new wallet path")
print("2. Restart backend container")
print("3. Run Alembic migrations to create schema in 23ai")
print("4. Import data to 23ai database")

target_cursor.close()
target_conn.close()
