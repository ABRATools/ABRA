import NodeAPI
import asyncio
import aiohttp
import socket
import json

node_connection_strings = []

async def get_node_locations():
  url = "http://127.0.0.1:8000/get_node_locations"

  async with aiohttp.ClientSession() as session:
    try:
      async with session.get(url) as response:
        if response.status != 200:
          print(f"Error: {response.status}")
          return
        print(f"Response Code: {response.status}")
        print(f"Response Body: {await response.text()}")
    except Exception as e:
      print(f"Error while posting JSON: {e}")

def get_node_info(host, port, message):
  try:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
      client_socket.connect((host, port))
      
      client_socket.sendall(message.encode())
      print(f"Sent: {message}")
      
      # Receive the response (up to 1024 bytes)
      response = client_socket.recv(1024).decode()
      print(f"Received: {response}")
      
      # The socket is automatically closed when using `with`
      return response
  except Exception as e:
    print(f"An error occurred: {e}")

async def generate_and_post_json():
    data = {
      "key1": "value1",
      "key2": "value2"
    }

    url = "http://127.0.0.1:7000/post_nodes"

    async with aiohttp.ClientSession() as session:
      try:
        async with session.post(url, json=data) as response:
          print(f"Response Code: {response.status}")
          print(f"Response Body: {await response.text()}")
      except Exception as e:
        print(f"Error while posting JSON: {e}")

async def periodic_task(interval):
    while True:
        await generate_and_post_json()
        await asyncio.sleep(interval)

if __name__ == "__main__":
    asyncio.run(periodic_task(30))

async def post_from_node_api():
  nodeapi = NodeAPI.NodeAPI("http+unix:///run/podman/podman.sock")
  await nodeapi.run()

if __name__ == "__main__":
  asyncio.run(post_from_node_api())
