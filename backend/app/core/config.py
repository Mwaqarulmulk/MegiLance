from functools import lru_cache
from typing import Optional

from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MegiLance API"
    environment: str = "development"
    backend_cors_origins: list[str] = ["*"]

    # Database
    # Supports both PostgreSQL and Oracle Autonomous Database
    # PostgreSQL: postgresql+psycopg2://user:pass@host:port/dbname
    # Oracle: oracle+oracledb://user:pass@host:port/service?wallet_location=/path&wallet_password=pass
    database_url: str = "postgresql+psycopg2://megilance:megilance_pw@db:5432/megilance_db"
    
    # Oracle Autonomous Database specific settings
    oracle_wallet_location: Optional[str] = None
    oracle_wallet_password: Optional[str] = None
    oracle_service_name: Optional[str] = None
    
    # Path to mounted JSON data directory (for mock/admin/demo endpoints)
    json_data_dir: str = "/data/db"
    
    # Security & JWT
    secret_key: str = "megilance_secret_key_for_jwt_tokens"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    jwt_algorithm: str = "HS256"
    
    # Oracle Cloud Infrastructure (OCI) Configuration
    oci_region: Optional[str] = "us-ashburn-1"
    oci_profile: Optional[str] = "DEFAULT"  # OCI CLI config profile
    oci_namespace: Optional[str] = None  # Auto-detected if not provided
    oci_compartment_id: Optional[str] = None
    
    # OCI Object Storage (replaces AWS S3)
    oci_bucket_name: Optional[str] = "megilance-storage"  # Main storage bucket
    oci_bucket_assets: Optional[str] = "megilance-assets"
    oci_bucket_logs: Optional[str] = "megilance-logs"
    oci_bucket_uploads: Optional[str] = "megilance-uploads"
    oci_config_file: Optional[str] = None  # Path to OCI config file (~/.oci/config)
    oci_config_profile: Optional[str] = "DEFAULT"
    
    # OCI Vault (replaces AWS Secrets Manager)
    oci_vault_secret_id: Optional[str] = None
    
    # Legacy AWS Configuration (for backward compatibility - can be removed after migration)
    aws_region: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_bucket_assets: Optional[str] = None
    s3_bucket_logs: Optional[str] = None
    s3_bucket_uploads: Optional[str] = None
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
    
    # Additional settings from .env
    debug: bool = False
    allowed_origins: str = "*"
    jwt_secret_key: Optional[str] = None
    refresh_token_expire_days: int = 7
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from: Optional[str] = None
    redis_host: Optional[str] = None
    redis_port: Optional[int] = None
    redis_db: Optional[int] = None

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()