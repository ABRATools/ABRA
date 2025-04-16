import sys, os
sys.path.insert(0, os.path.abspath('..'))
from logger import logger

from sqlalchemy import and_, func
from .models import User, Group, Node, Environment, ConnectionStrings, NodeInfo, Permission, System, Cluster
from typing import List
import datetime
import json

def get_hash_for_user(db, username):
    try:
        return db.query(User).filter(User.username == username).first().password
    except AttributeError:
        return None

def create_group(db, name):
    group = Group(name=name)
    db.add(group)
    logger.debug(f"Creating group {name}")
    db.commit()

def get_user_groups(db, username):
    try:
        user = db.query(User).filter(User.username == username).first()
        return [group.name for group in user.groups]
    except AttributeError:
        return None

def get_all_groups(db):
    return db.query(Group).all()

def add_user_to_group(db, username, group):
    user = db.query(User).filter(User.username == username).first()
    group = db.query(Group).filter(Group.name == group).first()
    user.groups.append(group)
    db.commit()
    logger.debug(f"Added user {username} to group {group.name}")

def create_user(db, username, hashed_password, email, groups):
    if db.query(User).filter(User.username == username).first() is not None:
        print(f"User {username} already exists")
        return
    max_id = db.query(func.max(User.id)).scalar()
    if max_id is None:
        max_id = 0
    max_id += 1
    user = User(id=max_id, username=username, email=email, password=hashed_password, is_active=True)
    for group in groups:
        group = db.query(Group).filter(Group.name == group).first()
        user.groups.append(group)
    db.add(user)
    logger.debug(f"Creating user {username}")
    db.commit()

def create_connection_string(db, name, connection_string, description=None):
    q_filter = and_(ConnectionStrings.name == name, ConnectionStrings.connection_string == connection_string)
    exists = db.query(ConnectionStrings).filter(q_filter).first()
    if exists is not None:
        logger.debug(f"Connection string {name} with connection string {connection_string} already exists... updating")
        exists.connection_string = connection_string
        exists.description = description
        db.commit()
        return
    if description:
        connection_string = ConnectionStrings(name=name, connection_string=connection_string, description=description)
    else:
        connection_string = ConnectionStrings(name=name, connection_string=connection_string)
    db.add(connection_string)
    db.commit()
    logger.debug(f"Adding connection string {name}")

def get_connection_strings(db):
    return db.query(ConnectionStrings).all()

def delete_connection_string(db, name):
    conn_str = db.query(ConnectionStrings).filter(ConnectionStrings.name == name).first()
    if conn_str is None:
        return False
    db.delete(conn_str)
    db.commit()
    logger.debug(f"Deleting connection string {name}")
    return True

def delete_user(db, username):
    user = db.query(User).filter(User.username == username).first()
    db.delete(user)
    db.commit()
    logger.debug(f"Deleted user {username}")

def get_users(db):
    return db.query(User).all()

def get_user_by_username(db, username):
    if username is None:
        return None
    try:
        user = db.query(User).filter(User.username == username).first()
        return user
    except AttributeError:
        return None

def get_user_by_email(db, email):
    if email is None:
        return None
    try:
        user = db.query(User).filter(User.email == email).first()
        return user
    except AttributeError:
        return None

def get_user_info(db, username):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        return None
    groups = [group.name for group in user.groups]
    if 'admin' in groups:
        user_type = 'admin'
    else:
        user_type = 'user'
    return {
        "username": user.username,
        "user_type": user_type,
        "groups": groups,
        "auth_source": 'database'
    }

def get_groups_by_names(db, group_names):
    groups = []
    for group_name in group_names:
        group = db.query(Group).filter(Group.name == group_name).first()
        if group is not None:
            groups.append(group)
    return groups

def get_or_add_group(db, group_name):
    group = db.query(Group).filter(Group.name == group_name).first()
    if group is None:
        if group_name == 'admin' or group_name == 'abra_ldap_admins':
            # get admin permission
            admin_perm = db.query(Permission).filter(Permission.name == 'admin:all').first()
            if admin_perm is None:
                # create admin permission if it doesn't exist
                admin_perm = Permission(name='admin:all')
                db.add(admin_perm)
                db.commit()
            group = Group(name=group_name)
            # add admin permission to group
            group.permissions.append(admin_perm)
        else:
            group = Group(name=group_name)
        # add group to database if it doesn't exist
        db.add(group)
        db.commit()
        logger.debug(f"Creating group {group_name}")
    return group

def update_user_email(db, username, email):
    user = db.query(User).filter(User.username == username).first()
    user.email = email
    db.commit()
    logger.debug(f"Updating email for user {username} to {email}")

