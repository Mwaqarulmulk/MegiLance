CREATE TABLE users (
	id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	first_name VARCHAR(100), 
	last_name VARCHAR(100), 
	is_active BOOLEAN NOT NULL, 
	is_verified BOOLEAN NOT NULL, 
	email_verified BOOLEAN NOT NULL, 
	email_verification_token VARCHAR(255), 
	name VARCHAR(255), 
	role VARCHAR(50) NOT NULL, 
	two_factor_enabled BOOLEAN NOT NULL, 
	two_factor_secret VARCHAR(255), 
	two_factor_backup_codes TEXT, 
	password_reset_token VARCHAR(255), 
	password_reset_expires DATETIME, 
	last_password_changed DATETIME, 
	user_type VARCHAR(20), 
	bio TEXT, 
	skills TEXT, 
	hourly_rate FLOAT, 
	profile_image_url VARCHAR(500), 
	location VARCHAR(100), 
	profile_data TEXT, 
	notification_preferences TEXT, 
	account_balance FLOAT NOT NULL, 
	created_by INTEGER, 
	joined_at DATETIME NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);

CREATE TABLE skills (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	category VARCHAR(100), 
	description TEXT, 
	icon_url VARCHAR(500), 
	is_active BOOLEAN NOT NULL, 
	sort_order INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE categories (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	slug VARCHAR(100) NOT NULL, 
	description VARCHAR(500), 
	icon VARCHAR(100), 
	parent_id INTEGER, 
	is_active BOOLEAN NOT NULL, 
	project_count INTEGER NOT NULL, 
	sort_order INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(parent_id) REFERENCES categories (id)
);

CREATE TABLE tags (
	id INTEGER NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	slug VARCHAR(50) NOT NULL, 
	type VARCHAR(20) NOT NULL, 
	usage_count INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE user_skills (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	skill_id INTEGER NOT NULL, 
	proficiency_level INTEGER NOT NULL, 
	years_of_experience INTEGER, 
	is_verified BOOLEAN NOT NULL, 
	verified_at DATETIME, 
	verified_by INTEGER, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(skill_id) REFERENCES skills (id), 
	FOREIGN KEY(verified_by) REFERENCES users (id)
);

CREATE TABLE projects (
	id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	budget_type VARCHAR(20) NOT NULL, 
	budget_min FLOAT, 
	budget_max FLOAT, 
	experience_level VARCHAR(20) NOT NULL, 
	estimated_duration VARCHAR(50) NOT NULL, 
	skills TEXT NOT NULL, 
	client_id INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(client_id) REFERENCES users (id)
);

CREATE TABLE portfolio_items (
	id INTEGER NOT NULL, 
	freelancer_id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	image_url VARCHAR(500) NOT NULL, 
	project_url VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(freelancer_id) REFERENCES users (id)
);

CREATE TABLE notifications (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	notification_type VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	content TEXT NOT NULL, 
	data TEXT, 
	is_read BOOLEAN NOT NULL, 
	read_at DATETIME, 
	created_at DATETIME NOT NULL, 
	expires_at DATETIME, 
	priority VARCHAR(20) NOT NULL, 
	action_url VARCHAR(500), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE user_sessions (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	session_token VARCHAR(255) NOT NULL, 
	refresh_token VARCHAR(255) NOT NULL, 
	expires_at DATETIME NOT NULL, 
	ip_address VARCHAR(45), 
	user_agent VARCHAR(500), 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	last_accessed DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE audit_logs (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	entity_type VARCHAR(50) NOT NULL, 
	entity_id INTEGER, 
	action VARCHAR(50) NOT NULL, 
	old_values TEXT, 
	new_values TEXT, 
	ip_address VARCHAR(45), 
	user_agent VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE favorites (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	target_type VARCHAR(20) NOT NULL, 
	target_id INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_favorite UNIQUE (user_id, target_type, target_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE support_tickets (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	subject VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	category VARCHAR(50), 
	priority VARCHAR(20) NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	assigned_to INTEGER, 
	attachments TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	resolved_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(assigned_to) REFERENCES users (id)
);

CREATE TABLE proposals (
	id INTEGER NOT NULL, 
	project_id INTEGER NOT NULL, 
	freelancer_id INTEGER NOT NULL, 
	cover_letter TEXT NOT NULL, 
	bid_amount FLOAT NOT NULL, 
	estimated_hours INTEGER NOT NULL, 
	hourly_rate FLOAT NOT NULL, 
	availability VARCHAR(20) NOT NULL, 
	attachments TEXT, 
	status VARCHAR(20) NOT NULL, 
	is_draft BOOLEAN NOT NULL, 
	draft_data TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(freelancer_id) REFERENCES users (id)
);

CREATE TABLE conversations (
	id INTEGER NOT NULL, 
	project_id INTEGER, 
	client_id INTEGER NOT NULL, 
	freelancer_id INTEGER NOT NULL, 
	title VARCHAR(255), 
	status VARCHAR(20) NOT NULL, 
	last_message_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	is_archived BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(client_id) REFERENCES users (id), 
	FOREIGN KEY(freelancer_id) REFERENCES users (id)
);

CREATE TABLE project_tags (
	id INTEGER NOT NULL, 
	project_id INTEGER NOT NULL, 
	tag_id INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_project_tag UNIQUE (project_id, tag_id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(tag_id) REFERENCES tags (id)
);

CREATE TABLE contracts (
	id INTEGER NOT NULL, 
	contract_address VARCHAR(100), 
	project_id INTEGER NOT NULL, 
	freelancer_id INTEGER NOT NULL, 
	client_id INTEGER NOT NULL, 
	winning_bid_id INTEGER, 
	amount FLOAT NOT NULL, 
	contract_amount FLOAT NOT NULL, 
	platform_fee FLOAT NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	start_date DATETIME, 
	end_date DATETIME, 
	description TEXT, 
	milestones TEXT, 
	terms TEXT, 
	blockchain_hash VARCHAR(255), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (contract_address), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(freelancer_id) REFERENCES users (id), 
	FOREIGN KEY(client_id) REFERENCES users (id), 
	FOREIGN KEY(winning_bid_id) REFERENCES proposals (id)
);

CREATE TABLE messages (
	id INTEGER NOT NULL, 
	conversation_id INTEGER NOT NULL, 
	sender_id INTEGER NOT NULL, 
	receiver_id INTEGER NOT NULL, 
	project_id INTEGER, 
	content TEXT NOT NULL, 
	message_type VARCHAR(20) NOT NULL, 
	attachments TEXT, 
	is_read BOOLEAN NOT NULL, 
	read_at DATETIME, 
	sent_at DATETIME NOT NULL, 
	is_deleted BOOLEAN NOT NULL, 
	parent_message_id INTEGER, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id), 
	FOREIGN KEY(sender_id) REFERENCES users (id), 
	FOREIGN KEY(receiver_id) REFERENCES users (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(parent_message_id) REFERENCES messages (id)
);

CREATE TABLE reviews (
	id INTEGER NOT NULL, 
	contract_id INTEGER NOT NULL, 
	reviewer_id INTEGER NOT NULL, 
	reviewee_id INTEGER NOT NULL, 
	rating FLOAT NOT NULL, 
	comment TEXT, 
	rating_breakdown TEXT, 
	is_public BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	response_to INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(reviewer_id) REFERENCES users (id), 
	FOREIGN KEY(reviewee_id) REFERENCES users (id), 
	FOREIGN KEY(response_to) REFERENCES reviews (id)
);

CREATE TABLE disputes (
	id INTEGER NOT NULL, 
	contract_id INTEGER NOT NULL, 
	raised_by INTEGER NOT NULL, 
	dispute_type VARCHAR(50) NOT NULL, 
	description TEXT NOT NULL, 
	evidence TEXT, 
	status VARCHAR(20) NOT NULL, 
	assigned_to INTEGER, 
	created_at DATETIME NOT NULL, 
	resolved_at DATETIME, 
	resolution TEXT, 
	resolution_amount FLOAT, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(raised_by) REFERENCES users (id), 
	FOREIGN KEY(assigned_to) REFERENCES users (id)
);

CREATE TABLE milestones (
	id INTEGER NOT NULL, 
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
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id)
);

CREATE TABLE escrow (
	id INTEGER NOT NULL, 
	contract_id INTEGER NOT NULL, 
	client_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	released_amount FLOAT NOT NULL, 
	released_at DATETIME, 
	expires_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(client_id) REFERENCES users (id)
);

CREATE TABLE time_entries (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	contract_id INTEGER NOT NULL, 
	start_time DATETIME NOT NULL, 
	end_time DATETIME, 
	duration_minutes INTEGER, 
	description TEXT, 
	billable BOOLEAN NOT NULL, 
	hourly_rate FLOAT, 
	amount FLOAT, 
	status VARCHAR(20) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id)
);

CREATE TABLE payments (
	id INTEGER NOT NULL, 
	contract_id INTEGER, 
	milestone_id INTEGER, 
	from_user_id INTEGER NOT NULL, 
	to_user_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	payment_type VARCHAR(20) NOT NULL, 
	payment_method VARCHAR(20) NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	transaction_id VARCHAR(200), 
	blockchain_tx_hash VARCHAR(200), 
	payment_details TEXT, 
	platform_fee FLOAT NOT NULL, 
	freelancer_amount FLOAT NOT NULL, 
	description TEXT, 
	processed_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(milestone_id) REFERENCES milestones (id), 
	FOREIGN KEY(from_user_id) REFERENCES users (id), 
	FOREIGN KEY(to_user_id) REFERENCES users (id), 
	UNIQUE (transaction_id)
);

CREATE TABLE invoices (
	id INTEGER NOT NULL, 
	invoice_number VARCHAR(50) NOT NULL, 
	contract_id INTEGER NOT NULL, 
	from_user_id INTEGER NOT NULL, 
	to_user_id INTEGER NOT NULL, 
	subtotal FLOAT NOT NULL, 
	tax FLOAT NOT NULL, 
	total FLOAT NOT NULL, 
	due_date DATETIME, 
	paid_date DATETIME, 
	status VARCHAR(20) NOT NULL, 
	items TEXT, 
	payment_id INTEGER, 
	notes TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(from_user_id) REFERENCES users (id), 
	FOREIGN KEY(to_user_id) REFERENCES users (id), 
	FOREIGN KEY(payment_id) REFERENCES payments (id)
);

CREATE TABLE refunds (
	id INTEGER NOT NULL, 
	payment_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	reason VARCHAR(500), 
	status VARCHAR(20) NOT NULL, 
	requested_by INTEGER NOT NULL, 
	approved_by INTEGER, 
	processed_at DATETIME, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(payment_id) REFERENCES payments (id), 
	FOREIGN KEY(requested_by) REFERENCES users (id), 
	FOREIGN KEY(approved_by) REFERENCES users (id)
);

-- Scope Change Requests table for contract modifications
CREATE TABLE scope_change_requests (
	id INTEGER NOT NULL, 
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
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id), 
	FOREIGN KEY(requested_by) REFERENCES users (id)
);

-- Referrals table for referral program
CREATE TABLE referrals (
	id INTEGER NOT NULL, 
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
	PRIMARY KEY (id), 
	FOREIGN KEY(referrer_id) REFERENCES users (id), 
	FOREIGN KEY(referred_user_id) REFERENCES users (id)
);
CREATE INDEX ix_referrals_referred_email ON referrals (referred_email);
CREATE INDEX ix_referrals_referral_code ON referrals (referral_code);

-- User Verifications table for KYC
CREATE TABLE user_verifications (
	user_id INTEGER NOT NULL, 
	kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending', 
	identity_doc_url VARCHAR(500), 
	company_name VARCHAR(255), 
	company_reg_number VARCHAR(100), 
	tax_id VARCHAR(100), 
	verified_at DATETIME, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- Analytics Events table for tracking
CREATE TABLE analytics_events (
	id INTEGER NOT NULL, 
	event_type VARCHAR(50) NOT NULL, 
	user_id INTEGER, 
	session_id VARCHAR(255), 
	entity_type VARCHAR(50), 
	entity_id INTEGER, 
	event_data TEXT, 
	ip_address VARCHAR(45), 
	user_agent VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);

-- Project Embeddings table for AI matching
CREATE TABLE project_embeddings (
	project_id INTEGER NOT NULL, 
	embedding_vector BLOB, 
	model_version VARCHAR(50), 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (project_id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
);

-- User Embeddings table for AI matching
CREATE TABLE user_embeddings (
	user_id INTEGER NOT NULL,
	embedding_vector BLOB,
	model_version VARCHAR(50),
	updated_at DATETIME NOT NULL,
	PRIMARY KEY (user_id),
	FOREIGN KEY(user_id) REFERENCES users (id)
);

-- Gamification: Badges
CREATE TABLE IF NOT EXISTS badges (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	icon TEXT,
	points INTEGER NOT NULL DEFAULT 0,
	tier TEXT NOT NULL DEFAULT 'bronze',
	created_at TEXT NOT NULL
);

-- Gamification: User Badges (earned badges per user)
CREATE TABLE IF NOT EXISTS user_badges (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	badge_id INTEGER NOT NULL,
	earned_at TEXT NOT NULL,
	UNIQUE(user_id, badge_id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(badge_id) REFERENCES badges(id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Gamification: Achievements
CREATE TABLE IF NOT EXISTS achievements (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	xp INTEGER NOT NULL DEFAULT 0,
	category TEXT,
	created_at TEXT NOT NULL
);

-- Gamification: User Achievements (unlocked achievements per user)
CREATE TABLE IF NOT EXISTS user_achievements (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	achievement_id INTEGER NOT NULL,
	unlocked_at TEXT NOT NULL,
	UNIQUE(user_id, achievement_id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(achievement_id) REFERENCES achievements(id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Community: Hubs (topic groups)
CREATE TABLE IF NOT EXISTS community_hubs (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT,
	icon TEXT,
	member_count INTEGER NOT NULL DEFAULT 0,
	post_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL
);

-- Community: Posts
CREATE TABLE IF NOT EXISTS community_posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	hub_id TEXT NOT NULL DEFAULT 'general',
	post_type TEXT NOT NULL DEFAULT 'discussion',
	author_id INTEGER NOT NULL,
	likes_count INTEGER NOT NULL DEFAULT 0,
	comments_count INTEGER NOT NULL DEFAULT 0,
	views_count INTEGER NOT NULL DEFAULT 0,
	is_pinned INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT,
	FOREIGN KEY(author_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_community_posts_hub_id ON community_posts(hub_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);

-- Community: Post Likes
CREATE TABLE IF NOT EXISTS community_post_likes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	created_at TEXT NOT NULL,
	UNIQUE(post_id, user_id),
	FOREIGN KEY(post_id) REFERENCES community_posts(id),
	FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Community: Post Comments
CREATE TABLE IF NOT EXISTS community_post_comments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id INTEGER NOT NULL,
	author_id INTEGER NOT NULL,
	content TEXT NOT NULL,
	created_at TEXT NOT NULL,
	FOREIGN KEY(post_id) REFERENCES community_posts(id),
	FOREIGN KEY(author_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post_id ON community_post_comments(post_id);

-- Gig Marketplace: Gigs
CREATE TABLE IF NOT EXISTS gigs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	seller_id INTEGER NOT NULL,
	title TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	description TEXT,
	category_id INTEGER,
	subcategory TEXT,
	tags TEXT,
	basic_price REAL NOT NULL DEFAULT 0,
	standard_price REAL,
	premium_price REAL,
	basic_delivery_days INTEGER NOT NULL DEFAULT 3,
	standard_delivery_days INTEGER,
	premium_delivery_days INTEGER,
	basic_revisions INTEGER NOT NULL DEFAULT 1,
	standard_revisions INTEGER,
	premium_revisions INTEGER,
	basic_description TEXT,
	standard_description TEXT,
	premium_description TEXT,
	images TEXT,
	requirements TEXT,
	status TEXT NOT NULL DEFAULT 'draft',
	orders_count INTEGER NOT NULL DEFAULT 0,
	average_rating REAL NOT NULL DEFAULT 0,
	reviews_count INTEGER NOT NULL DEFAULT 0,
	impressions_count INTEGER NOT NULL DEFAULT 0,
	clicks_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	FOREIGN KEY(seller_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_gigs_seller_id ON gigs(seller_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_category_id ON gigs(category_id);

-- Gig Marketplace: Gig FAQs
CREATE TABLE IF NOT EXISTS gig_faqs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	gig_id INTEGER NOT NULL,
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY(gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);

-- Gig Marketplace: Gig Orders
CREATE TABLE IF NOT EXISTS gig_orders (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	gig_id INTEGER NOT NULL,
	buyer_id INTEGER NOT NULL,
	seller_id INTEGER NOT NULL,
	package_type TEXT NOT NULL DEFAULT 'basic',
	price REAL NOT NULL,
	delivery_days INTEGER NOT NULL,
	revisions INTEGER NOT NULL DEFAULT 1,
	requirements TEXT,
	status TEXT NOT NULL DEFAULT 'pending',
	due_date TEXT,
	completed_at TEXT,
	cancelled_at TEXT,
	cancel_reason TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	FOREIGN KEY(gig_id) REFERENCES gigs(id),
	FOREIGN KEY(buyer_id) REFERENCES users(id),
	FOREIGN KEY(seller_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_gig_orders_gig_id ON gig_orders(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_orders_buyer_id ON gig_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gig_orders_seller_id ON gig_orders(seller_id);

-- Gig Marketplace: Gig Deliveries
CREATE TABLE IF NOT EXISTS gig_deliveries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	order_id INTEGER NOT NULL,
	message TEXT,
	attachments TEXT,
	revision_number INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL,
	FOREIGN KEY(order_id) REFERENCES gig_orders(id) ON DELETE CASCADE
);

-- Gig Marketplace: Gig Revisions
CREATE TABLE IF NOT EXISTS gig_revisions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	order_id INTEGER NOT NULL,
	requested_by INTEGER NOT NULL,
	message TEXT,
	created_at TEXT NOT NULL,
	FOREIGN KEY(order_id) REFERENCES gig_orders(id) ON DELETE CASCADE,
	FOREIGN KEY(requested_by) REFERENCES users(id)
);

-- Gig Marketplace: Gig Reviews
CREATE TABLE IF NOT EXISTS gig_reviews (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	gig_id INTEGER NOT NULL,
	order_id INTEGER NOT NULL UNIQUE,
	reviewer_id INTEGER NOT NULL,
	rating REAL NOT NULL,
	comment TEXT,
	seller_response TEXT,
	created_at TEXT NOT NULL,
	FOREIGN KEY(gig_id) REFERENCES gigs(id),
	FOREIGN KEY(order_id) REFERENCES gig_orders(id),
	FOREIGN KEY(reviewer_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_gig_reviews_gig_id ON gig_reviews(gig_id);

-- External Projects (aggregated from external job boards)
CREATE TABLE IF NOT EXISTS external_projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	company TEXT,
	company_logo TEXT,
	description TEXT,
	description_plain TEXT,
	category TEXT,
	source TEXT NOT NULL,
	source_id TEXT,
	project_type TEXT,
	experience_level TEXT,
	budget_min REAL,
	budget_max REAL,
	budget_currency TEXT DEFAULT 'USD',
	location TEXT,
	apply_url TEXT,
	trust_score REAL DEFAULT 0.5,
	is_verified INTEGER DEFAULT 0,
	tags TEXT,
	views_count INTEGER NOT NULL DEFAULT 0,
	clicks_count INTEGER NOT NULL DEFAULT 0,
	scraped_at TEXT NOT NULL,
	posted_at TEXT,
	expires_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_external_projects_source ON external_projects(source);
CREATE INDEX IF NOT EXISTS idx_external_projects_category ON external_projects(category);

-- External Project Saves (user bookmarks)
CREATE TABLE IF NOT EXISTS external_project_saves (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	project_id INTEGER NOT NULL,
	created_at TEXT NOT NULL,
	UNIQUE(user_id, project_id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE
);

-- External Project Clicks (tracking)
CREATE TABLE IF NOT EXISTS external_project_clicks (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER NOT NULL,
	user_id INTEGER,
	ip_address TEXT,
	created_at TEXT NOT NULL,
	FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE
);

-- External Project Flags (user reports)
CREATE TABLE IF NOT EXISTS external_project_flags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	reason TEXT,
	created_at TEXT NOT NULL,
	UNIQUE(user_id, project_id),
	FOREIGN KEY(project_id) REFERENCES external_projects(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Scrape Jobs (scheduled scraping tasks)
CREATE TABLE IF NOT EXISTS scrape_jobs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	source TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	started_at TEXT,
	completed_at TEXT,
	projects_scraped INTEGER DEFAULT 0,
	error_message TEXT,
	created_at TEXT NOT NULL
);

-- Referral Campaigns (advanced referral system)
CREATE TABLE IF NOT EXISTS referral_campaigns (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT,
	reward_amount REAL NOT NULL DEFAULT 0,
	reward_type TEXT NOT NULL DEFAULT 'fixed',
	max_referrals INTEGER,
	starts_at TEXT,
	ends_at TEXT,
	is_active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL
);

-- Referral Milestones
CREATE TABLE IF NOT EXISTS referral_milestones (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	campaign_id INTEGER,
	referrals_required INTEGER NOT NULL,
	reward_amount REAL NOT NULL,
	reward_description TEXT,
	FOREIGN KEY(campaign_id) REFERENCES referral_campaigns(id) ON DELETE CASCADE
);

-- Referral Milestone Achievements (user progress)
CREATE TABLE IF NOT EXISTS referral_milestone_achievements (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	milestone_id INTEGER NOT NULL,
	achieved_at TEXT NOT NULL,
	UNIQUE(user_id, milestone_id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(milestone_id) REFERENCES referral_milestones(id)
);

-- Wallet Balances
CREATE TABLE IF NOT EXISTS wallet_balances (
	user_id INTEGER PRIMARY KEY,
	available REAL DEFAULT 0,
	pending REAL DEFAULT 0,
	escrow REAL DEFAULT 0,
	currency TEXT DEFAULT 'USD',
	updated_at TEXT,
	FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	type TEXT NOT NULL,
	amount REAL NOT NULL,
	currency TEXT DEFAULT 'USD',
	status TEXT DEFAULT 'pending',
	description TEXT,
	reference_id TEXT,
	metadata TEXT,
	created_at TEXT,
	completed_at TEXT,
	FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- Token Blacklist (for JWT invalidation)
CREATE TABLE IF NOT EXISTS token_blacklist (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	jti TEXT NOT NULL UNIQUE,
	user_id INTEGER,
	expires_at TEXT NOT NULL,
	blacklisted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

