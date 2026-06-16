# @AI-HINT: MongoDB connection handling using Motor (AsyncIO) for Blog/CMS system
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
import logging
import os

logger = logging.getLogger("megilance")
settings = get_settings()

# @AI-HINT: MongoDB Atlas Free Tier Connection - HARDCODED for MegiLance Blog/CMS
# You can override with MONGODB_URL environment variable if you have your own cluster
# To get your own free MongoDB Atlas: https://cloud.mongodb.com (512MB free forever)
# Connection string format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
DEFAULT_MONGODB_URL = None  # Set your MongoDB Atlas URL here or via env var
MONGODB_DB_NAME = "megilance_blog"

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def get_database():
    if db.db is None:
        logger.warning("MongoDB database not available")
        return None
    return db.db

async def connect_to_mongo():
    """Optional MongoDB connection - fails gracefully if unavailable"""
    try:
        # Priority: 1) MONGODB_URI env, 2) MONGODB_URL env, 3) Settings, 4) Default
        mongo_url = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL") or settings.MONGODB_URL or DEFAULT_MONGODB_URL
        
        if not mongo_url:
            logger.warning("MongoDB URL not configured - Blog/CMS features disabled")
            logger.info("To enable MongoDB: Set MONGODB_URL env var or update DEFAULT_MONGODB_URL in mongodb.py")
            logger.info("Get free MongoDB Atlas at: https://cloud.mongodb.com")
            return
        
        logger.info("Attempting MongoDB connection...")
        db.client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000
        )
        db.db = db.client[settings.MONGODB_DB_NAME or MONGODB_DB_NAME]
        # Ping to verify connection
        await db.client.admin.command('ping')
        logger.info("✅ Connected to MongoDB successfully! Blog/CMS features enabled.")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e} - Blog/CMS features disabled")
        logger.info("Continuing without MongoDB - other features work normally")
        db.client = None
        db.db = None

async def close_mongo_connection():
    """Close MongoDB connection if it exists"""
    try:
        if db.client:
            logger.info("Closing MongoDB connection...")
            db.client.close()
            logger.info("MongoDB connection closed.")
    except Exception as e:
        logger.warning(f"Error closing MongoDB connection: {e}")
