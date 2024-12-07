from podman import PodmanClient
import psutil
import os, os.path
import json
from classes import Node, Environment
import asyncio
import logging
import nanoid

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
# remove all handlers
logger.propagate = False
logger.handlers.clear()

file_name = f"node-{nanoid.generate()}.log"

file_handler = logging.FileHandler(file_name)
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

class NodeAPI:
  def __init__(self, node_uri):
    self.uri = node_uri
    self.podmanClient = PodmanClient(base_url=self.uri)
    self.server = None
    self.addrs = None

  async def run(self):
    self.server = await asyncio.start_server(self.handle_client, '0.0.0.0', 5555)
    self.addrs = ', '.join(str(sock.getsockname()) for sock in self.server.sockets)
    async with self.server:
      await self.server.serve_forever()

  async def handle_client(self, reader, writer):
    data = await reader.read(100)
    message = data.decode()
    addr = writer.get_extra_info('peername')
    logger.info(f"Received {message} from {addr}")
    try:
      tokens = message.strip().split()
      if tokens[0] == "status":
        response = self.get_status()
      elif tokens[0] == "health":
        response = self.get_health()
      elif tokens[0] == "new":
        response = self.create_container()
      elif tokens[0] == "end":
        if len(tokens) < 2:
          response = "Comtainer name is required"
        else:
          response = self.stop_container(tokens[1])
      elif tokens[0] == "node":
        response = self.get_node()
      else:
        response = "Invalid command"

    except Exception as e:
      writer.write(f"Error: {e}".encode())

    else:
      writer.write(response.encode())

    finally:
      await writer.drain()
      logger.info(f"Sent: {response}")
      writer.close()
      await writer.wait_closed()

  def get_node(self):
    with self.podmanClient as client:
      node = Node()
      node.ip = self.uri
      node.os = os.uname().sysname
      node.status = "up"
      node.uptime = os.popen("uptime -p").read().strip()
      node.cpu_percent = psutil.cpu_percent()
      node.memory = psutil.virtual_memory().percent
      node.disk = psutil.disk_usage('/').percent
      node.max_cpus = psutil.cpu_count()
      node.max_memory = psutil.virtual_memory().total
      node.max_disk = psutil.disk_usage('/').total
      node.environments = []
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        env = Environment()
        env.env_id = c.id
        env.name = c.name
        env.ip = c.attrs['NetworkSettings']['IPAddress']
        env.os = c.attrs['Config']['Image']
        env.status = c.status
        env.uptime = c.attrs['State']['StartedAt']
        env.cpu_percent = c.attrs['HostConfig']['CpuPercent']
        env.memory = c.attrs['HostConfig']['Memory']
        env.disk = c.attrs['HostConfig']['Disk']
        env.max_cpus = c.attrs['HostConfig']['CpuQuota']
        env.max_memory = c.attrs['HostConfig']['Memory']
        env.max_disk = c.attrs['HostConfig']['Disk']
        node.environments.append(env)
      return node.model_dump_json()

  def get_status(self):
    logger.info(f"Getting status")
    with self.podmanClient as client:
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        return f"{c.id}:{c.name}:{c.status}"

  def get_health(self):
    logger.info(f"Getting health")
    return f"{psutil.cpu_percent()}:{psutil.virtual_memory()}:{psutil.disk_usage('/')}"

  def create_container(self):
    logger.info(f"Creating container")
    with self.podmanClient as client:
      image = client.images.list()[1]
      c = client.containers.create("almalinux:latest", tty=True, detach=True)
      c.start()
      c.reload()
      return f"{c.status}"

  def stop_container(self, container_name):
    logger.info(f"Stopping container {container_name}")
    with self.podmanClient as client:
      c = client.containers.get(container_name)
      c.stop()
      c.reload()
      return f"{c.status}"