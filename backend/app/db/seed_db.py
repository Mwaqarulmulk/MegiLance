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

    if count > 5:  # If we already seeded the 10+ users, skip
        logger.info(f"Database already has {count} users. Skipping seed.")
        return

    now = datetime.now(timezone.utc).isoformat()
    logger.info("Seeding database with demo data...")

    # Create 10 sample freelancers and 1 client
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
            "email": "freelancer3@example.com",
            "name": "Ahmad Raza",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Asynchronous backend engineer specializing in FastAPI, python optimization, and remote SQLite/Turso databases.",
            "skills": json.dumps(["Python", "FastAPI", "SQLite", "SQLAlchemy", "Docker"]),
            "hourly_rate": 35.0,
            "location": "Lahore, Pakistan",
            "headline": "FastAPI & Database Specialist",
        },
        {
            "email": "freelancer4@example.com",
            "name": "Sofia Martinez",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "NLP and LLM deployment specialist. Experienced building Retrieval Augmented Generation (RAG) pipelines.",
            "skills": json.dumps(["Python", "LangChain", "OpenAI API", "React", "Vector DB"]),
            "hourly_rate": 65.0,
            "location": "Madrid, Spain",
            "headline": "AI & LLM Application Engineer",
        },
        {
            "email": "freelancer5@example.com",
            "name": "Yuki Sato",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Smart contract developer focused on secure decentralized escrow models and Web3 integrations.",
            "skills": json.dumps(["Solidity", "Web3", "Ethereum", "React", "TypeScript"]),
            "hourly_rate": 75.0,
            "location": "Tokyo, Japan",
            "headline": "Smart Contract & Web3 Engineer",
        },
        {
            "email": "freelancer6@example.com",
            "name": "Liam O'Brien",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "DevOps expert setting up automated CI/CD pipelines, autoscaling, and container orchestration.",
            "skills": json.dumps(["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"]),
            "hourly_rate": 60.0,
            "location": "Dublin, Ireland",
            "headline": "Cloud Infrastructure & DevOps Engineer",
        },
        {
            "email": "freelancer7@example.com",
            "name": "Carlos Mendes",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Mobile engineer specializing in clean cross-platform mobile apps for Android and iOS using Flutter.",
            "skills": json.dumps(["Flutter", "Dart", "Firebase", "Android", "iOS"]),
            "hourly_rate": 40.0,
            "location": "São Paulo, Brazil",
            "headline": "Mobile App Developer (Flutter)",
        },
        {
            "email": "freelancer8@example.com",
            "name": "Elena Popova",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Frontend designer focused on accessible, premium quality interfaces and performance loading optimizations.",
            "skills": json.dumps(["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"]),
            "hourly_rate": 55.0,
            "location": "Berlin, Germany",
            "headline": "Senior Frontend Developer (Next.js)",
        },
        {
            "email": "freelancer9@example.com",
            "name": "Priya Nair",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Technical writer translating complex cloud and code concepts into clear documentation, blog posts, and copy.",
            "skills": json.dumps(["Technical Writing", "SEO", "Copywriting", "Editing", "Markdown"]),
            "hourly_rate": 30.0,
            "location": "Bangalore, India",
            "headline": "Technical Copywriter & SEO Specialist",
        },
        {
            "email": "freelancer10@example.com",
            "name": "David Cohen",
            "user_type": "freelancer",
            "role": "freelancer",
            "bio": "Shopify and WordPress custom liquid coder specializing in responsive layouts and converting landing pages.",
            "skills": json.dumps(["Shopify", "WordPress", "Liquid", "PHP", "HTML/CSS"]),
            "hourly_rate": 40.0,
            "location": "Tel Aviv, Israel",
            "headline": "Shopify & WordPress Customizer",
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
        {
            "email": "admin@megilance.com",
            "name": "MegiLance Admin",
            "user_type": "admin",
            "role": "admin",
            "bio": "System administrator for platform quality and disputes resolution management.",
            "skills": json.dumps([]),
            "hourly_rate": 0,
            "location": "Remote",
            "headline": "Platform Operations Manager",
        }
    ]

    user_ids = []
    for u in users:
        # Avoid duplicating during seeding
        existing_user = execute_query("SELECT id FROM users WHERE email = ?", [u["email"]])
        existing_rows = parse_rows(existing_user) if existing_user else []
        if existing_rows:
            user_ids.append(existing_rows[0]["id"])
            continue

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

    client_id = user_ids[-2]  # Tech Corp client

    # Create 10 sample projects with realistic parameters
    projects = [
        {
            "title": "AI chatbot for clinic website",
            "description": "Build an intelligent chatbot to answer patient FAQs, collect appointment bookings, and integrate with our clinic scheduling database. The output must be secure and HIPAA-compliant.",
            "category": "Artificial Intelligence",
            "budget_type": "fixed",
            "budget_min": 300.0,
            "budget_max": 600.0,
            "experience_level": "intermediate",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Python", "LangChain", "OpenAI API", "React"]),
        },
        {
            "title": "Restaurant booking landing page",
            "description": "Design and build a clean, conversion-focused single page website for a local dining restaurant. Includes a reservation form, map integration, and menu highlights.",
            "category": "Design & Creative",
            "budget_type": "fixed",
            "budget_min": 150.0,
            "budget_max": 300.0,
            "experience_level": "entry",
            "estimated_duration": "Less than 1 week",
            "skills": json.dumps(["React", "Tailwind CSS", "UI/UX"]),
        },
        {
            "title": "SaaS admin dashboard",
            "description": "Build a responsive React-based admin panel showing client stats, user accounts, charts, database metrics, and configuration options. Highly polished dark and light themes required.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 700.0,
            "budget_max": 1200.0,
            "experience_level": "expert",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]),
        },
        {
            "title": "E-commerce product recommendation engine",
            "description": "Build a personalized recommendation script in Python analyzing buyer habits and showing collaborative filtered results to increase average cart values on our shop store.",
            "category": "Data Science",
            "budget_type": "fixed",
            "budget_min": 500.0,
            "budget_max": 900.0,
            "experience_level": "expert",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Python", "Machine Learning", "SQL", "Pandas"]),
        },
        {
            "title": "Real estate lead capture website",
            "description": "Build a responsive real estate listing and lead capture portal using WordPress, custom themes, and maps. Optimise page speeds for maximum mobile conversion rates.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 250.0,
            "budget_max": 500.0,
            "experience_level": "intermediate",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["WordPress", "SEO", "HTML/CSS"]),
        },
        {
            "title": "Mobile fitness tracking app",
            "description": "Implement a cross-platform fitness log app using Flutter. Features include calorie trackers, workout routines, progress charts, and push alerts.",
            "category": "Mobile Development",
            "budget_type": "fixed",
            "budget_min": 800.0,
            "budget_max": 1500.0,
            "experience_level": "intermediate",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Flutter", "Dart", "Firebase"]),
        },
        {
            "title": "Financial portfolio tracker",
            "description": "Build an analytical app letting investors log portfolios, track live share prices, and estimate tax obligations. Multi-currency and charts support is vital.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 600.0,
            "budget_max": 1100.0,
            "experience_level": "expert",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Next.js", "TypeScript", "Tailwind CSS"]),
        },
        {
            "title": "Custom Shopify store redesign",
            "description": "Overhaul the layout design, navigation menus, and cart drawer animations on our Shopify storefront using customized liquid sections.",
            "category": "Design & Creative",
            "budget_type": "fixed",
            "budget_min": 400.0,
            "budget_max": 800.0,
            "experience_level": "intermediate",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Shopify", "Liquid", "HTML/CSS"]),
        },
        {
            "title": "API gateway for microservices",
            "description": "Design a high-throughput, secure API gateway route managing rate limiting, JWT token verification, and request forwarding to downstream Python microservices.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 500.0,
            "budget_max": 1000.0,
            "experience_level": "expert",
            "estimated_duration": "1-4 weeks",
            "skills": json.dumps(["Go", "Docker", "Kubernetes"]),
        },
        {
            "title": "Brand identity & logo design",
            "description": "Create a unified corporate brand book: logo design, color guidelines, typography parameters, and business card layouts for a security startup.",
            "category": "Design & Creative",
            "budget_type": "fixed",
            "budget_min": 200.0,
            "budget_max": 450.0,
            "experience_level": "entry",
            "estimated_duration": "Less than 1 week",
            "skills": json.dumps(["Figma", "Branding", "Illustrator"]),
        }
    ]

    for p in projects:
        # Check if project already seeded
        existing_proj = execute_query("SELECT id FROM projects WHERE title = ?", [p["title"]])
        existing_proj_rows = parse_rows(existing_proj) if existing_proj else []
        if existing_proj_rows:
            continue

        execute_query(
            """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                      experience_level, estimated_duration, skills, client_id, status, proposals_count, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, ?, ?)""",
            [
                p["title"], 
                p["description"], 
                p["category"], 
                p["budget_type"],
                p["budget_min"], 
                p["budget_max"], 
                p["experience_level"],
                p["estimated_duration"], 
                p["skills"], 
                client_id, 
                now, 
                now
            ],
        )

    logger.info(f"Database seeded: {len(users)} users, {len(projects)} projects")
    logger.info("Default password for all demo accounts: password123")


if __name__ == "__main__":
    seed_database()
