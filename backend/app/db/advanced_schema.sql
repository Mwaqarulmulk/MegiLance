-- @AI-HINT: Database schema for advanced features: multi-factor auth, multi-currency, security events, etc.
-- MegiLance Advanced Features Database Schema
-- Version: 2.0
-- Date: 2025-12-06

-- ============================================================================
-- SECURITY TABLES
-- ============================================================================

-- Multi-Factor Authentication Methods
CREATE TABLE IF NOT EXISTS mfa_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method VARCHAR(20) NOT NULL,  -- 'totp', 'sms', 'email', 'webauthn', 'hardware_key'
    secret TEXT,  -- Encrypted secret for TOTP
    contact VARCHAR(255),  -- Phone/email for SMS/email MFA
    verification_code VARCHAR(10),
    code_expires_at TIMESTAMP,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    public_key TEXT,  -- For WebAuthn
    credential_id TEXT,  -- For WebAuthn
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mfa_user ON mfa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_method ON mfa_methods(method);

-- MFA Backup Codes
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_backup_user ON mfa_backup_codes(user_id);

-- Security Events Log
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type VARCHAR(50) NOT NULL,  -- 'login_attempt', 'mfa_failed', 'password_change', etc.
    severity VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location TEXT,  -- JSON: {country, city, lat, lon}
    metadata TEXT,  -- JSON: additional event data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_security_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_created ON security_events(created_at);

-- IP Whitelist
CREATE TABLE IF NOT EXISTS ip_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ip_whitelist_user ON ip_whitelist(user_id);

-- ============================================================================
-- FINANCIAL TABLES
-- ============================================================================

-- Exchange Rates Cache
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(20, 10) NOT NULL,
    provider VARCHAR(50),  -- 'coingecko', 'exchangerate-api', etc.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_updated ON exchange_rates(updated_at);

-- Multi-Currency Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    converted_amount DECIMAL(20, 8),
    recipient_currency VARCHAR(10),
    exchange_rate DECIMAL(20, 10),
    platform_fee DECIMAL(20, 8),
    payment_method VARCHAR(50),  -- 'stripe', 'crypto', 'bank_transfer'
    payment_provider VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    tx_hash VARCHAR(100),  -- For crypto transactions
    network VARCHAR(50),  -- 'ethereum', 'polygon', 'bitcoin', etc.
    metadata TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_trans_from ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_trans_to ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_trans_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at);

-- Cryptocurrency Wallets
CREATE TABLE IF NOT EXISTS crypto_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cryptocurrency VARCHAR(10) NOT NULL,  -- 'BTC', 'ETH', 'USDC', etc.
    network VARCHAR(50) NOT NULL,  -- 'ethereum', 'polygon', 'bitcoin', etc.
    wallet_address VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    is_verified BOOLEAN DEFAULT 0,
    label VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_crypto ON crypto_wallets(cryptocurrency);

-- Payouts
CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payout_method VARCHAR(50),  -- 'stripe', 'crypto', 'bank_transfer', 'paypal'
    destination TEXT,  -- Wallet address, bank account, etc.
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    error_message TEXT,
    processing_fee DECIMAL(20, 8),
    net_amount DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_payout_user ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payouts(status);

-- ============================================================================
-- VIDEO COMMUNICATION TABLES
-- ============================================================================

-- Video Call Sessions
CREATE TABLE IF NOT EXISTS video_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    participant_ids TEXT,  -- JSON array of user IDs
    room_id VARCHAR(100) UNIQUE NOT NULL,
    call_type VARCHAR(20),  -- 'one_on_one', 'group', 'screen_share'
    status VARCHAR(20) DEFAULT 'scheduled',  -- 'scheduled', 'ongoing', 'ended', 'cancelled'
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    recording_url TEXT,
    metadata TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_call_host ON video_calls(host_id);
CREATE INDEX IF NOT EXISTS idx_call_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_call_scheduled ON video_calls(scheduled_at);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- User Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_properties TEXT,  -- JSON
    session_id VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- Business Metrics
CREATE TABLE IF NOT EXISTS business_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 2),
    metric_type VARCHAR(50),  -- 'revenue', 'users', 'projects', etc.
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    metadata TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON business_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON business_metrics(period_start, period_end);

-- ============================================================================
-- COLLABORATION TABLES
-- ============================================================================

-- Project Files
CREATE TABLE IF NOT EXISTS project_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    uploaded_by INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    parent_version INTEGER,  -- For version control
    is_latest BOOLEAN DEFAULT 1,
    annotations TEXT,  -- JSON: comments, markups
    metadata TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (parent_version) REFERENCES project_files(id)
);

CREATE INDEX IF NOT EXISTS idx_file_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploader ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_latest ON project_files(is_latest);

-- Real-time Collaboration Sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    file_id INTEGER,
    session_type VARCHAR(50),  -- 'code_editor', 'whiteboard', 'document'
    participants TEXT,  -- JSON array of user IDs
    session_data TEXT,  -- JSON: current state
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES project_files(id)
);

CREATE INDEX IF NOT EXISTS idx_collab_project ON collaboration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_collab_active ON collaboration_sessions(is_active);

-- ============================================================================
-- AI/ML TABLES
-- ============================================================================

-- AI Model Predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) NOT NULL,
    prediction_type VARCHAR(50),  -- 'price', 'match_score', 'fraud_risk', etc.
    input_data TEXT,  -- JSON
    prediction_result TEXT,  -- JSON
    confidence_score DECIMAL(5, 4),
    actual_outcome TEXT,  -- For model training
    feedback_score INTEGER,  -- User feedback on prediction quality
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_prediction_model ON ai_predictions(model_name);
CREATE INDEX IF NOT EXISTS idx_prediction_type ON ai_predictions(prediction_type);

