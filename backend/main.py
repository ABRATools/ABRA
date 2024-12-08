#!/usr/bin/env python

import datetime
from pydantic import BaseModel
from typing import Optional, List

import random
import os
import sys
import redis
import bcrypt
import logging
import database as db
from config import settings
from contextlib import asynccontextmanager
from jose import JWTError, jwt
from passlib.context import CryptContext

# webserver stuff
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse, RedirectResponse, JSONResponse

from classes import User, FilteredUser, Group, Environment, Node, Service, Task, Notification

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
# remove all handlers
logger.propagate = False
logger.handlers.clear()

file_handler = logging.FileHandler('abra.log')
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

session = obtain_session()

def get_session():
  return session

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
app.mount('/static', StaticFiles(directory='static'), name='static')

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY.get_secret_value())

# Define secret key and algorithm
SECRET_KEY = settings.SECRET_KEY.get_secret_value()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 3 * 60 * 60 # 3 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthToken(BaseModel):
  username: Optional[str] = None
  user_type: Optional[str] = None
  groups: Optional[List[str]] = None

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.datetime.now(datetime.UTC) + expires_delta
  else:
    # default expiration time is 15 minutes
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

async def get_cookie_or_token(request: Request):
  # access_token = request.cookies.get("access_token")
  auth_header = request.headers.get("Authorization")
  if auth_header:
    return auth_header
  else:
    logger.info("No auth header found")
    return None

async def authenticate_cookie(auth_header: str = Depends(get_cookie_or_token)):
  try:
    if auth_header:
      access_token = auth_header.split("Bearer ")[1]
      try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        token_data = AuthToken(
          username=payload.get("username"),
          user_type=payload.get("user_type"),
          groups=payload.get("groups")
        )
        return token_data
      except JWTError as e:
        logger.info("JWTError: " + str(e))
        return False
    logger.info("No token found")
    return False
  except AttributeError:
    return False

@app.post("/validate-token")
async def validate_token(request: Request, token: AuthToken = Depends(authenticate_cookie)):
  if token:
    request.session['user'] = token.username
    token_json = {
      "username": token.username,
      "user_type": token.user_type,
      "groups": token.groups
    }
    return JSONResponse(content={"token": token_json}, status_code=200)
  return JSONResponse(content={"token": None}, status_code=401)

