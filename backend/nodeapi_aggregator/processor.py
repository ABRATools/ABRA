import threading
from classes import *
import database as db
import nanoid
import asyncio
from logger import logger

async def processes_stream_output(output_queue, database_session, shared_queue):
  logger.debug("Starting stream output")
  logger.debug(f"Output queue: {output_queue}")
  while True:
    try:
      data = output_queue.get_nowait()
    except Exception:
      data = None

    if data:
      connection_url = data.get('url', None)
      status_code = data.get('status_code', None)
      if status_code != 200:
        logger.error(f"Error: {status_code} for {connection_url}")
        continue
      content = data.get('content', None)
      if not content:
        logger.error(f"No content for {connection_url}")
        continue
      host_data = content.get('host', None)
      if not host_data:
        logger.error(f"No host data for {connection_url}")
        continue

      container_data = content.get('containers', None)
      if not container_data:
        logger.warning(f"No container data for {connection_url}")
        continue

      host = Node(**host_data, node_id=nanoid.generate(), environments=[])
      for container in container_data:
        container = Environment(**container)
        host.environments.append(container)
      shared_queue.put(host.json())

def async_proccess_runner(output_queue, database_session, shared_queue):
  loop = asyncio.new_event_loop()
  asyncio.set_event_loop(loop)
  loop.run_until_complete(processes_stream_output(output_queue, database_session, shared_queue))
  loop.close()

def init_processor(output_queue, database_session, shared_queue):
  logger.debug("Initializing processor thread for stream output")
  stream_thread = threading.Thread(target=async_proccess_runner, args=(output_queue, database_session, shared_queue), daemon=True)
  stream_thread.start()