# @AI-HINT: Advanced Search router — aliases marketplace search at /search/freelancers
from fastapi import APIRouter
from app.api.v1.core_domain.marketplace import list_marketplace_freelancers

router = APIRouter()

router.add_api_route(
    "/search/freelancers",
    list_marketplace_freelancers,
    methods=["GET"],
    tags=["search"],
    summary="Search freelancers with full filter support",
)
