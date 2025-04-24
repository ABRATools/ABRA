from config import settings

import sys, os
sys.path.insert(0, os.path.abspath('..'))
from logger import logger

import time
from sqlalchemy import *
from sqlalchemy import event, func
from sqlalchemy.orm import sessionmaker, Session
from .models import Base
from .schemas import *

if not settings.LOCAL_DB:
    logger.info("Using remote database")
    conn_str = settings.DB_CONNECTION_STRING.get_secret_value()
    engine = create_engine(conn_str,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_timeout=30,
    )
else:
    logger.info("Using local sqlite database")
    # test if abra.db exists
    if os.path.exists("abra.db"):
        logger.info("abra.db exists")
    else:
        logger.info("abra.db does not exist, creating new database")

    engine = create_engine("sqlite:///./abra.db")

# Create the tables
Base.metadata.create_all(engine)

# Create a Session, yeild the session, commit and close on error or normal exit
Session = sessionmaker(bind=engine, autocommit=False)
def get_session():
    while True:
        try:
            session = Session()
            yield session
            session.commit()
            break
        except Exception as e:
            logger.critical(f"Error: {e}")
            logger.critical("Rolling back session")
            session.rollback()
        finally:
            session.close()
