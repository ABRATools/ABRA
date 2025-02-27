#cringe path hack
import sys, os
sys.path.insert(0, os.path.abspath('..'))
from logger import logger

import time
import asyncio
import requests
from classes import *
import database as db
import multiprocessing
from typing import List
from config import settings
from .processor import init_processor

from multiprocessing import Queue, Manager
# create a process for each connection string in the database for concurrent polling

class existingProcess:
  def __init__(self, process, connection_string):
    self.process = process
    self.connection_string = connection_string
  # Override __eq__ and __hash__ to allow for comparison of existingProcess objects, so duplicates are not added to the list
  def __eq__(self, other):
    return self.connection_string == other.connection_string
  def __hash__(self):
    return hash(self.connection_string)
  # Get the process object
  def get_process(self):
    return self.process

processes: List[multiprocessing.Process] = []
manager = multiprocessing.Manager()

command_queues: List[Queue] = []
output_queue = manager.Queue()

def init_pollers(connection_string:str, command_queue:Queue):
  """
  Poll the connection string for data
  """
  poller_id = os.getpid()
  poller = Poller(connection_string=connection_string, poller_id=poller_id)

  try:
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
      time.sleep(2)
  except KeyboardInterrupt:
    logger.info(f"Poller {poller_id} shutting down")
    return

class Poller:
  def __init__(self, connection_string:str, poller_id:int):
    self.connection_string = connection_string
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
      response: requests.Response
      output_queue.put({
        'poller_id': self.poller_id,
        'url': full_url,
        'status_code': response.status_code if response else None,
        'content': response.json() if response else None
      })
    except Exception as e:
      output_queue.put({
        'poller_id': self.poller_id,
        'url': full_url,
        'error': str(e)
      })

class PollerService:
  """
  A service that spawns a process per connection string from the database
  and manages polling via asynchronous looping.
  """
  def __init__(self, db_session, update_database=False, shared_queue=None):
    """
    Initialize the service with a database session.
    """
    self.db_session = db_session
    self.poll_interval = settings.NODE_UPDATE_INTERVAL

    if update_database:
      init_processor(output_queue, db_session)

    self.logger = logger
    self.processes: List[existingProcess] = [] 
    self.manager = Manager()
    self.command_queues: List[Queue] = []
    self.main_task = None

  def create_processes(self):
    """
    Create a process (with its own command queue) for each connection string in the database.
    """
    conn_strs = db.get_connection_strings(self.db_session)
    if len(conn_strs) == 0:
      self.logger.warning("No connection strings found in database")
    for conn in conn_strs:
      conn_str = conn.connection_string
      # self.logger.debug(f"Creating process for {conn_str}")
      cmd_q = self.manager.Queue()
      # Create a new process if one doesn't already exist for this connection string.
      p = multiprocessing.Process(target=init_pollers, args=(conn_str, cmd_q))
      # use special class to compare existing processes
      existing = existingProcess(p, conn_str)
      # Check if the process already exists in the list
      if existing not in self.processes:
        self.processes.append(existing)
        self.command_queues.append(cmd_q)

  def force_poll_all(self, endpoint: str, method: str = "GET", data=None):
    """
    Send a command to every poller to execute a poll immediately.
    """
    command = {
      'action': 'poll',
      'endpoint': endpoint,
      'method': method,
      'data': data
    }
    for cmd_q in self.command_queues:
      cmd_q.put(command)

  def __del__(self):
    """
    Clean up the database session.
    """
    for existing_process in self.processes:
      p = existing_process.get_process()
      if (not p is None) and (p.is_alive()):
        self.logger.info(f"Terminating process {p.pid}, {p}")
        os.kill(p.pid, 9)
        # p.terminate()
        # p.join()
    self.db_session.close()

  async def run(self):
    """
    The main async loop that starts the poller processes, dispatches poll commands,
    and handles output.
    """
    self.logger.info("Starting main loop")
    try:
      while True:
        self.create_processes()

        # Start processes that are not already alive
        for existing_process in self.processes:
          p = existing_process.get_process()
          if not p.is_alive():
            p.start()

        self.force_poll_all(endpoint="node-info", method="GET")
        await asyncio.sleep(self.poll_interval)
    except KeyboardInterrupt:
      self.shutdown()
      raise
    except asyncio.CancelledError:
      self.shutdown()
      raise

  def shutdown(self):
    """
    Terminate all processes and clean up.
    """
    if self.main_task and not self.main_task.done():
      self.main_task.cancel()
    for existing_process in self.processes:
      p = existing_process.get_process()
      if (not p is None) and (p.is_alive()):
        self.logger.info(f"Terminating process {p.pid}")
        p.kill()
        p.join()
    self.processes = []
    self.db_session.close()
    return