def update_user_password(db, username, password):
    user = db.query(User).filter(User.username == username).first()
    user.password = password
    user.passwordChangeDate = datetime.datetime.now(tz=datetime.timezone.utc)
    db.commit()
    logger.debug(f"Updating password for user {username}")

def update_user_totp_secret(db, username, secret):
    user = db.query(User).filter(User.username == username).first()
    user.totp_secret = secret
    user.is_totp_enabled = True
    db.commit()

def update_user_totp_confirmed(db, username):
    user = db.query(User).filter(User.username == username).first()
    user.is_totp_confirmed = True
    db.commit()

def reset_totp_secret(db, username):
    user = db.query(User).filter(User.username == username).first()
    user.totp_secret = None
    user.is_totp_enabled = False
    user.is_totp_confirmed = False
    db.commit()

"""
NODE STUFF
"""

def create_environment(db, env):
    # First try to find by container ID if available
    container_id = None
    if hasattr(env, 'env_id') and env.env_id:
        container_id = env.env_id
        logger.debug(f"Looking for environment by container_id: {container_id}")
        exists = db.query(Environment).filter(Environment.container_id == container_id).first()
        
        if exists is None:
            # Also try by name as fallback
            exists = db.query(Environment).filter(Environment.name == env.name).first()
    else:
        # Fall back to name-based lookup
        exists = db.query(Environment).filter(Environment.name == env.name).first()
    
    if exists is not None:
        logger.debug(f"Updating environment {exists.id} (name: {exists.name}, container_id: {exists.container_id})")
        exists.ip = env.ip
        exists.os = env.os
        exists.status = env.status
        exists.uptime = env.uptime
        exists.cpu_percent = env.cpu_percent
        exists.memory = env.memory
        exists.disk = env.disk
        exists.max_cpus = env.max_cpus
        exists.max_memory = env.max_memory
        exists.max_disk = env.max_disk
        
        # Update container_id if not already set
        if container_id and not exists.container_id:
            exists.container_id = container_id
            
        db.commit()
        return exists
        
    # get max id
    max_id = db.query(func.max(Environment.id)).scalar()
    if max_id is None:
        max_id = 0
    # increment max id
    max_id += 1

    logger.debug(f"Creating new environment with ID {max_id}, name {env.name}, container_id {container_id}")
    new_env = Environment(
        id=max_id, 
        name=env.name, 
        ip=env.ip, 
        os=env.os, 
        status=env.status, 
        uptime=env.uptime, 
        cpu_percent=env.cpu_percent, 
        memory=env.memory, 
        disk=env.disk, 
        max_cpus=env.max_cpus, 
        max_memory=env.max_memory, 
        max_disk=env.max_disk,
        container_id=container_id  # Store the original container ID
    )
    db.add(new_env)
    db.commit()
    logger.debug(f"Created environment {env.name} with container_id {container_id}")
    return new_env

def create_node(db, node):
    exists = db.query(Node).filter(Node.name == node.name).first()
    if exists is not None:
        exists.ip = node.ip
        exists.os = node.os
        exists.status = node.status
        exists.uptime = node.uptime
        exists.cpu_percent = node.cpu_percent
        exists.memory = node.memory
        exists.disk = node.disk
        exists.max_cpus = node.max_cpus
        exists.max_memory = node.max_memory
        exists.max_disk = node.max_disk
        db.commit()
        for env in node.environments:
            new_env = create_environment(db, env)
            if new_env is not None:
                exists.environments.append(new_env)
        return None
    # get max id
    max_id = db.query(func.max(Node.id)).scalar()
    if max_id is None:
        max_id = 0
    # increment max id
    max_id += 1

    new_node = Node(id=max_id, name=node.name, ip=node.ip, os=node.os, status=node.status, uptime=node.uptime, cpu_percent=node.cpu_percent, memory=node.memory, disk=node.disk, max_cpus=node.max_cpus, max_memory=node.max_memory, max_disk=node.max_disk)
    db.add(new_node)
    db.commit()

    for env in node.environments:
        new_env = create_environment(db, env)
        new_node.environments.append(new_env)
    
    db.commit()
    logger.debug(f"Creating node {node.name}")

def delete_node(db, node_name):
    node = db.query(Node).filter(Node.name == node_name).first()
    if node is None:
        return False
    for env in node.environments:
        db.delete(env)
    db.delete(node)
    db.commit()
    logger.debug(f"Deleting node {node_name}")
    return True

def get_nodes(db):
    nodes = db.query(Node).all()
    # print(nodes)
    return nodes

def get_nodes_and_environments(db):
    # need to left join nodes and environments on node.id = environment.node_id
    nodes = db.query(Node).outerjoin(Environment, Node.id == Environment.node_id).all()
    return nodes

def get_next_node_id(db):
    return db.query(func.max(Node.id)).scalar() + 1

