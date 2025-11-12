#!/usr/bin/env python3
"""
Initialize 23ai database schema using Alembic migrations
"""
import oracledb
from sqlalchemy import create_engine, text
import sys

print("🚀 Initializing 23ai database schema...")

# Database connection string
DATABASE_URL = "oracle+oracledb://ADMIN:Bfw5ZvHQXjkDb!3lAa1!@megilanceai_high"

# Create engine with wallet configuration
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "config_dir": "/app/oracle-wallet-23ai",
        "wallet_location": "/app/oracle-wallet-23ai",
        "wallet_password": "MegiLance2025!Wallet"
    }
)

print("✅ Engine created")

# Import models to create tables
sys.path.insert(0, '/app')
from app.db.base import Base
from app.models.user import User
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.contract import Contract
from app.models.payment import Payment
from app.models.skill import Skill

print("✅ Models imported")

# Create all tables
print("\n📊 Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created")

# Verify tables
with engine.connect() as conn:
    result = conn.execute(text("SELECT table_name FROM user_tables ORDER BY table_name"))
    tables = [row[0] for row in result]
    print(f"\n✅ Created {len(tables)} tables:")
    for table in tables:
        print(f"   - {table}")

print("\n🎉 23ai database schema initialized successfully!")
