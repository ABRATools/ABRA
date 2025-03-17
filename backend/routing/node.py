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
import subprocess
import socket

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/api/node")

def is_pingable(ip):
    try:
        output = subprocess.check_output(['ping', '-c', '1', ip], stderr=subprocess.STDOUT, universal_newlines=True)
        return True
    except subprocess.CalledProcessError:
        return False

def is_port_accessible(ip, port, timeout=3):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect((ip, port))
        s.close()
        return True
    except socket.error:
        return False

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
    raise Exception(response.text if response is not None else None)

def create_node(target_ip, name, url):
  try:
    ip_addr = None
    port = None
    try:
      ip_addr = url.split("//")[1].split(":")[0]
    except IndexError:
        logger.error("Invalid URL")
        raise Exception({"message": "Invalid URL"})
    try:
      port = url.split(":")[2]
    except IndexError:
        logger.error("Invalid URL")
        raise Exception({"message": "Invalid URL"})
    try:
      if port < 1 or port > 65535:
        raise Exception({"message": "Invalid port"})
    except ValueError:
        logger.error("Invalid port")
        raise Exception({"message": "Invalid port"})
    try:
        ipaddress.ip_address(ip_addr)
    except ValueError:
      logger.error("Invalid IP address")
      raise Exception({"message": "Invalid IP address"})
    try:
        if is_pingable(ip_addr):
            logger.info("Node IP is pingable")
            if is_port_accessible(ip_addr, port):
                logger.info("Node's API is accessable")
            else:
                logger.error(f"Node's API is not accessable, port {port} is not open")
                raise Exception({"message": "Node's API is not accessable, port is not open"})
        else:
            logger.error("Node IP address is not pingable")
            raise Exception({"message": "Node is not pingable"})
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise Exception({"message": "An error occurred"})
    # response = requests.post(
    #   f"http://{target_ip}:8888/containers/create",
    #   json={"image": image, "name": name, "ip": ip if ip is not None else ""},
    #   timeout=10
    # )

    #  TODO: Add the node to the database

    response.raise_for_status()
    return response.text
  except requests.exceptions.Timeout:
    logger.error("Request timed out after 10 seconds")
    raise Exception({"message": "Request timed out after 10 seconds"})

  except requests.exceptions.RequestException as e:
    logger.error(f"An error occurred: {e}")
    logger.error(f"API response: {response.text}")
    raise Exception(response.text if response is not None else None)

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
    url = data.get("url", None)
    name = data.get("name", None)
    if target_ip is None:
      logger.error("No target_ip provided")
      return JSONResponse(status_code=400, content={"message": "No target_ip provided"})
    if url is None:
      logger.error("No node url provided")
      return JSONResponse(status_code=400, content={"message": "No node URL provided"})
    if name is None:
      logger.error("No node name provided")
      return JSONResponse(status_code=400, content={"message": "No node name provided"})
    logger.info("Creating node: ")
    output = None
    try:
      output = create_node(target_ip, name, url)
      if output is None:
        return JSONResponse(status_code=500, content={"message": "An error occurred"})
    except Exception as e:
      logger.error(f"An error occurred: {e}")
      return JSONResponse(status_code=500, content=json.loads(str(e)) if e is not None else {"message": "An error occurred"})
    return JSONResponse(status_code=200, content={"message": "Container deleted"})
  logger.warning("Unauthorized request to delete container")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})