#cringe path hack
import sys, os
sys.path.insert(0, os.path.abspath('..'))

import pathlib
import database as db
from database.models import System
from classes import *
from containers import *
from pydantic import BaseModel

import subprocess

import bcrypt
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import time

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/api")

@router.post("/get_user_settings")
async def get_current_user_details(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    user = db.get_user_by_username(session, request.session['user'])
    user_json = FilteredUser(
      user_id=user.id,
      username=user.username,
      email=user.email,
      groups=[group.name for group in user.groups],
      passwordChangeDate=user.passwordChangeDate.strftime('%Y-%m-%d %H:%M:%S'),
      is_active=user.is_active,
      is_totp_enabled=user.is_totp_enabled,
      is_totp_confirmed=user.is_totp_confirmed,
    )
    return JSONResponse(content={'user': user_json.model_dump()}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/get_users")
async def get_users(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)):
    if token:
        users = db.get_users(session)
        users_json = []
        for user in users:
            filtered_user = FilteredUser(
                user_id=user.id,
                username=user.username,
                email=user.email,
                groups=[group.name for group in user.groups],
                passwordChangeDate=user.passwordChangeDate.strftime('%Y-%m-%d %H:%M:%S'),
                is_active=user.is_active,
                is_totp_enabled=user.is_totp_enabled,
                is_totp_confirmed=user.is_totp_confirmed,
            )
            users_json.append(filtered_user.model_dump())
        return JSONResponse(content={'users': users_json})
    return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/audit_log")
# this is a simple example of how to read a log file, it rly sux and should be replaced with a proper logging solution lol
async def get_audit_log(request: Request, token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    # audit_log stored in ./abra.log
    audit_log = []
    with open('abra.log', 'r') as f:
      for line in f:
        audit_log.append(line.strip())
    audit_str = '\n'.join(audit_log)
    return JSONResponse(content={'audit_log': audit_str}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.get('/stream_audit_log')
async def stream_audit_log(request: Request, token: AuthToken = Depends(authenticate_cookie)) -> StreamingResponse:
  """
  use streamingresponse to generate logs from the abra.log
  provides an actual endpoint stream that react can use
  """
  def generate_log():
    log_dir = "./abra.log"
    with open(log_dir, "r") as log_file:
      lines = log_file.readlines()
      yield ''.join(lines)
      while True:
        line = log_file.readline()
        if line:
          yield f"{line}"
        else: # check for new log every 5s
          time.sleep(5)
  
  return StreamingResponse(generate_log(), media_type="text/event-stream")

@router.post("/change_password")
async def get_change_password(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    username = data['username']
    new_password = data['password']
    confirm_password = data['confirmPassword']
    
    if new_password == '':
      logger.error(f"Password cannot be empty")
      return JSONResponse(content={'message': 'Password cannot be empty'}, status_code=400)

    logger.info(f"Password change request for user {username}")

    if new_password != confirm_password:
      logger.error(f"Passwords do not match")
      return JSONResponse(content={'message': 'Passwords do not match'}, status_code=400)

    if new_password == '':
      logger.error(f"Password cannot be empty")
      return JSONResponse(content={'message': 'Password cannot be empty'}, status_code=400)

    if len(new_password) < 8:
      logger.error(f"Password must be at least 8 characters long")
      return JSONResponse(content={'message': 'Password must be at least 8 characters long'}, status_code=400)

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    db.update_user_password(session, username, hashed_password)
    logger.info(f"Password changed successfully for user {username}")
    return JSONResponse(content={'message': 'Password changed successfully'}, status_code=200)

  logger.warning(f"Unauthorized request to change password for user... redirecting to login")
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/change_email")
async def post_change_email(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    # expect json: { 'username': 'username', 'email': 'new_email' }
    data = await request.json()
    username = data['username']
    logger.info(f"Email change request for user {username}")
    email = data['email']
    db.update_user_email(session, username, email)
    logger.info(f"Email changed successfully for user {username}")
    return JSONResponse(content={'message': 'Password changed successfully'}, status_code=200)
  logger.warning(f"Unauthorized request to change email for user... redirecting to login")
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post('/get_groups')
async def get_groups(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    # db_groups = db.get_all_groups(session)
    # for group in db_groups:
      # print(group.name)
      # print(group.permissions)
      # for users in group.users:
      #   print(users.username)
    groups = [
        Group(
            name=group.name, 
            users=[user.username for user in group.users],
            permissions=[permission.name for permission in group.permissions]
        ) 
        for group in db.get_all_groups(session)
    ]
    groups_json = [group.model_dump() for group in groups]
    print(groups_json)
    return JSONResponse(content={'groups': groups_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/add_connection_string")
async def post_connection_string(input: InputConnString, session = Depends(get_session), token = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    print(input)
    try:
      # parsed_ip = input.connection_string.split('//')[1].split(':')[0]
      # base_path = "/var/log"
      # new_node_path = pathlib.Path(base_path, input.name)
      # logger.info(f"Creating new connection string for {input.name} at {new_node_path}")
      # os.makedirs(new_node_path, exist_ok=True, mode=0o644)
      # with open('/etc/exports', 'a') as f:
      #   f.write(f"{new_node_path} {parsed_ip}/32(rw,async,no_root_squash,crossmnt,no_subtree_check)\n")
      # subprocess.run(['exportfs', '-a'], check=True)
      db.create_connection_string(session, input.name, input.connection_string, input.description)
    except Exception as e:
      logger.error(f"Error creating connection string: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
    return JSONResponse(content={'message': 'Connection string added successfully', 'connection_string': input.connection_string}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/add_user")
async def post_connection_string(input: InputUser, session = Depends(get_session), token = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    logger.info(f"User creation request for new user {input.username}")

    if input.password == '':
      logger.error(f"Password cannot be empty")
      return JSONResponse(content={'message': 'Password cannot be empty'}, status_code=400)

    if input.username == '':
      logger.error(f"Username cannot be empty")
      return JSONResponse(content={'message': 'Username cannot be empty'}, status_code=400)

    if len(input.password) < 8:
      logger.error(f"Password must be at least 8 characters long")
      return JSONResponse(content={'message': 'Password must be at least 8 characters long'}, status_code=400)
    
    if db.get_user_by_username(session, input.username):
      logger.error(f"User with username {input.username} already exists")
      return JSONResponse(content={'message': 'User with that username already exists'}, status_code=400)
    
    if input.email and db.get_user_by_email(session, input.email):
      logger.error(f"User with email {input.email} already exists")
      return JSONResponse(content={'message': 'User with that email already exists'}, status_code=400)
    
    if input.groups:
      groups = db.get_groups_by_names(session, input.groups)
      if len(groups) != len(input.groups):
        logger.error(f"Invalid group name")
        return JSONResponse(content={'message': 'Invalid group name'}, status_code=400)

    hashed_password = bcrypt.hashpw(input.password.encode('utf-8'), bcrypt.gensalt())
    db.create_user(session, input.username, hashed_password, input.email, input.groups)
    logger.info(f"Successfully created new user: {input.username}")
    return JSONResponse(content={'message': 'User created successfully'}, status_code=200)

  logger.warning(f"Unauthorized request to create user... redirecting to login")
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/delete_user")
async def post_delete_user(request: Request, session = Depends(get_session), token = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    logger.info(f"User deletion request")
    data = await request.json()
    username = data['username']
    db.delete_user(session, username)
    logger.info(f"User {username} deleted successfully")
    return JSONResponse(content={'message': 'User deleted successfully'}, status_code=200)
  logger.warning(f"Unauthorized request to delete user... redirecting to login")
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.get("/get_node_locations")
async def get_node_locations(request: Request, session = Depends(get_session)) -> JSONResponse:
  node_locations = db.get_connection_strings(session)
  node_locations_json = [ConnectionStrings(name=location.name, connection_string=location.connection_string, type=location.type, ip=location.ip).model_dump_json() for location in node_locations]
  return JSONResponse(content={'node_locations': node_locations_json}, status_code=200)

# systems endpoints
@router.post('/systems')
async def get_systems(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  """get all systems"""
  if token:
    try:
      # 1. Get all custom systems from the database
      db_systems = db.get_all_systems(session)
      systems_json = []
      
      # Process database systems
      for system in db_systems:
        env_list = []
        for env in system.environments:
          try:
            # Build base environment data
            env_data = {
              "env_id": str(env.id),
              "name": env.name,
              "ip": env.ip,
              "os": env.os,
              "status": env.status,
            }
            
            # Add container ID if available for matching with WebSocket data
            if hasattr(env, 'container_id') and env.container_id:
              env_data["container_id"] = env.container_id
              
            # Find the parent node for this environment
            node = None
            if env.node_id:
              node = session.query(db.models.Node).filter(db.models.Node.id == env.node_id).first()
              
            if node:
              env_data.update({
                "node_id": str(node.id),
                "node_name": node.name
              })
            
            # Log each environment for debugging
            logger.info(f"Adding environment to system {system.system_id} in listing: {env_data}")
            env_list.append(env_data)
          except Exception as e:
            logger.error(f"Error processing environment {env.id} for system {system.system_id}: {str(e)}")
            # Continue with other environments
        
        system_data = {
          "system_id": system.system_id,
          "name": system.name,
          "description": system.description,
          "is_custom": system.is_custom,
          "created_at": system.created_at.isoformat(),
          "updated_at": system.updated_at.isoformat(),
          "environments": env_list,
          "source": "database"  # Indicate this came from the database
        }
        
        # Log the system data
        logger.info(f"Adding system to listing: {system.system_id} with {len(env_list)} environments")
        systems_json.append(system_data)
      
      # 2. Get nodes for auto-generated systems
      nodes = db.get_nodes(session)
      
      # Create "all-nodes" system
      all_nodes_env_list = []
      os_systems = {}  # For auto-generated OS-based systems
      
      # Process nodes to create auto-generated systems
      for node in nodes:
        # Track which OS this node belongs to for OS-based systems
        os_key = f"{node.os}-{node.status}"
        if os_key not in os_systems:
          os_systems[os_key] = {
            "system_id": os_key,
            "name": f"{node.os} {node.status}",
            "description": f"Auto-generated system for {node.os} {node.status}",
            "is_custom": False,
            "environments": [],
            "source": "auto-generated"
          }
        
        # Process environments for this node
        for env in node.environments:
          env_data = {
            "env_id": str(env.id),
            "name": env.name,
            "ip": env.ip,
            "os": env.os,
            "status": env.status,
            "node_id": str(node.id),
            "node_name": node.name
          }
          
          # Add to all-nodes system
          all_nodes_env_list.append(env_data)
          
          # Add to OS-specific system
          os_systems[os_key]["environments"].append(env_data)
      
      # Add "all-nodes" system
      systems_json.append({
        "system_id": "all-nodes",
        "name": "All Nodes",
        "description": "All available nodes and environments",
        "is_custom": False,
        "environments": all_nodes_env_list,
        "source": "auto-generated"
      })
      
      # Add OS-based systems
      for os_system in os_systems.values():
        systems_json.append(os_system)
      
      return JSONResponse(content={'systems': systems_json}, status_code=200)
    except Exception as e:
      logger.error(f"Error getting systems: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

# Updated system creation endpoint to handle container IDs
@router.post('/system')
async def create_system(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
    """create a new system with proper container ID handling"""
    if token:
        try:
            data = await request.json()
            # Extract basic system fields
            system_id = data["system_id"]
            name = data["name"]
            description = data.get("description", "")
            is_custom = data.get("is_custom", True)
            
            # Create the base system first
            system = db.create_system(
                session, 
                system_id, 
                name, 
                description, 
                is_custom
            )
            
            # Handle both new format (environments array) and old format (environment_ids)
            if "environments" in data and isinstance(data["environments"], list):
                # New format - contains full environment objects with container_ids
                environments = data["environments"]
                logger.info(f"Creating system with {len(environments)} environment objects")
                
                for env_data in environments:
                    # Log the environment we're trying to add
                    logger.info(f"Processing environment: {env_data}")
                    
                    # Try to find the environment by container_id first (most reliable)
                    if "container_id" in env_data and env_data["container_id"]:
                        container_id = env_data["container_id"]
                        logger.info(f"Looking for environment by container_id: {container_id}")
                        
                        # Look up existing env by container_id
                        env = db.find_or_create_environment_by_container_id(
                            session,
                            container_id,
                            name=env_data.get("name", "Unknown"),
                            node_id=env_data.get("node_id")
                        )
                        
                        if env:
                            logger.info(f"Adding environment with container_id {container_id} to system")
                            # Add environment to system
                            system.environments.append(env)
                            continue
                    
                    # Fallback for environments without container_id
                    try:
                        # Create minimal environment record
                        new_env = db.models.Environment(
                            name=env_data.get("name", "Unknown"),
                            ip=env_data.get("ip", ""),
                            os=env_data.get("os", "undefined"),
                            status=env_data.get("status", "undefined"),
                            uptime="0",  # Default values for required fields
                            cpu_percent=0,
                            memory=0,
                            disk=0,
                            max_cpus=0,
                            max_memory=0,
                            max_disk=0,
                            container_id=env_data.get("container_id", None)
                        )
                        
                        # If we have node info, try to associate with a node
                        if "node_id" in env_data and env_data["node_id"]:
                            node = session.query(db.models.Node).filter(
                                db.models.Node.name == env_data["node_id"]
                            ).first()
                            
                            if node:
                                new_env.node_id = node.id
                        
                        # Add to database and get ID
                        session.add(new_env)
                        session.flush()  # Flush to get the ID
                        
                        logger.info(f"Created new environment: {new_env.id}")
                        
                        # Add to system
                        system.environments.append(new_env)
                    except Exception as e:
                        logger.error(f"Error creating environment: {str(e)}")
                        # Continue with other environments
            
            # Commit all changes
            session.commit()
            
            return JSONResponse(content={
                'message': 'System created successfully',
                'system_id': system.system_id
            }, status_code=200)
        except Exception as e:
            logger.error(f"Error creating system: {str(e)}")
            return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
    return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post('/system/{system_id}')
async def get_system(system_id: str, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  """get a specific system"""
  if token:
    try:
      system = db.get_system_by_id(session, system_id)
      if not system:
        return JSONResponse(content={'message': 'System not found'}, status_code=404)
      
      # Get environments in this system with detailed information
      env_list = []
      for env in system.environments:
        try:
          # Base environment data
          env_data = {
            "env_id": str(env.id),
            "name": env.name,
            "ip": env.ip,
            "os": env.os,
            "status": env.status,
          }
          
          # Add container ID if available for matching with WebSocket data
          if hasattr(env, 'container_id') and env.container_id:
            env_data["container_id"] = env.container_id
            
          # Find the parent node
          node = None
          if env.node_id:
            node = session.query(db.models.Node).filter(db.models.Node.id == env.node_id).first()
            
          if node:
            env_data.update({
              "node_id": str(node.id),
              "node_name": node.name
            })
          
          # Log the environment we're adding
          logger.info(f"Adding environment to system response: {env_data}")
          env_list.append(env_data)
        except Exception as e:
          logger.error(f"Error processing environment {env.id} for system {system.system_id}: {str(e)}")
          # Continue with other environments
      
      # Create the complete system response
      system_data = {
        "system_id": system.system_id,
        "name": system.name,
        "description": system.description,
        "is_custom": system.is_custom,
        "created_at": system.created_at.isoformat(),
        "updated_at": system.updated_at.isoformat(),
        "environments": env_list,
        "source": "database"
      }
      
      # Log the system data being returned
      logger.info(f"Returning system data: {system_data}")
      
      return JSONResponse(content={
        'system': system_data
      }, status_code=200)
    except Exception as e:
      logger.error(f"Error getting system {system_id}: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.delete('/system/{system_id}')
async def delete_system_endpoint(system_id: str, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  """delete a system"""
  if token:
    try:
      result = db.delete_system(session, system_id)
      if result:
        return JSONResponse(content={'message': 'System deleted successfully'}, status_code=200)
      else:
        return JSONResponse(content={'message': 'System not found'}, status_code=404)
    except Exception as e:
      logger.error(f"Error deleting system {system_id}: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post('/system/{system_id}/add-environment/{env_id}')
async def add_environment(system_id: str, env_id: str, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  """add an environment to a system"""
  if token:
    try:
      result = db.add_environment_to_system(session, system_id, int(env_id))
      if result:
        return JSONResponse(content={'message': 'Environment added to system successfully'}, status_code=200)
      else:
        return JSONResponse(content={'message': 'System or environment not found'}, status_code=404)
    except Exception as e:
      logger.error(f"Error adding environment {env_id} to system {system_id}: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post('/system/{system_id}/remove-environment/{env_id}')
async def remove_environment(system_id: str, env_id: str, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  """remove an environment from a system"""
  if token:
    try:
      result = db.remove_environment_from_system(session, system_id, int(env_id))
      if result:
        return JSONResponse(content={'message': 'Environment removed from system successfully'}, status_code=200)
      else:
        return JSONResponse(content={'message': 'System or environment not found'}, status_code=404)
    except Exception as e:
      logger.error(f"Error removing environment {env_id} from system {system_id}: {str(e)}")
      return JSONResponse(content={'message': f'Error: {str(e)}'}, status_code=500)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)