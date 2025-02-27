import database as db
import asyncio
import signal
import sys
from nodeapi_aggregator import PollerService

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

async def service_main(session, shared_queue):
  service = PollerService(db_session=session, update_database=True, shared_queue=shared_queue)
  loop = asyncio.get_running_loop()

  service.main_task = asyncio.create_task(service.run())

  for sig in (signal.SIGINT, signal.SIGTERM):
    loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown_handler(service)))
  
  try:
    await service.main_task
  except asyncio.CancelledError:
    service.logger.info("Main task cancelled gracefully.")
    sys.exit(0)

async def shutdown_handler(service: PollerService):
  service.logger.info("Shutdown handler triggered by signal.")
  service.shutdown()

def main(shared_queue):
  session = obtain_session()
  asyncio.run(service_main(session, shared_queue))