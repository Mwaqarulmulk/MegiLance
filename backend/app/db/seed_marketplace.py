# @AI-HINT: Marketplace demo-data seeder — populates realistic freelancers, gigs, and reviews
# so the public marketplace (/freelancers, /gigs) is never empty. Idempotent and reversible:
# every account it creates uses the @demo.megilance.com domain and can be removed with purge().
#
# Run:  python -m app.db.seed_marketplace          (seed)
#       python -m app.db.seed_marketplace purge     (remove all demo data)
import json
import logging
import sys
from datetime import datetime, timezone, timedelta

from app.db.turso_http import execute_query, parse_rows
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

DEMO_DOMAIN = "demo.megilance.com"
DEMO_PASSWORD = "Demo1234!"

# Curated, realistic freelancer profiles. Avatars use DiceBear (no upload needed, always renders).
FREELANCERS = [
    ("Aisha Khan", "Senior Full-Stack Engineer", ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
     85, "Lahore, Pakistan", "expert", "available", "platinum", 4.9, 187, 142,
     "Full-stack engineer with 9 years shipping SaaS products. I build fast, accessible web apps end-to-end."),
    ("Daniel Okafor", "UI/UX & Product Designer", ["Figma", "UI/UX", "Design Systems", "Prototyping", "Webflow"],
     70, "Lagos, Nigeria", "expert", "available", "gold", 4.8, 124, 98,
     "Product designer crafting clean, conversion-focused interfaces for startups and scale-ups."),
    ("Sofia Martinez", "Data Scientist & ML Engineer", ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
     95, "Barcelona, Spain", "expert", "busy", "platinum", 4.9, 156, 110,
     "ML engineer turning messy data into production models. NLP, forecasting, and recommendation systems."),
    ("Liam O'Brien", "DevOps & Cloud Architect", ["AWS", "Kubernetes", "Terraform", "Docker", "CI/CD"],
     90, "Dublin, Ireland", "expert", "available", "gold", 4.7, 89, 76,
     "I design resilient cloud infrastructure and automate everything. Cut your deploy times by 10x."),
    ("Mei Lin", "Mobile App Developer (Flutter)", ["Flutter", "Dart", "Firebase", "iOS", "Android"],
     65, "Singapore", "intermediate", "available", "gold", 4.8, 73, 61,
     "Cross-platform mobile developer. One codebase, native feel, App Store & Play Store launches handled."),
    ("Carlos Mendes", "Brand & Motion Designer", ["Branding", "After Effects", "Illustrator", "Motion Graphics", "Logo Design"],
     55, "São Paulo, Brazil", "intermediate", "available", "silver", 4.6, 64, 52,
     "I help brands stand out with bold identities and scroll-stopping motion graphics."),
    ("Priya Nair", "Technical Content Writer", ["Copywriting", "SEO", "Technical Writing", "Content Strategy", "Editing"],
     45, "Bangalore, India", "intermediate", "available", "silver", 4.7, 91, 80,
     "Developer-turned-writer. I make complex products easy to understand and rank on Google."),
    ("Tomas Novak", "Backend Engineer (Go/Python)", ["Go", "Python", "PostgreSQL", "Redis", "Microservices"],
     80, "Prague, Czechia", "expert", "busy", "gold", 4.8, 102, 88,
     "Backend specialist building high-throughput APIs and event-driven systems that don't fall over."),
    ("Amara Diallo", "Digital Marketing Strategist", ["SEO", "Google Ads", "Marketing", "Analytics", "Email Marketing"],
     60, "Toronto, Canada", "expert", "available", "gold", 4.7, 78, 66,
     "Performance marketer. I run data-driven campaigns that actually move revenue, not vanity metrics."),
    ("Hiro Tanaka", "Blockchain / Web3 Developer", ["Solidity", "Web3", "Ethereum", "Smart Contracts", "React"],
     110, "Tokyo, Japan", "expert", "available", "platinum", 4.9, 67, 58,
     "Smart-contract engineer. Audited DeFi protocols, NFT platforms, and on-chain tooling."),
    ("Elena Popova", "Frontend Engineer (React/Next.js)", ["React", "Next.js", "TypeScript", "TailwindCSS", "GraphQL"],
     75, "Berlin, Germany", "expert", "available", "gold", 4.8, 113, 95,
     "Frontend engineer obsessed with performance and pixel-perfect, accessible UI."),
    ("Omar Haddad", "WordPress & Shopify Expert", ["WordPress", "Shopify", "PHP", "WooCommerce", "Liquid"],
     40, "Cairo, Egypt", "intermediate", "available", "silver", 4.6, 142, 130,
     "I build and rescue WordPress & Shopify stores. Fast, secure, and conversion-optimized."),
    ("Grace Chen", "Product Manager & Scrum Master", ["Product Management", "Agile", "Jira", "Roadmapping", "Analytics"],
     88, "San Francisco, USA", "expert", "busy", "gold", 4.8, 54, 47,
     "I turn fuzzy ideas into shipped roadmaps. Ex-FAANG PM helping startups find product-market fit."),
    ("Nikolai Volkov", "Game Developer (Unity)", ["Unity", "C#", "Game Design", "3D Modeling", "Multiplayer"],
     70, "Warsaw, Poland", "intermediate", "available", "silver", 4.7, 49, 41,
     "Indie game dev. From prototype to Steam launch — gameplay, multiplayer, and polish."),
    ("Fatima Zahra", "AI/LLM Application Engineer", ["Python", "LLM", "LangChain", "RAG", "OpenAI API"],
     100, "Casablanca, Morocco", "expert", "available", "platinum", 4.9, 71, 63,
     "I build production LLM apps: RAG pipelines, agents, and chatbots that ship and scale."),
    ("James Wilson", "Video Editor & Producer", ["Video Editing", "Premiere Pro", "DaVinci Resolve", "YouTube", "Color Grading"],
     50, "Manchester, UK", "intermediate", "available", "silver", 4.6, 96, 85,
     "I edit YouTube videos, ads, and course content that keeps viewers watching to the end."),
    ("Ananya Reddy", "QA & Test Automation Engineer", ["Selenium", "Cypress", "Playwright", "Python", "API Testing"],
     58, "Hyderabad, India", "intermediate", "available", "silver", 4.7, 60, 53,
     "I catch bugs before your users do. Automated test suites and rock-solid CI pipelines."),
    ("Lucas Silva", "3D Artist & Blender Specialist", ["Blender", "3D Modeling", "Texturing", "Rendering", "Animation"],
     62, "Lisbon, Portugal", "intermediate", "available", "silver", 4.8, 58, 49,
     "3D artist for products, games, and architecture. Photorealistic renders and clean topology."),
    ("Yuki Sato", "Cybersecurity Consultant", ["Penetration Testing", "Security", "OWASP", "Networking", "Python"],
     105, "Osaka, Japan", "expert", "busy", "gold", 4.9, 44, 39,
     "I find the holes before attackers do. Web app pentests, security audits, and hardening."),
    ("Maria Garcia", "Virtual Assistant & Ops", ["Virtual Assistant", "Project Management", "Customer Support", "Notion", "Automation"],
     30, "Manila, Philippines", "entry", "available", "bronze", 4.7, 118, 108,
     "Reliable VA handling inboxes, scheduling, and ops so founders can focus on growth."),
    ("David Cohen", "Salesforce & CRM Developer", ["Salesforce", "Apex", "CRM", "Integrations", "JavaScript"],
     92, "Tel Aviv, Israel", "expert", "available", "gold", 4.7, 51, 44,
     "Salesforce specialist automating sales ops and building custom CRM workflows that stick."),
    ("Zara Ahmed", "Illustrator & Character Artist", ["Illustration", "Procreate", "Character Design", "Concept Art", "Photoshop"],
     48, "Karachi, Pakistan", "intermediate", "available", "silver", 4.8, 83, 72,
     "Illustrator bringing characters and worlds to life for books, games, and brands."),
    ("Felix Mueller", "Data Engineer (Spark/dbt)", ["Python", "Spark", "dbt", "Airflow", "Snowflake"],
     97, "Munich, Germany", "expert", "busy", "platinum", 4.8, 47, 42,
     "I build the data pipelines and warehouses your analytics team can actually trust."),
    ("Isabella Rossi", "Translator & Localization", ["Translation", "Localization", "Italian", "English", "Proofreading"],
     38, "Milan, Italy", "intermediate", "available", "silver", 4.9, 134, 125,
     "Native Italian translator. Marketing, legal, and app localization that reads naturally."),
]

