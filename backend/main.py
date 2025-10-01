# @AI-HINT: This is the main entry point for the MegiLance FastAPI backend.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

from app.api.routers import api_router
from app.core.config import get_settings
from app.db.init_db import init_db
from app.db.session import engine


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="MegiLance backend API - A comprehensive freelancing platform with AI-powered features and blockchain-based payments",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db(engine)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )


@app.get("/")
def root():
    return {"message": "Welcome to the MegiLance API!", "version": "1.0.0"}


@app.get("/api")
def api_root():
    return {
        "message": "MegiLance API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }


app.include_router(api_router, prefix="/api")
