# @AI-HINT: Pydantic schemas for Notification API - alert creation and delivery models
"""Notification schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime


class NotificationBase(BaseModel):
    """Base notification schema"""
    notification_type: str
    title: str = Field(..., min_length=1, max_length=255)
    content: str
    data: Optional[Dict[str, Any]] = None
    priority: str = "medium"
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: int
    expires_at: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None


class Notification(NotificationBase):
    """Schema for notification response"""
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationList(BaseModel):
    """Schema for paginated notification list"""
    total: int
    unread_count: int
    notifications: list[Notification]
