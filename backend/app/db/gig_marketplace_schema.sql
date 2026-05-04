-- @AI-HINT: Gig Marketplace Schema - Fiverr-style service packages and seller tier system
-- This migration creates tables for gigs, orders, reviews, seller stats, and talent invitations

-- ===========================
-- GIG MARKETPLACE TABLES
-- ===========================

-- Gigs table - Fiverr-style service listings with 3-tier packages
CREATE TABLE IF NOT EXISTS gigs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    category_id INTEGER,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_review', 'active', 'paused', 'rejected', 'archived')),
    
    -- 3-tier package pricing (Basic/Standard/Premium)
    basic_title TEXT DEFAULT 'Basic',
    basic_description TEXT,
    basic_price REAL NOT NULL DEFAULT 5.00,
    basic_delivery_days INTEGER NOT NULL DEFAULT 3,
    basic_revisions INTEGER DEFAULT 1,
    basic_features TEXT, -- JSON array of feature strings
    
    standard_title TEXT DEFAULT 'Standard',
    standard_description TEXT,
    standard_price REAL,
    standard_delivery_days INTEGER,
    standard_revisions INTEGER DEFAULT 2,
    standard_features TEXT, -- JSON array
    
    premium_title TEXT DEFAULT 'Premium',
    premium_description TEXT,
    premium_price REAL,
    premium_delivery_days INTEGER,
    premium_revisions INTEGER DEFAULT 3,
    premium_features TEXT, -- JSON array
    
    -- Gig extras (add-ons buyers can select)
    extras TEXT, -- JSON array of {title, description, price, delivery_days}
    
    -- Requirements from buyer
    requirements TEXT, -- JSON array of {question, type, required}
    
    -- Media
    images TEXT, -- JSON array of image URLs
    video_url TEXT,
    thumbnail_url TEXT,
    
    -- SEO and discovery
    tags TEXT, -- JSON array of tag strings
    search_tags TEXT, -- JSON array for internal search optimization
    
    -- Stats
    orders_completed INTEGER DEFAULT 0,
    orders_in_progress INTEGER DEFAULT 0,
    rating_average REAL DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- Promotion
    is_featured BOOLEAN DEFAULT 0,
    is_promoted BOOLEAN DEFAULT 0,
    promotion_expires_at TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    published_at TEXT,
    
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Gig FAQs
CREATE TABLE IF NOT EXISTS gig_faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gig_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);

-- Gig Orders
CREATE TABLE IF NOT EXISTS gig_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    gig_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    
    -- Package details
    package_tier TEXT NOT NULL CHECK(package_tier IN ('basic', 'standard', 'premium')),
    package_title TEXT NOT NULL,
    package_description TEXT,
    quantity INTEGER DEFAULT 1,
    
    -- Pricing
    base_price REAL NOT NULL,
    extras_price REAL DEFAULT 0.00,
    service_fee REAL DEFAULT 0.00,
    total_price REAL NOT NULL,
    
    -- Status and workflow
    status TEXT DEFAULT 'pending_requirements' CHECK(status IN (
        'pending_requirements', 'in_progress', 'revision_requested', 
        'delivered', 'completed', 'cancelled', 'disputed'
    )),
    
    -- Timeline
    delivery_days INTEGER NOT NULL,
    deadline TEXT,
    delivered_at TEXT,
    completed_at TEXT,
    cancelled_at TEXT,
    
    -- Revisions
    revisions_allowed INTEGER DEFAULT 0,
    revisions_used INTEGER DEFAULT 0,
    
    -- Requirements submitted by buyer
    buyer_requirements TEXT, -- JSON object with answers to gig requirements
    requirements_submitted_at TEXT,
    
    -- Selected extras
    selected_extras TEXT, -- JSON array of selected extra IDs/details
    
    -- Notes
    buyer_notes TEXT,
    seller_notes TEXT,
    cancellation_reason TEXT,
    
    -- Extension tracking
    original_deadline TEXT,
    extension_days INTEGER DEFAULT 0,
    extension_reason TEXT,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'released', 'refunded')),
    payment_released_at TEXT,
    
    -- Tip/bonus
    tip_amount REAL DEFAULT 0.00,
    tip_paid_at TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gig Deliveries (each order can have multiple delivery attempts)
CREATE TABLE IF NOT EXISTS gig_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    delivery_number INTEGER NOT NULL,
    message TEXT,
    files TEXT, -- JSON array of {filename, url, size, type}
    source_files TEXT, -- JSON array (for source file deliveries)
    is_final BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (order_id) REFERENCES gig_orders(id) ON DELETE CASCADE,
    UNIQUE(order_id, delivery_number)
);

