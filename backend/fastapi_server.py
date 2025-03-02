#!/usr/bin/env python

from config import settings
from contextlib import asynccontextmanager

import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from routing import frontend, api, containers
from starlette.responses import HTMLResponse, JSONResponse
import asyncio

import database as db
from classes import *
from containers import *
from web_utils import get_session, ws_manager
from logger import logger
from web_auth import auth_router

shared_queue = None

inMemoryJSON = ""

def get_inMemoryJSON():
  yield inMemoryJSON

def set_queue(queue):
  global shared_queue
  shared_queue = queue
  print("Queue set to shared queue: ", shared_queue)

def get_queue():
  return shared_queue

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("Starting FastAPI")
  yield
  print("Cleaning up")

app = FastAPI(lifespan=lifespan)

templates = Jinja2Templates(directory='templates')
# mount static files
app.mount("/static", StaticFiles(
    directory="static",
    html=True,
    check_dir=True
), name="static")

app.mount("/assets", StaticFiles(
    directory="static/assets",
    html=True,
    check_dir=True
), name="assets")

data_router = APIRouter(prefix="/data")

# public routes
app.include_router(frontend.router)
# api routes
app.include_router(api.router)
# auth routes
app.include_router(auth_router)
# container routes
app.include_router(containers.router)

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY.get_secret_value())

# @app.get("/test-static")
# async def test_static():
#     static_dir = Path("static")
#     assets_dir = Path("static/assets")
    
#     files = {
#         "static_files": [f.name for f in static_dir.iterdir() if f.is_file()],
#         "asset_files": [f.name for f in assets_dir.iterdir() if f.is_file()]
#     }
#     return files

@data_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, q = Depends(get_queue), inMemoryJSON = Depends(get_inMemoryJSON)):
  initJSONUsed = False
  await ws_manager.connect(websocket)
  print("/ws endpoint connected")
  try:
    while True:
      if not initJSONUsed and inMemoryJSON != "":
        await websocket.send_text(inMemoryJSON)
        initJSONUsed = True
      if q:
        try:
          msg = q.get_nowait()
          if not initJSONUsed:
            inMemoryJSON = str(msg)
        except:
          msg = None
        if msg:
          await websocket.send_text(str(msg))
      else:
        raise Exception("Queue not set")
      await asyncio.sleep(1)
  except asyncio.CancelledError:
    print("Websocket cancelled")
  except WebSocketDisconnect:
    print("Websocket disconnected")
  finally:
    ws_manager.disconnect(websocket)

@data_router.get("/")
async def get():
    # Simple HTML page to test websocket connection
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Demo</title>
        </head>
        <body>
            <h1>WebSocket Test</h1>
            <ul id='messages'></ul>
            <script>
                var ws = new WebSocket("ws://localhost:8989/data/ws");
                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages');
                    var message = document.createElement('li');
                    message.innerText = event.data;
                    messages.appendChild(message);
                };
            </script>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@data_router.get("/test")
async def test():
  if ws_manager:
    await ws_manager.broadcast("Test message")
  return JSONResponse(content={"message": "Test message sent"})

app.include_router(data_router)

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def catch_all(request: Request, full_path: str):
  return HTMLResponse(content="""<h1>404 Not Found, email the closest system administrator!</h1>""", status_code=404)

if __name__ == "__main__":
  uvicorn.run("fastapi_server:app", host='127.0.0.1', port=8989, reload=True)