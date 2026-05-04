# @AI-HINT: Comprehensive database seeder - populates all tables with realistic demo data
"""
MegiLance Complete Data Seeder
Seeds all tables: users, projects, proposals, contracts, milestones, 
payments, reviews, portfolios, skills, notifications, messages, etc.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta
import random
import json

# Import FastAPI app for proper initialization
from app.db.session import get_session_local, get_engine
from app.db.base import Base
from app.core.security import get_password_hash

# Import all models
from app.models.user import User
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.contract import Contract
from app.models.payment import Payment
from app.models.milestone import Milestone
from app.models.review import Review
from app.models.portfolio import PortfolioItem
from app.models.skill import Skill
from app.models.notification import Notification
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.category import Category
from app.models.tag import Tag
from app.models.support_ticket import SupportTicket
from app.models.referral import Referral
from app.models.favorite import Favorite
from app.models.time_entry import TimeEntry
from app.models.audit_log import AuditLog


def seed_all():
    """Seed all database tables with comprehensive demo data"""
    
    # Initialize engine and create tables
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    
    # Get session
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        print("🌱 Starting comprehensive database seeding...")
        print("=" * 60)
        
        # === 1. CLEAR EXISTING DATA ===
        print("\n🗑️  Clearing existing data...")
        tables_to_clear = [
            TimeEntry, AuditLog, Favorite, Referral, SupportTicket,
            Payment, Review, Milestone, Contract, Proposal,
            PortfolioItem, Message, Conversation, Notification,
            Project, Skill, Category, Tag
        ]
        
        for table in tables_to_clear:
            try:
                db.query(table).delete()
            except Exception as e:
                print(f"  Warning: Could not clear {table.__name__}: {e}")
        
        # Clear non-admin users
        db.query(User).filter(User.email != "admin@megilance.com").delete()
        db.commit()
        print("  ✓ Existing data cleared")
        
        # === 2. CREATE CATEGORIES ===
        print("\n📂 Creating categories...")
        categories_data = [
            ("Web Development", "web-development", "Building websites and web applications"),
            ("Mobile Development", "mobile-development", "iOS and Android app development"),
            ("Data Science", "data-science", "Analytics, ML, and AI projects"),
            ("UI/UX Design", "ui-ux-design", "User interface and experience design"),
            ("DevOps", "devops", "Cloud infrastructure and CI/CD"),
            ("Blockchain", "blockchain", "Smart contracts and Web3 development"),
            ("Backend Development", "backend-development", "Server-side programming"),
            ("Frontend Development", "frontend-development", "Client-side development"),
            ("Game Development", "game-development", "Video game creation"),
            ("Cybersecurity", "cybersecurity", "Security audits and implementations"),
        ]
        
        categories = []
        for name, slug, desc in categories_data:
            cat = Category(name=name, slug=slug, description=desc, is_active=True)
            db.add(cat)
            categories.append(cat)
        db.commit()
        print(f"  ✓ Created {len(categories)} categories")
        
        # === 3. CREATE SKILLS ===
        print("\n💎 Creating skills...")
        skills_data = {
            "Web Development": ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
            "Backend Development": ["Node.js", "Python", "FastAPI", "Django", "Flask", "Express.js", "PostgreSQL", "MongoDB", "GraphQL"],
            "Mobile Development": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"],
            "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Terraform"],
            "Data Science": ["Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Deep Learning"],
            "Design": ["UI/UX Design", "Figma", "Adobe XD", "Sketch", "Prototyping"],
            "Blockchain": ["Solidity", "Smart Contracts", "Web3.js", "Ethereum", "DeFi"],
        }
        
        skills = []
        for category, skill_names in skills_data.items():
            for skill_name in skill_names:
                skill = Skill(
                    name=skill_name,
                    category=category,
                    description=f"Professional {skill_name} expertise",
                    is_active=True
                )
                db.add(skill)
                skills.append(skill)
        db.commit()
        print(f"  ✓ Created {len(skills)} skills")
        
        # === 4. CREATE TAGS ===
        print("\n🏷️  Creating tags...")
        tags_data = ["urgent", "remote", "full-time", "part-time", "long-term", "short-term", 
                     "startup", "enterprise", "e-commerce", "fintech", "healthtech", "edtech"]
        tags = []
        for tag_name in tags_data:
            tag = Tag(name=tag_name, slug=tag_name.lower().replace(" ", "-"), type="general")
            db.add(tag)
            tags.append(tag)
        db.commit()
        print(f"  ✓ Created {len(tags)} tags")
        
        # === 5. CREATE USERS ===
        print("\n👥 Creating users...")
        
        # Admin
        admin = db.query(User).filter(User.email == "admin@megilance.com").first()
        if not admin:
            admin = User(
                email="admin@megilance.com",
                hashed_password=get_password_hash("admin123"),
                name="Admin User",
                user_type="admin",
                role="admin",
                is_active=True,
                is_verified=True,
                email_verified=True,
                account_balance=0.0
            )
            db.add(admin)
        
        # Clients
        clients_data = [
            ("TechStartup Inc", "client1@example.com", "SaaS startup", "San Francisco, CA"),
            ("E-Commerce Solutions", "client2@example.com", "E-commerce platform", "New York, NY"),
            ("FinTech Innovations", "client3@example.com", "Financial services", "London, UK"),
            ("HealthTech Corp", "client4@example.com", "Digital health", "Toronto, Canada"),
            ("AI Research Lab", "client5@example.com", "AI and ML research", "Singapore"),
        ]
        
        clients = []
        for name, email, bio, location in clients_data:
            client = User(
                email=email,
                hashed_password=get_password_hash("password123"),
                name=name,
                user_type="client",
                role="user",
                bio=bio,
                location=location,
                is_active=True,
                is_verified=True,
                email_verified=True,
                account_balance=round(random.uniform(5000, 50000), 2)
            )
            clients.append(client)
            db.add(client)
        
        # Freelancers
        freelancers_data = [
            ("Sarah Chen", "freelancer1@example.com", "Full-stack developer with 8+ years in React and Node.js", ["React", "Node.js", "TypeScript"], 85.0, "Austin, TX"),
            ("Marcus Johnson", "freelancer2@example.com", "UI/UX designer specializing in modern design", ["Figma", "UI/UX Design", "Prototyping"], 75.0, "Seattle, WA"),
            ("Priya Patel", "freelancer3@example.com", "Data scientist and ML engineer", ["Machine Learning", "Python", "TensorFlow"], 95.0, "Bangalore, India"),
            ("Alex Rivera", "freelancer4@example.com", "Mobile app developer - React Native specialist", ["React Native", "Flutter", "iOS"], 80.0, "Mexico City, Mexico"),
            ("Emma Williams", "freelancer5@example.com", "DevOps engineer and cloud architect", ["Docker", "Kubernetes", "AWS"], 90.0, "Berlin, Germany"),
            ("David Kim", "freelancer6@example.com", "Blockchain developer - Solidity expert", ["Solidity", "Web3.js", "Ethereum"], 100.0, "Seoul, South Korea"),
            ("Lisa Anderson", "freelancer7@example.com", "Backend architect - microservices specialist", ["Python", "FastAPI", "PostgreSQL"], 88.0, "Amsterdam, Netherlands"),
            ("Mohammed Al-Rashid", "freelancer8@example.com", "Frontend specialist - Vue.js expert", ["Vue.js", "TypeScript", "Tailwind CSS"], 70.0, "Dubai, UAE"),
        ]
        
        freelancers = []
        for name, email, bio, skill_list, rate, location in freelancers_data:
            freelancer = User(
                email=email,
                hashed_password=get_password_hash("password123"),
                name=name,
                user_type="freelancer",
                role="user",
                bio=bio,
                skills=json.dumps(skill_list),
                hourly_rate=rate,
                location=location,
                is_active=True,
                is_verified=True,
                email_verified=True,
                account_balance=round(random.uniform(1000, 10000), 2)
            )
            freelancers.append(freelancer)
            db.add(freelancer)
        
        db.commit()
        print(f"  ✓ Created 1 admin, {len(clients)} clients, {len(freelancers)} freelancers")
        
        # === 6. CREATE PROJECTS ===
        print("\n📋 Creating projects...")
        
        projects_data = [
            ("E-Commerce Platform Redesign", "Complete redesign using React and microservices", "Web Development", "fixed", 15000, 25000, "expert", "open", 0, ["React", "Node.js", "PostgreSQL"]),
            ("Mobile Banking App", "Secure banking app for iOS and Android", "Mobile Development", "fixed", 30000, 45000, "expert", "open", 1, ["React Native", "iOS", "Android"]),
            ("AI-Powered Chatbot", "GPT-4 chatbot for customer service", "Data Science", "hourly", 80, 120, "expert", "in_progress", 4, ["Machine Learning", "Python", "TensorFlow"]),
            ("DeFi Lending Protocol", "Ethereum-based lending protocol", "Blockchain", "fixed", 40000, 60000, "expert", "open", 2, ["Solidity", "Web3.js", "Ethereum"]),
            ("Healthcare Dashboard", "Doctor and patient dashboard", "UI/UX Design", "fixed", 8000, 12000, "intermediate", "open", 3, ["Figma", "UI/UX Design", "Prototyping"]),
            ("Cloud Infrastructure", "AWS setup with Kubernetes", "DevOps", "fixed", 10000, 15000, "expert", "completed", 0, ["Docker", "Kubernetes", "AWS"]),
            ("Content Management System", "Custom CMS with SEO", "Web Development", "fixed", 5000, 8000, "intermediate", "open", 1, ["Next.js", "TypeScript", "PostgreSQL"]),
            ("Real-time Analytics", "Data visualization dashboard", "Data Science", "hourly", 70, 100, "intermediate", "open", 4, ["Python", "Pandas", "React"]),
            ("Microservices Migration", "Monolith to microservices", "Backend Development", "fixed", 20000, 30000, "expert", "in_progress", 0, ["Python", "FastAPI", "Docker"]),
            ("Cross-Platform Game", "Casual mobile game", "Mobile Development", "fixed", 18000, 25000, "intermediate", "open", 3, ["Flutter", "iOS", "Android"]),
        ]
        
        projects = []
        for title, desc, category, budget_type, min_b, max_b, exp_level, status, client_idx, skill_list in projects_data:
            project = Project(
                title=title,
                description=desc,
                category=category,
                budget_type=budget_type,
                budget_min=min_b,
                budget_max=max_b,
                experience_level=exp_level,
                estimated_duration="2-4 weeks" if budget_type == "fixed" else "Ongoing",
                skills=json.dumps(skill_list),
                client_id=clients[client_idx].id,
                status=status,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
            )
            projects.append(project)
            db.add(project)
        
        db.commit()
        print(f"  ✓ Created {len(projects)} projects")
        
        # === 7. CREATE PROPOSALS ===
        print("\n💼 Creating proposals...")
        
        proposals_created = 0
        proposals = []
        for project in projects:
            if project.status in ["open", "in_progress"]:
                num_proposals = random.randint(2, 4)
                selected = random.sample(freelancers, min(num_proposals, len(freelancers)))
                
                for i, freelancer in enumerate(selected):
                    bid = project.budget_max * random.uniform(0.7, 1.0) if project.budget_type == "fixed" else freelancer.hourly_rate
                    proposal = Proposal(
                        project_id=project.id,
                        freelancer_id=freelancer.id,
                        cover_letter=f"Excited about this {project.category} project! I have experience with similar work.",
                        bid_amount=round(bid, 2),
                        estimated_hours=random.randint(40, 200),
                        hourly_rate=freelancer.hourly_rate,
                        availability=random.choice(["immediately", "1-2_weeks", "2-4_weeks"]),
                        status="accepted" if project.status == "in_progress" and i == 0 else "submitted",
                        created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 10))
                    )
                    db.add(proposal)
                    proposals.append(proposal)
                    proposals_created += 1
        
        db.commit()
        print(f"  ✓ Created {proposals_created} proposals")
        
        # === 8. CREATE CONTRACTS, MILESTONES, PAYMENTS ===
        print("\n📄 Creating contracts, milestones, and payments...")
        
        accepted_proposals = [p for p in proposals if p.status == "accepted"]
        contracts_created = 0
        milestones_created = 0
        payments_created = 0
        
        for proposal in accepted_proposals:
            project = next(p for p in projects if p.id == proposal.project_id)
            
            contract = Contract(
                project_id=proposal.project_id,
                freelancer_id=proposal.freelancer_id,
                client_id=project.client_id,
                winning_bid_id=proposal.id,
                amount=proposal.bid_amount,
                contract_amount=proposal.bid_amount,
                platform_fee=round(proposal.bid_amount * 0.1, 2),
                status="completed" if project.status == "completed" else "active",
                start_date=datetime.now(timezone.utc) - timedelta(days=random.randint(10, 30)),
                description=f"Contract for {project.title}",
                terms="Standard terms apply."
            )
            db.add(contract)
            db.commit()
            contracts_created += 1
            
            # Milestones
            num_milestones = random.randint(2, 4)
            milestone_amount = round(contract.amount / num_milestones, 2)
            milestone_titles = ["Planning", "Development", "Testing", "Deployment"]
            
            for i in range(num_milestones):
                is_completed = project.status == "completed"
                ms_status = "paid" if is_completed else ("approved" if i < num_milestones - 1 else "pending")
                
                milestone = Milestone(
                    contract_id=contract.id,
                    title=f"Milestone {i+1}: {milestone_titles[i % 4]}",
                    description=f"Complete {milestone_titles[i % 4].lower()} phase",
                    amount=milestone_amount,
                    due_date=contract.start_date + timedelta(days=7 * (i + 1)),
                    status=ms_status,
                    order_index=i,
                    approved_at=datetime.now(timezone.utc) if ms_status in ["approved", "paid"] else None,
                    paid_at=datetime.now(timezone.utc) if ms_status == "paid" else None
                )
                db.add(milestone)
                db.commit()
                milestones_created += 1
                
                # Payment for paid milestones
                if ms_status == "paid":
                    payment = Payment(
                        contract_id=contract.id,
                        milestone_id=milestone.id,
                        from_user_id=project.client_id,
                        to_user_id=proposal.freelancer_id,
                        amount=milestone_amount,
                        payment_type="milestone",
                        payment_method="stripe",
                        status="completed",
                        platform_fee=round(milestone_amount * 0.1, 2),
                        freelancer_amount=round(milestone_amount * 0.9, 2),
                        processed_at=datetime.now(timezone.utc),
                        transaction_id=f"txn_{random.randint(100000, 999999)}"
                    )
                    db.add(payment)
                    payments_created += 1
        
        db.commit()
        print(f"  ✓ Created {contracts_created} contracts, {milestones_created} milestones, {payments_created} payments")
        
        # === 9. CREATE REVIEWS ===
        print("\n⭐ Creating reviews...")
        
        completed_contracts = [c for c in db.query(Contract).filter(Contract.status == "completed").all()]
        reviews_created = 0
        
        review_comments_client = [
            "Excellent work! Delivered on time and exceeded expectations.",
            "Great communication and professional work. Highly recommended!",
            "Very skilled developer. Will definitely hire again.",
            "Outstanding quality and attention to detail."
        ]
        review_comments_freelancer = [
            "Great client! Clear requirements and prompt payments.",
            "Professional and responsive. Pleasure to work with.",
            "Excellent communication throughout the project.",
            "Fair and understanding client. Would work with again."
        ]
        
        for contract in completed_contracts:
            # Client reviews freelancer
            review1 = Review(
                contract_id=contract.id,
                reviewer_id=contract.client_id,
                reviewee_id=contract.freelancer_id,
                rating=round(random.uniform(4.0, 5.0), 1),
                comment=random.choice(review_comments_client),
                is_public=True
            )
            db.add(review1)
            reviews_created += 1
            
            # Freelancer reviews client
            review2 = Review(
                contract_id=contract.id,
                reviewer_id=contract.freelancer_id,
                reviewee_id=contract.client_id,
                rating=round(random.uniform(4.0, 5.0), 1),
                comment=random.choice(review_comments_freelancer),
                is_public=True
            )
            db.add(review2)
            reviews_created += 1
        
        db.commit()
        print(f"  ✓ Created {reviews_created} reviews")
        
        # === 10. CREATE PORTFOLIO ITEMS ===
        print("\n🎨 Creating portfolio items...")
        
        portfolio_created = 0
        for freelancer in freelancers[:6]:
            for i in range(random.randint(2, 4)):
                portfolio = PortfolioItem(
                    freelancer_id=freelancer.id,
                    title=f"{random.choice(['E-commerce', 'SaaS', 'Mobile', 'Dashboard'])} Project {i+1}",
                    description=f"Successfully delivered project showcasing my expertise.",
                    image_url=f"https://picsum.photos/seed/{random.randint(1000, 9999)}/800/600",
                    project_url=f"https://example.com/project-{i+1}" if random.random() > 0.5 else None
                )
                db.add(portfolio)
                portfolio_created += 1
        
        db.commit()
        print(f"  ✓ Created {portfolio_created} portfolio items")
        
        # === 11. CREATE CONVERSATIONS & MESSAGES ===
        print("\n💬 Creating conversations and messages...")
        
        conversations_created = 0
        messages_created = 0
        
        for project in projects[:5]:
            freelancer = random.choice(freelancers)
            client = next(c for c in clients if c.id == project.client_id)
            
            conv = Conversation(
                project_id=project.id,
                client_id=client.id,
                freelancer_id=freelancer.id,
                title=f"Discussion: {project.title}",
                status="active",
                last_message_at=datetime.now(timezone.utc)
            )
            db.add(conv)
            db.commit()
            conversations_created += 1
            
            # Add messages
            messages_text = [
                ("client", "Hi! I'm interested in discussing this project."),
                ("freelancer", "Hello! I'd love to help. What are your main requirements?"),
                ("client", "We need a scalable solution that can handle high traffic."),
                ("freelancer", "Great! I have experience with similar projects. Let me share some ideas."),
            ]
            
            for role, content in messages_text:
                sender = client if role == "client" else freelancer
                receiver = freelancer if role == "client" else client
                
                msg = Message(
                    conversation_id=conv.id,
                    sender_id=sender.id,
                    receiver_id=receiver.id,
                    project_id=project.id,
                    content=content,
                    message_type="text",
                    is_read=random.random() > 0.3,
                    sent_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
                )
                db.add(msg)
                messages_created += 1
        
        db.commit()
        print(f"  ✓ Created {conversations_created} conversations, {messages_created} messages")
        
        # === 12. CREATE NOTIFICATIONS ===
        print("\n🔔 Creating notifications...")
        
        notifications_created = 0
        notification_types = [
            ("proposal_received", "New Proposal", "You received a new proposal"),
            ("proposal_accepted", "Proposal Accepted", "Your proposal was accepted"),
            ("payment_received", "Payment Received", "You received a payment"),
            ("milestone_approved", "Milestone Approved", "Your milestone was approved"),
            ("new_message", "New Message", "You have a new message"),
        ]
        
        for user in (freelancers + clients):
            for _ in range(random.randint(2, 5)):
                ntype, title, content = random.choice(notification_types)
                notif = Notification(
                    user_id=user.id,
                    notification_type=ntype,
                    title=title,
                    content=content,
                    is_read=random.random() > 0.3,
                    priority="normal",
                    created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 72))
                )
                db.add(notif)
                notifications_created += 1
        
        db.commit()
        print(f"  ✓ Created {notifications_created} notifications")
        
        # === 13. CREATE SUPPORT TICKETS ===
        print("\n🎫 Creating support tickets...")
        
        tickets_created = 0
        ticket_subjects = [
            "Payment issue", "Account verification", "Dispute resolution", 
            "Technical problem", "Feature request"
        ]
        
        for user in random.sample(freelancers + clients, 3):
            ticket = SupportTicket(
                user_id=user.id,
                subject=random.choice(ticket_subjects),
                description="I need help with my account. Please assist.",
                status=random.choice(["open", "in_progress", "resolved"]),
                priority=random.choice(["low", "medium", "high"]),
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))
            )
            db.add(ticket)
            tickets_created += 1
        
        db.commit()
        print(f"  ✓ Created {tickets_created} support tickets")
        
        # === FINAL SUMMARY ===
        print("\n" + "=" * 60)
        print("🎉 DATABASE SEEDING COMPLETE!")
        print("=" * 60)
        
        total_users = 1 + len(clients) + len(freelancers)
        
        print(f"""
📊 SEEDED DATA SUMMARY:

Users:
  • Admin: 1
  • Clients: {len(clients)}
  • Freelancers: {len(freelancers)}
  • Total: {total_users}

Content:
  • Categories: {len(categories)}
  • Skills: {len(skills)}
  • Tags: {len(tags)}
  • Projects: {len(projects)}
  • Proposals: {proposals_created}
  • Contracts: {contracts_created}
  • Milestones: {milestones_created}
  • Payments: {payments_created}
  • Reviews: {reviews_created}
  • Portfolio Items: {portfolio_created}
  • Conversations: {conversations_created}
  • Messages: {messages_created}
  • Notifications: {notifications_created}
  • Support Tickets: {tickets_created}

🔐 LOGIN CREDENTIALS:
  Admin:      admin@megilance.com / admin123
  Client:     client1@example.com / password123
  Freelancer: freelancer1@example.com / password123

🚀 READY TO TEST!
        """)
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
