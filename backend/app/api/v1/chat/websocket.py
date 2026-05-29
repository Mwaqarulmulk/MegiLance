# @AI-HINT: WebSocket router — WebSocket status and connection info (actual Socket.IO is in core/websocket.py)
from fastapi import APIRouter, Depends
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user

router = APIRouter()


@router.get("/")
async def websocket_status():
    """Get WebSocket/Socket.IO connection status and info"""
    return {
        "status": "active",
        "transport": "socket.io",
        "endpoint": "/socket.io",
        "version": "4.8.1",
        "features": [
            "real-time-messaging",
            "typing-indicators",
            "online-presence",
            "notifications",
            "video-signaling",
        ],
        "protocols": ["websocket", "polling"],
    }


@router.get("/health")
async def websocket_health():
    """Health check for WebSocket server"""
    return {
        "status": "healthy",
        "connections": 0,  # In production, track active connections
        "uptime": "ok",
    }


@router.get("/config")
async def websocket_config(current_user=Depends(get_current_user)):
    """Get WebSocket connection configuration for the current user"""
    return {
        "url": "/socket.io",
        "transports": ["websocket", "polling"],
        "reconnection": True,
        "reconnection_attempts": 10,
        "reconnection_delay": 1000,
        "reconnection_delay_max": 5000,
        "timeout": 20000,
        "auth": {
            "user_id": current_user.id,
        },
    }
