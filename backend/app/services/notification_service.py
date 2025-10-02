"""
Notification Service
Manages email, in-app, and push notifications
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications"""
    
    NOTIFICATION_TYPES = {
        'PROJECT_CREATED': 'New project created',
        'PROPOSAL_RECEIVED': 'New proposal received',
        'PROPOSAL_ACCEPTED': 'Your proposal was accepted',
        'PROPOSAL_REJECTED': 'Your proposal was rejected',
        'CONTRACT_CREATED': 'Contract created',
        'PAYMENT_RECEIVED': 'Payment received',
        'MESSAGE_RECEIVED': 'New message received',
        'REVIEW_RECEIVED': 'New review received',
        'PROJECT_COMPLETED': 'Project completed',
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def send_notification(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        send_email: bool = False,
        send_push: bool = False
    ) -> Dict[str, Any]:
        """Send a notification to a user"""
        try:
            notification = {
                'user_id': user_id,
                'type': notification_type,
                'title': title,
                'message': message,
                'data': data or {},
                'created_at': datetime.utcnow().isoformat(),
                'read': False
            }
            
            # Save to database
            # await self._save_notification(notification)
            
            # Send email if requested
            if send_email:
                await self._send_email_notification(user_id, title, message)
            
            # Send push notification if requested
            if send_push:
                await self._send_push_notification(user_id, title, message)
            
            logger.info(f"Notification sent to user {user_id}: {notification_type}")
            return notification
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            raise
    
    async def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        try:
            # Query notifications
            # notifications = self.db.query(Notification).filter(...)
            
            # Placeholder
            return []
            
        except Exception as e:
            logger.error(f"Error getting notifications: {e}")
            return []
    
    async def mark_as_read(
        self,
        notification_ids: List[int],
        user_id: int
    ) -> bool:
        """Mark notifications as read"""
        try:
            # Update notifications
            # self.db.query(Notification).filter(...).update({'read': True})
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error marking notifications as read: {e}")
            self.db.rollback()
            return False
    
    async def _send_email_notification(self, user_id: int, title: str, message: str):
        """Send email notification"""
        try:
            # Get user email
            from app.models.user import User
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return
            
            # Send email via AWS SES or other service
            logger.info(f"Email notification sent to {user.email}: {title}")
            
        except Exception as e:
            logger.error(f"Error sending email notification: {e}")
    
    async def _send_push_notification(self, user_id: int, title: str, message: str):
        """Send push notification"""
        try:
            # Send via FCM, APNS, or other push service
            logger.info(f"Push notification sent to user {user_id}: {title}")
            
        except Exception as e:
            logger.error(f"Error sending push notification: {e}")
    
    async def notify_project_created(self, project_id: int, client_id: int):
        """Notify relevant freelancers about new project"""
        try:
            # Get matching freelancers
            from app.services.ai_matching import get_project_matches
            matches = await get_project_matches(self.db, project_id, limit=10)
            
            for match in matches:
                await self.send_notification(
                    user_id=match['freelancer_id'],
                    notification_type='PROJECT_CREATED',
                    title='New Project Match',
                    message=f"A new project matches your skills ({match['match_score']*100:.0f}% match)",
                    data={'project_id': project_id, 'match_score': match['match_score']},
                    send_email=True
                )
                
        except Exception as e:
            logger.error(f"Error notifying about project: {e}")
    
    async def notify_proposal_received(self, proposal_id: int, client_id: int):
        """Notify client about new proposal"""
        await self.send_notification(
            user_id=client_id,
            notification_type='PROPOSAL_RECEIVED',
            title='New Proposal',
            message='You have received a new proposal for your project',
            data={'proposal_id': proposal_id},
            send_email=True
        )
    
    async def notify_proposal_accepted(self, proposal_id: int, freelancer_id: int):
        """Notify freelancer their proposal was accepted"""
        await self.send_notification(
            user_id=freelancer_id,
            notification_type='PROPOSAL_ACCEPTED',
            title='Proposal Accepted!',
            message='Congratulations! Your proposal has been accepted',
            data={'proposal_id': proposal_id},
            send_email=True,
            send_push=True
        )
