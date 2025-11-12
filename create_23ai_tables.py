#!/usr/bin/env python3
"""
Create tables in 23ai database using raw SQL
"""
import oracledb

print("🚀 Creating tables in 23ai database...")

conn = oracledb.connect(
    user='ADMIN',
    password='Bfw5ZvHQXjkDb!3lAa1!',
    dsn='megilanceai_high',
    config_dir='/app/oracle-wallet-23ai',
    wallet_location='/app/oracle-wallet-23ai',
    wallet_password='MegiLance2025!Wallet'
)

cursor = conn.cursor()

# Create USERS table
cursor.execute("""
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    hashed_password VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(255),
    role VARCHAR2(50) NOT NULL,
    profile_data CLOB,
    is_active NUMBER(1) DEFAULT 1,
    is_verified NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✅ USERS table created")

# Create SKILLS table
cursor.execute("""
CREATE TABLE skills (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL UNIQUE,
    category VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✅ SKILLS table created")

# Create PROJECTS table
cursor.execute("""
CREATE TABLE projects (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR2(255) NOT NULL,
    description CLOB,
    budget_min NUMBER(10,2),
    budget_max NUMBER(10,2),
    deadline TIMESTAMP,
    status VARCHAR2(50) DEFAULT 'open',
    client_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES users(id)
)
""")
print("✅ PROJECTS table created")

# Create PROPOSALS table
cursor.execute("""
CREATE TABLE proposals (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    freelancer_id NUMBER NOT NULL,
    cover_letter CLOB,
    bid_amount NUMBER(10,2) NOT NULL,
    delivery_time NUMBER,
    status VARCHAR2(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proposal_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_proposal_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id)
)
""")
print("✅ PROPOSALS table created")

# Create CONTRACTS table
cursor.execute("""
CREATE TABLE contracts (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    freelancer_id NUMBER NOT NULL,
    client_id NUMBER NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    status VARCHAR2(50) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    terms CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contract_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_contract_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id),
    CONSTRAINT fk_contract_client FOREIGN KEY (client_id) REFERENCES users(id)
)
""")
print("✅ CONTRACTS table created")

# Create PAYMENTS table
cursor.execute("""
CREATE TABLE payments (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id NUMBER NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    status VARCHAR2(50) DEFAULT 'pending',
    payment_method VARCHAR2(100),
    transaction_id VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_contract FOREIGN KEY (contract_id) REFERENCES contracts(id)
)
""")
print("✅ PAYMENTS table created")

conn.commit()

# Verify tables
cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
tables = [row[0] for row in cursor.fetchall()]
print(f"\n✅ Created {len(tables)} tables:")
for table in tables:
    print(f"   - {table}")

cursor.close()
conn.close()

print("\n🎉 23ai database schema created successfully!")
