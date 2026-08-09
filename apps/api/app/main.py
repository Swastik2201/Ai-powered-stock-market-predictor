from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.cache_service import cache_service
from app.services.background_worker import background_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to cache server and launch quote background refresh worker
    await cache_service.connect()
    background_worker.start()
    yield
    # Shutdown: Stop worker and disconnect cache
    await background_worker.stop()
    await cache_service.disconnect()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


from app.core.rate_limiter import RateLimitMiddleware

# ------------------------------------------
# Rate Limiter & CORS Middleware Configuration
# ------------------------------------------
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check probe endpoint for production Docker container readiness."""
    return {"status": "healthy", "service": "MarketGenius FastAPI Engine", "version": settings.VERSION}


# ------------------------------------------
# Global Exception Handlers
# ------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "code": exc.status_code,
            "message": exc.detail,
            "path": str(request.url.path),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "code": 422,
            "message": "Validation Error",
            "details": exc.errors(),
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "code": 500,
            "message": "An unexpected internal server error occurred.",
            "path": str(request.url.path),
        },
    )


# ------------------------------------------
# Health Check Endpoint
# ------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ------------------------------------------
# API v1 Router Registration
# ------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)
