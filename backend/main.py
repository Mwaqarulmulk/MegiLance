# @AI-HINT: This is the main entry point for the MegiLance FastAPI backend.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import api_router
from app.core.config import get_settings
from app.db.init_db import init_db
from app.db.session import engine


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="MegiLance backend API",
    version="0.1.0",
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


@app.get("/")
def root():
    return {"message": "Welcome to the MegiLance API!"}


app.include_router(api_router, prefix="/api")
