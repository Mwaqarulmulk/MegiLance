"""Initialize all schemas"""

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
]
