"""
MegiLance ORM Model Definitions (Schema Reference Only).

ARCHITECTURE NOTE:
- These SQLAlchemy ORM models are a SCHEMA REFERENCE ONLY.
- Runtime database access uses the Turso HTTP API via
  app.db.turso_http_async (async) or app.db.turso_http (sync).
- sqlalchemy-libsql is NOT installed in production; these models are
  never used for live queries.
- All models are registered with Base.metadata solely so Alembic can
  autogenerate accurate migration scripts.
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
