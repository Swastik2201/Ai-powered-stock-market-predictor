import time
from typing import Dict, List
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# In-Memory Token Bucket IP Rate Limiter Store
# Restricts clients to 20 requests per minute
IP_REQUEST_LOGS: Dict[str, List[float]] = {}
RATE_LIMIT_MAX_REQUESTS = 20
RATE_LIMIT_WINDOW_SECONDS = 60


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Token-bucket IP rate limiter middleware restricting expensive AI & ML routes to 20 req/min.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        # Rate limit only expensive endpoints
        if path.startswith("/api/v1/genius") or path.startswith("/api/v1/forecast"):
            client_ip = request.client.host if request.client else "127.0.0.1"
            now = time.time()

            timestamps = IP_REQUEST_LOGS.setdefault(client_ip, [])
            # Filter timestamps within the 60-second window
            valid_timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
            IP_REQUEST_LOGS[client_ip] = valid_timestamps

            if len(valid_timestamps) >= RATE_LIMIT_MAX_REQUESTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded: Maximum 20 requests per minute allowed on AI/ML services.",
                )

            valid_timestamps.append(now)

        return await call_next(request)
