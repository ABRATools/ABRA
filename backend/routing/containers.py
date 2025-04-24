import sys, os
sys.path.insert(0, os.path.abspath('..'))

import json
import ipaddress
import database as db
from classes import *
from containers import *
import requests
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import asyncio

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

MAX_MEM_GIB = 16

def is_jsonable(x):
  try:
    out = json.dumps(x)
    return out
  except:
    return False

router = APIRouter(prefix="/api/containers")

def start_container(env_id, target_ip):
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

def delete_container(env_id, env_name, target_ip):
  logger.info(f"Deleting container with env_id: {env_id}")
  try:
    response = requests.post(
      f"http://{target_ip}:8888/containers/remove",
      timeout=10,
      json={"env_id": env_id, "env_name": env_name},
      headers={"Content-Type": "application/json"}
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

def generate_tree_structure(path):
  path = os.path.abspath(path) 
  def helper(current_path):
    items = []

    entries = sorted(os.listdir(current_path))
    dirs = [e for e in entries if os.path.isdir(os.path.join(current_path, e))]
    files = [e for e in entries if os.path.isfile(os.path.join(current_path, e))]

    for d in dirs:
      items.append([d, helper(os.path.join(current_path, d))])

    for f in files:
      items.append(os.path.join(current_path, f))

    return items

  tree = helper(path)
  return tree

@router.post("/node-log-tree")
async def generate_log_tree(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    node_id = data.get("node_id", None)
    env_name = data.get("env_name", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"message": "No env_id provided"})
    if node_id is None:
      logger.error("No node_id provided")
      return JSONResponse(status_code=400, content={"message": "No node_id provided"})
    if env_name is None:
      logger.error("No env_name provided")
      return JSONResponse(status_code=400, content={"message": "No env_name provided"})
    logger.info("Generating log tree: ")
    try:
      output = generate_tree_structure(f"/var/log/{node_id}/{env_name}")
    except Exception as e:
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Log tree generated", "tree": output})
  logger.warning("Unauthorized request to generate log tree")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.post('/node-log-file')
async def get_container_logs(request: Request, token: AuthToken = Depends(authenticate_cookie)) -> StreamingResponse:
  """get logs from a container"""
  if token:
    data = await request.json()
    container_name = data.get("env_name", None)
    node_name = data.get("node_id", None)
    log_path = data.get("log_path", None) 
    if not container_name:
      return JSONResponse(content={'message': 'No container_name provided'}, status_code=400)
    if not node_name:
      return JSONResponse(content={'message': 'No node_name provided'}, status_code=400)
    if not log_path:
      return JSONResponse(content={'message': 'No log_path provided'}, status_code=400)
    
    container_log_dir = os.path.join("/var/log/", node_name, container_name)
    # check if log_path is a valid path under container_log_dir
    if not os.path.exists(container_log_dir):
      return JSONResponse(content={'message': 'Log directory does not exist'}, status_code=400)
    # check if log_path is within container_log_dir
    if not os.path.commonpath([container_log_dir, log_path]) == container_log_dir:
      return JSONResponse(content={'message': 'Invalid log path'}, status_code=400)
    if not os.path.exists(log_path):
      return JSONResponse(content={'message': 'Log file does not exist'}, status_code=400)
    # check if log_path is a file
    if not os.path.isfile(log_path):
      return JSONResponse(content={'message': 'Log path is not a file'}, status_code=400)
    # check if log_path is readable
    if not os.access(log_path, os.R_OK):
      return JSONResponse(content={'message': 'Log file is not readable'}, status_code=400)
    logger.info(f"Getting logs from container {container_name} on node {node_name} at path {log_path}")
    async def generate_log():
      with open(log_path, "r") as log_file:
        lines = log_file.readlines()
        yield ''.join(lines)
        while True:
          line = log_file.readline()
          if line:
            yield f"{line}"
          else: # check for new log every 5s
            await asyncio.sleep(5)
    return StreamingResponse(generate_log(), media_type="text/event-stream")
  logger.warning("Unauthorized request to get container logs")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

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
    logger.info(f"Starting container with env_id: {env_id}")
    try:
      output = start_container(env_id, target_ip)
    except Exception as e:
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
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
    logger.info(f"Stopping container with env_id: {env_id}")
    try:
      output = stop_container(env_id, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container stopped"})
  logger.warning("Unauthorized request to stop container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})  

@router.post("/delete")
async def delete_container_on_node(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    data = await request.json()
    env_id = data.get("env_id", None)
    env_name = data.get("env_name", None)
    target_ip = data.get("target_ip", None)
    if env_id is None:
      logger.error("No env_id provided")
      return JSONResponse(status_code=400, content={"message": "No env_id provided"})
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if env_name is None:
      logger.error("No env_name provided")
      return JSONResponse(status_code=400, content={"message": "No env_name provided"})
    try:
      output = delete_container(env_id, env_name, target_ip)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
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
    if not (cpus is None) and isinstance(cpus, int):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if not (mem_limit is None) and isinstance(mem_limit, int):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    if isinstance(cpus, int) and (cpus < 1 or cpus > 16):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if isinstance(mem_limit, int) and (mem_limit < 1 or mem_limit > (1073741824 * MAX_MEM_GIB)):
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
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container created"})
  logger.warning("Unauthorized request to create container")
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
    if not (cpus is None) and isinstance(cpus, int):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if not (mem_limit is None) and isinstance(mem_limit, int):
      logger.error("Invalid mem_limit provided")
      return JSONResponse(status_code=400, content={"message": "Invalid mem_limit provided"})
    if isinstance(cpus, int) and (cpus < 1 or cpus > 16):
      logger.error("Invalid cpus provided")
      return JSONResponse(status_code=400, content={"message": "Invalid cpus provided"})
    if isinstance(mem_limit, int) and (mem_limit < 1 or mem_limit > (1073741824 * MAX_MEM_GIB)):
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
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container created"})
  logger.warning("Unauthorized request to create container")
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
      if is_jsonable(e):
        logger.error(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content={"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container images listed", "images": output})
  logger.warning("Unauthorized request to list node images")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})