"""
Async Turso HTTP API client using httpx.AsyncClient.
Replaces the synchronous requests-based client for non-blocking DB operations.
"""

import asyncio
import logging
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor

import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)

_QUERY_CACHE_TTL = 30
_QUERY_CACHE_MAX = 500


class _AsyncLRUTTLCache:
    """Thread-safe LRU cache with TTL expiry for async query results."""

    def __init__(self, max_size: int = _QUERY_CACHE_MAX, ttl: float = _QUERY_CACHE_TTL):
        self._max_size = max_size
        self._ttl = ttl
        self._data: OrderedDict[str, tuple] = OrderedDict()
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            result, ts = item
            if time.time() - ts > self._ttl:
                del self._data[key]
                return None
            self._data.move_to_end(key)
            return result

    async def put(self, key: str, value: Any) -> None:
        async with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
                self._data[key] = (value, time.time())
            else:
                if len(self._data) >= self._max_size:
                    self._data.popitem(last=False)
                self._data[key] = (value, time.time())

    async def invalidate_all(self) -> None:
        async with self._lock:
            self._data.clear()


_query_cache = _AsyncLRUTTLCache()


class AsyncTursoHTTP:
    """Async HTTP client for Turso remote database using httpx."""

    _instance: Optional['AsyncTursoHTTP'] = None
    _init_lock = asyncio.Lock()

    def __init__(self, url: str, token: str):
        self._url = url
        self._token = token
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self._url,
                headers={
                    "Authorization": f"Bearer {self._token}",
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(
                    max_keepalive_connections=20,
                    max_connections=50,
                ),
            )
        return self._client

    @classmethod
    async def get_instance(cls) -> 'AsyncTursoHTTP':
        if cls._instance is not None:
            return cls._instance

        async with cls._init_lock:
            if cls._instance is not None:
                return cls._instance

            settings = get_settings()
            if not settings.turso_database_url or not settings.turso_auth_token:
                raise RuntimeError(
                    "Turso database not configured. "
                    "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables."
                )
            if "CHANGE_ME" in (settings.turso_auth_token or "") or len(settings.turso_auth_token or "") < 50:
                raise RuntimeError("Invalid Turso auth token. Please set a valid TURSO_AUTH_TOKEN.")

            url = settings.turso_database_url.replace("libsql://", "https://")
            if not url.endswith("/"):
                url += "/"

            cls._instance = cls(url, settings.turso_auth_token)
            logger.info(f"Async Turso HTTP client initialized: {url[:50]}...")

        return cls._instance

    @classmethod
    async def reset_instance(cls):
        async with cls._init_lock:
            if cls._instance is not None:
                client = cls._instance._client
                if client and not client.is_closed:
                    await client.aclose()
                cls._instance = None
            await _query_cache.invalidate_all()

    async def execute(self, sql: str, params: Optional[List[Any]] = None) -> Dict[str, Any]:
        if params is None:
            params = []

        sql_upper = sql.strip().upper()
        is_read = sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")

        if is_read:
            cache_key = f"{sql}:{params}"
            cached = await _query_cache.get(cache_key)
            if cached is not None:
                return cached

        result = await self._execute_remote(sql, params)

        if is_read:
            await _query_cache.put(cache_key, result)
        else:
            await _query_cache.invalidate_all()

        return result

    async def _execute_remote(self, sql: str, params: List[Any]) -> Dict[str, Any]:
        client = await self._get_client()
        response = await client.post(
            self._url,
            json={
                "statements": [{
                    "q": sql,
                    "params": params
                }]
            },
        )

        if response.status_code != 200:
            raise Exception(f"Turso HTTP error: {response.status_code} - {response.text[:500]}")

        data = response.json()
        if not data or len(data) == 0:
            return {"columns": [], "rows": []}

        result = data[0].get("results", {})
        return {
            "columns": result.get("columns", []),
            "rows": result.get("rows", [])
        }

    async def execute_many(self, statements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        client = await self._get_client()
        response = await client.post(
            self._url,
            json={"statements": statements},
        )

        if response.status_code != 200:
            raise Exception(f"Turso HTTP error: {response.status_code} - {response.text[:500]}")

        data = response.json()
        results = []
        for item in data:
            result = item.get("results", {})
            results.append({
                "columns": result.get("columns", []),
                "rows": result.get("rows", [])
            })
        await _query_cache.invalidate_all()
        return results

    async def fetch_one(self, sql: str, params: Optional[List[Any]] = None) -> Optional[List[Any]]:
        result = await self.execute(sql, params)
        rows = result.get("rows", [])
        return rows[0] if rows else None

    async def fetch_all(self, sql: str, params: Optional[List[Any]] = None) -> List[List[Any]]:
        result = await self.execute(sql, params)
        return result.get("rows", [])

    async def fetch_scalar(self, sql: str, params: Optional[List[Any]] = None) -> Any:
        row = await self.fetch_one(sql, params)
        return row[0] if row else None


async def get_async_turso() -> AsyncTursoHTTP:
    return await AsyncTursoHTTP.get_instance()


async def execute_query_async(sql: str, params: List[Any] = None) -> Optional[Dict[str, Any]]:
    try:
        client = await AsyncTursoHTTP.get_instance()
        result = await client.execute(sql, params)
        columns = result.get("columns", [])
        rows_raw = result.get("rows", [])
        cols = [{"name": col} for col in columns]
        rows = []
        for row in rows_raw:
            row_data = []
            for val in row:
                if val is None:
                    row_data.append({"type": "null", "value": None})
                else:
                    row_data.append({"type": "text", "value": val})
            rows.append(row_data)
        return {"cols": cols, "rows": rows}
    except Exception as e:
        logger.info(f"[DB] execute_query_async error: {e}")
        return None


# Sync compatibility layer — wraps async calls for gradual migration
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="db_async_wrapper")


