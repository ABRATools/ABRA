import psutil
import socket
import os, os.path
from podman import PodmanClient
import asyncio
import json
import subprocess

ADMIN_USER="root"
MESSAGE_SIZE=255
IDENTITY_FILE="/root/.ssh/api"
ACTIVE_JOBS_FILE="/etc/abra/active_jobs"

class Controller:
  def __init__(self):
    self.uri=["ssh://root@",":22/run/podman/podman.sock?secure=True"]
    self.server=None
    self.next_job=1
    self.active_jobs=self.find_active_jobs()
    asyncio.run(self.run())


  def __del__(self):
    if self.server:
    	self.server.close()

  def find_active_jobs(self)->dict:
    """Jobs are stored in the following pattern
      Hostname:JobID:User
    """
    active_jobs={}
    try:
      with open(ACTIVE_JOBS_FILE) as jobs:
        for line in jobs:
          parts=line.split(":")
          try:
            active_jobs[parts[0]].append((parts[1],parts[2].strip()))
          except KeyError:
            active_jobs[parts[0]]=[(parts[1],parts[2].strip())]
          if int(parts[1]) >= self.next_job:
            self.next_job=int(parts[1])+1
    except Exception as e:
      print (f"Error Opening /etc/abra/active_jobs: {e}")
    return active_jobs

  async def run(self):
    try:
      print("starting server")
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
    """API INFO
    status:
      status - returns all containers stats
      status node nodename - returns all containers from one node
      status container jobid - returns status of single container
    #build - prebuild a common image on a single container
      #rootless -- all users launching containers need ldap uid/gid map space
      #--cpu-quota
      #--memory
    new:
      new nodename - creates new container using defaults
      #--cpus #not supported on linux with podman api
      #--gpus #not supported with podman api
      #--memory
      #--user --volume -> podman create --secuirty-opt label=deisable --volume $HOME:/home/user ...
      #seccomp=false
    start:
      start jobid - starts container
    stop:
      stop jobid - stops container
    delete:
      rm jobid - deletes container
    #exec - execute command in container
    inspect:
      inspect list - list current log options
      #inspect list jobid - list current log options for jobid
      #inspect node nodename -
      #inspect job jobid - 
      inspect job jobid log_option - returns the log file for specific contianer
      #inspect log_option - returns the log file for all containers
    #config - edit default configs
      #config logs
    """
    print("handling")
    query=(await reader.read(MESSAGE_SIZE)).decode()
#    try:
    tokens = query.strip().split()
    if tokens[0] == "status":
      if len(tokens)==1:
        #return all containers
        response=''
        for x in self.active_jobs.keys():
          response=response+self.get_status(x)
      elif len(tokens)==3:
        if tokens[1] == "node":
          response=self.get_status(tokens[2])    #return all containers for one node
        elif tokens[1] == "container":
          response=self.get_status(self.resolve_host(tokens[2]),job=tokens[2])    #return stats of one container
      else:
        response = '''status:
  status - returns all containers stats
  status node nodename - returns all containers from one node
  status container job - returns status of single container
  additional options:
    full
'''
#    elif tokens[0] == "health":
#      response = self.get_health()
    elif tokens[0] == "new":
      if len(tokens)==2:
        response = self.create_container(tokens[1])
      else:
        response="""new:
  new nodename - creates new container using defaults
"""
    elif tokens[0] =="start":
      if len(tokens)==2:
        self.start_container(tokens[1])
      else:
        response="""start:
  start jobid - starts container
"""
    elif tokens[0] == "stop":
      if len(tokens)== 2:
        self.stop_container(tokens[1])
      else:
        response="""stop:
  stop jobid - stops container
"""
    elif tokens[0] == "rm":
      if len(tokens)== 2:
        self.delete_container(tokens[1])
      else:
        response="""delete:
  rm jobid - deletes container
"""
    elif tokens[0] == "inspect":
      if tokens[1] == "list":
        response="""Log Options:
  comands - ebpf per container commands
  syscall - syscalls that were blocked by seccomp
  #systemd - systemd logs via podman logs
"""
      if len(tokens)>=3:
        response=get_logs(tokens[1],tokens[2].split(','))

      else:
        response="""inspect:
  #inspect list - list current log options
  #inspect jobid - 
  #inspect jobid log_option - returns the log file for specific contianer
  #inspect log_option - returns the log file for all containers
"""
    else:
      response = "Invalid command"
    writer.write(response.encode())
    writer.close()

