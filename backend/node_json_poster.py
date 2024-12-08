import asyncio
import aiohttp
from typing import List
from classes import ConnectionStrings, Node, Environment

async def get_node_locations(url = "http://127.0.0.1:8000/get_node_locations") -> List[ConnectionStrings]:
  async with aiohttp.ClientSession() as session:
    try:
      node_connection_strings: List[ConnectionStrings] = []
      async with session.get(url) as response:
        if response.status != 200:
          print(f"Error: {response.status}")
          return []
        json = await response.json()
        json = json['node_locations']
        for item in json:
          node_connection_strings.append(ConnectionStrings.model_validate_json(item))
      return node_connection_strings
    except Exception as e:
      print(f"Error while posting JSON: {e}")

async def get_node_info(connection_string: ConnectionStrings, message: str, timeout=5) -> str:
  try:
    host = connection_string.ip if connection_string.type == "remote" else '127.0.0.1'
    port = '5555'
      
    reader, writer = await asyncio.open_connection(host, port)
    
    writer.write(message.encode())
    await writer.drain()
    print(f"Sent: {message}")
    
    response_text = ""
    try:
      while True:
        data = await asyncio.wait_for(reader.read(100), timeout=timeout)
        if not data:
          break
        response_text += data.decode()
    except asyncio.TimeoutError:
      print("Timed out")
      return None
  
    writer.close()
    await writer.wait_closed()
    
    return response_text
  except Exception as e:
    print(f"An error occurred: {e}")
    return None

async def main():
  tasks = []

  connection_strings = await get_node_locations()
  for connection_string in connection_strings:
    tasks.append(asyncio.create_task(get_node_info(connection_string, "node")))
  responses = await asyncio.gather(*tasks)
  print(responses)
  
async def generate_and_post_json(data, url = "http://127.0.0.1:8000/post_nodes"):
  async with aiohttp.ClientSession() as session:
    try:
      async with session.post(url, json=data) as response:
        print(f"Response Code: {response.status}")
        print(f"Response Body: {await response.text()}")
    except Exception as e:
      print(f"Error while posting JSON: {e}")

async def fetch_all_nodes(interval):
  while True:
    await main()
    await asyncio.sleep(interval)

if __name__ == "__main__":
  asyncio.run(fetch_all_nodes(30))
