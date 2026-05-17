"""
FastAPI dependency injection for async database access.
"""

from typing import AsyncGenerator

from app.db.turso_http_async import AsyncTursoHTTP


async def get_db() -> AsyncGenerator[AsyncTursoHTTP, None]:
    """Dependency that provides an async Turso client."""
    client = await AsyncTursoHTTP.get_instance()
    yield client
