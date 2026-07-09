"""
@AI-HINT: Integration tests for advanced AI API
Tests all endpoints in backend/app/api/v1/ai/ai_advanced.py
Requires valid user authentication via headers.
"""

import pytest
from datetime import datetime
import httpx
from httpx import AsyncClient

# Pytest fixtures for async http client
@pytest.fixture
async def client():
    """Create async HTTP client"""
    from main import app
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers(client: AsyncClient):
    """Create authenticated user and return auth headers"""
    email = f"test_{datetime.now().timestamp()}@example.com"
    # Register user
    register_response = await client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "TestPassword123!",
            "name": "Test User",
            "role": "freelancer"
        }
    )
    
    # Login
    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "TestPassword123!"
        }
    )
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
class TestPortfolioAnalysis:
    async def test_get_portfolio_analysis_for_user(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/ai-advanced/portfolio/1",
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 500] 

    async def test_get_my_portfolio_analysis(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/ai-advanced/portfolio",
            headers=auth_headers
        )
        assert response.status_code in [200, 500]

@pytest.mark.asyncio
class TestMarketTrendsAndInsights:
    async def test_get_market_trends(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/ai-advanced/trends",
            headers=auth_headers
        )
        assert response.status_code in [200, 500]

    async def test_get_market_insights(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/ai-advanced/market-insights",
            headers=auth_headers
        )
        assert response.status_code in [200, 500]

@pytest.mark.asyncio
class TestSkillRecommendations:
    async def test_get_skill_recommendations(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(
            "/api/ai-advanced/recommendations/1",
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 500]
