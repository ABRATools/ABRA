import sys, os
sys.path.insert(0, os.path.abspath('..'))

import json
import ipaddress
import database as db
from classes import *
from containers import *
import requests
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

MAX_MEM_GIB = 16

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
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else {"message": "An error occurred"})

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
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else {"message": "An error occurred"})

def delete_container(env_id, target_ip):
  logger.info(f"Deleting container with env_id: {env_id}")
  try:
    response = requests.post(
      f"http://{target_ip}:8888/containers/remove/{env_id}",
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
  
def list_node_images(target_ip):
  try:
    response = requests.get(
      f"http://{target_ip}:8888/images/list",
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

def create_container(target_ip, image, name, ip, cpus, mem_limit):
  logger.info(f"Creating container with env_id: {name}, image: {image}, ip: {ip}, cpus: {cpus}, mem_limit: {mem_limit}")
  try:
    print(target_ip, image, name, ip)
    response = requests.post(
      f"http://{target_ip}:8888/containers/create",
      json={"image": image, "name": name, "ip": ip if ip is not None else "", "cpus": cpus, "mem_limit": mem_limit},
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

def create_ebpf_container(target_ip, image, name, ip, cpus, mem_limit):
  logger.info(f"Creating container with env_id: {name}, image: {image}, ip: {ip}, cpus: {cpus}, mem_limit: {mem_limit}")
  try:
    print(target_ip, image, name, ip)
    response = requests.post(
      f"http://{target_ip}:8888/containers/create-ebpf",
      json={"image": image, "name": name, "ip": ip if ip is not None else "", "cpus": cpus, "mem_limit": mem_limit},
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

@router.post("/start")
async def start_container_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
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
    logger.info("Starting container: ")
    logger.info(f"Starting container with env_id: {env_id}")
    try:
      output = start_container(env_id, target_ip)
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container started"})
  logger.warning("Unauthorized request to start container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/stop")
async def stop_container_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
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
    logger.info("Stopping container: ")
    logger.info(f"Stopping container with env_id: {env_id}")
    try:
      output = stop_container(env_id, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container stopped"})
  logger.warning("Unauthorized request to stop container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})  

@router.post("/delete")
async def delete_container_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
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
    logger.info("Deleting container: ")
    logger.info(f"Deleting container with env_id: {env_id}")
    try:
      output = delete_container(env_id, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container deleted"})
  logger.warning("Unauthorized request to delete container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/create")
async def create_environment_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    target_ip = data.get("target_ip", None)
    image = data.get("image", None)
    name = data.get("name", None)
    ip = data.get("ip", None)
    cpus = data.get("cpus", None)
    mem_limit = data.get("mem_limit", None)
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if image is None:
      logger.error("No image provided")
      return JSONResponse(status_code=400, content={"message": "No image provided"})
    if name is None:
      logger.error("No name provided")
      return JSONResponse(status_code=400, content={"message": "No name provided"})
    if not isinstance(cpus, int):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if not isinstance(mem_limit, int):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    if cpus < 1 or cpus > 16:
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if mem_limit < 1 or mem_limit > (1073741824 * MAX_MEM_GIB):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    # check if ip is valid
    if ip is not None and ip != "":
      print("ip: ", ip)
      try:
        test_ip = ipaddress.ip_address(ip)
      except ValueError:
        logger.error("Invalid ip address")
        return JSONResponse(status_code=400, content={"message": "Invalid ip address"})
    logger.info("Creating container: ")
    output = None
    try:
      output = create_container(target_ip, image, name, ip, cpus, mem_limit)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container deleted"})
  logger.warning("Unauthorized request to delete container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/create-ebpf")
async def create_ebpf_environment_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    target_ip = data.get("target_ip", None)
    image = data.get("image", None)
    name = data.get("name", None)
    ip = data.get("ip", None)
    ebpf_modules = data.get("ebpfModules", None)
    cpus = data.get("cpus", None)
    mem_limit = data.get("mem_limit", None)
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if image is None:
      logger.error("No image provided")
      return JSONResponse(status_code=400, content={"message": "No image provided"})
    if name is None:
      logger.error("No name provided")
      return JSONResponse(status_code=400, content={"message": "No name provided"})
    if not isinstance(cpus, int):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if not isinstance(mem_limit, int):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    if cpus < 1 or cpus > 16:
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if mem_limit < 1 or mem_limit > (1073741824 * MAX_MEM_GIB):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    # check if ip is valid
    if ip is not None and ip != "":
      print("ip: ", ip)
      try:
        test_ip = ipaddress.ip_address(ip)
      except ValueError:
        logger.error("Invalid ip address")
        return JSONResponse(status_code=400, content={"message": "Invalid ip address"})
    logger.info("Creating container: ")
    output = None
    try:
      output = create_ebpf_container(target_ip, image, name, ip, cpus, mem_limit)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container deleted"})
  logger.warning("Unauthorized request to delete container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post("/list_images")
async def get_node_images(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    target_ip = data.get("target_ip", None)
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    logger.info(f"Listing container images on node: {target_ip}")
    try:
      output = list_node_images(target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container images listed", "images": output})
  logger.warning("Unauthorized request to list node images")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})