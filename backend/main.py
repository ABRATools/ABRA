import multiprocessing
import sys
import time
import uvicorn
import argparse
# from fastapi_server import app
import config
from logger import logger
from typing import Optional

parser = argparse.ArgumentParser()
# parser.add_argument("--config", type=str, default="config.yaml", help="Path to the configuration file")
parser.add_argument("--no-aggregator", dest='noagg', action='store_true', help="If set, will not run the aggregator process")

def run_fastapi():
    uvicorn.run('fastapi_server:app', host="127.0.0.1", port=8989, workers=2)

def run_aggregator():
    import run_aggregator
    run_aggregator.main()

def run_log_notifier():
    import run_log_notifier
    run_log_notifier.main()

if __name__ == "__main__":
    args = parser.parse_args()
    logger.info("Starting central process...")

    multiprocessing.freeze_support()

    fastapi_process = multiprocessing.Process(target=run_fastapi)
    aggregator_process = multiprocessing.Process(target=run_aggregator)

    logger.info("Processes created. Starting webserver and aggregator processes...")
    fastapi_process.start()
    if not args.noagg:
        logger.info("Starting aggregator process...")
        aggregator_process.start()
    else:
        logger.info("Not starting aggregator process.")

    if config.settings.DISCORD_ENABLED:
        logger.info("Starting log notifier process...")
        log_notifier_process = multiprocessing.Process(target=run_log_notifier)
        log_notifier_process.start()
    else:
        logger.info("Log notifier process not started. DISCORD_ENABLED is set to False.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Received exit signal for central process. Shutting down webserver and aggregator processes...")
        # Terminate both processes gracefully.
        fastapi_process.terminate()
        fastapi_process.join()

        if not args.noagg:
            aggregator_process.terminate()
            aggregator_process.join()

        sys.exit(0)