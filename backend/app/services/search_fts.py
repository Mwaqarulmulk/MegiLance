from typing import Optional
from app.services.search_service import search_freelancers_advanced


class SearchService:
    @staticmethod
    def search_freelancers(
        query: str,
        min_rate: Optional[float] = None,
        max_rate: Optional[float] = None,
        location: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict:
        return search_freelancers_advanced(
            query=query,
            min_rate=min_rate,
            max_rate=max_rate,
            limit=limit,
            offset=offset,
        )
