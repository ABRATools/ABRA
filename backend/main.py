#!/usr/bin/env python

import datetime
from pydantic import BaseModel
from typing import Optional, List

import sys
import redis
import bcrypt
import logging
import database as db
from config import settings
from contextlib import asynccontextmanager

# webserver stuff
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse, RedirectResponse, JSONResponse

from classes import User, Group, Environment, Node, Service, Task, Notification

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

file_handler = logging.FileHandler('abra.log')
file_handler.setLevel(logging.DEBUG)
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

# redis_client = redis.StrictRedis(
#   host=settings.REDIS_HOST,
#   port=settings.REDIS_PORT,
#   db=0,
#   decode_responses=True,
# )

# def get_redis_client():
#   return redis_client

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

# endpoints to render index page with react-router
@app.get("/")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/login")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.post("/login")
async def login(request: Request, session = Depends(get_session)):
  form = await request.form()
  username = form['username'].replace(' ', '').strip()
  password = form['password'].replace(' ', '').strip()
  logger.info(f"User {username} is attempting to log in")
  user_pw_hash = db.get_hash_for_user(session, username)
  if user_pw_hash is None:
    logger.info(f"User {username} does not exist")
    return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)
  if bcrypt.checkpw(password.encode('utf-8'), user_pw_hash):
    logger.info(f"User {username} has successfully logged in")
    request.session['user'] = username
    user_groups = db.get_user_groups(session, username)
    for group in user_groups:
      logger.info(f"User {username} is in group {group}")
      if group == 'admin':
        request.session['is_admin'] = True
    return JSONResponse(content={'message': 'Successfully logged in', 'redirect': '/dashboard'}, status_code=200)
  logger.info(f"User {username} has failed to log in")
  return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)

@app.get("/dashboard")
async def root(request: Request, session = Depends(get_session)):
  if 'user' in request.session:
    return templates.TemplateResponse('index.html', {'request': request})
  else:
    return JSONResponse(content={'message': 'Unauthorized'}, status_code=401)
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/get_resources")
async def get_resources(request: Request) -> Resource:
  cpu_percent = psutil.cpu_percent(interval=1)
  mem = psutil.virtual_memory()
  disk = psutil.disk_usage('/')
  resource = Resource(
    date=datetime.datetime.now().strftime("%Y-%m-%d"),
    cpu_percent=cpu_percent,
    mem_percent=mem.percent,
    total_mem=mem.total / (1024 ** 3),
    avail_mem=mem.available / (1024 ** 3),
    disk_percent=disk.percent,
    total_disk=disk.total / (1024 ** 3),
    used_disk=disk.used / (1024 ** 3),
    free_disk=disk.free / (1024 ** 3)
  )
  return JSONResponse(content=resource.model_dump_json(), status_code=200)

@app.get("/get_nodes")
async def get_nodes(request: Request, redis_client=Depends(get_redis_client)):
  nodes = []
  node1_env1 = Environment(
    id=1,
    machine_name="env1",
    description="env1 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.50",
    port=22,
    status="running"
  )
  node1_env2 = Environment(
    id=2,
    machine_name="env2",
    description="env2 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.51",
    port=22,
    status="running"
  )
  node2_env1 = Environment(
    id=1,
    machine_name="env1",
    description="env1 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.50",
    port=22,
    status="running"
  )
  node2_env2 = Environment(
    id=2,
    machine_name="env2",
    description="env2 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.51",
    port=22,
    status="running"
  )
  node1 = Node(
    id=1,
    name="node1",
    ip="192.168.1.1",
    port=22,
    status="running",
    environments=[node1_env1, node1_env2]
    )
  node2 = Node(
    id=2,
    name="node2",
    ip="192.168.2.1",
    port=22,
    status="running",
    environments=[node2_env1, node2_env2]
    )
  nodes.append(node1.model_dump_json())
  nodes.append(node2.model_dump_json())

  redis_client.set('nodes', str(nodes))
  print(redis_client.get('nodes'))
  return JSONResponse(content=nodes, status_code=200)

if __name__ == "__main__":
  uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
