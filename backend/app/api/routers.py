from fastapi import APIRouter
from .v1 import health, users, mock, projects, proposals, contracts, portfolio, payments, auth, client, upload, ai_services


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"]) 
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"]) 
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(client.router, prefix="/client", tags=["client"])
api_router.include_router(ai_services.router, prefix="/ai", tags=["ai"])
api_router.include_router(mock.router, prefix="", tags=["mock"])