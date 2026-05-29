# @AI-HINT: Database seeding script — populates demo/development data using Turso HTTP API
import logging
import json
from datetime import datetime, timezone
from app.db.turso_http import execute_query, parse_rows
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


def seed_database():
    """Seed the database with demo data using Turso HTTP API."""
    # Check if data already exists
    existing = execute_query("SELECT COUNT(*) as cnt FROM users")
    rows = parse_rows(existing) if existing else []
    count = rows[0].get("cnt", 0) if rows else 0

    if count > 0:
        logger.info(f"Database already has {count} users. Skipping seed.")
        return

    now = datetime.now(timezone.utc).isoformat()
    logger.info("Seeding database with demo data...")

    # Create sample users
    users = [
        {
            "email": "freelancer1@example.com",
            "name": "Alice Johnson",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Experienced full-stack developer with 5+ years of experience in React, Node.js, and Python.",
            "skills": json.dumps(["React", "Node.js", "Python", "PostgreSQL", "MongoDB"]),
            "hourly_rate": 50.0,
            "location": "San Francisco, CA",
            "headline": "Full-Stack Developer | React & Node.js Expert",
        },
        {
            "email": "freelancer2@example.com",
            "name": "Bob Smith",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "UI/UX designer with expertise in creating beautiful and functional user interfaces.",
            "skills": json.dumps(["UI/UX", "Design", "Figma", "Adobe XD", "Prototyping"]),
            "hourly_rate": 45.0,
            "location": "New York, NY",
            "headline": "UI/UX Designer | Creating Delightful Experiences",
        },
        {
            "email": "client1@example.com",
            "name": "Tech Corp",
            "user_type": "client",
            "role": "client",
            "bio": "Innovative tech company looking for talented freelancers.",
            "skills": json.dumps([]),
            "hourly_rate": 0,
            "location": "Los Angeles, CA",
            "headline": "Building the Future of Technology",
        },
    ]

    user_ids = []
    for u in users:
        result = execute_query(
            """INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified,
                      name, user_type, role, bio, skills, hourly_rate, location, headline,
                      profile_data, two_factor_enabled, account_balance, joined_at, created_at, updated_at)
               VALUES (?, ?, 1, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?, '{}', 0, 0, ?, ?, ?)""",
            [
                u["email"],
                get_password_hash("password123"),
                u["name"],
                u["user_type"],
                u["role"],
                u["bio"],
                u["skills"],
                u["hourly_rate"],
                u["location"],
                u["headline"],
                now,
                now,
                now,
            ],
        )
        if result:
            id_result = execute_query("SELECT last_insert_rowid() as id")
            id_rows = parse_rows(id_result) if id_result else []
            user_ids.append(id_rows[0]["id"] if id_rows else 0)

    if len(user_ids) < 3:
        logger.error("Failed to create seed users")
        return

    freelancer1_id, freelancer2_id, client1_id = user_ids[0], user_ids[1], user_ids[2]

    # Create sample projects
    projects = [
        {
            "title": "E-commerce Website Development",
            "description": "Build a modern e-commerce website with React frontend and Node.js backend.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 5000.0,
            "budget_max": 10000.0,
            "experience_level": "intermediate",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["React", "Node.js", "PostgreSQL", "Stripe"]),
            "client_id": client1_id,
        },
        {
            "title": "Mobile App UI Design",
            "description": "Design a beautiful and intuitive UI for our new mobile application.",
            "category": "Design & Creative",
            "budget_type": "fixed",
            "budget_min": 2000.0,
            "budget_max": 4000.0,
            "experience_level": "entry",
            "estimated_duration": "Less than 1 week",
            "skills": json.dumps(["UI/UX", "Figma", "Prototyping"]),
            "client_id": client1_id,
        },
    ]

    project_ids = []
    for p in projects:
        result = execute_query(
            """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                      experience_level, estimated_duration, skills, client_id, status, proposals_count, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, ?, ?)""",
            [p["title"], p["description"], p["category"], p["budget_type"],
             p["budget_min"], p["budget_max"], p["experience_level"],
             p["estimated_duration"], p["skills"], p["client_id"], now, now],
        )
        if result:
            id_result = execute_query("SELECT last_insert_rowid() as id")
            id_rows = parse_rows(id_result) if id_result else []
            project_ids.append(id_rows[0]["id"] if id_rows else 0)

    logger.info(f"Database seeded: {len(users)} users, {len(projects)} projects")
    logger.info("Default password for all demo accounts: password123")


if __name__ == "__main__":
    seed_database()