def _run_async(coro):
    """Run an async coroutine from sync context using the running event loop or a new one."""
    try:
        loop = asyncio.get_running_loop()
        if loop.is_running():
            future = asyncio.run_coroutine_threadsafe(coro, loop)
            return future.result()
    except RuntimeError:
        pass
    return asyncio.run(coro)


def execute_query(sql: str, params: List[Any] = None) -> Optional[Dict[str, Any]]:
    """Sync wrapper for async execute_query. Uses existing event loop or creates new one."""
    return _run_async(execute_query_async(sql, params))


def parse_rows(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not result:
        return []
    cols = result.get("cols", [])
    rows = result.get("rows", [])
    parsed = []
    for row in rows:
        item = {}
        for i, col in enumerate(cols):
            col_name = col.get("name", f"col_{i}")
            if i < len(row):
                cell = row[i]
                if cell.get("type") == "null":
                    item[col_name] = None
                else:
                    item[col_name] = cell.get("value")
            else:
                item[col_name] = None
        parsed.append(item)
    return parsed


def to_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, dict):
        if value.get("type") == "null":
            return None
        value = value.get("value")
        if value is None:
            return None
    if isinstance(value, bytes):
        return value.decode('utf-8')
    return str(value)


def to_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, dict):
        if value.get("type") == "null":
            return None
        value = value.get("value")
        if value is None:
            return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, dict):
        if value.get("type") == "null":
            return None
        value = value.get("value")
        if value is None:
            return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def parse_date(value: Any) -> Optional[Any]:
    if value is None:
        return None
    if isinstance(value, dict):
        if value.get("type") == "null":
            return None
        value = value.get("value")
        if value is None:
            return None
    if isinstance(value, bytes):
        value = value.decode('utf-8')
    if isinstance(value, str):
        from datetime import datetime
        try:
            if 'T' in value:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            return datetime.strptime(value[:19], '%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            try:
                return datetime.strptime(value[:10], '%Y-%m-%d')
            except (ValueError, TypeError):
                return value
    return value
