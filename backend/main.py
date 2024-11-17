#!/usr/bin/env python

import datetime
from pydantic import BaseModel
from typing import Optional, List

import os
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

@app.get("/users")
async def display_users(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/audit")
async def display_audit(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/settings")
async def display_settings(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/authenticate_current_user")
async def authenticate_current_user(request: Request):
  if 'user' in request.session:
    return JSONResponse(content={'message': 'Authorized', 'user': request.session}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.get("/get_user_settings")
async def get_current_user_details(request: Request):
  if 'user' in request.session:
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

@app.get("/login")
async def get_login(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.post("/login")
async def process_login(request: Request, session = Depends(get_session)):
  data = await request.json()
  username = data['username'].lower().strip()
  password = data['password'].strip()
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
    print("Successfully logged in")
    return JSONResponse(content={'message': 'Successfully logged in', 'user': request.session, 'redirect': '/dashboard'}, status_code=200)
  logger.info(f"User {username} has failed to log in")
  return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)

@app.get("/logout")
async def process_logout(request: Request):
  if 'user' in request.session:
    request.session.pop('user')
    if 'is_admin' in request.session:
      request.session.pop('is_admin')
    return JSONResponse(content={'message': 'Successfully logged out', 'redirect': '/login'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@app.get("/dashboard")
async def get_dashboard(request: Request, session = Depends(get_session)):
  if 'user' in request.session:
    return templates.TemplateResponse('index.html', {'request': request})
  else:
    return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/get_users")
async def get_users(request: Request, session = Depends(get_session)) -> JSONResponse:
  if 'user' in request.session:
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

@app.get("/get_audit_log")
# this is a simple example of how to read a log file, it rly sux and should be replaced with a proper logging solution lol
async def get_audit_log(request: Request, session = Depends(get_session)) -> JSONResponse:
  if 'user' in request.session:
    # audit_log stored in ./abra.log
    audit_log = []
    with open('abra.log', 'r') as f:
      for line in f:
        audit_log.append(line.strip())
    audit_str = '\n'.join(audit_log)
    return JSONResponse(content={'audit_log': audit_str}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

if __name__ == "__main__":
  uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
