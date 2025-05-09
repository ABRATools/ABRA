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
parser.add_argument("--no-notifier", dest='nonoti', action='store_true', help="If set, will not run the notifier process")

def run_fastapi():
    uvicorn.run('fastapi_server:app', host="127.0.0.1", port=8000)

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
    notifier_process = multiprocessing.Process(target=run_log_notifier)

    logger.info("Processes created. Starting webserver and aggregator processes...")
    fastapi_process.start()
    if not args.noagg:
        logger.info("Starting aggregator process...")
        aggregator_process.start()
    else:
        logger.info("Not starting aggregator process.")
    if not args.nonoti:
        logger.info("Starting notifier process...")
        notifier_process.start()
    else:
        logger.info("Not starting aggregator process.")

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

        if not args.nonoti:
            notifier_process.terminate()
            notifier_process.join()

        sys.exit(0)