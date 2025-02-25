import threading
from classes import *
import database as db
import nanoid
import asyncio

async def processes_stream_output(output_queue, database_session, shared_queue):
  print("Starting stream output")
  print("Aggregator shared queue: ", shared_queue)
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
      print("Broadcasting host data")
      shared_queue.put(host.json())

def async_proccess_runner(output_queue, database_session, shared_queue):
  loop = asyncio.new_event_loop()
  asyncio.set_event_loop(loop)
  loop.run_until_complete(processes_stream_output(output_queue, database_session, shared_queue))
  loop.close()

def init_processor(output_queue, database_session, shared_queue):
  print("Starting stream thread")
  #stream_thread = threading.Thread(target=processes_stream_output, args=(output_queue, database_session), daemon=True)
  stream_thread = threading.Thread(target=async_proccess_runner, args=(output_queue, database_session, shared_queue), daemon=True)
  stream_thread.start()