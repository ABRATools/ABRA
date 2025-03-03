import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
# remove all handlers
logger.propagate = False
logger.handlers.clear()

file_handler = logging.FileHandler('abra.log')
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)