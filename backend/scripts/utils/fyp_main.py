# @AI-HINT: Minimal backend for FYP requirements testing
"""
Minimal MegiLance Backend - Core endpoints only
"""

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("megilance")

# Initialize DB before importing routers
from app.db.turso_http import TursoHTTP
TursoHTTP.get_instance()

# Create app
app = FastAPI(
    title="MegiLance API",
    version="1.0.0",
    description="MegiLance Freelancing Platform API - FYP Testing Mode"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import essential routers only - direct imports to avoid __init__.py
import importlib

def load_router(module_name, prefix, tags):
    try:
        mod = importlib.import_module(f"app.api.v1.{module_name}")
        app.include_router(mod.router, prefix=prefix, tags=tags)
        logger.info(f"{module_name} router loaded")
        return True
    except Exception as e:
        logger.error(f"Failed to load {module_name}: {e}")
        return False

# Load core routers
load_router("health", "/api", ["health"])
load_router("auth", "/api/auth", ["auth"])
load_router("projects", "/api/projects", ["projects"])
load_router("proposals", "/api/proposals", ["proposals"])
load_router("contracts", "/api/contracts", ["contracts"])
load_router("reviews", "/api/reviews", ["reviews"])
load_router("admin", "/api/admin", ["admin"])


@app.on_event("startup")
async def on_startup():
    from app.db.session import get_engine
    from app.db.init_db import init_db
    try:
        engine = get_engine()
        init_db(engine)
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database init skipped (already exists): {e}")


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
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
