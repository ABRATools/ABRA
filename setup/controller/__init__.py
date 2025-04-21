import psutil
import socket
import os, os.path
from podman import PodmanClient
import asyncio

MESSAGE_SIZE=255

class Controller:
  def __init__(self):
    self.uri=["ssh://root@",":22/run/podman/podman.sock?secure=True"]
    self.server=None
    asyncio.run(self.run())

  def __del__(self):
    if self.server:
    	self.server.close()

  async def run(self):
    try:
      self.server=await asyncio.start_unix_server(self.handle_client,path="/run/abra/abra.sock")
      async with self.server:
        try:
          await self.server.serve_forever()
        except KeyboardInterrupt:
          print ("Closing server")
          self.server.close()
          await self.server.wait_close()
    except KeyboardInterrupt:
      print ("Closing server")
      self.server.close()
      await self.server.wait_close()

  async def handle_client(self,reader,writer):
    query=(await reader.read(MESSAGE_SIZE)).decode()
    try:
      tokens = query.strip().split()
      if tokens[0] == "status":
        if len(tokens)>2:
          response=self.get_status(self,self.resolve_host(tokens[2]),name=tokens[2])
        response = self.get_status(self,tokens[1])
      elif tokens[0] == "health":
        response = self.get_health()
      elif tokens[0] == "new":
        response = self.create_container(self,tokens[1])
        if len(tokens)<2:
          response = "Job ID is required for container name"
      elif tokens[0] == "end":
        if len(tokens) < 2:
          response = "Container name is required"
        else:
          response = self.stop_container(self,tokens[1])
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
      #logger.info(f"Sent: {response}")
      writer.close()
      await writer.wait_closed()

  def get_status(self,host,name=None):
    #logger.info(f"Getting status")
    uri=self.uri[0]+host+self.uri[1]
    with PodmanClient(base_url=uri) as client:
      if name:
        c=client.containers.get(container.name)
        c.reload()
        return json.dumps(f"{c.id}:{c.name}:{c.status}")
      containers = []
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        containers.append(f"{c.id}:{c.name}:{c.status}")
        print(c.stats(stream=False))
      return json.dumps(containers)

  def get_health(self):
    #logger.info(f"Getting health")
    return f"{psutil.cpu_percent()}:{psutil.virtual_memory()}:{psutil.disk_usage('/')}"

  def create_container(self,name):
    #logger.info(f"Creating container")
    with self.podmanClient as client:
      image = client.images.list()[1]
      c = client.containers.create("almalinux:latest", tty=True, detach=True)

  def stop_container(self, container_name):
    #logger.info(f"Stopping container {container_name}")
    with self.podmanClient as client:
      c = client.containers.get(container_name)
      c.stop()
      c.reload()
      return f"{c.status}"
  def resolve_host(self,jobid):
    return "nvbaisec0"

if __name__=="__main__":
  c=Controller()
