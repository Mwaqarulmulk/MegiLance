from functools import lru_cache
from typing import Optional

from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MegiLance API"
    environment: str = "development"
    backend_cors_origins: list[str] = ["*"]

    # Database
    database_url: str = "postgresql+psycopg2://megilance:megilance_pw@db:5432/megilance_db"
    # Path to mounted JSON data directory (for mock/admin/demo endpoints)
    json_data_dir: str = "/data/db"
    
    # Security & JWT
    secret_key: str = "megilance_secret_key_for_jwt_tokens"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    jwt_algorithm: str = "HS256"
    
    # AWS Configuration
    aws_region: Optional[str] = "eu-central-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    
    # AWS S3
    s3_bucket_assets: Optional[str] = None
    s3_bucket_logs: Optional[str] = None
    s3_bucket_uploads: Optional[str] = None
    
    # AWS Secrets Manager ARNs
    db_secret_arn: Optional[str] = None
    jwt_secret_arn: Optional[str] = None
    
    # AI Service
    ai_service_url: Optional[str] = "http://localhost:8001"
    openai_api_key: Optional[str] = None
    
    # Email & Notifications
    ses_region: Optional[str] = None
    ses_from_email: Optional[str] = None
    sns_topic_arn: Optional[str] = None
    
    # Blockchain & Payments
    circle_api_key: Optional[str] = None
    blockchain_provider_url: Optional[str] = None
    usdc_contract_address: Optional[str] = None
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()