# endpoints to render index page with react-router
@app.get("/")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/users")
async def display_users(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/audit")
async def display_audit(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/settings")
async def display_settings(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/login")
async def get_login(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/dashboard")
async def get_dashboard(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/nodes")
async def get_nodes(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.post("/login")
async def process_login(request: Request, session = Depends(get_session)) -> JSONResponse:
  data = await request.json()
  username = data['username'].lower().strip()
  password = data['password'].strip()
  logger.info(f"User {username} is attempting to log in")

  user_pw_hash = db.get_hash_for_user(session, username)

  if user_pw_hash is None:
    logger.error(f"User {username} does not exist")
    return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)

  if bcrypt.checkpw(password.encode('utf-8'), user_pw_hash):
    logger.info(f"User {username} has successfully logged in")
    request.session['user'] = username
    user_data = db.get_user_info(session, username)
    access_token_expires = datetime.timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
    access_token = create_access_token(data=user_data, expires_delta=access_token_expires)
    logger.info(f"User {username} has successfully logged in")
    response = JSONResponse(content={"token": access_token}, status_code=200)
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True, max_age=ACCESS_TOKEN_EXPIRE_SECONDS)
    return response
  logger.warning(f"User {username} has failed to log in")
  return JSONResponse(content={"token": None}, status_code=401)

@app.post("/get_user_settings")
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

@app.post("/get_users")
async def get_users(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    users = db.get_users(session)
    # filter out passwords and totp secret
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
    return JSONResponse(content={'users': users_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.post("/audit_log")
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

@app.post("/change_password")
async def get_change_password(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    logger.info(f"Password change request for user {username}")
    data = await request.json()
    username = data['username']
    new_password = data['password']
    confirm_password = data['confirmPassword']

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

@app.post("/change_email")
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

@app.get('/get_groups')
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

# test data for now
@app.post('/node-data')
async def get_node_data(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    env1_1 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=10, memory=2.1, disk=30, max_cpus=4, max_memory=8, max_disk=100, node_id=1)
    env2_1 = Environment(env_id = 2, name='Env 2', ip='10.0.2.2', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=22, memory=14, disk=88, max_cpus=4, max_memory=16, max_disk=100, node_id=1)
    node1 = Node(node_id=1,name='Node 1',ip='10.0.11',os='Linux',status='Active',uptime='1d 2h 3m',cpu_percent=20,memory=2,disk=200,max_cpus=4,max_memory=8,max_disk=1000,environments=[])
    node1.environments.append(env1_1)
    node1.environments.append(env2_1)

    env1_2 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=10, memory=2.1, disk=30, max_cpus=4, max_memory=8, max_disk=100, node_id=2)
    node2 = Node(node_id=2,name='Node 2',ip='10.0.12',os='Linux',status='Active',uptime='1d 2h 3m',cpu_percent=30,memory=7.7,disk=30,max_cpus=4,max_memory=8,max_disk=100,environments=[])
    node2.environments.append(env1_2)

    env1_3 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=10, memory=2.1, disk=30, max_cpus=4, max_memory=8, max_disk=100, node_id=3)
    env2_3 = Environment(env_id = 2, name='Env 2', ip='10.0.2.2', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=22, memory=14, disk=88, max_cpus=4, max_memory=16, max_disk=100, node_id=3)
    env3_3 = Environment(env_id = 3, name='Env 3', ip='10.0.2.3', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=40, memory=4.8, disk=30.4, max_cpus=4, max_memory=8, max_disk=100, node_id=3)
    node3 = Node(node_id=3,name='Node 3',ip='10.0.13',os='Linux',status='Active',uptime='1d 2h 3m',cpu_percent=70,memory=20,disk=300,max_cpus=4,max_memory=32,max_disk=2000,environments=[])
    node3.environments.append(env1_3)
    node3.environments.append(env2_3)
    node3.environments.append(env3_3)
    sample_data1 = [node1, node2, node3]

    env1_1 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='2d 2h 3m', cpu_percent=60, memory=8.1, disk=20, max_cpus=4, max_memory=8, max_disk=100, node_id=1)
    env2_1 = Environment(env_id = 2, name='Env 2', ip='10.0.2.2', os='Linux', status='Active', uptime='2d 2h 3m', cpu_percent=42, memory=4, disk=8, max_cpus=4, max_memory=16, max_disk=100, node_id=1)
    node1 = Node(node_id=1,name='Node 1',ip='10.0.11',os='Linux',status='Active',uptime='2d 2h 3m',cpu_percent=40,memory=7,disk=300,max_cpus=4,max_memory=8,max_disk=1000,environments=[])
    node1.environments.append(env1_1)
    node1.environments.append(env2_1)

    env1_2 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=10, memory=2.1, disk=30, max_cpus=4, max_memory=8, max_disk=100, node_id=2)
    node2 = Node(node_id=2,name='Node 2',ip='10.0.12',os='Linux',status='Active',uptime='0d 2h 3m',cpu_percent=60,memory=2.7,disk=10,max_cpus=4,max_memory=8,max_disk=100,environments=[])
    node2.environments.append(env1_2)

    env1_3 = Environment(env_id = 1, name='Env 1', ip='10.0.2.1', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=10, memory=2.1, disk=30, max_cpus=4, max_memory=8, max_disk=100, node_id=3)
    env2_3 = Environment(env_id = 2, name='Env 2', ip='10.0.2.2', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=22, memory=14, disk=88, max_cpus=4, max_memory=16, max_disk=100, node_id=3)
    env3_3 = Environment(env_id = 3, name='Env 3', ip='10.0.2.3', os='Linux', status='Active', uptime='1d 2h 3m', cpu_percent=40, memory=4.8, disk=30.4, max_cpus=4, max_memory=8, max_disk=100, node_id=3)
    node3 = Node(node_id=3,name='Node 3',ip='10.0.13',os='Linux',status='Active',uptime='1d 2h 3m',cpu_percent=70,memory=20,disk=300,max_cpus=4,max_memory=32,max_disk=2000,environments=[])
    node3.environments.append(env1_3)
    node3.environments.append(env2_3)
    node3.environments.append(env3_3)
    sample_data2 = [node1, node2, node3]

    random_choice = random.choice([sample_data1, sample_data2])
    # nodes = db.get_all_nodes(session)
    nodes_json = [node.model_dump() for node in random_choice]
    return JSONResponse(content={'nodes': nodes_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.get("/logout")
async def process_logout(request: Request, token: AuthToken = Depends(authenticate_cookie)):
  if token:
    return JSONResponse(content={'message': 'Successfully logged out', 'redirect': '/login'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

if __name__ == "__main__":
  print("hello bingus!")
  uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
