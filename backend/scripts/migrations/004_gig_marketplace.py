"""
Migration: Create gig marketplace tables
Creates: gigs, gig_orders, gig_reviews, gig_revisions, gig_deliveries, gig_faqs
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.turso_http import execute_query

TABLES = [
    # Gigs table
    """CREATE TABLE IF NOT EXISTS gigs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category_id INTEGER,
        subcategory TEXT DEFAULT '',
        description TEXT NOT NULL,
        basic_title TEXT DEFAULT 'Basic',
        basic_description TEXT DEFAULT '',
        basic_price REAL DEFAULT 0,
        basic_delivery_days INTEGER DEFAULT 3,
        basic_revisions INTEGER DEFAULT 1,
        standard_title TEXT DEFAULT 'Standard',
        standard_description TEXT DEFAULT '',
        standard_price REAL DEFAULT 0,
        standard_delivery_days INTEGER DEFAULT 5,
        standard_revisions INTEGER DEFAULT 3,
        premium_title TEXT DEFAULT 'Premium',
        premium_description TEXT DEFAULT '',
        premium_price REAL DEFAULT 0,
        premium_delivery_days INTEGER DEFAULT 7,
        premium_revisions INTEGER DEFAULT 5,
        tags TEXT DEFAULT '[]',
        images TEXT DEFAULT '[]',
        thumbnail_url TEXT DEFAULT '',
        status TEXT DEFAULT 'draft',
        average_rating REAL DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        orders_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )""",

    # Gig orders
    """CREATE TABLE IF NOT EXISTS gig_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gig_id INTEGER NOT NULL REFERENCES gigs(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        package_type TEXT DEFAULT 'basic',
        price REAL DEFAULT 0,
        delivery_days INTEGER DEFAULT 3,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        completed_at TEXT,
        cancelled_at TEXT
    )""",

    # Gig reviews
    """CREATE TABLE IF NOT EXISTS gig_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gig_id INTEGER NOT NULL REFERENCES gigs(id),
        order_id INTEGER REFERENCES gig_orders(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER DEFAULT 5,
        communication_rating INTEGER DEFAULT 5,
        service_rating INTEGER DEFAULT 5,
        recommendation_rating INTEGER DEFAULT 5,
        comment TEXT DEFAULT '',
        seller_response TEXT DEFAULT '',
        seller_response_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )""",

    # Gig revisions
    """CREATE TABLE IF NOT EXISTS gig_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES gig_orders(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        revision_message TEXT NOT NULL,
        extra_cost REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
    )""",

    # Gig deliveries
    """CREATE TABLE IF NOT EXISTS gig_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES gig_orders(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        delivery_message TEXT NOT NULL,
        files TEXT DEFAULT '[]',
        status TEXT DEFAULT 'submitted',
        created_at TEXT DEFAULT (datetime('now'))
    )""",

    # Gig FAQs
    """CREATE TABLE IF NOT EXISTS gig_faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gig_id INTEGER NOT NULL REFERENCES gigs(id),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )""",
]

INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_gigs_seller ON gigs(seller_id)",
    "CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status)",
    "CREATE INDEX IF NOT EXISTS idx_gigs_slug ON gigs(slug)",
    "CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_orders_buyer ON gig_orders(buyer_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_orders_seller ON gig_orders(seller_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_orders_gig ON gig_orders(gig_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_reviews_gig ON gig_reviews(gig_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_reviews_buyer ON gig_reviews(buyer_id)",
    "CREATE INDEX IF NOT EXISTS idx_gig_faqs_gig ON gig_faqs(gig_id)",
]


def run_migration():
    print("Running gig marketplace migration...")
    for sql in TABLES:
        try:
            execute_query(sql)
            table = sql.split("CREATE TABLE IF NOT EXISTS ")[1].split(" ")[0]
            print(f"  ✅ Created table: {table}")
        except Exception as e:
            table = sql.split("CREATE TABLE IF NOT EXISTS ")[1].split(" ")[0]
            print(f"  ⚠️ Table {table} may already exist: {e}")

    for sql in INDEXES:
        try:
            execute_query(sql)
        except Exception as e:
            print(f"  ⚠️ Index may already exist: {e}")

    print("Gig marketplace migration complete!")


if __name__ == "__main__":
    run_migration()
