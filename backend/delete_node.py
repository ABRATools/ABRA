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

  if db.delete_node(session, args.name):
    print(f"Node {args.name} deleted successfully")
  else:
    print(f"Node {args.name} not found")

  print([node.name for node in db.get_nodes(session)])

if __name__ == '__main__':
  args = parser.parse_args()
  main(args)