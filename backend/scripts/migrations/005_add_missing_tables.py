# @AI-HINT: Migration 005 — Add missing tables for new API routers
# Tables: notification_preferences, wallet_transactions, fraud_alerts, support_messages

MIGRATION_NAME = "005_add_missing_tables"

SQL_STATEMENTS = [
    # notification_preferences table
    """CREATE TABLE IF NOT EXISTS notification_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email_notifications BOOLEAN DEFAULT 1,
        push_notifications BOOLEAN DEFAULT 1,
        proposal_alerts BOOLEAN DEFAULT 1,
        project_alerts BOOLEAN DEFAULT 1,
        message_alerts BOOLEAN DEFAULT 1,
        payment_alerts BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )""",

    # wallet_transactions table
    """CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount FLOAT NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        reference_id VARCHAR(100),
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )""",

    # fraud_alerts table
    """CREATE TABLE IF NOT EXISTS fraud_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reporter_id INTEGER,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        resolution TEXT,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(reporter_id) REFERENCES users(id)
    )""",

    # support_messages table
    """CREATE TABLE IF NOT EXISTS support_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY(ticket_id) REFERENCES support_tickets(id),
        FOREIGN KEY(sender_id) REFERENCES users(id)
    )""",

    # Add missing columns to users table (enhanced profile fields)
    """ALTER TABLE users ADD COLUMN tagline VARCHAR(200)""",
    """ALTER TABLE users ADD COLUMN headline VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN experience_level VARCHAR(50)""",
    """ALTER TABLE users ADD COLUMN years_of_experience INTEGER""",
    """ALTER TABLE users ADD COLUMN languages TEXT""",
    """ALTER TABLE users ADD COLUMN timezone VARCHAR(100)""",
    """ALTER TABLE users ADD COLUMN availability_status VARCHAR(20) DEFAULT 'available'""",
    """ALTER TABLE users ADD COLUMN education TEXT""",
    """ALTER TABLE users ADD COLUMN certifications TEXT""",
    """ALTER TABLE users ADD COLUMN work_history TEXT""",
    """ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN github_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN website_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN twitter_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN dribbble_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN behance_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN stackoverflow_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN phone_number VARCHAR(50)""",
    """ALTER TABLE users ADD COLUMN video_intro_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN resume_url VARCHAR(500)""",
    """ALTER TABLE users ADD COLUMN availability_hours VARCHAR(50)""",
    """ALTER TABLE users ADD COLUMN preferred_project_size VARCHAR(50)""",
    """ALTER TABLE users ADD COLUMN industry_focus TEXT""",
    """ALTER TABLE users ADD COLUMN tools_and_technologies TEXT""",
    """ALTER TABLE users ADD COLUMN achievements TEXT""",
    """ALTER TABLE users ADD COLUMN testimonials_enabled BOOLEAN DEFAULT 1""",
    """ALTER TABLE users ADD COLUMN contact_preferences TEXT""",
    """ALTER TABLE users ADD COLUMN profile_visibility VARCHAR(20) DEFAULT 'public'""",
    """ALTER TABLE users ADD COLUMN profile_slug VARCHAR(100)""",
    """ALTER TABLE users ADD COLUMN profile_views INTEGER DEFAULT 0""",
    """ALTER TABLE users ADD COLUMN seller_level VARCHAR(20) DEFAULT 'new_seller'""",
    """ALTER TABLE users ADD COLUMN company_name VARCHAR(200)""",
    """ALTER TABLE users ADD COLUMN industry VARCHAR(100)""",
    """ALTER TABLE users ADD COLUMN company_size VARCHAR(50)""",

    # Add missing columns to reviews table
    """ALTER TABLE reviews ADD COLUMN communication_rating INTEGER""",
    """ALTER TABLE reviews ADD COLUMN quality_rating INTEGER""",
    """ALTER TABLE reviews ADD COLUMN deadline_rating INTEGER""",
    """ALTER TABLE reviews ADD COLUMN professionalism_rating INTEGER""",
    """ALTER TABLE reviews ADD COLUMN would_recommend BOOLEAN DEFAULT 1""",
    """ALTER TABLE reviews ADD COLUMN is_public BOOLEAN DEFAULT 1""",
    """ALTER TABLE reviews ADD COLUMN response TEXT""",

    # Add missing columns to notifications table
    """ALTER TABLE notifications ADD COLUMN link VARCHAR(500)""",
]