# Gig templates keyed loosely to seller specialties (assigned round-robin to first N sellers).
GIGS = [
    ("I will build a modern responsive website with React and Next.js", "web-development",
     "Custom, fast, SEO-ready websites built with React/Next.js and deployed to production.",
     150, 450, 1200, [3, 5, 10],
     "Landing page (1 page), responsive, contact form",
     "Up to 5 pages, CMS integration, animations",
     "Full web app, auth, dashboard, API integration, 30-day support"),
    ("I will design a stunning UI/UX for your web or mobile app", "design",
     "Conversion-focused UI/UX design in Figma with a reusable design system.",
     120, 350, 900, [3, 6, 12],
     "3 screens, 1 concept, source file",
     "8 screens, 2 concepts, prototype",
     "Full product design, design system, dev handoff"),
    ("I will build and train a custom machine learning model", "data-science",
     "End-to-end ML: data prep, model training, evaluation, and deployment.",
     300, 800, 2000, [5, 10, 21],
     "EDA + baseline model + report",
     "Tuned model + API endpoint",
     "Production pipeline, monitoring, retraining setup"),
    ("I will set up CI/CD and cloud infrastructure on AWS", "devops",
     "Infrastructure-as-code, automated deploys, and observability for your stack.",
     200, 600, 1500, [3, 7, 14],
     "CI/CD pipeline for 1 service",
     "IaC + multi-env setup",
     "Full cloud architecture, autoscaling, monitoring"),
    ("I will develop a cross-platform mobile app with Flutter", "mobile-development",
     "iOS + Android from one Flutter codebase, store submission included.",
     250, 700, 1800, [7, 14, 28],
     "MVP, 3 screens, 1 platform",
     "8 screens, both platforms, auth",
     "Full app, backend, store launch, 30-day support"),
    ("I will create a complete brand identity and logo", "design",
     "Memorable brand identity: logo, palette, typography, and guidelines.",
     90, 250, 600, [3, 5, 10],
     "Logo + 2 concepts",
     "Logo + brand colors + fonts",
     "Full brand kit + guidelines + social assets"),
    ("I will write SEO blog articles and website copy", "writing",
     "Researched, SEO-optimized content that ranks and converts.",
     50, 150, 400, [2, 4, 7],
     "1 article (800 words), 1 keyword",
     "3 articles, keyword research",
     "5 articles + content strategy + meta"),
    ("I will build a high-performance backend API", "web-development",
     "Scalable REST/GraphQL APIs with auth, tests, and docs.",
     180, 500, 1300, [4, 8, 16],
     "5 endpoints, auth, docs",
     "Full CRUD API, tests, DB design",
     "Microservices, caching, CI/CD, monitoring"),
    ("I will run a data-driven Google Ads campaign", "marketing",
     "Profitable paid campaigns with tracking, A/B tests, and reporting.",
     150, 400, 1000, [3, 7, 30],
     "1 campaign setup + tracking",
     "3 campaigns, A/B tests",
     "Full account management, monthly optimization"),
    ("I will develop and audit a Solidity smart contract", "blockchain",
     "Secure smart contracts and audits for DeFi, NFTs, and on-chain apps.",
     400, 1200, 3000, [5, 10, 21],
     "Single contract + tests",
     "Contract suite + deployment",
     "Full audit report + remediation + re-test"),
    ("I will build a production-ready LLM chatbot with RAG", "data-science",
     "Custom AI assistants: RAG over your data, tool-calling, and guardrails.",
     350, 900, 2200, [5, 10, 18],
     "Chatbot + RAG over 1 source",
     "Multi-source RAG + UI",
     "Agentic assistant, eval suite, deployment"),
    ("I will edit professional YouTube videos and ads", "writing",
     "Engaging edits with motion, captions, and color grading that retain viewers.",
     60, 180, 450, [2, 4, 7],
     "1 video up to 5 min",
     "1 video up to 15 min + captions",
     "4 videos/month + thumbnails + color grade"),
]