-- Fraud Detection Alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    alert_type VARCHAR(50),  -- 'fake_profile', 'payment_fraud', 'collusion', etc.
    severity VARCHAR(20),  -- 'low', 'medium', 'high', 'critical'
    risk_score DECIMAL(5, 2),
    evidence TEXT,  -- JSON: detected patterns
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'investigating', 'resolved', 'false_positive'
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_fraud_user ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_severity ON fraud_alerts(severity);

-- ============================================================================
-- COMPLIANCE TABLES
-- ============================================================================

-- GDPR Data Requests
CREATE TABLE IF NOT EXISTS gdpr_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_type VARCHAR(50),  -- 'access', 'delete', 'portability', 'rectification'
    status VARCHAR(20) DEFAULT 'pending',
    request_data TEXT,  -- JSON
    response_data TEXT,  -- JSON: packaged user data
    processed_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gdpr_user ON gdpr_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_status ON gdpr_requests(status);

-- Tax Documents
CREATE TABLE IF NOT EXISTS tax_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tax_year INTEGER NOT NULL,
    document_type VARCHAR(50),  -- '1099', 'W-9', 'VAT', etc.
    country VARCHAR(2),
    total_earnings DECIMAL(20, 2),
    tax_withheld DECIMAL(20, 2),
    document_path TEXT,
    status VARCHAR(20) DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tax_user ON tax_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_year ON tax_documents(tax_year);

-- ============================================================================
-- GAMIFICATION TABLES (Enhanced)
-- ============================================================================

-- User Achievements (Extended)
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    nft_token_id VARCHAR(100),  -- For blockchain achievements
    nft_contract_address VARCHAR(100),
    metadata TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievement_user ON user_achievements(user_id);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_name VARCHAR(100) NOT NULL,
    period VARCHAR(20),  -- 'daily', 'weekly', 'monthly', 'all_time'
    category VARCHAR(50),
    rankings TEXT,  -- JSON: [{user_id, score, rank}]
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_name ON leaderboards(board_name);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboards(period_start, period_end);

-- ============================================================================
-- UPDATES TO EXISTING TABLES
-- ============================================================================

-- Add columns to users table (if not exists)
ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN kyc_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN kyc_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN risk_score DECIMAL(5, 2) DEFAULT 0.0;
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;

-- Add columns to user_sessions table
ALTER TABLE user_sessions ADD COLUMN device_fingerprint VARCHAR(64);
ALTER TABLE user_sessions ADD COLUMN device_info TEXT;  -- JSON
ALTER TABLE user_sessions ADD COLUMN location TEXT;  -- JSON: geo data
ALTER TABLE user_sessions ADD COLUMN last_activity TIMESTAMP;

-- Add columns to projects table
ALTER TABLE projects ADD COLUMN collaboration_enabled BOOLEAN DEFAULT 0;
ALTER TABLE projects ADD COLUMN requires_nda BOOLEAN DEFAULT 0;
ALTER TABLE projects ADD COLUMN estimated_duration_hours INTEGER;
ALTER TABLE projects ADD COLUMN complexity_score INTEGER;

-- Add columns to contracts table
ALTER TABLE contracts ADD COLUMN auto_milestone_release BOOLEAN DEFAULT 0;
ALTER TABLE contracts ADD COLUMN escrow_auto_fund BOOLEAN DEFAULT 0;
ALTER TABLE contracts ADD COLUMN blockchain_contract_address VARCHAR(100);
ALTER TABLE contracts ADD COLUMN blockchain_network VARCHAR(50);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- User Activity Summary
CREATE VIEW IF NOT EXISTS vw_user_activity AS
SELECT 
    u.id,
    u.email,
    u.user_type,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT pr.id) as total_proposals,
    COUNT(DISTINCT c.id) as total_contracts,
    SUM(pay.amount) as total_earnings,
    u.account_balance,
    u.created_at as user_since
FROM users u
LEFT JOIN projects p ON (u.id = p.client_id OR u.id = (SELECT freelancer_id FROM contracts WHERE project_id = p.id LIMIT 1))
LEFT JOIN proposals pr ON u.id = pr.freelancer_id
LEFT JOIN contracts c ON u.id = c.freelancer_id
LEFT JOIN payments pay ON u.id = pay.to_user_id
GROUP BY u.id;

-- Revenue Analytics
CREATE VIEW IF NOT EXISTS vw_revenue_analytics AS
SELECT 
    DATE(created_at) as date,
    currency,
    COUNT(*) as transaction_count,
    SUM(amount) as gross_volume,
    SUM(platform_fee) as platform_revenue,
    AVG(amount) as avg_transaction_value
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at), currency;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_currency ON users(preferred_currency);
CREATE INDEX IF NOT EXISTS idx_projects_complexity ON projects(complexity_score);
CREATE INDEX IF NOT EXISTS idx_contracts_blockchain ON contracts(blockchain_contract_address);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_mfa_timestamp 
AFTER UPDATE ON mfa_methods
BEGIN
    UPDATE mfa_methods SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_exchange_timestamp 
AFTER UPDATE ON exchange_rates
BEGIN
    UPDATE exchange_rates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- DONE
-- ============================================================================

-- Verification query
SELECT 'Advanced schema created successfully!' as status;
