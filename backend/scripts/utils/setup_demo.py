#!/usr/bin/env python
"""
Initialize database with all tables and seed demo data for FYP evaluation
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ['DATABASE_URL'] = 'sqlite:///./local_dev.db'
os.environ['ENVIRONMENT'] = 'development'
os.environ['SECRET_KEY'] = 'dev-secret-key-for-testing-only-change-in-production-12345'
os.environ['TURSO_AUTH_TOKEN'] = ''

from sqlalchemy import create_engine
from app.db.base import Base
from app.db.init_db import init_db

# Import all models to register them with Base.metadata
from app.models import (
    User, Skill, UserSkill, Project, Proposal, Contract, Payment, PortfolioItem,
    Message, Conversation, Notification, Review, Dispute, Milestone, UserSession,
    AuditLog, Escrow, TimeEntry, Invoice, Category, Favorite, Tag, ProjectTag,
    SupportTicket, Refund, ScopeChangeRequest, AnalyticsEvent, 
    ProjectEmbedding, UserEmbedding, UserVerification
)

def create_all_tables():
    """Create all tables in the database"""
    print("Creating database engine...")
    engine = create_engine(
        "sqlite:///./local_dev.db",
        connect_args={"check_same_thread": False},
        echo=False
    )
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")
    
    # Verify tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\nCreated {len(tables)} tables:")
    for t in sorted(tables):
        print(f"  - {t}")
        if t == 'contracts':
            columns = [c['name'] for c in inspector.get_columns(t)]
            print(f"    Columns: {columns}")
    
    return engine

def seed_demo_data(engine):
    """Seed demo data for FYP evaluation"""
    from sqlalchemy.orm import sessionmaker
    from datetime import datetime, timezone, timedelta
    import json
    
    # Hash for password "Password123"
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("Password123")
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if demo data already exists
        existing_users = session.query(User).count()
        if existing_users > 0:
            print(f"Demo data already exists ({existing_users} users). Skipping seeding.")
            return
        
        print("\nSeeding demo data...")
        
        # Create admin user
        admin = User(
            email="admin@megilance.com",
            hashed_password=hashed_password,
            first_name="Admin",
            last_name="User",
            name="Admin User",
            role="admin",
            user_type="admin",
            is_active=True,
            is_verified=True,
            email_verified=True,
            bio="Platform administrator",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(admin)
        
        # Create client user
        client = User(
            email="client@demo.com",
            hashed_password=hashed_password,
            first_name="John",
            last_name="Client",
            name="John Client",
            role="client",
            user_type="client",
            is_active=True,
            is_verified=True,
            email_verified=True,
            bio="Business owner looking for talented freelancers",
            location="New York, USA",
            account_balance=5000.00,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(client)
        
        # Create freelancer users
        freelancer1 = User(
            email="freelancer@demo.com",
            hashed_password=hashed_password,
            first_name="Sarah",
            last_name="Developer",
            name="Sarah Developer",
            role="freelancer",
            user_type="freelancer",
            is_active=True,
            is_verified=True,
            email_verified=True,
            bio="Full-stack developer with 5+ years of experience in React, Node.js, and Python",
            skills=json.dumps(["React", "Node.js", "Python", "PostgreSQL", "AWS"]),
            hourly_rate=75.00,
            location="San Francisco, USA",
            account_balance=2500.00,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(freelancer1)
        
        freelancer2 = User(
            email="designer@demo.com",
            hashed_password=hashed_password,
            first_name="Mike",
            last_name="Designer",
            name="Mike Designer",
            role="freelancer",
            user_type="freelancer",
            is_active=True,
            is_verified=True,
            email_verified=True,
            bio="UI/UX Designer specializing in modern web and mobile applications",
            skills=json.dumps(["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping"]),
            hourly_rate=65.00,
            location="London, UK",
            account_balance=1800.00,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(freelancer2)
        
        session.flush()  # Get IDs
        
        # Create categories
        categories_data = [
            ("Web Development", "web-development", "Build websites and web applications"),
            ("Mobile Development", "mobile-development", "iOS and Android app development"),
            ("UI/UX Design", "ui-ux-design", "User interface and experience design"),
            ("Data Science", "data-science", "Data analysis and machine learning"),
            ("Content Writing", "content-writing", "Blog posts, articles, and copywriting"),
            ("Digital Marketing", "digital-marketing", "SEO, social media, and online advertising"),
        ]
        
        categories = []
        for name, slug, desc in categories_data:
            cat = Category(name=name, slug=slug, description=desc)
            session.add(cat)
            categories.append(cat)
        
        session.flush()
        
        # Create skills
        skills_data = [
            "Python", "JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL",
            "MongoDB", "AWS", "Docker", "Kubernetes", "Figma", "Adobe XD",
            "UI Design", "UX Research", "Machine Learning", "Data Analysis"
        ]
        
        skills = []
        for skill_name in skills_data:
            skill = Skill(name=skill_name, category="Technology")
            session.add(skill)
            skills.append(skill)
        
        session.flush()
        
        # Create projects
        project1 = Project(
            title="E-commerce Website Development",
            description="Build a modern e-commerce platform with React frontend and Node.js backend. Features include product catalog, shopping cart, payment integration (Stripe), user authentication, and admin dashboard.",
            category="web_development",
            budget_type="fixed",
            budget_min=5000.00,
            budget_max=10000.00,
            experience_level="expert",
            estimated_duration="1-3 months",
            skills="React,Node.js,PostgreSQL,Stripe",
            status="open",
            client_id=client.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(project1)
        
        project2 = Project(
            title="Mobile App UI/UX Redesign",
            description="Redesign the user interface for our fitness tracking mobile app. Need modern, clean design with intuitive navigation. Deliverables include wireframes, mockups, and design system.",
            category="design",
            budget_type="fixed",
            budget_min=2000.00,
            budget_max=4000.00,
            experience_level="intermediate",
            estimated_duration="2-4 weeks",
            skills="Figma,Adobe XD,UI Design,UX Research",
            status="open",
            client_id=client.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(project2)
        
        project3 = Project(
            title="Data Analytics Dashboard",
            description="Create an interactive data analytics dashboard using Python and visualization libraries. Should connect to our PostgreSQL database and display real-time metrics.",
            category="data_science",
            budget_type="fixed",
            budget_min=3000.00,
            budget_max=6000.00,
            experience_level="expert",
            estimated_duration="1-2 months",
            skills="Python,Data Visualization,PostgreSQL,Pandas",
            status="in_progress",
            client_id=client.id,
            created_at=datetime.now(timezone.utc) - timedelta(days=10),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(project3)
        
        session.flush()
        
        # Create proposals
        proposal1 = Proposal(
            project_id=project1.id,
            freelancer_id=freelancer1.id,
            cover_letter="I'm excited to work on your e-commerce project! With my 5+ years of experience in React and Node.js, I can deliver a high-quality platform that meets all your requirements. I've built similar projects before and understand the complexities involved.",
            bid_amount=7500.00,
            estimated_hours=180,
            hourly_rate=42.00,
            availability="immediate",
            status="submitted",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(proposal1)
        
        proposal2 = Proposal(
            project_id=project2.id,
            freelancer_id=freelancer2.id,
            cover_letter="Your fitness app redesign sounds like an exciting challenge! I specialize in creating modern, user-friendly mobile interfaces. I'll provide a complete design system with reusable components.",
            bid_amount=3000.00,
            estimated_hours=50,
            hourly_rate=60.00,
            availability="1-2_weeks",
            status="submitted",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(proposal2)
        
        session.flush()
        
        # Create contract for in-progress project
        contract1 = Contract(
            project_id=project3.id,
            client_id=client.id,
            freelancer_id=freelancer1.id,
            contract_type="fixed",
            amount=4500.00,
            contract_amount=4500.00,
            description="Fixed price contract for analytics dashboard. Payment upon completion of milestones.",
            terms="Standard contract terms apply. Intellectual property transfers upon final payment.",
            status="active",
            start_date=datetime.now(timezone.utc) - timedelta(days=10),
            end_date=datetime.now(timezone.utc) + timedelta(days=35),
            created_at=datetime.now(timezone.utc) - timedelta(days=10),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(contract1)
        
        session.flush()
        
        # Create milestones
        milestone1 = Milestone(
            contract_id=contract1.id,
            title="Project Setup & Database Connection",
            description="Set up development environment and establish database connection",
            amount=1000.00,
            status="completed",
            due_date=datetime.now(timezone.utc) - timedelta(days=5),
            created_at=datetime.now(timezone.utc) - timedelta(days=10)
        )
        session.add(milestone1)
        
        milestone2 = Milestone(
            contract_id=contract1.id,
            title="Dashboard UI Development",
            description="Build the main dashboard interface with charts and tables",
            amount=2000.00,
            status="in_progress",
            due_date=datetime.now(timezone.utc) + timedelta(days=10),
            created_at=datetime.now(timezone.utc) - timedelta(days=10)
        )
        session.add(milestone2)
        
        milestone3 = Milestone(
            contract_id=contract1.id,
            title="Testing & Deployment",
            description="Final testing and deployment to production",
            amount=1500.00,
            status="pending",
            due_date=datetime.now(timezone.utc) + timedelta(days=35),
            created_at=datetime.now(timezone.utc) - timedelta(days=10)
        )
        session.add(milestone3)
        
        # Create a completed payment
        payment1 = Payment(
            contract_id=contract1.id,
            milestone_id=milestone1.id,
            from_user_id=client.id,
            to_user_id=freelancer1.id,
            amount=1000.00,
            freelancer_amount=900.00,
            platform_fee=100.00,
            payment_type="milestone",
            payment_method="usdc",
            status="completed",
            description="Payment for Project Setup & Database Connection milestone",
            created_at=datetime.now(timezone.utc) - timedelta(days=3)
        )
        session.add(payment1)
        
        # Create portfolio items for freelancers
        portfolio1 = PortfolioItem(
            freelancer_id=freelancer1.id,
            title="SaaS Platform Development",
            description="Built a complete SaaS platform with multi-tenant architecture, subscription billing, and analytics dashboard.",
            image_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            project_url="https://example-saas.com",
            created_at=datetime.now(timezone.utc) - timedelta(days=60)
        )
        session.add(portfolio1)
        
        portfolio2 = PortfolioItem(
            freelancer_id=freelancer2.id,
            title="Healthcare App Design",
            description="Designed a comprehensive healthcare management app with focus on accessibility and user experience.",
            image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800",
            project_url="https://dribbble.com/example",
            created_at=datetime.now(timezone.utc) - timedelta(days=45)
        )
        session.add(portfolio2)
        
        # Create a review (needs contract_id, not project_id)
        review1 = Review(
            contract_id=contract1.id,
            reviewer_id=client.id,
            reviewee_id=freelancer1.id,
            rating=5.0,
            comment="Sarah is an excellent developer! She delivered high-quality work on time and was very communicative throughout the project.",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        session.add(review1)
        
        # Create notifications
        notif1 = Notification(
            user_id=freelancer1.id,
            notification_type="proposal_accepted",
            title="Proposal Accepted!",
            content="Your proposal for 'Data Analytics Dashboard' has been accepted.",
            is_read=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=10)
        )
        session.add(notif1)
        
        notif2 = Notification(
            user_id=client.id,
            notification_type="milestone_completed",
            title="Milestone Completed",
            content="Sarah has marked 'Project Setup & Database Connection' as completed.",
            is_read=False,
            created_at=datetime.now(timezone.utc) - timedelta(days=3)
        )
        session.add(notif2)
        
        session.commit()
        print("Demo data seeded successfully!")
        
        # Print summary
        print("\n=== Demo Accounts ===")
        print("Admin:      admin@megilance.com / Password123")
        print("Client:     client@demo.com / Password123")
        print("Freelancer: freelancer@demo.com / Password123")
        print("Designer:   designer@demo.com / Password123")
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()


if __name__ == "__main__":
    engine = create_all_tables()
    seed_demo_data(engine)
