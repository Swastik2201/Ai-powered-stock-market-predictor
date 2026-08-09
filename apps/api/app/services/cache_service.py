import json
import time
import logging
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger("market_cache")


class AsyncCacheService:
    """
    Async caching layer utilizing Redis when available, with automatic
    in-memory dictionary fallback for local development or connection failures.
    """

    def __init__(self):
        self._memory_cache: dict[str, tuple[Any, float]] = {}
        self._redis = None
        self._is_redis_available = False

    async def connect(self):
        """Attempts connection to Redis cluster/instance."""
        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=1.5
            )
            await self._redis.ping()
            self._is_redis_available = True
            logger.info("Connected to Redis cache server successfully.")
        except Exception as e:
            self._is_redis_available = False
            logger.warning(f"Redis unavailable ({e}). Falling back to in-memory cache.")

    async def disconnect(self):
        """Closes Redis connection if open."""
        if self._redis:
            try:
                await self._redis.close()
            except Exception:
                pass

    async def get(self, key: str) -> Optional[str]:
        """Retrieves string value by key from Redis or Memory Cache."""
        if self._is_redis_available and self._redis:
            try:
                return await self._redis.get(key)
            except Exception as e:
                logger.warning(f"Redis get failed ({e}), checking in-memory cache.")
                self._is_redis_available = False

        # In-Memory Cache Fallback Check
        if key in self._memory_cache:
            val, expiry = self._memory_cache[key]
            if time.time() < expiry:
                return val
            else:
                del self._memory_cache[key]
        return None

    async def set(self, key: str, value: str, ttl: int = settings.CACHE_TTL_SECONDS):
        """Sets string value with TTL expiration."""
        if self._is_redis_available and self._redis:
            try:
                await self._redis.set(key, value, ex=ttl)
                return
            except Exception as e:
                logger.warning(f"Redis set failed ({e}), storing in memory cache.")
                self._is_redis_available = False

        # In-Memory Cache Storage
        expiry = time.time() + ttl
        self._memory_cache[key] = (value, expiry)

    async def get_json(self, key: str) -> Optional[Any]:
        """Retrieves and deserializes JSON object by key."""
        data = await self.get(key)
        if data:
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return None
        return None

    async def set_json(self, key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS):
        """Serializes object to JSON and sets in cache."""
        serialized = json.dumps(value)
        await self.set(key, serialized, ttl=ttl)


# Global Singleton Instance
cache_service = AsyncCacheService()
