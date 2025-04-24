import database as db
import asyncio
import signal
import sys
from logger import logger
from discord_notifier import LogMonitor

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

async def service_main(session):
  service = LogMonitor(db_session=session)
  loop = asyncio.get_running_loop()

  service.main_task = asyncio.create_task(service.run())

  for sig in (signal.SIGINT, signal.SIGTERM):
    loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown_handler(service)))
  
  try:
    await service.main_task
  except asyncio.CancelledError:
    logger.info("Log notifier task cancelled gracefully.")
    sys.exit(0)

async def shutdown_handler(service: LogMonitor):
  logger.info("Shutdown handler for log notifier triggered by signal.")
  service.shutdown()

def main():
  session = obtain_session()
  asyncio.run(service_main(session))