from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    passwordChangeDate = Column(DateTime, default="", nullable=True)
    role = Column(Enum('admin', 'user'), nullable=False)

class Node(Base):
    __tablename__ = 'nodes'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    ip = Column(String(50), nullable=False)
    port = Column(Integer, nullable=False)
    status = Column(String(50), default="undefined", nullable=False)
    # node can have multiple environments
    environments = relationship("Environment", back_populates="nodes")

class Environment(Base):
    __tablename__ = 'environments'

    id = Column(Integer, primary_key=True, index=True)
    machine_name = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    os = Column(String(50), default="undefined", nullable=False)
    ip = Column(String(50), nullable=True)
    port = Column(Integer, nullable=True)
    status = Column(String(50), default="undefined", nullable=False)
    # environment can only have one node
    node_id = Column(Integer, ForeignKey('nodes.id'))
    nodes = relationship("Node", back_populates="environments")
