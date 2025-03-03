import sys, os
sys.path.insert(0, os.path.abspath('..'))
from logger import logger

from sqlalchemy import and_, func
from .models import User, Group, Node, Environment, ConnectionStrings, NodeInfo
from typing import List
import datetime
import json

def get_hash_for_user(db, username):
    try:
        return db.query(User).filter(User.username == username).first().password
    except AttributeError:
        return None

def create_group(db, name):
    # default permissions for a group (admin)
    group = Group(name=name, permissions="create, read, update, delete")
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
    logger.debug(f"Adding user {username} to group {group.name}")
    db.commit()

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

# def create_user(db, username, password, admin):
#     if db.query(User).filter(User.username == username).first() is not None:
#         print(f"User {username} already exists")
#         return
#     max_id = db.query(func.max(User.id)).scalar()
#     if max_id is None:
#         max_id = 0
#     max_id += 1
#     user = User(id=max_id, username=username, email="", password=password, is_active=True)
#     if admin:
#         group = db.query(Group).filter(Group.name == 'admin').first()
#         if group is None:
#             print("Admin group does not exist... creating")
#             create_group(db, 'admin')
#         user.groups.append(group)
#     db.add(user)
#     logger.debug(f"Creating user {username}")
#     db.commit()

def create_connection_string(db, name, connection_string, conn_str_type, ip=None):
    exists = db.query(ConnectionStrings).filter(ConnectionStrings.name == name).first()
    if exists is not None:
        print(f"Connection string {name} already exists")
        exists.connection_string = connection_string
        db.commit()
        return
    connection_string = ConnectionStrings(name=name, connection_string=connection_string, type=conn_str_type, ip=ip)
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
    }

def get_groups_by_names(db, group_names):
    groups = []
    for group_name in group_names:
        group = db.query(Group).filter(Group.name == group_name).first()
        if group is not None:
            groups.append(group)
    return groups

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
    exists = db.query(Environment).filter(Environment.name == env.name).first()
    if exists is not None:
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
        db.commit()
        return None
    # get max id
    max_id = db.query(func.max(Environment.id)).scalar()
    if max_id is None:
        max_id = 0
    # increment max id
    max_id += 1

    new_env = Environment(id=max_id, name=env.name, ip=env.ip, os=env.os, status=env.status, uptime=env.uptime, cpu_percent=env.cpu_percent, memory=env.memory, disk=env.disk, max_cpus=env.max_cpus, max_memory=env.max_memory, max_disk=env.max_disk)
    db.add(new_env)
    db.commit()
    logger.debug(f"Creating environment {env.name}")
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

def insert_node_info_json(db, json: str):
    # have max 20 entries in the table
    max_id = db.query(func.max(NodeInfo.id)).scalar()
    if max_id is None:
        max_id = 0
    if max_id >= 20:
        # delete the oldest entry
        oldest = db.query(NodeInfo).order_by(NodeInfo.id).first()
        db.delete(oldest)
        db.commit()
    # insert new entry
    new_entry = NodeInfo(id=max_id+1, data=json)
    db.add(new_entry)
    db.commit()

def get_newest_node_info(db) -> str:
    newest = db.query(NodeInfo).order_by(NodeInfo.id.desc()).first()
    return json.dumps(newest.data)

def get_all_node_info_newer_than(db, time: datetime.datetime) -> List[str]:
    data_list = List[str]
    data = db.query(NodeInfo).filter(NodeInfo.timestamp > time).all()
    for entry in data:
        print(entry.data)
        data_list.append(json.dumps(entry.data))