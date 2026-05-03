# @AI-HINT: Migration to add enhanced freelancer profile fields for shareable profiles
"""add_enhanced_profile_fields

Revision ID: c7e3a2f19b45
Revises: 85124def9342
Create Date: 2026-02-14 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'c7e3a2f19b45'
down_revision = '85124def9342'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enhanced profile fields for freelancers
    columns_to_add = [
        ("profile_slug", "VARCHAR(100)"),
        ("headline", "VARCHAR(300)"),
        ("experience_level", "VARCHAR(20)"),
        ("years_of_experience", "INTEGER"),
        ("education", "TEXT"),
        ("certifications", "TEXT"),
        ("work_history", "TEXT"),
        ("linkedin_url", "VARCHAR(500)"),
        ("github_url", "VARCHAR(500)"),
        ("website_url", "VARCHAR(500)"),
        ("twitter_url", "VARCHAR(500)"),
        ("dribbble_url", "VARCHAR(500)"),
        ("behance_url", "VARCHAR(500)"),
        ("stackoverflow_url", "VARCHAR(500)"),
        ("phone_number", "VARCHAR(30)"),
        ("video_intro_url", "VARCHAR(500)"),
        ("resume_url", "VARCHAR(500)"),
        ("availability_hours", "VARCHAR(20)"),
        ("preferred_project_size", "VARCHAR(20)"),
        ("industry_focus", "TEXT"),
        ("tools_and_technologies", "TEXT"),
        ("achievements", "TEXT"),
        ("testimonials_enabled", "BOOLEAN DEFAULT 1"),
        ("contact_preferences", "TEXT"),
        ("profile_views", "INTEGER DEFAULT 0"),
        ("profile_visibility", "VARCHAR(20) DEFAULT 'public'"),
    ]

    for col_name, col_type in columns_to_add:
        try:
            op.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        except Exception:
            pass  # Column may already exist

    # Create unique index for profile_slug
    try:
        op.execute("CREATE UNIQUE INDEX ix_users_profile_slug ON users(profile_slug)")
    except Exception:
        pass


def downgrade() -> None:
    columns_to_drop = [
        "profile_slug", "headline", "experience_level", "years_of_experience",
        "education", "certifications", "work_history", "linkedin_url",
        "github_url", "website_url", "twitter_url", "dribbble_url",
        "behance_url", "stackoverflow_url", "phone_number", "video_intro_url",
        "resume_url", "availability_hours", "preferred_project_size",
        "industry_focus", "tools_and_technologies", "achievements",
        "testimonials_enabled", "contact_preferences", "profile_views",
        "profile_visibility",
    ]
    for col_name in columns_to_drop:
        try:
            op.execute(f"ALTER TABLE users DROP COLUMN {col_name}")
        except Exception:
            pass
