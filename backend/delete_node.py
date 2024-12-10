import database as db
import argparse
import bcrypt

parser = argparse.ArgumentParser(description='Delete a node from the database')
parser.add_argument('--name', type=str, help='The name of the node to delete')

def obtain_session():
  try:
    session = db.get_session()
  except Exception as e:
    raise
  return next(session)

session = obtain_session()

def main(args):
  print([node.name for node in db.get_nodes(session)])
  print([f"{conn_str.name}: {conn_str.ip}" for conn_str in db.get_connection_strings(session)])

  if db.delete_node(session, args.name):
    print(f"Node {args.name} deleted successfully")
  else:
    print(f"Node {args.name} not found")

  if db.delete_connection_string(session, args.name):
    print(f"Connection string {args.name} deleted successfully")
  else:
    print(f"Connection string {args.name} not found")

  print([conn_str.name for conn_str in db.get_connection_strings(session)])
  print([node.name for node in db.get_nodes(session)])

if __name__ == '__main__':
  args = parser.parse_args()
  main(args)