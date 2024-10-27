from config import settings

from sqlalchemy import *
from sqlalchemy.orm import create_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .models import User, Environment, Base
from .schemas import *
  
if not settings.LOCAL_DB:
    conn_str = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    engine = create_engine(conn_str,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_timeout=30,
    )
else:
    engine = create_engine("sqlite:///./test.db")

#reset the database
# Base.metadata.drop_all(engine)

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
            print(f"Error: {e}")
            session.rollback()
        finally:
            session.close()
