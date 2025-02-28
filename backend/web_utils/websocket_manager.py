from fastapi import WebSocket

class ConnectionManager:
  def __init__(self):
    self.active_connections: list[WebSocket] = []

  async def connect(self, websocket: WebSocket):
    await websocket.accept()
    self.active_connections.append(websocket)
    print(f"Active connections: {self.active_connections}")

  def disconnect(self, websocket: WebSocket):
    self.active_connections.remove(websocket)

  async def send_individual_message(self, message: str, websocket: WebSocket):
    await websocket.send_text(message)

  async def broadcast(self, message: str):
    print(f"Active connections: {self.active_connections}")
    for connection in self.active_connections:
      await connection.send_text(message)

ws_manager = ConnectionManager()
