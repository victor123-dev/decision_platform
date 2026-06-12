from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings
import logging
import os

logger = logging.getLogger(__name__)

# Ensure data directory exists
os.makedirs(os.path.dirname(settings.sqlite_path), exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{settings.sqlite_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

logger.info(f"SQLite database initialized at {settings.sqlite_path}")
