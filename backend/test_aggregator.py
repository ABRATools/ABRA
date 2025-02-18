import database as db
from nodeapi_aggregator import PollerService, output_queue

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

def main():
  session = obtain_session()
  service = PollerService(db_session=session, poll_interval=15, update_database=True)
  service.start()

if __name__ == "__main__":
  main()
