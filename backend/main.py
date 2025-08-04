# @AI-HINT: This is the main entry point for the MegiLance FastAPI backend.

from fastapi import FastAPI

app = FastAPI(
    title="MegiLance API",
    description="The backend API for the MegiLance platform, handling user authentication, project management, and payments.",
    version="0.1.0",
)

@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the MegiLance API!"}
