from fastapi import APIRouter, Depends, HTTPException, status
from app.services.se_ranking_service import SERankingService
from typing import Dict, Any, List

router = APIRouter(prefix="/se-ranking", tags=["SEO & SE Ranking"])

@router.get("/status", response_model=Dict[str, Any])
async def get_status(service: SERankingService = Depends()):
    """Check configuration status of the SE Ranking service."""
    return {
        "configured": service.api_key is not None and service.site_id is not None,
        "site_id": service.site_id,
        "using_mock_data": not (service.api_key and service.site_id)
    }

@router.get("/audit", response_model=Dict[str, Any])
async def get_audit(service: SERankingService = Depends()):
    """Get the latest search engine ranking audit for the site."""
    return await service.get_site_audit()

@router.get("/keywords", response_model=List[Dict[str, Any]])
async def get_keywords(service: SERankingService = Depends()):
    """Get all tracked keywords with search volume, CPC, and competition index."""
    return await service.get_tracked_keywords()

@router.get("/rankings", response_model=Dict[str, Any])
async def get_rankings(service: SERankingService = Depends()):
    """Get historical search engine keyword rankings positions."""
    return await service.get_rankings()
