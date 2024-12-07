import psutil
import socket
import os, os.path
from podman import PodmanClient

uri='unix:///run/podman/podman.sock'

#if os.path.exists("/tmp/abra.sock"):
#  os.remove("/tmp/abra.sock")
#change to systemctl service

#add logging
#change socket to be able to receive multiple messages

server=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
#server.bind("/tmp/abra.sock")
server.bind(("",5555))
server.listen(1)
while True:
  con,addr=server.accept()
  datagram=con.recv(1024)
  if datagram:
    print(datagram)
    tokens=datagram.strip().split()
    print(tokens)

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
        #spindown container
        with PodmanClient(base_url=uri) as client:
            c=client.containers.get(tokens[1])
            c.stop()
            c.reload()
            con.send(f"{c.status}".encode())
  con.close()