#######################
# Node Info (JSON)
#######################

def insert_node_info_json(db, json: str, hostname: str):
    # have max 20 entries in the table
    max_id = db.query(func.max(NodeInfo.id)).scalar()
    if max_id is None:
        max_id = 0
    if max_id >= 20:
        # delete the oldest entry, smallest timestamp
        oldest = db.query(NodeInfo).order_by(NodeInfo.timestamp.asc()).first()
        db.delete(oldest)
        db.commit()
    # insert new entry
    new_entry = NodeInfo(id=max_id+1, data=json, hostname=hostname)
    db.add(new_entry)
    db.commit()

# def get_newest_node_info(db) -> str:
#     newest = db.query(NodeInfo).order_by(NodeInfo.id.desc()).first()
#     return json.dumps(newest.data)

# def get_all_node_info_newer_than(db, time: datetime.datetime) -> List[str]:
#     data_list = List[str]
#     data = db.query(NodeInfo).filter(NodeInfo.timestamp > time).all()
#     for entry in data:
#         print(entry.data)
#         data_list.append(json.dumps(entry.data))

#######################
# Cluster Info (JSON)
#######################

def add_node_to_cluster(db, node_name):
    cluster = db.query(Cluster).first()
    if cluster is None:
        # create new cluster
        max_id = db.query(func.max(Cluster.id)).scalar()
        if max_id is None:
            max_id = 0
        max_id += 1
        cluster = Cluster(id=max_id, number_of_nodes=1, node_details=f"{node_name}")
        db.add(cluster)
    else:
        # Check if node already exists in cluster
        for node in cluster.node_details.split(","):
            if node == node_name:
                return
        logger.debug(f"Adding node {node_name} to cluster {cluster.id}")
        cluster.number_of_nodes += 1
        cluster.node_details += f",{node_name}"

        db.add(cluster)
        db.commit()
        db.refresh(cluster)
    db.commit()

def return_cluster_info(db):
    """
    Uses data stored in Cluster table to create and return a JSON object with the following structure:
    {
        "nodes": [
            # Instances of NodeInfo with matching node_name
            {"node_name": "node1", "environments": ["env1", "env2"]},
            {"node_name": "node2", "environments": ["env3"]},
        ]
    }
    """
    cluster = db.query(Cluster).first()
    if cluster is None:
        return None
    nodes = []
    for node in cluster.node_details.split(","):
        node_info = db.query(NodeInfo).order_by(NodeInfo.timestamp.desc()).filter(NodeInfo.hostname == node).first()
        if node_info is not None:
            nodes.append(node_info.data)
    return json.dumps({"node_data": nodes})

#######################
# systems
#######################

def create_system(db, system_id, name, description=None, is_custom=True):
    """create a new system or update if it already exists"""
    # Check if system already exists
    existing = db.query(System).filter(System.system_id == system_id).first()
    if existing:
        # Update existing system
        existing.name = name
        existing.description = description
        existing.is_custom = is_custom
        existing.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)
        db.commit()
        logger.debug(f"Updated existing system {system_id}")
        return existing
    
    # Get next ID
    max_id = db.query(func.max(System.id)).scalar()
    if max_id is None:
        max_id = 0
    max_id += 1
    
    # Create new system
    new_system = System(
        id=max_id,
        system_id=system_id,
        name=name,
        description=description,
        is_custom=is_custom
    )
    db.add(new_system)
    db.commit()
    logger.debug(f"Created new system {system_id}")
    return new_system

def get_system_by_id(db, system_id):
    """get a system by its system_id"""
    return db.query(System).filter(System.system_id == system_id).first()

def get_all_systems(db):
    """get all systems"""
    return db.query(System).all()

def delete_system(db, system_id):
    """delete a system by its system_id"""
    system = db.query(System).filter(System.system_id == system_id).first()
    if not system:
        logger.warning(f"Attempted to delete non-existent system {system_id}")
        return False
    
    db.delete(system)
    db.commit()
    logger.debug(f"Deleted system {system_id}")
    return True

def add_environment_to_system(db, system_id, env_id):
    """add an environment to a system"""
    try:
        # First, make sure both system and environment exist
        system = db.query(System).filter(System.system_id == system_id).first()
        if not system:
            logger.warning(f"System {system_id} not found")
            return False
            
        # Try to find environment by id 
        environment = db.query(Environment).filter(Environment.id == env_id).first()
        if not environment:
            logger.warning(f"Environment {env_id} not found")
            return False
        
        # Check if environment is already in system
        if environment not in system.environments:
            logger.debug(f"Adding environment {env_id} to system {system_id}")
            system.environments.append(environment)
            db.commit()
            logger.debug(f"Added environment {env_id} to system {system_id}")
        else:
            logger.debug(f"Environment {env_id} already in system {system_id}")
            
        return True
    except Exception as e:
        logger.error(f"Error adding environment {env_id} to system {system_id}: {str(e)}")
        db.rollback()
        raise

