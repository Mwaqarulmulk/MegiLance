# @AI-HINT: Application settings and environment configuration using Pydantic BaseSettings
import os
import secrets
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


def _generate_secret_key() -> str:
    """Generate or retrieve a persistent cryptographically secure secret key for development."""
    key_file = os.path.join(os.path.dirname(__file__), "..", "..", ".dev_secret_key")
    try:
        if os.path.exists(key_file):
            with open(key_file, "r", encoding="utf-8") as f:
                saved = f.read().strip()
                if saved and len(saved) >= 32:
                    return saved
        new_key = secrets.token_hex(32)
        with open(key_file, "w", encoding="utf-8") as f:
            f.write(new_key)
        return new_key
    except Exception:
        return secrets.token_hex(32)


class Settings(BaseSettings):
    app_name: str = "MegiLance API"
    environment: str = "development"
    backend_cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://megilance.site",
        "https://www.megilance.site",
        "https://api.megilance.site",
    ]

    # Database - Turso (libSQL) Remote Database ONLY
    # REQUIRED: Must set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
    # No local SQLite - all environments use Turso cloud database
    turso_database_url: str
    turso_auth_token: str

    # Debug mode for verbose logging
    debug: bool = False

    # MongoDB Configuration (Optional - for blog/advanced features)
    MONGODB_URL: Optional[str] = None  # Set via MONGODB_URL or MONGODB_URI env var
    MONGODB_DB_NAME: str = "megilance"  # Database name matching seed scripts

    # Path to mounted JSON data directory (for mock/admin/demo endpoints)
    json_data_dir: str = "/data/db"

    # Security & JWT - Auto-generates a random key in dev if not provided via env
    secret_key: str = os.environ.get("SECRET_KEY") or _generate_secret_key()
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    jwt_algorithm: str = "HS256"

    # Password Policy
    password_min_length: int = 8
    password_max_length: int = 128
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_digit: bool = True
    password_require_special: bool = False  # Recommended for better UX

    # Rate Limiting
    rate_limit_requests_per_minute: int = 60
    rate_limit_login_attempts: int = 5  # Failed login attempts before temporary lockout
    rate_limit_lockout_minutes: int = 15

    # Account Security
    account_lockout_threshold: int = 10  # Lock account after this many failed attempts

    # AWS S3 / Cloudflare R2 Configuration
    aws_region: Optional[str] = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_bucket_name: Optional[str] = None
    aws_endpoint_url: Optional[str] = (
        None  # Crucial for Cloudflare R2, e.g., https://<account_id>.r2.cloudflarestorage.com
    )
    aws_custom_domain: Optional[str] = (
        None  # Public URL (e.g., https://pub-xxxxxxxx.r2.dev or a custom domain)
    )
    account_lockout_duration_minutes: int = 30  # How long to lock the account
    session_absolute_timeout_hours: int = 24  # Force re-login after this many hours

    # CSRF Protection
    # Enabled in production; uses SameSite=Lax + CSRF token for state-changing requests
    csrf_enabled: bool = True
    csrf_header_name: str = "X-CSRF-Token"

    # Audit Logging
    audit_log_enabled: bool = True
    audit_log_retention_days: int = 90

    # File Storage (Simple local storage or can be upgraded to cloud storage like S3/Cloudflare R2)
    upload_dir: str = "./uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_upload_extensions: list[str] = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".pdf",
        ".doc",
        ".docx",
    ]

    # AI Service — DigitalOcean AI
    ai_service_url: Optional[str] = "http://localhost:8001"
    do_ai_api_key: Optional[str] = None            # DO_AI_API_KEY
    do_ai_api_base: Optional[str] = "https://inference.do-ai.run/v1"
    do_ai_model: Optional[str] = "llama3.3-70b-instruct"
    do_ai_agent_endpoint: Optional[str] = None      # DO_AI_AGENT_ENDPOINT
    do_ai_agent_key: Optional[str] = None           # DO_AI_AGENT_KEY
    do_ai_kb_id: Optional[str] = None               # DO_AI_KB_ID

    # Email & Notifications
    ses_region: Optional[str] = None
    ses_from_email: Optional[str] = None
    sns_topic_arn: Optional[str] = None

    # SMTP Configuration for Email Service
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: str = "noreply@megilance.site"
    FROM_NAME: str = "MegiLance"
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "https://megilance.site")

    # Blockchain & Payments
    circle_api_key: Optional[str] = None
    blockchain_provider_url: Optional[str] = None
    usdc_contract_address: Optional[str] = None

    # Stripe Payment Configuration
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PLATFORM_FEE_PERCENT: float = 8.0  # Platform fee % charged to freelancers (below market; clients pay 0%)

    # Binance Pay Configuration (crypto payments via Binance)
    BINANCE_PAY_API_KEY: Optional[str] = None
    BINANCE_PAY_SECRET_KEY: Optional[str] = None
    BINANCE_PAY_MERCHANT_ID: Optional[str] = None
    # Platform's receiving wallet for crypto deposits. Defaults to the project's
    # Polygon Amoy testnet wallet so MetaMask deposits work out-of-the-box for
    # demos/showcases even when the deployment env var is not set. Override
    # CRYPTO_WALLET_ADDRESS (and CRYPTO_NETWORK) in production for real funds.
    CRYPTO_WALLET_ADDRESS: Optional[str] = "0x228d599d4c7e89194b94e9d65b1b4114870a4c34"
    CRYPTO_NETWORK: str = "AMOY"  # Network name (ETH, BSC, POLYGON, AMOY, SEPOLIA, BSC_TESTNET)
    CRYPTO_CHAIN_ID: Optional[int] = None  # EVM chain id; derived from CRYPTO_NETWORK when unset
    CRYPTO_RPC_URL: Optional[str] = None  # Override JSON-RPC endpoint used to verify transactions
    # Stablecoin (ERC-20) token registry override as JSON, merged over built-in defaults:
    # {"80002": {"USDC": {"address": "0x...", "decimals": 6, "faucet": true}}}
    STABLECOIN_TOKENS: Optional[str] = None

    # OAuth Configuration - Google (FREE forever)
    # Get from: https://console.cloud.google.com/apis/credentials
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # OAuth Configuration - GitHub (FREE forever)
    # Get from: https://github.com/settings/developers
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # OAuth Configuration - LinkedIn (FREE)
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None

    # Resend Email Service (FREE 3,000/month)
    # Get from: https://resend.com/api-keys
    RESEND_API_KEY: Optional[str] = None

    # Monitoring & Logging
    sentry_dsn: Optional[str] = None
    log_level: str = "INFO"

    # Connection Pool
    # Sized to match Starlette's default threadpool (40 workers) so that sync
    # route handlers - which each make blocking Turso HTTP calls - don't churn
    # connections under concurrent load.
    turso_pool_connections: int = 20
    turso_pool_maxsize: int = 40

    # Redis (Optional — caching/sessions)
    redis_host: Optional[str] = None
    redis_port: Optional[int] = None
    redis_db: Optional[int] = None

    # Token Aliases (prefer canonical fields above)
    refresh_token_expire_days: int = 7

    # SE Ranking API configuration
    se_ranking_api_key: Optional[str] = None
    se_ranking_site_id: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        populate_by_name=True,
        extra="ignore",
    )


