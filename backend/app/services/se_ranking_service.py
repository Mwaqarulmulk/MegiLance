import httpx
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, timedelta
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class SERankingService:
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.se_ranking_api_key
        self.site_id = self.settings.se_ranking_site_id
        self.base_url = "https://api.seranking.com/v2"

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "application/json"
        }

    async def get_site_audit(self) -> Dict[str, Any]:
        """Fetch website SEO audit report."""
        if not self.api_key or not self.site_id:
            logger.info("SE Ranking credentials missing. Returning mock site audit report.")
            return {
                "health_score": 92,
                "pages_crawled": 1240,
                "passed_checks": 1150,
                "warnings": 82,
                "errors": 8,
                "notices": 142,
                "core_web_vitals": {
                    "lcp": "1.8s",
                    "fid": "12ms",
                    "cls": "0.04"
                },
                "last_audit_time": datetime.utcnow().isoformat() + "Z"
            }

        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"{self.base_url}/sites/{self.site_id}/audit",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                if res.status_code == 200:
                    return res.json()
                logger.error(f"SE Ranking API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Error calling SE Ranking API: {str(e)}")

        return {"error": "Failed to retrieve site audit data"}

    async def get_tracked_keywords(self) -> List[Dict[str, Any]]:
        """Fetch list of tracked keywords and search volumes."""
        if not self.api_key or not self.site_id:
            logger.info("SE Ranking credentials missing. Returning mock keyword list.")
            return [
                {"id": 1, "keyword": "freelancer website", "search_volume": 1900, "competition": 23, "cpc": 1.25},
                {"id": 2, "keyword": "freelance jobs online", "search_volume": 880, "competition": 23, "cpc": 0.95},
                {"id": 3, "keyword": "upwork alternative", "search_volume": 210, "competition": 28, "cpc": 3.10},
                {"id": 4, "keyword": "fiverr alternative", "search_volume": 210, "competition": 50, "cpc": 2.50},
                {"id": 5, "keyword": "ai project cost estimator", "search_volume": 540, "competition": 12, "cpc": 1.80},
                {"id": 6, "keyword": "freelance rate calculator", "search_volume": 420, "competition": 15, "cpc": 1.50},
                {"id": 7, "keyword": "project scope planner", "search_volume": 320, "competition": 18, "cpc": 2.10},
                {"id": 8, "keyword": "freelance contract builder", "search_volume": 260, "competition": 25, "cpc": 2.80},
                {"id": 9, "keyword": "ai proposal writer", "search_volume": 480, "competition": 20, "cpc": 2.20},
                {"id": 10, "keyword": "freelancer match score", "search_volume": 180, "competition": 8, "cpc": 1.10},
            ]

        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"{self.base_url}/sites/{self.site_id}/keywords",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                if res.status_code == 200:
                    return res.json()
                logger.error(f"SE Ranking API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Error calling SE Ranking API: {str(e)}")

        return []

    async def get_rankings(self) -> Dict[str, Any]:
        """Fetch keyword ranking positions over time."""
        if not self.api_key or not self.site_id:
            logger.info("SE Ranking credentials missing. Returning mock rankings history.")
            today = datetime.utcnow()
            dates = [(today - timedelta(days=i*7)).strftime("%Y-%m-%d") for i in range(4, -1, -1)]
            
            return {
                "dates": dates,
                "rankings": [
                    {"keyword": "freelancer website", "positions": [14, 12, 10, 8, 6]},
                    {"keyword": "freelance jobs online", "positions": [18, 16, 12, 9, 8]},
                    {"keyword": "upwork alternative", "positions": [5, 4, 3, 3, 2]},
                    {"keyword": "fiverr alternative", "positions": [8, 8, 7, 5, 4]},
                    {"keyword": "ai project cost estimator", "positions": [32, 24, 15, 8, 3]},
                    {"keyword": "freelance rate calculator", "positions": [28, 20, 14, 9, 4]},
                    {"keyword": "project scope planner", "positions": [42, 35, 22, 12, 7]},
                    {"keyword": "freelance contract builder", "positions": [19, 17, 15, 12, 10]},
                    {"keyword": "ai proposal writer", "positions": [35, 28, 19, 10, 5]},
                    {"keyword": "freelancer match score", "positions": [50, 41, 30, 18, 9]},
                ]
            }

        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"{self.base_url}/sites/{self.site_id}/stat",
                    headers=self._get_headers(),
                    timeout=10.0
                )
                if res.status_code == 200:
                    return res.json()
                logger.error(f"SE Ranking API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Error calling SE Ranking API: {str(e)}")

        return {"dates": [], "rankings": []}