def remove_environment_from_system(db, system_id, env_id):
    """remove an environment from a system"""
    try:
        system = db.query(System).filter(System.system_id == system_id).first()
        if not system:
            logger.warning(f"System {system_id} not found")
            return False
            
        environment = db.query(Environment).filter(Environment.id == env_id).first()
        if not environment:
            logger.warning(f"Environment {env_id} not found")
            return False
        
        if environment in system.environments:
            logger.debug(f"Removing environment {env_id} from system {system_id}")
            system.environments.remove(environment)
            db.commit()
            logger.debug(f"Removed environment {env_id} from system {system_id}")
        else:
            logger.debug(f"Environment {env_id} not in system {system_id}")
        
        return True
    except Exception as e:
        logger.error(f"Error removing environment {env_id} from system {system_id}: {str(e)}")
        db.rollback()
        raise

def get_system_environments(db, system_id):
    """get all environments in a system"""
    system = db.query(System).filter(System.system_id == system_id).first()
    if not system:
        return []
    
    return system.environments

def find_or_create_environment_by_container_id(db, container_id, name=None, node_id=None):
    """
    Find an environment by its container ID or create a new one if it doesn't exist
    
    Args:
        db: Database session
        container_id: The container ID from Podman
        name: Optional name for the environment
        node_id: Optional node ID to associate with this environment
        
    Returns:
        The found or newly created Environment object
    """
    if not container_id:
        logger.warning("No container_id provided to find_or_create_environment_by_container_id")
        return None
        
    # First try to find by container ID
    env = db.query(Environment).filter(Environment.container_id == container_id).first()
    
    if env:
        logger.debug(f"Found existing environment with container_id {container_id}")
        # Update name and node if provided
        if name:
            env.name = name
        if node_id:
            # Find node by ID or name
            node = None
            try:
                if isinstance(node_id, int):
                    node = db.query(Node).filter(Node.id == node_id).first()
                else:
                    node = db.query(Node).filter(Node.name == node_id).first()
                    
                if node:
                    env.node_id = node.id
            except Exception as e:
                logger.error(f"Error finding node {node_id}: {str(e)}")
                
        db.commit()
        return env
        
    # If not found, create a new environment
    try:
        # Get next ID
        max_id = db.query(func.max(Environment.id)).scalar()
        if max_id is None:
            max_id = 0
        max_id += 1
        
        # Create minimal environment record with required fields
        new_env = Environment(
            id=max_id,
            name=name or "Unknown",
            ip="",
            os="undefined",
            status="undefined",
            uptime="0",
            cpu_percent=0,
            memory=0,
            disk=0,
            max_cpus=0,
            max_memory=0,
            max_disk=0,
            container_id=container_id
        )
        
        # Associate with node if provided
        if node_id:
            node = None
            try:
                if isinstance(node_id, int):
                    node = db.query(Node).filter(Node.id == node_id).first()
                else:
                    node = db.query(Node).filter(Node.name == node_id).first()
                    
                if node:
                    new_env.node_id = node.id
            except Exception as e:
                logger.error(f"Error finding node {node_id}: {str(e)}")
        
        db.add(new_env)
        db.commit()
        
        logger.debug(f"Created new environment with ID {max_id} for container_id {container_id}")
        return new_env
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating environment for container_id {container_id}: {str(e)}")
        return None

# Enhanced function to add environment to system with container ID support
def add_environment_to_system_by_container_id(db, system_id, container_id, env_name=None, node_id=None):
    """Add an environment to a system by container ID"""
    try:
        # First, make sure system exists
        system = db.query(System).filter(System.system_id == system_id).first()
        if not system:
            logger.warning(f"System {system_id} not found")
            return False
        
        # Find or create environment by container ID
        environment = find_or_create_environment_by_container_id(
            db, container_id, name=env_name, node_id=node_id
        )
        
        if not environment:
            logger.warning(f"Could not find or create environment for container_id {container_id}")
            return False
        
        # Check if environment is already in system
        if environment not in system.environments:
            logger.debug(f"Adding environment {environment.id} (container_id: {container_id}) to system {system_id}")
            system.environments.append(environment)
            db.commit()
            logger.debug(f"Added environment to system {system_id}")
        else:
            logger.debug(f"Environment {environment.id} (container_id: {container_id}) already in system {system_id}")
            
        return True
    except Exception as e:
        logger.error(f"Error adding environment with container_id {container_id} to system {system_id}: {str(e)}")
        db.rollback()
        raise