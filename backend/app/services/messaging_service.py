"""
Real-time Messaging Service
WebSocket-based messaging between clients and freelancers
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)


class MessageService:
    """Service for managing real-time messages"""
    
    def __init__(self, db: Session):
        self.db = db
        self.active_connections: Dict[int, Any] = {}
    
    async def send_message(
        self,
        sender_id: int,
        receiver_id: int,
        content: str,
        contract_id: Optional[int] = None,
        attachment_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send a message"""
        try:
            message = {
                'id': None,  # Will be assigned by database
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content,
                'contract_id': contract_id,
                'attachment_url': attachment_url,
                'sent_at': datetime.utcnow().isoformat(),
                'read': False
            }
            
            # Save to database
            # await self._save_message(message)
            
            # Send via WebSocket if receiver is online
            if receiver_id in self.active_connections:
                await self._send_websocket_message(receiver_id, message)
            
            return message
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise
    
    async def get_conversation(
        self,
        user1_id: int,
        user2_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get conversation history between two users"""
        try:
            # Query messages between users
            # messages = self.db.query(Message).filter(...)
            
            # Placeholder response
            return []
            
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            return []
    
    async def mark_as_read(
        self,
        message_ids: List[int],
        user_id: int
    ) -> bool:
        """Mark messages as read"""
        try:
            # Update message read status
            # self.db.query(Message).filter(...).update({'read': True})
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {e}")
            self.db.rollback()
            return False
    
    async def _send_websocket_message(self, user_id: int, message: Dict[str, Any]):
        """Send message via WebSocket"""
        connection = self.active_connections.get(user_id)
        if connection:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending WebSocket message: {e}")
    
    async def connect_user(self, user_id: int, websocket: Any):
        """Register WebSocket connection for user"""
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to messaging")
    
    async def disconnect_user(self, user_id: int):
        """Remove WebSocket connection for user"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from messaging")