CATEGORY_SLUGS = {
    "web-development": "Web Development", "design": "Design", "data-science": "Data Science",
    "devops": "DevOps", "mobile-development": "Mobile Development", "writing": "Writing",
    "marketing": "Marketing", "blockchain": "Blockchain",
}

REVIEW_COMMENTS = [
    "Outstanding work, delivered ahead of schedule. Will hire again!",
    "Exceeded expectations. Clear communication and top-tier quality.",
    "Truly a professional. Understood the brief immediately and nailed it.",
    "Great experience from start to finish. Highly recommended.",
    "Solved a problem three other freelancers couldn't. Brilliant.",
    "Responsive, skilled, and a pleasure to work with.",
    "Quality was exceptional and the price was fair. 10/10.",
]


def _slug(text: str) -> str:
    import re
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:90]


# Real profile photos hosted on Cloudflare R2
_FREELANCER_AVATARS = [
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/aisha-khan.jpg",  # aisha-khan
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/daniel-okafor.jpg",  # daniel-okafor
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/sofia-martinez.jpg",  # sofia-martinez
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/liam-o-brien.jpg",  # liam-o-brien
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/mei-lin.jpg",  # mei-lin
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/carlos-mendes.jpg",  # carlos-mendes
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/priya-nair.jpg",  # priya-nair
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/tomas-novak.jpg",  # tomas-novak
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/amara-diallo.jpg",  # amara-diallo
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/hiro-tanaka.jpg",  # hiro-tanaka
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/elena-popova.jpg",  # elena-popova
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/omar-haddad.jpg",  # omar-haddad
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/grace-chen.jpg",  # grace-chen
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/nikolai-volkov.jpg",  # nikolai-volkov
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/fatima-zahra.jpg",  # fatima-zahra
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/james-wilson.jpg",  # james-wilson
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/ananya-reddy.jpg",  # ananya-reddy
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/lucas-silva.jpg",  # lucas-silva
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/yuki-sato.jpg",  # yuki-sato
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/maria-garcia.jpg",  # maria-garcia
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/david-cohen.jpg",  # david-cohen
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/zara-ahmed.jpg",  # zara-ahmed
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/felix-mueller.jpg",  # felix-mueller
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/freelancers/isabella-rossi.jpg",  # isabella-rossi
]

