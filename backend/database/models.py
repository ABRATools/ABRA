from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime, Float, Table
from sqlalchemy.types import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

user_groups = Table(
    'user_groups',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True)
)

group_permissions = Table(
    'group_permissions',
    Base.metadata,
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

user_notifications = Table(
    'user_notifications',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('notification_id', Integer, ForeignKey('notifications.id'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=True)
    # hashed password
    password = Column(String(60), nullable=False)
    # password change date is set to epoch time by default
    passwordChangeDate = Column(DateTime, default=datetime.datetime.fromtimestamp(0, datetime.timezone.utc), nullable=True)
    is_active = Column(Boolean, default=True)
    totp_secret = Column(String(50), nullable=True)
    is_totp_enabled = Column(Boolean, default=True)
    is_totp_confirmed = Column(Boolean, default=False)
    # user can have multiple notifications
    notifications = relationship("Notification", secondary=user_notifications, back_populates="users")
    # user can have multiple groups
    groups = relationship("Group", secondary=user_groups, back_populates="users")

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    # sqlite does not support mutable lists lol
    # permissions = Column(MutableList.as_mutable(String), nullable=True)
    # permissions = Column(String(255), nullable=True)
    users = relationship("User", secondary=user_groups, back_populates="groups")
    permissions = relationship("Permission", secondary=group_permissions, back_populates="groups")

class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(150), nullable=True)
    groups = relationship("Group", secondary=group_permissions, back_populates="permissions")

class ConnectionStrings(Base):
    __tablename__ = 'connection_strings'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    connection_string = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    ip = Column(String(50), nullable=True)

class Node(Base):
    __tablename__ = 'nodes'
    id = Column(Integer, primary_key=True, index=True)
    active = Column(Boolean, default=True)
    name = Column(String(50), nullable=False)
    ip = Column(String(50), nullable=False)
    os = Column(String(50), nullable=False)
    status = Column(String(50), default="undefined", nullable=False)
    uptime = Column(String(50), nullable=False)
    cpu_percent = Column(Integer, nullable=False)
    memory = Column(Float, nullable=False)
    disk = Column(Float, nullable=False)
    max_cpus = Column(Integer, nullable=False)
    max_memory = Column(Float, nullable=False)
    max_disk = Column(Float, nullable=False)
    # node can have multiple environments
    environments = relationship("Environment", back_populates="nodes")

class Environment(Base):
    __tablename__ = 'environments'
    id = Column(Integer, primary_key=True, index=True)
    active = Column(Boolean, default=True)
    name = Column(String(50), nullable=False)
    ip = Column(String(50), nullable=True)
    os = Column(String(50), default="undefined", nullable=False)
    status = Column(String(50), default="undefined", nullable=False)
    uptime = Column(String(50), nullable=False)
    cpu_percent = Column(Integer, nullable=False)
    memory = Column(Float, nullable=False)
    disk = Column(Float, nullable=False)
    max_cpus = Column(Integer, nullable=False)
    max_memory = Column(Integer, nullable=False)
    max_disk = Column(Integer, nullable=False)
    # Store original container ID for WebSocket matching
    container_id = Column(String(100), nullable=True)
    # environment can only have one node
    node_id = Column(Integer, ForeignKey('nodes.id'))
    nodes = relationship("Node", back_populates="environments")

class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    status = Column(String(50), default="undefined", nullable=False)
    port_number = Column(Integer, nullable=False)

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc))
    end_time = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    status = Column(String(50), default="undefined", nullable=False)
    output = Column(String(200), nullable=True)

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    date_created = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc))
    is_read = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    # can have multiple users
    users = relationship("User", secondary=user_notifications, back_populates="notifications")

class NodeInfo(Base):
    __tablename__ = 'node_info'

    id = Column(Integer, primary_key=True)
    data = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc))

class System(Base):
    __tablename__ = 'systems'
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String(50), nullable=False, unique=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=True)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc))
    updated_at = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc), onupdate=datetime.datetime.now(tz=datetime.timezone.utc))
    environments = relationship("Environment", secondary="system_environments", backref="systems")
    
# Association table for system-environment relationships
system_environments = Table(
    'system_environments',
    Base.metadata,
    Column('system_id', Integer, ForeignKey('systems.id'), primary_key=True),
    Column('environment_id', Integer, ForeignKey('environments.id'), primary_key=True)
)