import psutil
import os, os.path
from podman import PodmanClient

uri='unix:///run/podman/podman.sock'

class HeadNode:
    def __init__(self):


    if(tokens[0].decode()=="status"):
        with PodmanClient(base_url=uri) as client:
            for container in client.containers.list():
                container.reload()
                c=client.containers.get(container.name)
                con.send(f"{c.id}:{c.name}:{c.status}".encode())
    elif(tokens[0].decode()=="health"):
        con.send(f"{psutil.cpu_percent()}:{psutil.virtual_memory()}:{psutil.disk_usage('/')}:".encode())
    elif(tokens[0].decode()=="new"):
        #spinup container https://podman-py.readthedocs.io/en/latest/podman.domain.containers_create.html
        #podman run -dit almalinux:latest
        with PodmanClient(base_url=uri) as client:
            image=client.images.list()[1]
#            c=client.containers.create(image,tty=True,detach=True)
            c=client.containers.create("almalinux:latest",tty=True,detach=True)
            c.start()
            c.reload()
            con.send(f"{c.status}".encode())
    elif(tokens[0].decode()=="end"):
        '''end {container name} '''
        #check to make sure container is real first
        with PodmanClient(base_url=uri) as client:
            c=client.containers.get(tokens[1])
            c.stop()
            c.reload()
            con.send(f"{c.status}".encode())
  con.close()
