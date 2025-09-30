from sqlalchemy import Engine
from app.db.base import Base
from app.models import user  # noqa: F401  ensure models are imported


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)
