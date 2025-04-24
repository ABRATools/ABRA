import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
# remove all handlers
logger.propagate = False
logger.handlers.clear()

file_handler = logging.FileHandler('abra.log')
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

def get_logfile_path() -> str:
    """Return the path to the log file."""
    return file_handler.baseFilename