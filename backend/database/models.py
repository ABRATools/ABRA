from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime, Float, Table
from sqlalchemy.types import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

def epoch_now():
    return int(datetime.datetime.now(tz=datetime.timezone.utc).timestamp())

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
    description = Column(String(200), nullable=True)

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
    start_time = Column(Integer, default=epoch_now)
    end_time = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    status = Column(String(50), default="undefined", nullable=False)
    output = Column(String(200), nullable=True)

class Notifier(Base):
    __tablename__ = 'notifiers'

    id = Column(Integer, primary_key=True, index=True)
    webhook_name = Column(String(200), nullable=False)
    webhook_url = Column(String(200), nullable=False)
    enabled = Column(Boolean, default=True)

class Notification(Base):
    # global
    __tablename__ = 'notifications'

    # severity and type should really be enums, if only sqlite supported them
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    date_created = Column(Integer, default=epoch_now)
    severity = Column(String(50), nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), nullable=False)

class NodeInfo(Base):
    __tablename__ = 'node_info'

    id = Column(Integer, primary_key=True)
    data = Column(JSON, nullable=False)
    hostname = Column(String(50), nullable=False)
    timestamp = Column(Integer, default=epoch_now)

class Cluster(Base):
    __tablename__ = 'clusters'
    id = Column(Integer, primary_key=True)
    number_of_nodes = Column(Integer, nullable=False)
    node_details = Column(String(500), nullable=True) # string which holds list of nodes, becuase sqlite does not support list

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