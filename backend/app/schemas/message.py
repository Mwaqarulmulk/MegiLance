# @AI-HINT: Pydantic schemas for Messages API - send, receive, and conversation models
"""Message schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime


class MessageBase(BaseModel):
    """Base message schema"""
    content: str = Field(..., min_length=1)
    message_type: str = "text"
    attachments: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    receiver_id: int
    conversation_id: Optional[int] = None
    project_id: Optional[int] = None
    parent_message_id: Optional[int] = None


class MessageUpdate(BaseModel):
    """Schema for updating a message"""
    content: Optional[str] = Field(None, min_length=1)
    is_read: Optional[bool] = None


class Message(MessageBase):
    """Schema for message response"""
    id: int
    conversation_id: int
    sender_id: int
    receiver_id: int
    project_id: Optional[int] = None
    is_read: bool
    read_at: Optional[datetime] = None
    sent_at: datetime
    is_deleted: bool
    parent_message_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationBase(BaseModel):
    """Base conversation schema"""
    title: Optional[str] = None
    status: str = "active"


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    freelancer_id: int
    client_id: int
    project_id: Optional[int] = None


class ConversationUpdate(BaseModel):
    """Schema for updating a conversation"""
    title: Optional[str] = None
    status: Optional[str] = None
    is_archived: Optional[bool] = None


class Conversation(ConversationBase):
    """Schema for conversation response"""
    id: int
    project_id: Optional[int] = None
    client_id: int
    freelancer_id: int
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    messages: list[Message] = []

    model_config = ConfigDict(from_attributes=True)