def validate_production_settings(settings: Settings) -> None:
    """Validate critical security settings for production environment."""
    import warnings

    # Always check Turso database configuration (required for all environments)
    if not settings.turso_database_url or not settings.turso_auth_token:
        raise ValueError(
            "CRITICAL: Turso database not configured. "
            "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required for all environments. "
            "Get free Turso database at: https://turso.tech"
        )

    if settings.environment == "production":
        # Check for default/weak secret key
        if "CHANGE_ME" in settings.secret_key or len(settings.secret_key) < 32:
            raise ValueError(
                "CRITICAL: Production environment detected with insecure SECRET_KEY. "
                "Set a strong, random SECRET_KEY environment variable (at least 32 characters)."
            )

        # Check CORS wildcard in production
        if "*" in settings.backend_cors_origins:
            warnings.warn(
                "WARNING: CORS wildcard (*) detected in production. "
                "Consider restricting to specific origins.",
                RuntimeWarning,
            )
    elif settings.environment != "development":
        # Staging, test, etc. — BLOCK insecure secret keys (not just warn)
        if "CHANGE_ME" in settings.secret_key or len(settings.secret_key) < 32:
            raise ValueError(
                f"CRITICAL: Insecure SECRET_KEY detected in '{settings.environment}' environment. "
                "Set a strong, random SECRET_KEY environment variable (at least 32 characters). "
                "Default keys are only allowed in 'development' mode."
            )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    validate_production_settings(settings)
    return settings
