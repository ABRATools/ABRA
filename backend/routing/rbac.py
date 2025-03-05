#cringe path hack
import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
from classes import *
from containers import *

import bcrypt
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import time

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/api/rbac")