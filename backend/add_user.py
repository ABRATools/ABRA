#!/usr/bin/env python3

import database as db
import bcrypt
import argparse

parser = argparse.ArgumentParser(description="Add a new user to the database.")
parser.add_argument("username", type=str, help="Username of the new user")
parser.add_argument("password", type=str, help="Password of the new user")
parser.add_argument("email", type=str, help="Email of the new user")
parser.add_argument("groups", type=str, nargs='+', help="Groups of the new user")
parser.add_argument("--admin", action="store_true", help="If set, the user will be an admin")

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

def main(args):
    session = obtain_session()
    hashed_password = bcrypt.hashpw(args.password.encode('utf-8'), bcrypt.gensalt())
    db.create_user(session, 'admin', hashed_password, 'admin@example.com', ['admin'] if args.admin else args.groups)

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)