#    except Exception as e:
#      writer.write(f"Error: {e}".encode())

#    else:
#      writer.write(response.encode())

#    finally:
#      await writer.drain()
      #logger.info(f"Sent: {response}")
#      writer.close()
#      await writer.wait_closed()

  def get_status(self,host:str,job:str=None,full:bool=False)->str:
    #logger.info(f"Getting status")
    uri=self.uri[0]+host+self.uri[1]
    with PodmanClient(base_url=uri,identity=IDENTITY_FILE) as client:
      if job:
        c=client.containers.get(job)
        c.reload()
        if full:
          return c.stats(stream=False)
        return json.dumps(f"{c.id}:{c.name}:{c.status}")
      containers = []
      for container in client.containers.list():
        container.reload()
        c = client.containers.get(container.name)
        if full:
          containers.append(c.stats(stream=False))
        containers.append(f"{c.id}:{c.name}:{c.status}")
      return json.dumps(containers)

  def get_logs(self,jobid:str,logs:list[str]):
    dumpme={}
    for log_type in logs:
      try:
        dumpme[jobid].append(self.get_logtype(jobid,log_type))
      except KeyError:
        dumpme[jobid]=[self.get_logtype(jobid,log_type)]
    return json.dumps(dumpme)

  def get_logtype(self,jobid:str,logtype:str)->str:
    if logtype == "commands":
      return f"/var/log/abra/{jobid}/ebpf/userspacecommands.log"

    return ''

  def get_health(self):
    #logger.info(f"Getting health")
    return f"{psutil.cpu_percent()}:{psutil.virtual_memory()}:{psutil.disk_usage('/')}"

  def create_container(self,host)->str:
    #logger.info(f"Creating container")
    uri=self.uri[0]+host+self.uri[1]
    with PodmanClient(base_url=uri,identity=IDENTITY_FILE) as client:
      #image = client.images.list()[1]
      subprocess.Popen(f"ssh -i {IDENTITY_FILE} {ADMIN_USER}@{host} mkdir /var/log/abra/{self.next_job}",shell=True).communicate()
      c = client.containers.create("almalinux:latest",name=str(self.next_job),mounts=[{"type":"bind","source":f"/var/log/abra/{self.next_job}","target":"/var/log"}], tty=True, detach=True)
      try:
        self.active_jobs[host].append((self.next_job,"ricky"))
      except KeyError:
        self.active_jobs[host]=[(self.next_job,"ricky")]
      with open(ACTIVE_JOBS_FILE,'a') as f:
        f.write(f"{host}:{self.next_job}:ricky\n")
      print(self.active_jobs)
      self.next_job+=1
      c.start()
      return f"{c.status}"

  def stop_container(self, job):
    #logger.info(f"Stopping container {container_name}")
    uri=self.uri[0]+self.resolve_host(job)+self.uri[1]
    with PodmanClient(base_url=uri,identity=IDENTITY_FILE) as client:
      c = client.containers.get(job)
      c.stop()
      c.reload()
      return f"{c.status}"

  def start_container(self, job):
    uri=self.uri[0]+self.resolve_host(job)+self.uri[1]
    with PodmanClient(base_url=uri,identity=IDENTITY_FILE) as client:
      c = client.containers.get(job)
      c.start()
      c.reload()
      return f"{c.status}"

  def delete_container(self, job):
    uri=self.uri[0]+self.resolve_host(job)+self.uri[1]
    with PodmanClient(base_url=uri,identity=IDENTITY_FILE) as client:
      c = client.containers.remove(job)
      for x in self.active_jobs.keys():
        for y in self.active_jobs[x]:
          if(y[0]==jobid):
            self.active_jobs[x].remove(y)
            return

  def resolve_host(self,jobid)->str:
    for x in self.active_jobs.keys():
      for y in self.active_jobs[x]:
        if(y[0]==jobid):
          return x

if __name__=="__main__":
  c=Controller()
