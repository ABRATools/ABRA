import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

session = obtain_session()

def get_session():
  return session