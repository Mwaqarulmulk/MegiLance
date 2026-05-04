# @AI-HINT: Ultra-simple standalone FYP testing backend
"""
Standalone MegiLance Backend - No package imports from app.api.v1.__init__
"""

import sys
import os

# Set working directory and path
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("megilance")

# Initialize DB before importing routers
from app.db.turso_http import TursoHTTP
TursoHTTP.get_instance()

# Create app
app = FastAPI(
    title="MegiLance API - FYP Mode",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers directly without going through __init__.py
def load_router_module(module_path, prefix, tags):
    """Import a router module directly from its file path"""
    import importlib.util
    module_file = os.path.join(os.getcwd(), module_path.replace(".", os.sep) + ".py")
    if not os.path.exists(module_file):
        logger.error(f"Module not found: {module_file}")
        return False
    
    try:
        spec = importlib.util.spec_from_file_location(module_path, module_file)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[module_path] = mod
        spec.loader.exec_module(mod)
        app.include_router(mod.router, prefix=prefix, tags=tags)
        logger.info(f"Loaded: {module_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to load {module_path}: {e}")
        import traceback
        traceback.print_exc()
        return False

# Load only essential routers for FYP testing
load_router_module("app.api.v1.health", "/api", ["health"])
load_router_module("app.api.v1.auth", "/api/auth", ["auth"])
load_router_module("app.api.v1.projects", "/api/projects", ["projects"])
load_router_module("app.api.v1.proposals", "/api/proposals", ["proposals"])
load_router_module("app.api.v1.contracts", "/api/contracts", ["contracts"])
load_router_module("app.api.v1.reviews", "/api/reviews", ["reviews"])
load_router_module("app.api.v1.notifications", "/api/notifications", ["notifications"])
load_router_module("app.api.v1.ai_services", "/api/ai", ["ai"])
load_router_module("app.api.v1.ai_matching", "/api/ai/matching", ["ai-matching"])
load_router_module("app.api.v1.admin", "/api/admin", ["admin"])

@app.on_event("startup")
async def on_startup():
    logger.info("FYP Backend started successfully")

if __name__ == "__main__":
    print("\n" + "="*50)
    print("MegiLance FYP Backend")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
