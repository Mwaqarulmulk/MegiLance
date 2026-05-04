# @AI-HINT: Models package init - exports all SQLAlchemy ORM models for the platform
"""
MegiLance database models.

ARCHITECTURE NOTE: These SQLAlchemy models serve as the canonical schema
reference but are NOT used at runtime for queries.  All database access goes
through raw SQL via the Turso HTTP client (app.db.turso_http).  Changes here
should be mirrored in the corresponding SQL DDL / Alembic migrations.
"""

from .user import User, UserType
from .skill import Skill
from .user_skill import UserSkill
from .project import Project, ProjectStatus, ProjectCategory
from .proposal import Proposal
from .contract import Contract, ContractStatus
from .payment import Payment, PaymentType, PaymentStatus, PaymentMethod
from .portfolio import PortfolioItem
from .message import Message, MessageType
from .conversation import Conversation, ConversationStatus
from .notification import Notification, NotificationType, NotificationPriority
from .review import Review
from .dispute import Dispute, DisputeType, DisputeStatus
from .milestone import Milestone, MilestoneStatus
from .session import UserSession
from .audit_log import AuditLog, AuditAction
from .escrow import Escrow
from .time_entry import TimeEntry
from .invoice import Invoice
from .category import Category
from .favorite import Favorite
from .tag import Tag
from .project_tag import ProjectTag
from .support_ticket import SupportTicket
from .refund import Refund
from .scope_change import ScopeChangeRequest
from .analytics import AnalyticsEvent
from .embedding import ProjectEmbedding, UserEmbedding
from .verification import UserVerification

# Gig marketplace models
from .gig import Gig, GigStatus, GigPackageTier
from .gig_order import GigOrder, GigOrderStatus
from .gig_review import GigReview
from .gig_revision import GigRevision
from .gig_delivery import GigDelivery
from .gig_faq import GigFAQ

# Seller tier system
from .seller_stats import SellerStats, SellerLevel, LEVEL_REQUIREMENTS, LEVEL_BENEFITS

# Talent invitation system
from .talent_invitation import TalentInvitation, InvitationStatus

__all__ = [
    "User",
    "UserType",
    "Skill",
    "UserSkill",
    "Project",
    "ProjectStatus",
    "ProjectCategory",
    "Proposal",
    "Contract",
    "ContractStatus",
    "Payment",
    "PaymentType",
    "PaymentStatus",
    "PaymentMethod",
    "PortfolioItem",
    "Message",
    "MessageType",
    "Conversation",
    "ConversationStatus",
    "Notification",
    "NotificationType",
    "NotificationPriority",
    "Review",
    "Dispute",
    "DisputeType",
    "DisputeStatus",
    "Milestone",
    "MilestoneStatus",
    "UserSession",
    "AuditLog",
    "AuditAction",
    "Escrow",
    "TimeEntry",
    "Invoice",
    "Category",
    "Favorite",
    "Tag",
    "ProjectTag",
    "SupportTicket",
    "Refund",
    "ScopeChangeRequest",
    "AnalyticsEvent",
    "ProjectEmbedding",
    "UserEmbedding",
    "UserVerification",
    # Gig marketplace
    "Gig",
    "GigStatus",
    "GigPackageTier",
    "GigOrder",
    "GigOrderStatus",
    "GigReview",
    "GigRevision",
    "GigDelivery",
    "GigFAQ",
    # Seller tier system
    "SellerStats",
    "SellerLevel",
    "LEVEL_REQUIREMENTS",
    "LEVEL_BENEFITS",
    # Talent invitation
    "TalentInvitation",
    "InvitationStatus",
]
