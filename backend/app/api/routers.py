from fastapi import APIRouter
from .v1 import health, users, mock


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"]) 
api_router.include_router(users.router, prefix="/users", tags=["users"]) 
api_router.include_router(mock.router, prefix="", tags=["mock"]) 
