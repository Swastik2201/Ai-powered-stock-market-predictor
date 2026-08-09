from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)


async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)) -> dict:
    """
    Placeholder token verification for Supabase JWTs or API keys.
    """
    if not credentials:
        # In development mode, allow unauthenticated dev requests if desired
        if settings.ENVIRONMENT == "development":
            return {"sub": "dev-user-123", "role": "authenticated"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    # Token verification logic against Supabase JWT secret will be expanded here
    return {"sub": "user-id-from-jwt", "token": token}
