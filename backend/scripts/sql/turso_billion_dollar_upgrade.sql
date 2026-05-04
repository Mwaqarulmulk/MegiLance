-- Billion Dollar Upgrade Schema Changes

-- Ensure base tables exist (if missing from initial migration)
CREATE TABLE IF NOT EXISTS portfolio_items (
	id INTEGER PRIMARY KEY, 
	freelancer_id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	image_url VARCHAR(500) NOT NULL, 
	project_url VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	FOREIGN KEY(freelancer_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS milestones (
	id INTEGER PRIMARY KEY, 
	contract_id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	amount FLOAT NOT NULL, 
	due_date DATETIME NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	deliverables TEXT, 
	submitted_at DATETIME, 
	approved_at DATETIME, 
	paid_at DATETIME, 
	feedback TEXT, 
	order_index INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	FOREIGN KEY(contract_id) REFERENCES contracts (id)
);

-- 1. Scope Change Requests
-- Handles negotiation of scope changes within active contracts
CREATE TABLE IF NOT EXISTS scope_change_requests (
    id INTEGER PRIMARY KEY,
    contract_id INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL, 
    reason TEXT,
    status VARCHAR(20) NOT NULL, -- pending, approved, rejected, cancelled
    old_amount FLOAT,
    new_amount FLOAT,
    old_deadline DATETIME,
    new_deadline DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    resolved_at DATETIME,
    FOREIGN KEY(contract_id) REFERENCES contracts(id),
    FOREIGN KEY(requested_by) REFERENCES users(id)
);

-- 2. Analytics Events
-- High-volume append-only table for business intelligence and AI training
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- search, click, view, proposal_sent, milestone_completed
    user_id INTEGER, -- Nullable for anonymous users
    session_id VARCHAR(255),
    entity_type VARCHAR(50), -- project, profile, gig, etc.
    entity_id INTEGER,
    event_data TEXT, -- JSON payload with specific details
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at DATETIME NOT NULL
);

-- 3. AI Embeddings (Placeholder for Vector Search)
-- These tables will store vector embeddings for semantic search
-- Note: 'VECTOR' type requires libSQL with vector extension. 
-- If running on standard SQLite, these might need to be BLOBs or managed differently.
CREATE TABLE IF NOT EXISTS project_embeddings (
    project_id INTEGER PRIMARY KEY,
    embedding_vector BLOB, -- Storing as BLOB for compatibility, can be cast to VECTOR in Turso
    model_version VARCHAR(50),
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS user_embeddings (
    user_id INTEGER PRIMARY KEY,
    embedding_vector BLOB,
    model_version VARCHAR(50),
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 4. Enhanced Profile Fields (Optional - if not adding columns to users table directly)
-- We can use a separate table for extended verification info to keep users table clean
CREATE TABLE IF NOT EXISTS user_verifications (
    user_id INTEGER PRIMARY KEY,
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    identity_doc_url VARCHAR(500),
    company_name VARCHAR(255),
    company_reg_number VARCHAR(100),
    tax_id VARCHAR(100),
    verified_at DATETIME,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
