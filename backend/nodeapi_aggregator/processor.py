import threading
from classes import *
import database as db
import asyncio
from logger import logger

async def processes_stream_output(output_queue, database_session):
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

      hostname = host_data.get('node_id', None)

      container_data = content.get('containers', None)
      # if not container_data:
      #   logger.warning(f"No container data for {connection_url}")
      #   continue
      host = Node(**host_data, environments=[])
      if container_data:
        for container in container_data:
          container = Environment(**container)
          host.environments.append(container)
      host_json = host.model_dump()
      # print(f"data received for: {hostname}")
      # add node to cluster
      db.add_node_to_cluster(database_session, hostname)
      # add node info to database
      db.insert_node_info_json(db=database_session, json=host_json, hostname=hostname)

def async_proccess_runner(output_queue, database_session):
  loop = asyncio.new_event_loop()
  asyncio.set_event_loop(loop)
  loop.run_until_complete(processes_stream_output(output_queue, database_session))
  loop.close()

def init_processor(output_queue, database_session):
  logger.debug("Initializing processor thread for stream output")
  stream_thread = threading.Thread(target=async_proccess_runner, args=(output_queue, database_session), daemon=True)
  stream_thread.start()