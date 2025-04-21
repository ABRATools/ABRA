import socket
from json import loads

with socket.socket(socket.AF_UNIX,socket.SOCK_STREAM) as client:
  client.connect("/run/abra/abra.sock")
  #client.send(b"status node nvbaisec0")
  #client.send(b"status container vigilant_kepler")
  client.send(b"status")
  #client.send(b"new nvbaisec0")
  #client.send(b"stop 1")
  a=client.recv(1024).decode()
  a=loads(a)
  print(type(a))
  print(a[-1].split(':'))
  client.close()
