#cringe path hack
import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
from database.models import System
from classes import *
from containers import *
from classes import Notifier, DeleteNotifierRequest, ToggleNotifierRequest

import bcrypt
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import time

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/api/discord")

@router.get("/current-config")
async def get_current_discord_config(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    notifiers = db.get_current_notifiers(session)
    notifiers_json = []
    for notifier in notifiers:
      filtered_notifier = Notifier(
        webhook_name=notifier.webhook_name,
        webhook_url=notifier.webhook_url,
        enabled=notifier.enabled
        )
      notifiers_json.append(filtered_notifier.model_dump())
    return JSONResponse(content={'notifiers': notifiers_json}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/new-config")
async def new_notifier_config(newNotifierRequest: Notifier, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)):
  if token:
    try:
      # create a new notifier
      db.create_notifier(
        session,
        newNotifierRequest.webhook_name,
        newNotifierRequest.webhook_url,
        newNotifierRequest.enabled
      )
    except Exception as e:
      logger.error(f"Error creating new notifier: {e}")
      return JSONResponse(content={'message': 'Error creating new notifier'}, status_code=500)
    return JSONResponse(content={'message': 'Notifier created successfully'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.delete("/delete-config")
async def delete_notifier_config(deleteNotifierRequest: DeleteNotifierRequest, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)):
  if token:
    try:
      # delete the notifier
      db.delete_notifier(
        session,
        deleteNotifierRequest.webhook_name
      )
    except Exception as e:
      logger.error(f"Error deleting notifier: {e}")
      return JSONResponse(content={'message': 'Error deleting notifier'}, status_code=500)
    return JSONResponse(content={'message': 'Notifier deleted successfully'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)

@router.post("/toggle-config")
async def toggle_notifier_config(toggleNotifierRequest: ToggleNotifierRequest, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)):
  if token:
    try:
      # delete the notifier
      db.set_notifier_enabled(
        session,
        toggleNotifierRequest.webhook_name,
        toggleNotifierRequest.enabled
      )
    except Exception as e:
      logger.error(f"Error deleting notifier: {e}")
      return JSONResponse(content={'message': 'Error deleting notifier'}, status_code=500)
    return JSONResponse(content={'message': 'Notifier deleted successfully'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)