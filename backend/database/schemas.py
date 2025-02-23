from sqlalchemy import and_, func
from .models import User, Group, Node, Environment, ConnectionStrings
import datetime

def get_hash_for_user(db, username):
    try:
        return db.query(User).filter(User.username == username).first().password
    except AttributeError:
        return None

def create_group(db, name):
    # default permissions for a group (admin)
    group = Group(name=name, permissions="create, read, update, delete")
    db.add(group)
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

def create_user(db, username, password, admin):
    if db.query(User).filter(User.username == username).first() is not None:
        print(f"User {username} already exists")
        return

    # get max id
    max_id = db.query(func.max(User.id)).scalar()
    if max_id is None:
        max_id = 0
    # increment max id (WE LOVE SUPPLEMENTAL PRIMARY KEYS IN THIS HOUSE NATURAL KEYS ARE FOR LOSERS)
    max_id += 1

    user = User(id=max_id, username=username, email="", password=password, is_active=True)
    if admin:
        group = db.query(Group).filter(Group.name == 'admin').first()
        if group is None:
            print("Admin group does not exist... creating")
            create_group(db, 'admin')
        user.groups.append(group)
    db.add(user)
    db.commit()

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

def get_connection_strings(db):
    return db.query(ConnectionStrings).all()

def delete_connection_string(db, name):
    conn_str = db.query(ConnectionStrings).filter(ConnectionStrings.name == name).first()
    if conn_str is None:
        return False
    db.delete(conn_str)
    db.commit()
    return True

def delete_user(db, username):
    user = db.query(User).filter(User.username == username).first()
    db.delete(user)
    db.commit()

def get_users(db):
    return db.query(User).all()

def get_user(db, username):
    user = db.query(User).filter(User.username == username).first()
    return user

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

def update_user_email(db, username, email):
    user = db.query(User).filter(User.username == username).first()
    user.email = email
    db.commit()

def update_user_password(db, username, password):
    user = db.query(User).filter(User.username == username).first()
    user.password = password
    user.passwordChangeDate = datetime.datetime.now(tz=datetime.timezone.utc)
    db.commit()

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

def delete_node(db, node_name):
    node = db.query(Node).filter(Node.name == node_name).first()
    if node is None:
        return False
    for env in node.environments:
        db.delete(env)
    db.delete(node)
    db.commit()
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