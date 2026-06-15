from typing import Optional, List
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
        # search_freelancers_advanced expects (where_clause, params, sort) where the
        # last two params are LIMIT and OFFSET. Build that here.
        where: List[str] = ["u.user_type = 'freelancer'", "u.is_active = 1"]
        params: list = []
        if query:
            where.append("(u.name LIKE ? OR u.bio LIKE ? OR u.skills LIKE ?)")
            like = f"%{query}%"
            params.extend([like, like, like])
        if min_rate is not None:
            where.append("u.hourly_rate >= ?")
            params.append(min_rate)
        if max_rate is not None:
            where.append("u.hourly_rate <= ?")
            params.append(max_rate)
        if location:
            where.append("u.location LIKE ?")
            params.append(f"%{location}%")

        params.extend([limit, offset])
        return search_freelancers_advanced(" AND ".join(where), params, sort="newest")
