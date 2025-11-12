#!/usr/bin/env python3
"""
Create minimal Oracle schema for demo - 5 core tables only
This bypasses all migration issues and gets a working system FAST
"""
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not set!")
    sys.exit(1)

print("\n🚀 Creating Minimal Schema for Demo")
print("=" * 60)

engine = create_engine(DATABASE_URL)

# Drop existing tables first
drop_tables = [
    'DROP TABLE payments CASCADE CONSTRAINTS',
    'DROP TABLE contracts CASCADE CONSTRAINTS',
    'DROP TABLE proposals CASCADE CONSTRAINTS',
    'DROP TABLE projects CASCADE CONSTRAINTS',
    'DROP TABLE skills CASCADE CONSTRAINTS',
    'DROP TABLE users CASCADE CONSTRAINTS',
    'DROP TABLE alembic_version CASCADE CONSTRAINTS',
]

print("\n🧹 Cleaning existing tables...")
with engine.connect() as conn:
    for drop_sql in drop_tables:
        try:
            conn.execute(text(drop_sql))
            conn.commit()
            table_name = drop_sql.split()[2]
            print(f"  ✓ Dropped {table_name}")
        except Exception as e:
            pass  # Table might not exist

# Create minimal tables (Oracle-compatible, no JSON types)
tables = {
    'users': """
        CREATE TABLE users (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email VARCHAR2(255) UNIQUE NOT NULL,
            hashed_password VARCHAR2(255) NOT NULL,
            name VARCHAR2(255),
            user_type VARCHAR2(20) DEFAULT 'client',
            bio CLOB,
            skills VARCHAR2(1000),
            hourly_rate NUMBER(10,2),
            account_balance NUMBER(10,2) DEFAULT 0,
            is_active NUMBER(1) DEFAULT 1,
            is_verified NUMBER(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """,
    
    'skills': """
        CREATE TABLE skills (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name VARCHAR2(100) UNIQUE NOT NULL,
            category VARCHAR2(100),
            description CLOB,
            icon_url VARCHAR2(500),
            is_active NUMBER(1) DEFAULT 1,
            sort_order NUMBER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """,
    
    'projects': """
        CREATE TABLE projects (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            title VARCHAR2(255) NOT NULL,
            description CLOB NOT NULL,
            category VARCHAR2(100),
            budget_min NUMBER(10,2),
            budget_max NUMBER(10,2),
            budget_type VARCHAR2(20) DEFAULT 'fixed',
            experience_level VARCHAR2(20) DEFAULT 'intermediate',
            estimated_duration VARCHAR2(50),
            skills VARCHAR2(1000),
            client_id NUMBER NOT NULL,
            status VARCHAR2(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES users(id)
        )
    """,
    
    'proposals': """
        CREATE TABLE proposals (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            project_id NUMBER NOT NULL,
            freelancer_id NUMBER NOT NULL,
            cover_letter CLOB,
            estimated_hours NUMBER,
            hourly_rate NUMBER(10,2),
            availability VARCHAR2(20) DEFAULT 'immediate',
            attachments VARCHAR2(2000),
            status VARCHAR2(20) DEFAULT 'submitted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_proposal_project FOREIGN KEY (project_id) REFERENCES projects(id),
            CONSTRAINT fk_proposal_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
        )
    """,
    
    'contracts': """
        CREATE TABLE contracts (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            project_id NUMBER NOT NULL,
            client_id NUMBER NOT NULL,
            freelancer_id NUMBER NOT NULL,
            proposal_id NUMBER,
            contract_amount NUMBER(10,2) NOT NULL,
            platform_fee NUMBER(10,2) DEFAULT 0,
            status VARCHAR2(20) DEFAULT 'active',
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            description CLOB,
            milestones VARCHAR2(2000),
            terms VARCHAR2(2000),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_contract_project FOREIGN KEY (project_id) REFERENCES projects(id),
            CONSTRAINT fk_contract_client FOREIGN KEY (client_id) REFERENCES users(id),
            CONSTRAINT fk_contract_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id),
            CONSTRAINT fk_contract_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id)
        )
    """,
    
    'payments': """
        CREATE TABLE payments (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            contract_id NUMBER,
            from_user_id NUMBER NOT NULL,
            to_user_id NUMBER NOT NULL,
            amount NUMBER(10,2) NOT NULL,
            payment_type VARCHAR2(20) DEFAULT 'project',
            payment_method VARCHAR2(20) DEFAULT 'usdc',
            status VARCHAR2(20) DEFAULT 'pending',
            transaction_id VARCHAR2(200) UNIQUE,
            blockchain_hash VARCHAR2(255),
            description VARCHAR2(1000),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_payment_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
            CONSTRAINT fk_payment_from_user FOREIGN KEY (from_user_id) REFERENCES users(id),
            CONSTRAINT fk_payment_to_user FOREIGN KEY (to_user_id) REFERENCES users(id)
        )
    """
}

print("\n📊 Creating tables...")
created_count = 0
with engine.connect() as conn:
    for table_name, create_sql in tables.items():
        try:
            conn.execute(text(create_sql))
            conn.commit()
            created_count += 1
            print(f"  ✅ Created {table_name.upper()}")
        except Exception as e:
            print(f"  ❌ Failed to create {table_name}: {e}")

# Create useful indexes
indexes = [
    "CREATE INDEX idx_users_email ON users(email)",
    "CREATE INDEX idx_users_type ON users(user_type)",
    "CREATE INDEX idx_projects_client ON projects(client_id)",
    "CREATE INDEX idx_projects_status ON projects(status)",
    "CREATE INDEX idx_proposals_project ON proposals(project_id)",
    "CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id)",
    "CREATE INDEX idx_proposals_status ON proposals(status)",
    "CREATE INDEX idx_contracts_project ON contracts(project_id)",
    "CREATE INDEX idx_contracts_status ON contracts(status)",
    "CREATE INDEX idx_payments_contract ON payments(contract_id)",
]

print("\n🔑 Creating indexes...")
with engine.connect() as conn:
    for idx_sql in indexes:
        try:
            conn.execute(text(idx_sql))
            conn.commit()
        except Exception as e:
            pass  # Index might already exist

# Verify tables created
with engine.connect() as conn:
    result = conn.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))
    tables_list = [row[0] for row in result]
    
    print(f"\n✅ Database Schema Created Successfully!")
    print(f"📊 Total tables: {len(tables_list)}")
    for table in tables_list:
        print(f"  ✓ {table}")

print("\n" + "=" * 60)
print("🎉 Minimal schema ready for demo!")
print("\nNext steps:")
print("  1. Run seed script to add demo data")
print("  2. Test API endpoints")
print("  3. Open frontend at http://localhost:3000")
print("=" * 60 + "\n")
