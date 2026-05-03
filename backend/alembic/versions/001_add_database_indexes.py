# @AI-HINT: Database optimization migration - adds indexes for better query performance
# Revision: 001
# Description: Add indexes for frequently queried columns across all models

"""add_database_indexes

Revision ID: 001_add_indexes
Revises: 
Create Date: 2024-11-13

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_indexes'
down_revision = 'b39ccee56d98'
branch_labels = None
depends_on = None


def upgrade():
    """Add indexes for performance optimization"""
    
    # ===== Users Table Indexes =====
    # Email already has unique index, but add for lookups
    op.create_index('idx_users_email_verified', 'users', ['is_verified'])
    op.create_index('idx_users_user_type', 'users', ['user_type'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])
    op.create_index('idx_users_location', 'users', ['location'])
    
    # ===== Projects Table Indexes =====
    op.create_index('idx_projects_client_id', 'projects', ['client_id'])
    op.create_index('idx_projects_status', 'projects', ['status'])
    op.create_index('idx_projects_created_at', 'projects', ['created_at'])
    op.create_index('idx_projects_budget_range', 'projects', ['budget_min', 'budget_max'])
    # op.create_index('idx_projects_deadline', 'projects', ['deadline'])
    
    # Composite index for common queries
    op.create_index('idx_projects_status_created', 'projects', ['status', 'created_at'])
    
    # ===== Proposals Table Indexes =====
    op.create_index('idx_proposals_project_id', 'proposals', ['project_id'])
    op.create_index('idx_proposals_freelancer_id', 'proposals', ['freelancer_id'])
    op.create_index('idx_proposals_status', 'proposals', ['status'])
    op.create_index('idx_proposals_created_at', 'proposals', ['created_at'])
    
    # Composite index for freelancer's proposals
    op.create_index('idx_proposals_freelancer_status', 'proposals', ['freelancer_id', 'status'])
    
    # ===== Contracts Table Indexes =====
    op.create_index('idx_contracts_project_id', 'contracts', ['project_id'])
    op.create_index('idx_contracts_freelancer_id', 'contracts', ['freelancer_id'])
    op.create_index('idx_contracts_client_id', 'contracts', ['client_id'])
    op.create_index('idx_contracts_status', 'contracts', ['status'])
    op.create_index('idx_contracts_start_date', 'contracts', ['start_date'])
    op.create_index('idx_contracts_end_date', 'contracts', ['end_date'])
    
    # ===== Milestones Table Indexes =====
    op.create_index('idx_milestones_contract_id', 'milestones', ['contract_id'])
    op.create_index('idx_milestones_status', 'milestones', ['status'])
    op.create_index('idx_milestones_due_date', 'milestones', ['due_date'])
    op.create_index('idx_milestones_created_at', 'milestones', ['created_at'])
    
    # ===== Payments Table Indexes =====
    op.create_index('idx_payments_from_user_id', 'payments', ['from_user_id'])
    op.create_index('idx_payments_to_user_id', 'payments', ['to_user_id'])
    # op.create_index('idx_payments_project_id', 'payments', ['project_id'])
    op.create_index('idx_payments_status', 'payments', ['status'])
    op.create_index('idx_payments_created_at', 'payments', ['created_at'])
    op.create_index('idx_payments_payment_method', 'payments', ['payment_method'])
    
    # Composite index for user payment history
    op.create_index('idx_payments_user_created', 'payments', ['from_user_id', 'created_at'])
    
    # ===== Messages Table Indexes =====
    op.create_index('idx_messages_sender_id', 'messages', ['sender_id'])
    op.create_index('idx_messages_receiver_id', 'messages', ['receiver_id'])
    op.create_index('idx_messages_project_id', 'messages', ['project_id'])
    op.create_index('idx_messages_is_read', 'messages', ['is_read'])
    op.create_index('idx_messages_created_at', 'messages', ['created_at'])
    
    # Composite index for unread messages
    op.create_index('idx_messages_receiver_unread', 'messages', ['receiver_id', 'is_read'])
    
    # ===== Notifications Table Indexes =====
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('idx_notifications_created_at', 'notifications', ['created_at'])
    op.create_index('idx_notifications_type', 'notifications', ['notification_type'])
    
    # Composite index for unread notifications
    op.create_index('idx_notifications_user_unread', 'notifications', ['user_id', 'is_read'])
    
    # ===== Reviews Table Indexes =====
    op.create_index('idx_reviews_reviewer_id', 'reviews', ['reviewer_id'])
    op.create_index('idx_reviews_reviewee_id', 'reviews', ['reviewee_id'])
    # op.create_index('idx_reviews_project_id', 'reviews', ['project_id'])
    op.create_index('idx_reviews_rating', 'reviews', ['rating'])
    op.create_index('idx_reviews_created_at', 'reviews', ['created_at'])
    
    # Composite index for user's received reviews
    op.create_index('idx_reviews_reviewee_rating', 'reviews', ['reviewee_id', 'rating'])
    
    # ===== Disputes Table Indexes =====
    op.create_index('idx_disputes_contract_id', 'disputes', ['contract_id'])
    op.create_index('idx_disputes_raised_by', 'disputes', ['raised_by'])
    op.create_index('idx_disputes_status', 'disputes', ['status'])
    op.create_index('idx_disputes_created_at', 'disputes', ['created_at'])
    
    # ===== Invoices Table Indexes =====
    # op.create_index('idx_invoices_from_user_id', 'invoices', ['from_user_id'])
    # op.create_index('idx_invoices_to_user_id', 'invoices', ['to_user_id'])
    # op.create_index('idx_invoices_project_id', 'invoices', ['project_id'])
    # op.create_index('idx_invoices_status', 'invoices', ['status'])
    # op.create_index('idx_invoices_due_date', 'invoices', ['due_date'])
    # op.create_index('idx_invoices_created_at', 'invoices', ['created_at'])
    
    # ===== Time Entries Table Indexes =====
    # op.create_index('idx_time_entries_user_id', 'time_entries', ['user_id'])
    # op.create_index('idx_time_entries_project_id', 'time_entries', ['project_id'])
    # op.create_index('idx_time_entries_date', 'time_entries', ['date'])
    # op.create_index('idx_time_entries_created_at', 'time_entries', ['created_at'])
    
    # Composite index for project time tracking
    # op.create_index('idx_time_entries_project_date', 'time_entries', ['project_id', 'date'])
    
    # ===== Escrow Table Indexes =====
    # op.create_index('idx_escrow_contract_id', 'escrow', ['contract_id'])
    # op.create_index('idx_escrow_client_id', 'escrow', ['client_id'])
    # op.create_index('idx_escrow_freelancer_id', 'escrow', ['freelancer_id'])
    # op.create_index('idx_escrow_status', 'escrow', ['status'])
    # op.create_index('idx_escrow_created_at', 'escrow', ['created_at'])
    
    # ===== Support Tickets Table Indexes =====
    # op.create_index('idx_support_tickets_user_id', 'support_tickets', ['user_id'])
    # op.create_index('idx_support_tickets_status', 'support_tickets', ['status'])
    # op.create_index('idx_support_tickets_priority', 'support_tickets', ['priority'])
    # op.create_index('idx_support_tickets_created_at', 'support_tickets', ['created_at'])
    # op.create_index('idx_support_tickets_assigned_to', 'support_tickets', ['assigned_to'])
    
    # Composite index for ticket queue
    # op.create_index('idx_support_tickets_status_priority', 'support_tickets', ['status', 'priority'])
    
    # ===== Skills Table Indexes =====
    op.create_index('idx_skills_name', 'skills', ['name'])
    op.create_index('idx_skills_category', 'skills', ['category'])
    
    # ===== User Skills Table Indexes =====
    op.create_index('idx_user_skills_user_id', 'user_skills', ['user_id'])
    op.create_index('idx_user_skills_skill_id', 'user_skills', ['skill_id'])
    op.create_index('idx_user_skills_proficiency', 'user_skills', ['proficiency_level'])
    
    # ===== Portfolio Table Indexes =====
    op.create_index('idx_portfolio_user_id', 'portfolio_items', ['freelancer_id'])
    op.create_index('idx_portfolio_created_at', 'portfolio_items', ['created_at'])
    
    # ===== Favorites Table Indexes =====
    # op.create_index('idx_favorites_user_id', 'favorites', ['user_id'])
    # op.create_index('idx_favorites_favorited_user_id', 'favorites', ['favorited_user_id'])
    # op.create_index('idx_favorites_project_id', 'favorites', ['project_id'])
    
    # ===== Tags Table Indexes =====
    # op.create_index('idx_tags_name', 'tags', ['name'])
    
    # ===== Project Tags Table Indexes =====
    # op.create_index('idx_project_tags_project_id', 'project_tags', ['project_id'])
    # op.create_index('idx_project_tags_tag_id', 'project_tags', ['tag_id'])
    
    # ===== Categories Table Indexes =====
    # op.create_index('idx_categories_name', 'categories', ['name'])
    # op.create_index('idx_categories_parent_id', 'categories', ['parent_id'])
    
    # ===== Refunds Table Indexes =====
    # op.create_index('idx_refunds_payment_id', 'refunds', ['payment_id'])
    # op.create_index('idx_refunds_requested_by', 'refunds', ['requested_by'])
    # op.create_index('idx_refunds_status', 'refunds', ['status'])
    # op.create_index('idx_refunds_created_at', 'refunds', ['created_at'])
    
    # ===== Audit Logs Table Indexes =====
    op.create_index('idx_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('idx_audit_logs_entity_type', 'audit_logs', ['entity_type'])
    op.create_index('idx_audit_logs_created_at', 'audit_logs', ['created_at'])
    
    # Composite index for user activity tracking
    op.create_index('idx_audit_logs_user_created', 'audit_logs', ['user_id', 'created_at'])
    
    # ===== User Sessions Table Indexes =====
    op.create_index('idx_user_sessions_user_id', 'user_sessions', ['user_id'])
    op.create_index('idx_user_sessions_session_token', 'user_sessions', ['session_token'])
    op.create_index('idx_user_sessions_expires_at', 'user_sessions', ['expires_at'])
    op.create_index('idx_user_sessions_created_at', 'user_sessions', ['created_at'])


def downgrade():
    """Remove all indexes"""
    
    # Users
    op.drop_index('idx_users_email_verified')
    op.drop_index('idx_users_user_type')
    op.drop_index('idx_users_created_at')
    op.drop_index('idx_users_location')
    
    # Projects
    op.drop_index('idx_projects_client_id')
    op.drop_index('idx_projects_status')
    op.drop_index('idx_projects_created_at')
    op.drop_index('idx_projects_budget_range')
    # op.drop_index('idx_projects_deadline')
    op.drop_index('idx_projects_status_created')
    
    # Proposals
    op.drop_index('idx_proposals_project_id')
    op.drop_index('idx_proposals_freelancer_id')
    op.drop_index('idx_proposals_status')
    op.drop_index('idx_proposals_created_at')
    op.drop_index('idx_proposals_freelancer_status')
    
    # Contracts
    op.drop_index('idx_contracts_project_id')
    op.drop_index('idx_contracts_freelancer_id')
    op.drop_index('idx_contracts_client_id')
    op.drop_index('idx_contracts_status')
    op.drop_index('idx_contracts_start_date')
    op.drop_index('idx_contracts_end_date')
    
    # Milestones
    op.drop_index('idx_milestones_contract_id')
    op.drop_index('idx_milestones_status')
    op.drop_index('idx_milestones_due_date')
    op.drop_index('idx_milestones_created_at')
    
    # Payments
    op.drop_index('idx_payments_from_user_id')
    op.drop_index('idx_payments_to_user_id')
    # op.drop_index('idx_payments_project_id')
    op.drop_index('idx_payments_status')
    op.drop_index('idx_payments_created_at')
    op.drop_index('idx_payments_payment_method')
    op.drop_index('idx_payments_user_created')
    
    # Messages
    op.drop_index('idx_messages_sender_id')
    op.drop_index('idx_messages_receiver_id')
    op.drop_index('idx_messages_project_id')
    op.drop_index('idx_messages_is_read')
    op.drop_index('idx_messages_created_at')
    op.drop_index('idx_messages_receiver_unread')
    
    # Notifications
    op.drop_index('idx_notifications_user_id')
    op.drop_index('idx_notifications_is_read')
    op.drop_index('idx_notifications_created_at')
    op.drop_index('idx_notifications_type')
    op.drop_index('idx_notifications_user_unread')
    
    # Reviews
    op.drop_index('idx_reviews_reviewer_id')
    op.drop_index('idx_reviews_reviewee_id')
    # op.drop_index('idx_reviews_project_id')
    op.drop_index('idx_reviews_rating')
    op.drop_index('idx_reviews_created_at')
    op.drop_index('idx_reviews_reviewee_rating')
    
    # Disputes
    op.drop_index('idx_disputes_contract_id')
    op.drop_index('idx_disputes_raised_by')
    op.drop_index('idx_disputes_status')
    op.drop_index('idx_disputes_created_at')
    
    # Invoices
    # op.drop_index('idx_invoices_from_user_id')
    # op.drop_index('idx_invoices_to_user_id')
    # op.drop_index('idx_invoices_project_id')
    # op.drop_index('idx_invoices_status')
    # op.drop_index('idx_invoices_due_date')
    # op.drop_index('idx_invoices_created_at')
    
    # Time Entries
    # op.drop_index('idx_time_entries_user_id')
    # op.drop_index('idx_time_entries_project_id')
    # op.drop_index('idx_time_entries_date')
    # op.drop_index('idx_time_entries_created_at')
    # op.drop_index('idx_time_entries_project_date')
    
    # Escrow
    # op.drop_index('idx_escrow_contract_id')
    # op.drop_index('idx_escrow_client_id')
    # op.drop_index('idx_escrow_freelancer_id')
    # op.drop_index('idx_escrow_status')
    # op.drop_index('idx_escrow_created_at')
    
    # Support Tickets
    # op.drop_index('idx_support_tickets_user_id')
    # op.drop_index('idx_support_tickets_status')
    # op.drop_index('idx_support_tickets_priority')
    # op.drop_index('idx_support_tickets_created_at')
    # op.drop_index('idx_support_tickets_assigned_to')
    # op.drop_index('idx_support_tickets_status_priority')
    
    # Skills
    op.drop_index('idx_skills_name')
    op.drop_index('idx_skills_category')
    
    # User Skills
    op.drop_index('idx_user_skills_user_id')
    op.drop_index('idx_user_skills_skill_id')
    op.drop_index('idx_user_skills_proficiency')
    
    # Portfolio
    op.drop_index('idx_portfolio_user_id')
    op.drop_index('idx_portfolio_created_at')
    
    # Favorites
    # op.drop_index('idx_favorites_user_id')
    # op.drop_index('idx_favorites_favorited_user_id')
    # op.drop_index('idx_favorites_project_id')
    
    # Tags
    # op.drop_index('idx_tags_name')
    
    # Project Tags
    # op.drop_index('idx_project_tags_project_id')
    # op.drop_index('idx_project_tags_tag_id')
    
    # Categories
    # op.drop_index('idx_categories_name')
    # op.drop_index('idx_categories_parent_id')
    
    # Refunds
    # op.drop_index('idx_refunds_payment_id')
    # op.drop_index('idx_refunds_requested_by')
    # op.drop_index('idx_refunds_status')
    # op.drop_index('idx_refunds_created_at')
    
    # Audit Logs
    op.drop_index('idx_audit_logs_user_id')
    op.drop_index('idx_audit_logs_action')
    op.drop_index('idx_audit_logs_entity_type')
    op.drop_index('idx_audit_logs_created_at')
    op.drop_index('idx_audit_logs_user_created')
    
    # User Sessions
    op.drop_index('idx_user_sessions_user_id')
    op.drop_index('idx_user_sessions_session_token')
    op.drop_index('idx_user_sessions_expires_at')
    op.drop_index('idx_user_sessions_created_at')
