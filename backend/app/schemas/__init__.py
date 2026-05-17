"""
MegiLance Pydantic Schema Definitions.

ARCHITECTURE NOTE:
- These are Pydantic v2 models for API request/response validation.
- They mirror the ORM models in app.models but are decoupled from
  SQLAlchemy — no ORM integration is used in production.
- Schemas serve as the contract layer between FastAPI route handlers
  and the Turso HTTP client.
"""

from .auth import Token, RefreshTokenRequest, AuthResponse
from .user import UserCreate, UserUpdate, UserRead
from .skill import Skill, SkillCreate, SkillUpdate, UserSkill, UserSkillCreate, UserSkillUpdate
from .project import ProjectCreate, ProjectUpdate, ProjectRead
from .proposal import ProposalCreate, ProposalUpdate, ProposalRead
from .contract import ContractCreate, ContractUpdate, ContractRead
from .payment import PaymentCreate, PaymentUpdate, PaymentRead
from .portfolio import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemRead
from .message import Message, MessageCreate, MessageUpdate, Conversation, ConversationCreate, ConversationUpdate
from .notification import Notification, NotificationCreate, NotificationUpdate, NotificationList
from .review import Review, ReviewCreate, ReviewUpdate, ReviewStats
from .dispute import Dispute, DisputeCreate, DisputeUpdate, DisputeList
from .milestone import Milestone, MilestoneCreate, MilestoneUpdate, MilestoneSubmit, MilestoneApprove
from .time_entry import TimeEntryCreate, TimeEntryUpdate, TimeEntryRead, TimeEntryStop, TimeEntrySummary
from .invoice import InvoiceCreate, InvoiceUpdate, InvoiceRead, InvoicePayment, InvoiceList
from .escrow import EscrowCreate, EscrowUpdate, EscrowRead, EscrowRelease, EscrowRefund, EscrowBalance
from .category import CategoryCreate, CategoryUpdate, CategoryRead, CategoryTree
from .favorite import FavoriteCreate, FavoriteRead, FavoriteDelete
from .tag import TagCreate, TagUpdate, TagRead, TagWithProjects
from .support_ticket import SupportTicketCreate, SupportTicketUpdate, SupportTicketRead, SupportTicketAssign, SupportTicketResolve, SupportTicketList
from .refund import RefundCreate, RefundUpdate, RefundRead, RefundApprove, RefundReject, RefundList

__all__ = [
    # Authentication
    "Token",
    "RefreshTokenRequest",
    "AuthResponse",
    # User
    "UserCreate",
    "UserUpdate",
    "UserRead",
    # Skills
    "Skill",
    "SkillCreate",
    "SkillUpdate",
    "UserSkill",
    "UserSkillCreate",
    "UserSkillUpdate",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectRead",
    # Proposal
    "ProposalCreate",
    "ProposalUpdate",
    "ProposalRead",
    # Contract
    "ContractCreate",
    "ContractUpdate",
    "ContractRead",
    # Payment
    "PaymentCreate",
    "PaymentUpdate",
    "PaymentRead",
    # Portfolio
    "PortfolioItemCreate",
    "PortfolioItemUpdate",
    "PortfolioItemRead",
    # Messaging
    "Message",
    "MessageCreate",
    "MessageUpdate",
    "Conversation",
    "ConversationCreate",
    "ConversationUpdate",
    # Notifications
    "Notification",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationList",
    # Reviews
    "Review",
    "ReviewCreate",
    "ReviewUpdate",
    "ReviewStats",
    # Disputes
    "Dispute",
    "DisputeCreate",
    "DisputeUpdate",
    "DisputeList",
    # Milestones
    "Milestone",
    "MilestoneCreate",
    "MilestoneUpdate",
    "MilestoneSubmit",
    "MilestoneApprove",
    # Time Entry
    "TimeEntryCreate",
    "TimeEntryUpdate",
    "TimeEntryRead",
    "TimeEntryStop",
    "TimeEntrySummary",
    # Invoice
    "InvoiceCreate",
    "InvoiceUpdate",
    "InvoiceRead",
    "InvoicePayment",
    "InvoiceList",
    # Escrow
    "EscrowCreate",
    "EscrowUpdate",
    "EscrowRead",
    "EscrowRelease",
    "EscrowRefund",
    "EscrowBalance",
    # Category
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryRead",
    "CategoryTree",
    # Favorite
    "FavoriteCreate",
    "FavoriteRead",
    "FavoriteDelete",
    # Tag
    "TagCreate",
    "TagUpdate",
    "TagRead",
    "TagWithProjects",
    # Support Ticket
    "SupportTicketCreate",
    "SupportTicketUpdate",
    "SupportTicketRead",
    "SupportTicketAssign",
    "SupportTicketResolve",
    "SupportTicketList",
    # Refund
    "RefundCreate",
    "RefundUpdate",
    "RefundRead",
    "RefundApprove",
    "RefundReject",
    "RefundList",
]
