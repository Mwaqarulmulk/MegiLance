#!/usr/bin/env python3
"""
Create all database tables directly using SQLAlchemy create_all()
This bypasses Alembic and creates tables from the models
"""
import os
import sys
from sqlalchemy import create_engine, text

# Add app to path
sys.path.insert(0, '/app')

from app.db.base import Base
from app.models import (
    User, Skill, UserSkill, Project, Proposal, Contract, Payment,
    PortfolioItem, Message, Conversation, Notification, Review,
    Dispute, Milestone, UserSession, AuditLog
)

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not set!")
    sys.exit(1)

print("\n🔨 Creating all database tables...")
print(f"📊 Database: {DATABASE_URL.split('@')[1].split('?')[0] if '@' in DATABASE_URL else 'Oracle ADB'}")

engine = create_engine(DATABASE_URL)

# Import all models so they're registered with Base
print("\n📦 Loaded models:")
for model in [User, Skill, UserSkill, Project, Proposal, Contract, Payment,
              PortfolioItem, Message, Conversation, Notification, Review,
              Dispute, Milestone, UserSession, AuditLog]:
    print(f"  - {model.__tablename__}")

# Create all tables
try:
    Base.metadata.create_all(bind=engine, checkfirst=True)
    print("\n✅ All tables created successfully!")
    
    # Verify
    with engine.connect() as conn:
        result = conn.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))
        tables = [row[0] for row in result]
        print(f"\n📊 Total tables in database: {len(tables)}")
        for table in tables:
            print(f"  ✓ {table}")
    
    print("\n🎉 Database schema ready!")
    
except Exception as e:
    print(f"\n❌ Error creating tables: {e}")
    sys.exit(1)
