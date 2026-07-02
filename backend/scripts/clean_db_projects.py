import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables if .env exists
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
except ImportError:
    pass

from app.db.turso_http import execute_query, parse_rows

RENAME_MAP = {
    1: ("Figma UI/UX Design for Travel SaaS Dashboard", "Create a modern, high-fidelity Figma UI design for a Travel SaaS Dashboard, including responsive desktop and mobile layouts."),
    2: ("Landing Page Development for Fintech Startup", "Build a high-converting landing page using Next.js, Tailwind CSS, and Framer Motion for a fintech startup."),
    3: ("Stripe Integration for Subscription Billing", "Integrate Stripe billing engine with support for multi-tier subscription plans, coupons, and customer portal."),
    4: ("React & Socket.io Collaborative Whiteboard", "Develop a real-time collaborative whiteboard app using React, Node.js, Socket.io, and HTML5 Canvas."),
    5: ("Slack Bot Development for Jira Integration", "Create a Python-based Slack bot that fetches Jira tickets, updates statuses, and sends daily reports to Slack channels."),
    7: ("Discord Notification System for Trading Signals", "Build a Discord bot that listens to Webhook alerts and posts real-time crypto/stock trading signals to premium channels."),
    8: ("Web Push Notification Service", "Implement a serverless push notification service using Web Push library and service workers for chrome/safari compatibility."),
    9: ("Web Push Notification Service (Staging)", "Staging deployment and verification for the push notification service, including load testing."),
    10: ("PostgreSQL to Turso Migration Strategy", "Develop a migration plan and schema conversion scripts to migrate a legacy PostgreSQL database to Turso Edge database."),
    11: ("Tailwind CSS Theme Refactoring", "Refactor a legacy CSS codebase into Tailwind CSS, establishing a clean design system and component classes."),
    12: ("Figma Wireframe for Healthcare Portal", "Create low-fidelity and high-fidelity wireframes in Figma for a patient-doctor messaging and scheduling portal."),
    13: ("React Native Mobile App Development", "Build a cross-platform mobile application using React Native for a local delivery and tracking service."),
    14: ("Custom WordPress Theme for Law Firm", "Develop a custom WordPress theme, contact forms, and SEO optimization for a local corporate law firm website."),
    19: ("SEO Optimization & Copywriting for SaaS", "Optimize SaaS landing page content for organic search, including keyword research, meta tags, and high-quality copywriting."),
    20: ("SEO Optimization & Copywriting (Audit)", "Perform a comprehensive technical SEO audit and fix indexation issues for an e-learning website."),
    23: ("Docker Containerization for Legacy Python App", "Containerize a legacy Python 2.7 web app using Docker, ensuring compatibility and secure environmental config."),
    26: ("Mobile App Penetration Testing & Audit", "Perform a comprehensive security audit and vulnerability assessment for an Android/iOS e-wallet mobile app."),
    30: ("Social Media Marketing Automation Tool", "Build a dashboard to schedule posts, track analytics, and manage campaigns across Twitter, LinkedIn, and Facebook APIs."),
    31: ("AI Chatbot Integration with OpenAI API", "Integrate GPT-4o conversational chat into a customer support portal with custom instructions and vector embeddings database."),
    32: ("Technical Writing for API Documentation", "Write developer-friendly OpenAPI/Swagger documentation, quick-start guides, and sample SDKs for a fintech API."),
    33: ("Data Pipeline and ETL with Apache Spark", "Design and deploy a scalable data pipeline using Apache Spark, Kafka, and AWS S3 for clickstream log analysis."),
    34: ("Shopify Theme Customization & Payment Integration", "Customize a premium Shopify theme, optimize load speeds, and configure local payment gateways for a clothing brand."),
    36: ("Next.js Headless E-commerce Storefront", "Build a headless storefront using Next.js App Router, connecting to a Shopify admin backend via GraphQL Storefront API."),
    37: ("WooCommerce Site Redesign & SEO Setup", "Redesign a legacy WooCommerce store with modern UI, guest checkout, and comprehensive Schema.org SEO structure."),
    38: ("Multi-vendor E-Commerce Marketplace", "Configure a multi-vendor online marketplace using WooCommerce and Dokan, including custom shipping rules per vendor."),
    39: ("FastAPI REST API Backend with OAuth2", "Develop a secure, high-performance REST API backend using FastAPI, SQLAlchemy 2.0, PostgreSQL, and JWT authentication."),
    40: ("Google Analytics Setup & Custom Reports", "Configure Google Analytics 4 (GA4) custom events, conversion funnels, and Google Tag Manager triggers for a SaaS landing page."),
    41: ("Kubernetes Setup and CI/CD Pipeline", "Architect a production-grade Kubernetes cluster on DigitalOcean, including cert-manager, ingress-nginx, and GitHub Actions."),
    42: ("AWS Cloud Optimization and Cost Control", "Audit AWS cloud infrastructure resources and implement cost-saving policies, resizing EC2, RDS, and S3 retention policies.")
}

def clean_projects():
    print("Beginning database projects cleanup...")
    count = 0
    for p_id, (title, desc) in RENAME_MAP.items():
        try:
            # Check if project exists
            check = execute_query("SELECT id FROM projects WHERE id = ?", [p_id])
            if check and check.get("rows"):
                print(f"Updating Project ID {p_id} to '{title}'...")
                execute_query("UPDATE projects SET title = ?, description = ? WHERE id = ?", [title, desc, p_id])
                count += 1
        except Exception as e:
            print(f"Error updating project ID {p_id}: {e}")
    print(f"Successfully cleaned up {count} test projects in the database.")

if __name__ == '__main__':
    clean_projects()
