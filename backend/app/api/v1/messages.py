"""Messages and conversations API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models import Message, Conversation, User
from app.schemas import (
    Message as MessageSchema,
    MessageCreate,
    MessageUpdate,
    Conversation as ConversationSchema,
    ConversationCreate,
    ConversationUpdate,
)
from app.core.security import get_current_active_user

router = APIRouter()


# Conversation endpoints
@router.post("/conversations", response_model=ConversationSchema)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new conversation"""
    # Check if conversation already exists between these users for this project
    existing = db.query(Conversation).filter(
        Conversation.client_id == conversation.client_id,
        Conversation.freelancer_id == conversation.freelancer_id,
        Conversation.project_id == conversation.project_id if conversation.project_id else True,
    ).first()
    
    if existing:
        return existing
    
    # Create new conversation
    db_conversation = Conversation(**conversation.dict())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


@router.get("/conversations", response_model=List[ConversationSchema])
def get_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    archived: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all conversations for current user"""
    query = db.query(Conversation).filter(
        or_(
            Conversation.client_id == current_user.id,
            Conversation.freelancer_id == current_user.id,
        )
    )
    
    if status:
        query = query.filter(Conversation.status == status)
    
    if archived is not None:
        query = query.filter(Conversation.is_archived == archived)
    
    conversations = query.order_by(Conversation.last_message_at.desc()).offset(skip).limit(limit).all()
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationSchema)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific conversation"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is part of conversation
    if conversation.client_id != current_user.id and conversation.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return conversation


@router.patch("/conversations/{conversation_id}", response_model=ConversationSchema)
def update_conversation(
    conversation_id: int,
    conversation_update: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a conversation"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is part of conversation
    if conversation.client_id != current_user.id and conversation.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    for key, value in conversation_update.dict(exclude_unset=True).items():
        setattr(conversation, key, value)
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    return conversation


# Message endpoints
@router.post("/messages", response_model=MessageSchema)
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Send a new message"""
    # If conversation_id not provided, create/find conversation
    if not message.conversation_id:
        conversation = db.query(Conversation).filter(
            or_(
                and_(Conversation.client_id == current_user.id, Conversation.freelancer_id == message.receiver_id),
                and_(Conversation.freelancer_id == current_user.id, Conversation.client_id == message.receiver_id),
            ),
            Conversation.project_id == message.project_id if message.project_id else True,
        ).first()
        
        if not conversation:
            # Create new conversation
            receiver = db.query(User).filter(User.id == message.receiver_id).first()
            if not receiver:
                raise HTTPException(status_code=404, detail="Receiver not found")
            
            conversation = Conversation(
                client_id=current_user.id if current_user.user_type == "client" else message.receiver_id,
                freelancer_id=message.receiver_id if current_user.user_type == "client" else current_user.id,
                project_id=message.project_id,
            )
            db.add(conversation)
            db.flush()
        
        message.conversation_id = conversation.id
    
    # Create message
    db_message = Message(
        **message.dict(),
        sender_id=current_user.id,
    )
    db.add(db_message)
    
    # Update conversation last_message_at
    conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()
    conversation.last_message_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_message)
    return db_message


@router.get("/messages", response_model=List[MessageSchema])
def get_messages(
    conversation_id: int = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get messages for a conversation"""
    # Verify user has access to conversation
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.client_id != current_user.id and conversation.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.is_deleted == False,
    ).order_by(Message.sent_at.desc()).offset(skip).limit(limit).all()
    
    # Mark messages as read
    unread_messages = [m for m in messages if not m.is_read and m.receiver_id == current_user.id]
    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = datetime.utcnow()
    
    if unread_messages:
        db.commit()
    
    return list(reversed(messages))


@router.get("/messages/{message_id}", response_model=MessageSchema)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check if user is sender or receiver
    if message.sender_id != current_user.id and message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mark as read if receiver
    if message.receiver_id == current_user.id and not message.is_read:
        message.is_read = True
        message.read_at = datetime.utcnow()
        db.commit()
        db.refresh(message)
    
    return message


@router.patch("/messages/{message_id}", response_model=MessageSchema)
def update_message(
    message_id: int,
    message_update: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only sender can edit message content
    if message_update.content and message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only sender can edit message")
    
    # Receiver can mark as read
    if message_update.is_read is not None and message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only receiver can mark as read")
    
    # Update fields
    for key, value in message_update.dict(exclude_unset=True).items():
        setattr(message, key, value)
    
    if message_update.is_read:
        message.read_at = datetime.utcnow()
    
    db.commit()
    db.refresh(message)
    return message


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Soft delete a message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only sender can delete
    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only sender can delete message")
    
    message.is_deleted = True
    db.commit()
    
    return {"message": "Message deleted successfully"}


@router.get("/messages/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get count of unread messages for current user"""
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
        Message.is_deleted == False,
    ).count()
    
    return {"unread_count": count}
