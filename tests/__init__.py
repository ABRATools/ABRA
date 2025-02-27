import unittest
import socket
import subprocess
from time import sleep
from json import loads

class ControllerTest(unittest.TestCase):

  def test_status(self):
    resp=status()
    resp=loads(resp)
    self.assertTrue(type(resp)==type(['list']))

  def test_newNode(self):
    client=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
    client.connect("/run/abra/abra.sock")
    client.send(b"new nvbaisec0")
    client.close()
    resp=status()
    resp=loads(resp)
    resp=resp[-1].split(':')
    self.assertTrue(len(resp[0])==len("b07d03589de91a7d880806c49354f8e8e2af85eb6181a724d1ee0253fee5ee55"))
    self.assertTrue(resp[2]=="running")

#class ComputeTest(unittest.TestCase):
#  def blank(self):
#    return

def status():
  client=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
  client.connect("/run/abra/abra.sock")
  client.send(b"status")
  resp=client.recv(1024).decode()
  client.close()
  return resp

if __name__=="__main__":
  api=subprocess.Popen(['python3 /srv/ABRA/backend2/controller/dev.py'],shell=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
  sleep(1)
  unittest.main()

  api.terminate()
