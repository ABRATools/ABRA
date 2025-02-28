import socket
import os, os.path

if os.path.exists("/tmp/abra.sock"):
  os.remove("/tmp/abra.sock")
#change to systemctl service

server=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
server.bind("/tmp/abra.sock")
while True:
  server.listen(1)
  con,addr=server.accept()
  datagram=con.recv(1024)
  if datagram:
    tokens=datagram.strip().split()
    print(tokens)
    
    con.send(b'1')
  con.close()