-- Gig Revisions (revision requests and responses)
CREATE TABLE IF NOT EXISTS gig_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    revision_number INTEGER NOT NULL,
    requester_id INTEGER NOT NULL, -- buyer who requested
    request_description TEXT NOT NULL,
    request_files TEXT, -- JSON array of attachments
    response_message TEXT,
    response_files TEXT, -- JSON array
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'delivered', 'accepted')),
    is_extra BOOLEAN DEFAULT 0, -- if this revision is paid
    extra_cost REAL DEFAULT 0.00,
    created_at TEXT DEFAULT (datetime('now')),
    responded_at TEXT,
    
    FOREIGN KEY (order_id) REFERENCES gig_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(order_id, revision_number)
);

-- Gig Reviews (multi-category ratings like Fiverr)
CREATE TABLE IF NOT EXISTS gig_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    gig_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL, -- buyer
    seller_id INTEGER NOT NULL,
    
    -- Multi-category ratings (1-5)
    rating_communication INTEGER NOT NULL CHECK(rating_communication BETWEEN 1 AND 5),
    rating_service INTEGER NOT NULL CHECK(rating_service BETWEEN 1 AND 5),
    rating_delivery INTEGER NOT NULL CHECK(rating_delivery BETWEEN 1 AND 5),
    rating_recommendation INTEGER NOT NULL CHECK(rating_recommendation BETWEEN 1 AND 5),
    rating_overall REAL, -- calculated average
    
    -- Review content
    review_text TEXT,
    review_images TEXT, -- JSON array of image URLs
    
    -- Seller response
    seller_response TEXT,
    seller_responded_at TEXT,
    
    -- Private feedback to seller (not public)
    private_feedback TEXT,
    
    -- Moderation
    is_public BOOLEAN DEFAULT 1,
    is_verified_purchase BOOLEAN DEFAULT 1,
    helpful_votes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (order_id) REFERENCES gig_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(order_id) -- one review per order
);

-- ===========================
-- SELLER TIER SYSTEM
-- ===========================

-- Seller Stats - tracks metrics for tier calculation
CREATE TABLE IF NOT EXISTS seller_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    
    -- Current level
    level TEXT DEFAULT 'new_seller' CHECK(level IN ('new_seller', 'bronze', 'silver', 'gold', 'platinum')),
    level_updated_at TEXT,
    
    -- Order metrics (last 60 days for JSS calculation)
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    disputed_orders INTEGER DEFAULT 0,
    
    -- Rolling 60-day metrics
    orders_last_60d INTEGER DEFAULT 0,
    completed_last_60d INTEGER DEFAULT 0,
    on_time_delivery_rate REAL DEFAULT 100.0,
    completion_rate REAL DEFAULT 100.0,
    
    -- Response metrics
    avg_response_time_hours REAL DEFAULT 0.0,
    response_rate REAL DEFAULT 100.0,
    
    -- Revenue
    total_earnings REAL DEFAULT 0.00,
    earnings_last_60d REAL DEFAULT 0.00,
    
    -- Ratings
    average_rating REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    five_star_reviews INTEGER DEFAULT 0,
    
    -- Repeat clients
    repeat_client_rate REAL DEFAULT 0.0,
    unique_clients INTEGER DEFAULT 0,
    repeat_clients INTEGER DEFAULT 0,
    
    -- Job Success Score (JSS) - Upwork style
    jss_score REAL DEFAULT 0.0, -- 0-100
    jss_calculated_at TEXT,
    
    -- Badges
    badges TEXT, -- JSON array of earned badge IDs
    
    -- Account standing
    warnings_count INTEGER DEFAULT 0,
    last_warning_at TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- TALENT INVITATIONS
-- ===========================

-- Talent Invitations - clients invite specific freelancers
CREATE TABLE IF NOT EXISTS talent_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    freelancer_id INTEGER NOT NULL,
    
    -- Invitation content
    message TEXT,
    suggested_rate REAL,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    response_message TEXT,
    responded_at TEXT,
    
    -- Expiry (default 7 days)
    expires_at TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, freelancer_id) -- one invitation per freelancer per project
);

-- ===========================
-- INDEXES FOR PERFORMANCE
-- ===========================

CREATE INDEX IF NOT EXISTS idx_gigs_seller ON gigs(seller_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_slug ON gigs(slug);

CREATE INDEX IF NOT EXISTS idx_gig_orders_buyer ON gig_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gig_orders_seller ON gig_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_gig_orders_gig ON gig_orders(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_orders_status ON gig_orders(status);
CREATE INDEX IF NOT EXISTS idx_gig_orders_number ON gig_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_gig_reviews_gig ON gig_reviews(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_reviews_seller ON gig_reviews(seller_id);

CREATE INDEX IF NOT EXISTS idx_seller_stats_user ON seller_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_stats_level ON seller_stats(level);

CREATE INDEX IF NOT EXISTS idx_talent_invitations_project ON talent_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_talent_invitations_freelancer ON talent_invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_talent_invitations_status ON talent_invitations(status);

-- ===========================
-- USER TABLE UPDATES (add missing columns)
-- ===========================

-- Add new columns to users table if they don't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, 
-- so these might fail if columns already exist - that's OK

-- These are handled separately to avoid errors
