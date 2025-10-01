from sqlalchemy import Engine
from app.db.base import Base
from app.models import user, project, proposal, contract, portfolio, payment  # noqa: F401  ensure models are imported


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)
    
    # Import and run seed function
    from app.db.seed_db import seed_database
    seed_database()