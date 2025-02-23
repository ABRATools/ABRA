#!/usr/bin/env python

from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List

import database as db
from config import settings
from contextlib import asynccontextmanager

# webserver stuff
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.routing import APIRouter
from frontend_routing import frontend, api
from starlette.responses import HTMLResponse, RedirectResponse, JSONResponse

from classes import User, FilteredUser, Group, Environment, Node, Service, Task, Notification, ConnectionStrings
from containers import *

from web_utils import get_session, logger
from web_auth import AuthToken, authenticate_cookie, auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  try:
    # redis_client.ping()
    print("FastAPI is starting...")
  except Exception as e:
    print(f"Redis is not connected {e}")
  yield
  print("Cleaning up")

app = FastAPI(lifespan=lifespan)

templates = Jinja2Templates(directory='templates')
# mount static files
app.mount("/static", StaticFiles(
    directory="static",
    html=True,
    check_dir=True
), name="static")

app.mount("/assets", StaticFiles(
    directory="static/assets",
    html=True,
    check_dir=True
), name="assets")

# include routers
app.include_router(frontend.router)
app.include_router(api.router)
app.include_router(auth_router)

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY.get_secret_value())

@app.get("/test-static")
async def test_static():
    static_dir = Path("static")
    assets_dir = Path("static/assets")
    
    files = {
        "static_files": [f.name for f in static_dir.iterdir() if f.is_file()],
        "asset_files": [f.name for f in assets_dir.iterdir() if f.is_file()]
    }
    return files

@app.post("/api/get_user_settings")
async def get_current_user_details(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    user = db.get_user(session, request.session['user'])
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

@app.post("/api/get_users")
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

@app.post("/api/audit_log")
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

@app.post("/api/change_password")
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

@app.post("/api/change_email")
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

@app.post('/api/get_groups')
async def get_groups(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    db_groups = db.get_all_groups(session)
    for group in db_groups:
      print(group.name)
      print(group.permissions)
      for users in group.users:
        print(users.username)
    groups = [Group(name=group.name, permissions=group.permissions, users=[user.username for user in group.users]) for group in db.get_all_groups(session)]
    groups_json = [group.model_dump() for group in groups]
    print(groups_json)
    return JSONResponse(content={'groups': groups_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

class InputConnString(BaseModel):
  name: str
  source: str
  ip: Optional[str] = None

@app.post("/api/add_connection_string")
async def post_connection_string(input: InputConnString, session = Depends(get_session), token = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    conn_string = None
    if input.source == 'remote':
      if input.ip is None:
        return JSONResponse(content={'message': 'Invalid request'}, status_code=400)
      conn_string = f"http+ssh://root@{input.ip}/run/podman/podman.sock"
    elif input.source == 'local':
      conn_string = "http+unix:///run/podman/podman.sock"
    else:
      return JSONResponse(content={'message': 'Invalid request'}, status_code=400)
    db.create_connection_string(session, input.name, conn_string, input.source, input.ip)
    return JSONResponse(content={'message': 'Connection string added successfully', 'connection_string': conn_string}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.get("/api/get_node_locations")
async def get_node_locations(request: Request, session = Depends(get_session)) -> JSONResponse:
  node_locations = db.get_connection_strings(session)
  node_locations_json = [ConnectionStrings(name=location.name, connection_string=location.connection_string, type=location.type, ip=location.ip).model_dump_json() for location in node_locations]
  return JSONResponse(content={'node_locations': node_locations_json}, status_code=200)


# container file logic
@app.get('/api/get_containers')
async def get_containers_endpoint(token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
    logger.info("Fetching containers")
    print("hello")
    try:
        if token:
            containers = fetch_containers()
            logger.info(f"Successfully retrieved containers: {containers}")
            return JSONResponse(content={
                'images': containers,
                'success': True
            }, status_code=200)  
        else:
            logger.warning("Unauthorized access attempt to get_containers")
            return JSONResponse(content={
                'message': 'Unauthorized', 
                'redirect': '/login'
            }, status_code=401)
    except Exception as e:
        logger.error(f"Error fetching containers: {str(e)}", exc_info=True)
        return JSONResponse(content={
            'message': 'Internal server error',
            'success': False
        }, status_code=500)

@app.post('/api/write_containers')
async def write_container(request: Request, token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  try:
    if token:
      data = await request.json()
      filename = data['filename']
      content = data['content']
      result = edit_container(filename, content)
      return {
        'success': result
      }
    else:
      return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)
  except Exception as e:
    print(f"Exception occurred: {e}")
    return {}

@app.post('/api/delete_container')
async def delete_container(request: Request, token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  try:
    if token:
      data = await request.json()
      filename = data['filename']
      result = delete_container(filename)
      return {
        'success': result 
      }
    else:
      return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)
  except Exception as e:
    print(f"Exception occurred: {e}")
    return {}

# test data for now
@app.post('/node-data')
async def get_node_data(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    nodes = db.get_nodes(session)
    nodes_json = [Node(node_id=node.id, name=node.name, ip=node.ip, os=node.os, status=node.status, uptime=node.uptime, cpu_percent=node.cpu_percent, memory=node.memory, disk=node.disk, max_cpus=node.max_cpus, max_memory=node.max_memory, max_disk=node.max_disk, environments=[Environment(env_id=env.id, name=env.name, ip=env.ip, os=env.os, status=env.status, uptime=env.uptime, cpu_percent=env.cpu_percent, memory=env.memory, disk=env.disk, max_cpus=env.max_cpus, max_memory=env.max_memory, max_disk=env.max_disk, node_id=env.node_id) for env in node.environments]).model_dump_json() for node in nodes]
    return JSONResponse(content={'nodes': nodes_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.post("/post_node")
async def post_node(request: Request, session = Depends(get_session)) -> JSONResponse:
  # if token:
  data = await request.json()
  node = Node.model_validate_json(data)
  if node:
    db.create_node(session, node)
    return JSONResponse(content={'message': 'Nodes added successfully'}, status_code=200)
  return JSONResponse(content={'message': 'Unproccessable Data'}, status_code=422)
  # return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

# catch all route for client-side routing (put at end to cover up any other ones)
@app.get("/{full_path:path}", response_class=HTMLResponse)
async def catch_all(request: Request, full_path: str):
  return HTMLResponse(content="""<h1>404 Not Found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</h1>""", status_code=404)
    # return templates.TemplateResponse('index.html', {'request': request})

if __name__ == "__main__":
  print("hello bingus!")
  uvicorn.run('main:app', host='127.0.0.1', port=8989, reload=True)
