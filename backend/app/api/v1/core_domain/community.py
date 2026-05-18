# @AI-HINT: Community router — community hubs, posts, announcements
from fastapi import APIRouter, Depends
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user

router = APIRouter()


@router.get("/hubs")
async def list_hubs():
    return {
        "hubs": [
            {"id": "general", "name": "General Discussion", "description": "Talk about anything"},
            {"id": "freelancers", "name": "Freelancers", "description": "Tips and strategies for freelancers"},
            {"id": "clients", "name": "Clients", "description": "Resources for hiring clients"},
            {"id": "announcements", "name": "Announcements", "description": "Platform news and updates"},
        ]
    }


@router.get("/stats")
async def get_community_stats():
    return {
        "members": 0,
        "posts": 0,
        "discussions": 0,
    }
