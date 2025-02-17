import os
import time
import asyncio
import requests
from classes import *
import database as db
import multiprocessing
from typing import List
from multiprocessing import Process, Queue, Manager
# create a process for each connection string in the database for concurrent polling

processes: List[multiprocessing.Process] = []
manager = multiprocessing.Manager()

command_queues: List[Queue] = []
output_queue = manager.Queue()

class Poller:

  def __init__(self, connection_string:str, output_queue:Queue, poller_id:int):
    self.connection_string = connection_string
    self.output_queue = output_queue
    self.poller_id = poller_id

  def exec_request(self, endpoint: str, method: str = "GET", data=None):
    full_url = f"{self.connection_string}/{endpoint}"
    try:
      if method.upper() == "GET":
        response = requests.get(full_url, data=data)
      elif method.upper() == "POST":
        response = requests.post(full_url, data=data)
      else:
        response = None
      self.output_queue.put({
        'poller_id': self.poller_id,
        'url': full_url,
        'status_code': response.status_code if response else None,
        'content': response.text[:200] if response else None
      })
    except Exception as e:
      self.output_queue.put({
        'poller_id': self.poller_id,
        'url': full_url,
        'error': str(e)
      })

def init_pollers(connection_string:str, command_queue:Queue):
  """
  Poll the connection string for data
  """
  poller_id = os.getpid()
  poller = Poller(connection_string=connection_string, output_queue=output_queue, poller_id=poller_id)
  while True:
    try:
      # Check for a command in the queue
      command = command_queue.get_nowait()
    except Exception:
      command = None

    if command and command.get('action') == 'poll':
      endpoint = command.get('endpoint', '')
      method = command.get('method', 'GET')
      data = command.get('data', None)
      poller.exec_request(endpoint, method, data)
    time.sleep(5)

def get_connection_strings():
  return db.get_connection_strings()

def create_processes():
  """
  Create a process (with its own command queue) for each connection string in the database.
  """
  while True:
    conn_strs = db.get_connection_strings()
    for conn in conn_strs:
      conn_str = conn.connection_string
      cmd_q = manager.Queue()
      p = multiprocessing.Process(target=init_pollers, args=(conn_str, cmd_q))

      if p not in processes:
        processes.append(p)
      if cmd_q not in command_queues:
        command_queues.append(cmd_q)

    asyncio.sleep(30)

def force_poll_all(endpoint: str, method: str = "GET", data=None):
    """
    This function sends a command to every poller to immediately execute a poll
    with the given endpoint, HTTP method, and data.
    """
    command = {
      'action': 'poll',
      'endpoint': endpoint,
      'method': method,
      'data': data
    }
    for cmd_q in command_queues:
      cmd_q.put(command)


def main():
  create_processes()
  while True:

    for p in processes:
      if not p.is_alive():
        p.start()

    while not output_queue.empty():
      result = output_queue.get()
      print("Response Received:", result)

    force_poll_all(endpoint="containers/list", method="GET")
    asyncio.sleep(10)

if __name__ == "__main__":
  main()