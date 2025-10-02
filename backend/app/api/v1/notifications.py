"""Notifications API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models import Notification, User
from app.schemas import (
    Notification as NotificationSchema,
    NotificationCreate,
    NotificationUpdate,
    NotificationList,
)
from app.core.security import get_current_active_user

router = APIRouter()


@router.post("/notifications", response_model=NotificationSchema)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new notification (admin/system use)"""
    # Only admins can create notifications for other users
    if notification.user_id != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create notifications for other users")
    
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.get("/notifications", response_model=NotificationList)
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_read: bool = Query(None),
    notification_type: str = Query(None),
    priority: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all notifications for current user"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # Filter expired notifications
    query = query.filter(
        (Notification.expires_at.is_(None)) | (Notification.expires_at > datetime.utcnow())
    )
    
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    
    if priority:
        query = query.filter(Notification.priority == priority)
    
    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return NotificationList(
        total=total,
        unread_count=unread_count,
        notifications=notifications,
    )


@router.get("/notifications/{notification_id}", response_model=NotificationSchema)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Auto-mark as read when viewed
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    
    return notification


@router.patch("/notifications/{notification_id}", response_model=NotificationSchema)
def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a notification (mark as read/unread)"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    for key, value in notification_update.dict(exclude_unset=True).items():
        setattr(notification, key, value)
    
    if notification_update.is_read and not notification.read_at:
        notification.read_at = datetime.utcnow()
    
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/notifications/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Mark all notifications as read for current user"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow(),
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.get("/notifications/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get count of unread notifications for current user"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    
    return {"unread_count": count}


# Utility function to send notifications (can be used by other modules)
def send_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    content: str,
    data: dict = None,
    priority: str = "medium",
    action_url: str = None,
    expires_at: datetime = None,
):
    """Helper function to send a notification"""
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        content=content,
        data=data,
        priority=priority,
        action_url=action_url,
        expires_at=expires_at,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
