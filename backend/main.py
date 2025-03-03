import multiprocessing
import sys
import time
import uvicorn
import argparse
from fastapi_server import set_queue, app
import config
from logger import logger
from typing import Optional

parser = argparse.ArgumentParser()
# parser.add_argument("--config", type=str, default="config.yaml", help="Path to the configuration file")
parser.add_argument("--no-aggregator", dest='noagg', action='store_true', help="If set, will not run the aggregator process")
parser.add_argument("--config", type=Optional[str], default=None, help="Path to the configuration file")

def run_fastapi(shared_queue):
    set_queue(shared_queue)
    uvicorn.run(app, host="127.0.0.1", port=8976)

def run_aggregator(shared_queue):
    import run_aggregator
    run_aggregator.main(shared_queue)

if __name__ == "__main__":
    args = parser.parse_args()
    logger.info("Starting central process...")
    if not args.config is None:
        config.load_config_file(args.config)
    else:
        logger.info("No configuration file provided. Using default configuration.")
        config.load_default_config()

    multiprocessing.freeze_support()

    manager = multiprocessing.Manager()
    shared_queue = manager.Queue()

    fastapi_process = multiprocessing.Process(target=run_fastapi, args=(shared_queue,))
    aggregator_process = multiprocessing.Process(target=run_aggregator, args=(shared_queue,))

    logger.info("Processes created. Starting webserver and aggregator processes...")
    fastapi_process.start()
    if not args.noagg:
        logger.info("Starting aggregator process...")
        aggregator_process.start()
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

        sys.exit(0)