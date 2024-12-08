import netifaces
from podman import PodmanClient
import psutil
import os, os.path
import json
from classes import Node, Environment
import asyncio
import logging
import nanoid
import datetime

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

  def __del__(self):
    if self.server:
      self.server.close()

  async def run(self):
    try:
      self.server = await asyncio.start_server(self.handle_client, '0.0.0.0', 5555)
      self.addrs = ', '.join(str(sock.getsockname()) for sock in self.server.sockets)
      async with self.server:
        try:
          await self.server.serve_forever()
        except KeyboardInterrupt:
          print("Stopping server...")
          if self.server:
            self.server.close()
            await self.server.wait_closed()
    except KeyboardInterrupt:
      print("Stopping server...")
      if self.server:
        self.server.close()
        await self.server.wait_closed()

  async def handle_client(self, reader, writer):
    data = await reader.read(100)
    message = data.decode()
    addr = writer.get_extra_info('peername')
    logger.info(f"Received {message} from {addr}")
    response = ""
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
          response = "Container name is required"
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

  def get_ip_address(self):
    ips = {}
    for iface in netifaces.interfaces():
      addresses = netifaces.ifaddresses(iface)
      if netifaces.AF_INET in addresses:
        ips[iface] = addresses[netifaces.AF_INET][0]['addr']
    return ips

  def days_since(self, timestamp_str):
    try:
      if '.' in timestamp_str:
        date_part, fraction_part = timestamp_str.split('.')
        fraction_part, tz_part = fraction_part.split('-', 1)
        trimmed_fraction = fraction_part[:6]
        timestamp_str = f"{date_part}.{trimmed_fraction}-{tz_part}"
      dt = int(datetime.datetime.fromisoformat(timestamp_str).timestamp())
      now = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
      days, remainder = divmod(now - dt, 24 * 3600)
      hours, remainder = divmod(remainder, 3600)
      minutes, _ = divmod(remainder, 60)
      response = f"{days} days, {hours} hours, {minutes} minutes"
      return response
    except Exception as e:
      print(e)
      return 0

  def get_node(self):
    with self.podmanClient as client:
      node = Node(
        node_id = nanoid.generate('1234567890', 6),
        name = os.uname().nodename,
        ip = self.get_ip_address()['ens18'] if 'ens18' in self.get_ip_address() else self.get_ip_address()['eth0'],
        os = os.uname().sysname,
        status = "running",
        uptime = os.popen("uptime -p").read().strip(),
        cpu_percent = int(psutil.cpu_percent()),
        memory = psutil.virtual_memory().percent,
        disk = psutil.disk_usage('/').percent,
        max_cpus = psutil.cpu_count(),
        max_memory = f"{psutil.virtual_memory().total / (1024 * 1024 * 1024):.2f}",
        max_disk = f"{psutil.disk_usage('/').total / (1024 * 1024 * 1024):.2f}",
        environments=[]
      )
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        output = container.exec_run("nproc")[1]
        decoded_output = ''.join(filter(str.isdigit, output.decode(errors="ignore")))
        total_cpus = int(decoded_output)

        output = container.exec_run("awk '/MemTotal/ {print $2}' /proc/meminfo")[1]
        decoded_output = ''.join(filter(str.isdigit, output.decode(errors="ignore")))
        total_mem_info_int = int(decoded_output)
        total_mem_info = f"{(total_mem_info_int / (1024 * 1024)):.2f}"

        output = container.exec_run("awk '/MemAvailable/ {print $2}' /proc/meminfo")[1]
        decoded_output = ''.join(filter(str.isdigit, output.decode(errors="ignore")))
        used_mem_info_int = int(decoded_output)
        used_mem_info = f"{(used_mem_info_int / (1024 * 1024)):.2f}"

        awk_command = '\'BEGIN { OFS = " " } NR==2 { print $2, $3 }\''
        output = container.exec_run(["/bin/bash", "-c", f"df -k / | awk {awk_command}"])[1]
        decoded_output = ''.join(filter(str.isprintable, output.decode(errors="ignore")))
        total_kb, used_kb = map(int, decoded_output.split())
        maximum_disk = f"{total_kb / (1024 * 1024):.2f}"
        used_disk = f"{used_kb / (1024 * 1024):.2f}"
        
        env = Environment(
          env_id = nanoid.generate('1234567890', 6),
          name = c.attrs['Name'],
          ip = c.attrs['NetworkSettings']['IPAddress'],
          os = c.attrs['Config']['Image'],
          status = c.status,
          uptime = self.days_since(c.attrs['State']['StartedAt']),
          cpu_percent = c.attrs['HostConfig']['CpuPercent'],
          memory = used_mem_info,
          disk = used_disk,
          max_cpus = total_cpus,
          max_memory = total_mem_info,
          max_disk = maximum_disk,
          node_id = node.node_id
        )
        node.environments.append(env)
      return node.model_dump_json()

  def get_status(self):
    logger.info(f"Getting status")
    with self.podmanClient as client:
      containers = []
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        containers.append(f"{c.id}:{c.name}:{c.status}")
        print(c.stats(stream=False))
      return json.dumps(containers)

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