import socket

node={'nvbaisec1':['10.0.1.11']}


server=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.connect((node['nvbaisec1'][0],5555))
#server.send(b'health')
#print(server.recv(1024))
#server.send(b'status')
#print(server.recv(1024))
#print(server.recv(1024))
#print(server.recv(1024))
#print(server.recv(1024))
#print(server.recv(1024))
#server.send(b'new')
#print(server.recv(1024))
server.send(b'end gallant_keldysh')
print(server.recv(1024))
server.close()
