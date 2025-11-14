from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings


settings = get_settings()

# Lazy engine creation to avoid blocking on startup
_engine = None
_SessionLocal = None

def get_engine():
    global _engine
    if _engine is None:
        try:
            _engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args={"connect_timeout": 5})
        except Exception as e:
            print(f"⚠️ Database engine creation failed: {e}")
            # Create a dummy engine that will fail gracefully
            _engine = create_engine("sqlite:///:memory:")
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# For backward compatibility
engine = None
SessionLocal = None

def get_db():
    db = None
    try:
        session_factory = get_session_local()
        db = session_factory()
        yield db
    except Exception as e:
        print(f"⚠️ Database session creation failed: {e}")
        # Return a None generator that doesn't block
        yield None
    finally:
        if db is not None:
            try:
                db.close()
            except:
                pass
