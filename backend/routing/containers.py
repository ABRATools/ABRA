import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
from classes import *
from containers import *
import requests
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/api/containers")

def start_container(env_id, target_ip):
  logger.info(f"Stopping container with env_id: {env_id}")
  try:
    response = requests.post(
      f"http://{target_ip}:8888/containers/start/{env_id}",
      timeout=10
    )
    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    return None
  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    return None

def stop_container(env_id, target_ip):
  logger.info(f"Stopping container with env_id: {env_id}")
  try:
    response = requests.post(
      f"http://{target_ip}:8888/containers/stop/{env_id}",
      timeout=10
    )
    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    return None
  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    return None

@router.post("/start")
async def get_current_user_details(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    target_ip = data.get("target_ip", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"error": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"error": "No target_ip provided"})
    logger.info("Starting container: ")
    logger.info(f"Starting container with env_id: {env_id}")
    try:
      output = start_container(env_id, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"error": "An error occurred"})
    except Exception as e:
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"error": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container started"})
  logger.warning("Unauthorized request to start container")
  return JSONResponse(status_code=401, content={"error": "Unauthorized"})

@router.post("/stop")
async def get_current_user_details(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    target_ip = data.get("target_ip", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"error": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"error": "No target_ip provided"})
    logger.info("Stopping container: ")
    logger.info(f"Stopping container with env_id: {env_id}")
    try:
      output = stop_container(env_id, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"error": "An error occurred"})
    except Exception as e:
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"error": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container stopped"})
  logger.warning("Unauthorized request to stop container")
  return JSONResponse(status_code=401, content={"error": "Unauthorized"})  