_CLIENT_AVATARS = [
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/clients/meridian-studios.jpg",  # meridian-studios
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/clients/techventure-inc.jpg",  # techventure-inc
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/clients/global-media-co.jpg",  # global-media-co
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/clients/ecosolutions-ltd.jpg",  # ecosolutions-ltd
    "https://pub-5723b5e89c4042049d37c030cc388ac4.r2.dev/avatars/demo/clients/dataflow-systems.jpg",  # dataflow-systems
]

def _avatar(name: str, index: int = 0, pool: list = None) -> str:
    """Return a real R2-hosted portrait for this demo profile."""
    if pool is None:
        pool = _FREELANCER_AVATARS
    return pool[index % len(pool)]


def _gig_image(slug: str) -> str:
    return f"https://picsum.photos/seed/{slug}/800/450"


def purge():
    """Remove all demo marketplace data (reversible cleanup)."""
    rows = parse_rows(execute_query(
        "SELECT id FROM users WHERE email LIKE ?", [f"%@{DEMO_DOMAIN}"]) or {})
    ids = [r["id"] for r in rows]
    if not ids:
        logger.info("seed_marketplace.purge: nothing to remove")
        return 0
    placeholders = ",".join("?" for _ in ids)
    execute_query(f"DELETE FROM reviews WHERE reviewee_id IN ({placeholders}) OR reviewer_id IN ({placeholders})", ids + ids)
    execute_query(f"DELETE FROM contracts WHERE freelancer_id IN ({placeholders}) OR client_id IN ({placeholders})", ids + ids)
    execute_query(f"DELETE FROM gigs WHERE seller_id IN ({placeholders})", ids)
    execute_query(f"DELETE FROM users WHERE id IN ({placeholders})", ids)
    logger.info(f"seed_marketplace.purge: removed {len(ids)} demo users + their gigs/reviews")
    return len(ids)


