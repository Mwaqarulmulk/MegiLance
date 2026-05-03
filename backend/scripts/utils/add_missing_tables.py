# @AI-HINT: Script to add missing tables to the local SQLite database
import sqlite3

conn = sqlite3.connect('local_dev.db')
cursor = conn.cursor()

# Create missing tables one by one
tables = [
    ("scope_change_requests", '''CREATE TABLE IF NOT EXISTS scope_change_requests (
        id INTEGER NOT NULL PRIMARY KEY, 
        contract_id INTEGER NOT NULL, 
        requested_by INTEGER NOT NULL, 
        title VARCHAR(255) NOT NULL, 
        description TEXT NOT NULL, 
        reason TEXT, 
        status VARCHAR(20) NOT NULL DEFAULT 'pending', 
        old_amount FLOAT, 
        new_amount FLOAT, 
        old_deadline DATETIME, 
        new_deadline DATETIME, 
        created_at DATETIME NOT NULL, 
        updated_at DATETIME NOT NULL, 
        resolved_at DATETIME, 
        FOREIGN KEY(contract_id) REFERENCES contracts (id), 
        FOREIGN KEY(requested_by) REFERENCES users (id)
    )'''),
    ("referrals", '''CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER NOT NULL PRIMARY KEY, 
        referrer_id INTEGER NOT NULL, 
        referred_email VARCHAR(255) NOT NULL, 
        referred_user_id INTEGER, 
        status VARCHAR(20) NOT NULL DEFAULT 'pending', 
        referral_code VARCHAR(50) NOT NULL UNIQUE, 
        reward_amount FLOAT NOT NULL DEFAULT 0.0, 
        is_paid BOOLEAN NOT NULL DEFAULT 0, 
        created_at DATETIME NOT NULL, 
        updated_at DATETIME NOT NULL, 
        completed_at DATETIME, 
        FOREIGN KEY(referrer_id) REFERENCES users (id), 
        FOREIGN KEY(referred_user_id) REFERENCES users (id)
    )'''),
    ("user_verifications", '''CREATE TABLE IF NOT EXISTS user_verifications (
        user_id INTEGER NOT NULL PRIMARY KEY, 
        kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending', 
        identity_doc_url VARCHAR(500), 
        company_name VARCHAR(255), 
        company_reg_number VARCHAR(100), 
        tax_id VARCHAR(100), 
        verified_at DATETIME, 
        updated_at DATETIME NOT NULL, 
        FOREIGN KEY(user_id) REFERENCES users (id)
    )'''),
    ("analytics_events", '''CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER NOT NULL PRIMARY KEY, 
        event_type VARCHAR(50) NOT NULL, 
        user_id INTEGER, 
        session_id VARCHAR(255), 
        entity_type VARCHAR(50), 
        entity_id INTEGER, 
        event_data TEXT, 
        ip_address VARCHAR(45), 
        user_agent VARCHAR(500), 
        created_at DATETIME NOT NULL
    )'''),
    ("project_embeddings", '''CREATE TABLE IF NOT EXISTS project_embeddings (
        project_id INTEGER NOT NULL PRIMARY KEY, 
        embedding_vector BLOB, 
        model_version VARCHAR(50), 
        updated_at DATETIME NOT NULL, 
        FOREIGN KEY(project_id) REFERENCES projects (id)
    )'''),
    ("user_embeddings", '''CREATE TABLE IF NOT EXISTS user_embeddings (
        user_id INTEGER NOT NULL PRIMARY KEY, 
        embedding_vector BLOB, 
        model_version VARCHAR(50), 
        updated_at DATETIME NOT NULL, 
        FOREIGN KEY(user_id) REFERENCES users (id)
    )''')
]

for name, sql in tables:
    try:
        cursor.execute(sql)
        print(f"✅ Created: {name}")
    except Exception as e:
        print(f"❌ {name}: {e}")

conn.commit()
conn.close()
print("\n✅ All missing tables added successfully!")
