"""
Minimal backend for testing auth registration
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth
from app.db.turso_http import TursoHTTP

# Initialize DB
TursoHTTP.get_instance()

app = FastAPI(title="MegiLance Auth Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount auth router
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
