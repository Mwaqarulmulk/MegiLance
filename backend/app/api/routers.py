from fastapi import APIRouter
from .v1 import health, users, mock, projects, proposals, contracts, portfolio, payments, auth


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"]) 
api_router.include_router(users.router, prefix="/users", tags=["users"]) 
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(mock.router, prefix="", tags=["mock"])