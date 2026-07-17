import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_se_ranking_status():
    """Verify SE Ranking status endpoint returns configuration status."""
    resp = client.get("/api/se-ranking/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "configured" in data
    assert "using_mock_data" in data

def test_se_ranking_audit():
    """Verify SE Ranking audit endpoint returns site health metrics."""
    resp = client.get("/api/se-ranking/audit")
    assert resp.status_code == 200
    data = resp.json()
    assert "health_score" in data
    assert "pages_crawled" in data

def test_se_ranking_keywords():
    """Verify SE Ranking keywords endpoint returns a list of tracked keywords."""
    resp = client.get("/api/se-ranking/keywords")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "keyword" in data[0]
        assert "search_volume" in data[0]

def test_se_ranking_rankings():
    """Verify SE Ranking rankings endpoint returns history metrics."""
    resp = client.get("/api/se-ranking/rankings")
    assert resp.status_code == 200
    data = resp.json()
    assert "dates" in data
    assert "rankings" in data
