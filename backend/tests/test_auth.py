from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_db
from main import app

TEST_DATABASE_URL = "sqlite:///./test_auth.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
app.router.on_startup.clear()
app.router.on_shutdown.clear()
client = TestClient(app)


@pytest.fixture(autouse=True)
def _setup_db() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_register_login_and_profile_flow():
    register_payload = {
        "email": "alice@example.com",
        "password": "securePassword123",
        "name": "Alice",
        "user_type": "Freelancer",
        "bio": "Experienced developer",
    }

    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == register_payload["email"]
    assert data["name"] == register_payload["name"]

    login_payload = {
        "email": register_payload["email"],
        "password": register_payload["password"],
    }

    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["user"]["email"] == register_payload["email"]

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["email"] == register_payload["email"]

    update_payload = {"name": "Alice Johnson", "location": "Karachi"}
    response = client.put("/api/auth/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    updated_profile = response.json()
    assert updated_profile["name"] == update_payload["name"]
    assert updated_profile["location"] == update_payload["location"]

    refresh_payload = {"refresh_token": tokens["refresh_token"]}
    response = client.post("/api/auth/refresh", json=refresh_payload)
    assert response.status_code == 200
    refreshed_tokens = response.json()
    assert "access_token" in refreshed_tokens
    assert "refresh_token" in refreshed_tokens