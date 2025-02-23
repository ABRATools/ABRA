import threading
from classes import *
import database as db
import nanoid

def processes_stream_output(output_queue, database_session):
  while True:
    try:
      data = output_queue.get_nowait()
    except Exception:
      data = None

    if data:
      connection_url = data.get('url', None)
      status_code = data.get('status_code', None)
      print(connection_url, status_code)
      if status_code != 200:
        print(f"Error: {status_code} for {connection_url}")
        continue
      content = data.get('content', None)
      if not content:
        print(f"No content for {connection_url}")
        continue
      host_data = content.get('host', None)
      if not host_data:
        print(f"No host data for {connection_url}")
        continue

      container_data = content.get('containers', None)
      if not container_data:
        print(f"No container data for {connection_url}")
        continue

      host = Node(**host_data, node_id=nanoid.generate(), environments=[])
      for container in container_data:
        container = Environment(**container)
        host.environments.append(container)
      print(f"Host: {host}")

def init_processor(output_queue, database_session):
  print("Starting stream thread")
  stream_thread = threading.Thread(target=processes_stream_output, args=(output_queue, database_session), daemon=True)
  stream_thread.start()