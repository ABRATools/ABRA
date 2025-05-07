

from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from web_auth import authenticate_cookie, AuthToken
from logger import logger
from web_utils import get_session

import requests
import json

router = APIRouter(prefix="/ebpf")

# /ebpf/ebpf-info/:container_id
# /ebpf/ebpf-start-service
# /ebpf/ebpf-stop-service

def request_ebpf_module_names(target_ip, name):
  try:
    print(target_ip, name)
    response = requests.post(
    f"http://{target_ip}:8888/ebpf/ebpf-info/{name}",
    headers={"Content-Type": "application/json"},
    timeout=10
    )
    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else {"message": "An error occurred"})

def start_ebpf_service(target_ip, name, service):
  try:
    print(target_ip, name, service)
    response = requests.post(
      f"http://{target_ip}:8888/ebpf/ebpf-start-service",
      json={"container_id": name, "ebpf_service": service},
      timeout=10
    )
    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else {"message": "An error occurred"})

def stop_ebpf_service(target_ip, name, service):
  try:
    print(target_ip, name, service)
    response = requests.post(
      f"http://{target_ip}:8888/ebpf/ebpf-stop-service",
      json={"container_id": name, "ebpf_service": service},
      timeout=10
    )
    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else {"message": "An error occurred"})

@router.post("/start-ebpf-service")
async def start_service_on_container(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    target_ip = data.get("target_ip", None)
    service = data.get("service", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"message": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if service is None:
        logger.error("No service provided")
        return JSONResponse(status_code=400, content={"message": "No service provided"})
    logger.info(f"Starting ebpf service on container with env_id: {env_id}")
    try:
        output = start_ebpf_service(target_ip, env_id, service)
        if output is None:
            return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "eBPF service started"})
  logger.warning("Unauthorized request to start container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/stop-ebpf-service")
async def stop_service_on_container(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    target_ip = data.get("target_ip", None)
    service = data.get("service", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"message": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if service is None:
        logger.error("No service provided")
        return JSONResponse(status_code=400, content={"message": "No service provided"})
    logger.info(f"Starting ebpf service on container with env_id: {env_id}")
    try:
        output = stop_ebpf_service(target_ip, env_id, service)
        if output is None:
            return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "eBPF service stopped"})
  logger.warning("Unauthorized request to start container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/ebpf-info")
async def get_ebpf_info(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    target_ip = data.get("target_ip", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"message": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    logger.info(f"Getting ebpf info on container with env_id: {env_id}")
    try:
      output = request_ebpf_module_names(target_ip, env_id)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "eBPF info retrieved"})
  logger.warning("Unauthorized request to start container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.get("/get_ebpf_module_names")
async def get_ebpf_module_names(request: Request, token: AuthToken = Depends(authenticate_cookie)):
  if token:
    names = [
      "ebpf_usercommands"
      "ebpf_ipgeolocation"
    ]
    return JSONResponse(
      content={
        "module_names": names
      },
      status_code=200
    )
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)