def _category_id(slug: str):
    name = CATEGORY_SLUGS.get(slug, slug)
    rows = parse_rows(execute_query(
        "SELECT id FROM categories WHERE slug = ? OR name = ? LIMIT 1", [slug, name]) or {})
    return rows[0]["id"] if rows else None


def seed(force: bool = False):
    """Seed realistic demo freelancers, gigs, and reviews. Idempotent."""
    existing = parse_rows(execute_query(
        "SELECT COUNT(*) as c FROM users WHERE email LIKE ?", [f"%@{DEMO_DOMAIN}"]) or {})
    if existing and existing[0].get("c", 0) > 0:
        if not force:
            logger.info("seed_marketplace: demo data already present; use force=True to reseed")
            return {"status": "skipped", "reason": "already_seeded"}
        purge()

    now = datetime.now(timezone.utc)
    pw = get_password_hash(DEMO_PASSWORD)
    seller_ids = []

    for i, (name, headline, skills, rate, location, exp, avail, level, rating, reviews, completed, bio) in enumerate(FREELANCERS):
        email = f"{_slug(name)}@{DEMO_DOMAIN}"
        slug = _slug(name)
        joined = (now - timedelta(days=120 + i * 7)).isoformat()
        last_active = (now - timedelta(hours=i % 24)).isoformat()
        langs = json.dumps(["English"]) if "," not in location else json.dumps(["English"])
        execute_query(
            """INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified,
                  name, user_type, role, bio, skills, hourly_rate, profile_image_url, location,
                  headline, tagline, experience_level, availability_status, seller_level, languages,
                  profile_slug, years_of_experience, profile_visibility, profile_views,
                  two_factor_enabled, account_balance, last_active_at, joined_at, created_at, updated_at)
               VALUES (?,?,1,1,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,?,?,?,?)""",
            [email, pw, name, "freelancer", "freelancer", bio, json.dumps(skills), float(rate),
             _avatar(name, i, _FREELANCER_AVATARS), location, headline, headline[:60], exp, avail, level, langs,
             slug, 3 + (i % 9), "public", 200 + i * 37, last_active, joined, joined, now.isoformat()],
        )
        row = parse_rows(execute_query("SELECT id FROM users WHERE email = ?", [email]) or {})
        sid = row[0]["id"] if row else None
        seller_ids.append((sid, rating, reviews))

    # Demo clients (multiple realistic clients)
    DEMO_CLIENTS = [
        ("Meridian Studios", "Product studio hiring top freelancers for client work.", "Remote"),
        ("TechVenture Inc", "Innovative tech startup building the future of SaaS.", "San Francisco, CA"),
        ("Global Media Co", "Digital media agency creating content worldwide.", "New York, NY"),
        ("EcoSolutions Ltd", "Sustainable technology solutions for modern businesses.", "London, UK"),
        ("DataFlow Systems", "Enterprise data analytics and visualization platform.", "Berlin, Germany"),
    ]

    client_ids = []
    for ci, (cname, cbio, cloc) in enumerate(DEMO_CLIENTS):
        client_email = f"{_slug(cname)}@{DEMO_DOMAIN}"
        execute_query(
            """INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified,
                  name, user_type, role, bio, location, profile_image_url, two_factor_enabled, account_balance,
                  joined_at, created_at, updated_at)
               VALUES (?,?,1,1,1,?,?,?,?,?,?,0,0,?,?,?)""",
            [client_email, pw, cname, "client", "client", cbio, cloc,
             _CLIENT_AVATARS[ci % len(_CLIENT_AVATARS)],
             now.isoformat(), now.isoformat(), now.isoformat()],
        )
        crow = parse_rows(execute_query("SELECT id FROM users WHERE email = ?", [client_email]) or {})
        cid = crow[0]["id"] if crow else None
        client_ids.append(cid)

    # Demo projects
    DEMO_PROJECTS = [
        ("E-commerce Platform Redesign", "Complete redesign of our e-commerce platform with modern UI/UX, React frontend, and Node.js backend.", "Web Development", 5000, 12000, "intermediate", "1-3 months"),
        ("Mobile App Development", "Cross-platform mobile app for iOS and Android with Flutter.", "Mobile Development", 8000, 20000, "expert", "2-4 months"),
        ("AI Chatbot Integration", "Integrate AI-powered customer support chatbot into our website.", "Data Science", 3000, 8000, "expert", "1-2 months"),
        ("Brand Identity Design", "Complete brand identity including logo, color palette, and guidelines.", "Design", 1500, 4000, "intermediate", "2-4 weeks"),
        ("Cloud Infrastructure Setup", "AWS cloud infrastructure with CI/CD pipeline and monitoring.", "DevOps", 4000, 10000, "expert", "1-2 months"),
        ("Content Management System", "Custom CMS built with Next.js and headless architecture.", "Web Development", 6000, 15000, "intermediate", "1-3 months"),
        ("Data Analytics Dashboard", "Real-time analytics dashboard with charts and KPI tracking.", "Data Science", 5000, 12000, "expert", "1-2 months"),
        ("SEO Optimization Campaign", "Full SEO audit and optimization for improved search rankings.", "Marketing", 2000, 5000, "intermediate", "2-4 weeks"),
    ]

    project_ids = []
    for pi, (ptitle, pdesc, pcat, pbmin, pbmax, pexp, pdur) in enumerate(DEMO_PROJECTS):
        client_id = client_ids[pi % len(client_ids)]
        if not client_id:
            continue
        execute_query(
            """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                  experience_level, estimated_duration, skills, client_id, status, proposals_count, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,'open',?, ?, ?)""",
            [ptitle, pdesc, pcat, "fixed", pbmin, pbmax, pexp, pdur,
             json.dumps(["React", "Node.js", "TypeScript"]), client_id, 3 + pi,
             (now - timedelta(days=30 - pi * 3)).isoformat(), now.isoformat()],
        )
        prow = parse_rows(execute_query("SELECT id FROM projects WHERE title = ?", [ptitle]) or {})
        pid = prow[0]["id"] if prow else None
        project_ids.append(pid)

    # Completed contracts + linked reviews -> populates avg_rating, review_count, completed_projects
    for idx, (sid, rating, review_count) in enumerate(seller_ids):
        if not sid or not client_ids[0] or not project_ids[0]:
            break
        n = min(6, max(2, review_count // 20))
        for k in range(n):
            amount = 500.0 + (idx * 50) + (k * 120)
            client_id = client_ids[(idx + k) % len(client_ids)]
            project_id = project_ids[(idx + k) % len(project_ids)]
            execute_query(
                """INSERT INTO contracts (project_id, freelancer_id, client_id, amount, contract_amount,
                      platform_fee, status, created_at, updated_at)
                   VALUES (?,?,?,?,?,?, 'completed', ?, ?)""",
                [project_id, sid, client_id, amount, amount, round(amount * 0.1, 2),
                 (now - timedelta(days=k * 12 + idx + 10)).isoformat(), now.isoformat()],
            )
            con = parse_rows(execute_query(
                "SELECT id FROM contracts WHERE freelancer_id = ? ORDER BY id DESC LIMIT 1", [sid]) or {})
            contract_id = con[0]["id"] if con else None
            if not contract_id:
                continue
            r = 5 if (k % 5 != 0) else 4
            execute_query(
                """INSERT INTO reviews (contract_id, reviewer_id, reviewee_id, rating, comment, is_public, created_at, updated_at)
                   VALUES (?,?,?,?,?,1,?,?)""",
                [contract_id, client_id, sid, r, REVIEW_COMMENTS[(idx + k) % len(REVIEW_COMMENTS)],
                 (now - timedelta(days=k * 9 + idx)).isoformat(), now.isoformat()],
            )

    # Gigs: assign each gig template to a seller (round-robin over first len(GIGS) sellers)
    gig_count = 0
    for gi, (title, cat_slug, desc, bp, sp, pp, deliv, bf, sf, pf) in enumerate(GIGS):
        sid = seller_ids[gi % len(seller_ids)][0]
        if not sid:
            continue
        gslug = _slug(title) + f"-{gi}"
        cat_id = _category_id(cat_slug)
        rating = 4.6 + (gi % 4) / 10
        rcount = 18 + gi * 7
        execute_query(
            """INSERT INTO gigs (seller_id, category_id, title, slug, description, short_description, status,
                  basic_title, basic_description, basic_price, basic_delivery_days, basic_revisions, basic_features,
                  standard_title, standard_description, standard_price, standard_delivery_days, standard_revisions, standard_features,
                  premium_title, premium_description, premium_price, premium_delivery_days, premium_revisions, premium_features,
                  tags, images, thumbnail_url, rating_average, rating_count, orders_completed, impressions, clicks,
                  is_featured, created_at, updated_at, published_at)
               VALUES (?,?,?,?,?,?, 'active',
                  'Basic',?,?,?,1,?, 'Standard',?,?,?,2,?, 'Premium',?,?,?,3,?,
                  ?,?,?,?,?,?,?,?,?,?,?,?)""",
            [sid, cat_id, title[:80], gslug, desc, desc[:200],
             bf, float(bp), deliv[0], json.dumps(bf.split(", ")),
             sf, float(sp), deliv[1], json.dumps(sf.split(", ")),
             pf, float(pp), deliv[2], json.dumps(pf.split(", ")),
             json.dumps([cat_slug]), json.dumps([_gig_image(gslug)]), _gig_image(gslug),
             round(rating, 2), rcount, rcount - 3, 500 + gi * 80, 120 + gi * 20,
             1 if gi < 4 else 0, now.isoformat(), now.isoformat(), now.isoformat()],
        )
        gig_count += 1

    # Seed demo conversations between clients and freelancers
    conversation_count = 0
    for ci, cid in enumerate(client_ids[:3]):
        if not cid:
            continue
        for si, (sid, _, _) in enumerate(seller_ids[ci * 3:ci * 3 + 3]):
            if not sid:
                continue
            now_iso = now.isoformat()
            execute_query(
                """INSERT INTO conversations (client_id, freelancer_id, status, is_archived, last_message_at, created_at, updated_at)
                   VALUES (?,?,'active',0,?,?,?)""",
                [cid, sid, now_iso, now_iso, now_iso],
            )
            conv = parse_rows(execute_query(
                "SELECT id FROM conversations WHERE client_id = ? AND freelancer_id = ? ORDER BY id DESC LIMIT 1",
                [cid, sid]) or {})
            conv_id = conv[0]["id"] if conv else None
            if conv_id:
                msg_now = (now - timedelta(hours=1)).isoformat()
                execute_query(
                    """INSERT INTO messages (conversation_id, sender_id, receiver_id, content, message_type, is_read, is_deleted, sent_at, created_at)
                       VALUES (?,?,'active',0,?,?,?,?,?)""",
                    [conv_id, cid, sid, f"Hi! I'm interested in your work. Let's discuss the project.", "text", False, False, msg_now, msg_now],
                )
                conversation_count += 1

    result = {"status": "seeded", "freelancers": len(seller_ids), "clients": len(client_ids), "projects": len(project_ids), "gigs": gig_count, "conversations": conversation_count}
    logger.info(f"seed_marketplace: {result}")
    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    if len(sys.argv) > 1 and sys.argv[1] == "purge":
        print(purge())
    else:
        force = len(sys.argv) > 1 and sys.argv[1] == "force"
        print(seed(force=force))
