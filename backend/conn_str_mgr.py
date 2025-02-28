import database as db
import argparse

parser = argparse.ArgumentParser(description='Add a user to the database')
parser.add_argument('--list', action='store_true', help='List all connection strings')
parser.add_argument('--delete', action='store_true', help='Delete a connection string')
parser.add_argument('--create', action='store_true', help='Create a connection string')

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

session = obtain_session()

def main(args):
  if args.list:
    print("List all connection strings")
    conn_strs = db.get_connection_strings(session)
    for conn in conn_strs:
      print(f"Name: {conn.name}, Connection String: {conn.connection_string}, Type: {conn.type} IP: {conn.ip if conn.ip else 'N/A'}")
  elif args.delete:
    print("Delete a connection string")
    conn_strs = db.get_connection_strings(session)
    for conn in conn_strs:
      print(f"Name: {conn.name}, Connection String: {conn.connection_string}, Type: {conn.type} IP: {conn.ip if conn.ip else 'N/A'}")
    name = input("Enter the name of the connection string to delete: ")
    db.delete_connection_string(session, name)
  elif args.create:
    print("Create a connection string")
    name = input("Enter the name of the connection string: ")
    conn_str = input("Enter the connection string: ")
    conn_type = input("Enter the type of connection string (http, ssh): ")
    db.create_connection_string(session, name, conn_str, conn_type)
  else:
    print("No arguments provided")

if __name__ == '__main__':
  args = parser.parse_args()
  main(args)