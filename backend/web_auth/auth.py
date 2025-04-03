import sys, os
sys.path.insert(0, os.path.abspath('..'))

from config import settings

import database as db

from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt

import datetime
from pydantic import BaseModel
from typing import Optional, List

from fastapi import APIRouter

router = APIRouter(prefix="/auth")

from fastapi import Request, Depends
from fastapi.responses import JSONResponse

from web_utils import get_session
from logger import logger
from .ldap_helper import LDAPConnection

SECRET_KEY = settings.SECRET_KEY.get_secret_value()
ALGORITHM = "HS256"

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthToken(BaseModel):
  username: Optional[str] = None
  user_type: Optional[str] = None
  groups: Optional[List[str]] = None

ldap_conn = None

try:
  ldap_conn = LDAPConnection()
  logger.info("LDAP connection initialized")
except Exception as e:
  logger.error(f"Failed to initialize LDAP connection: {str(e)}")

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
  else:
    # default expiration time is 15 minutes
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

async def get_cookie_or_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if auth_header:
        return auth_header
    access_token = request.cookies.get("abra-auth")
    if access_token:
        return access_token
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
        return False
    logger.info("No token found")
    return False
  except AttributeError:
    return False

@router.post("/validate-token")
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

@router.post("/login")
async def process_login(request: Request, session = Depends(get_session)) -> JSONResponse:
  data = await request.json()
  username = data['username'].lower().strip()
  password = data['password'].strip()

  # print(settings.LDAP_ENABLED)

  # try ldap auth first if enabled
  if settings.LDAP_ENABLED:
    logger.info(f"User {username} is attempting to log in via LDAP")
    if not ldap_conn:
      logger.critical("LDAP connection not initialized")
      sys.exit(1)
    if ldap_conn.user_authenticate(username, password):
      user_data = ldap_conn.query_user(username)
      if user_data is None:
        logger.error(f"User {username} not found in LDAP")
        return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)
      access_token_expires = datetime.timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS)
      access_token = create_access_token(data=user_data, expires_delta=access_token_expires)
      logger.info(f"User {username} has successfully logged in via LDAP")
      response = JSONResponse(content={"token": access_token}, status_code=200)
      response.set_cookie(key="abra-auth", value=f"Bearer {access_token}", httponly=True, max_age=settings.ACCESS_TOKEN_EXPIRE_SECONDS)
      return response

  logger.info(f"User {username} is attempting to log in via database authentication")
  user_pw_hash = db.get_hash_for_user(session, username)

  if user_pw_hash is None:
    logger.error(f"User {username} does not exist")
    return JSONResponse(content={'message': 'Invalid credentials'}, status_code=401)

  if bcrypt.checkpw(password.encode('utf-8'), user_pw_hash):
    logger.info(f"User {username} has successfully logged in")
    request.session['user'] = username
    user_data = db.get_user_info(session, username)
    access_token_expires = datetime.timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS)
    access_token = create_access_token(data=user_data, expires_delta=access_token_expires)
    logger.info(f"User {username} has successfully logged in")
    response = JSONResponse(content={"token": access_token}, status_code=200)
    response.set_cookie(key="abra-auth", value=f"Bearer {access_token}", httponly=True, max_age=settings.ACCESS_TOKEN_EXPIRE_SECONDS)
    return response
  logger.warning(f"User {username} has failed to log in")
  return JSONResponse(content={"token": None}, status_code=401)

@router.post("/logout")
async def process_logout(request: Request, token: AuthToken = Depends(authenticate_cookie)):
  if token:
    request.session.pop('user', None)
    response = JSONResponse(content={'message': 'Successfully logged out', 'redirect': '/login'}, status_code=200)
    response.delete_cookie("abra-auth")
    response.delete_cookie("session")
    response.delete_cookie("access_token")
    return response
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)