#!/usr/bin/env python

from config import settings
from contextlib import asynccontextmanager

import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends, APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from routing import frontend, api, containers
from starlette.responses import HTMLResponse, JSONResponse
from fastapi.concurrency import run_in_threadpool
import asyncio
import datetime

import database as db
from classes import *
from containers import *
from web_utils import get_session, ws_manager
from logger import logger
from web_auth import auth_router
<<<<<<< HEAD
=======
from role_based_access.rba_endpoints import router as rba_router
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569

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
<<<<<<< HEAD
=======
# rba routers
app.include_router(rba_router)
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY.get_secret_value())

async def send_data(session):
  try:
    while True:
      data = db.get_newest_node_info(session)
      if not data:
        await asyncio.sleep(2.5)
        continue
      await ws_manager.broadcast(data)
      await asyncio.sleep(2.5)
  except asyncio.CancelledError:
    print("send_data cancelled")
    await ws_manager.disconnect_all()
    return
  except Exception as e:
    print(f"Error in send_data: {e}")
    await ws_manager.disconnect_all()
    return

@data_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, session = Depends(get_session)):
  await ws_manager.connect(websocket)
  print("/ws endpoint connected")
  try:
    rst = await send_data(session)
    return rst
  except asyncio.CancelledError:
    await ws_manager.disconnect(websocket)
    print("send_data cancelled")
    return
  except Exception as e:
    await ws_manager.disconnect(websocket)
    print(f"Error in websocket_endpoint: {e}")
    return
  except WebSocketDisconnect:
    await ws_manager.disconnect(websocket)
    print("WebSocket disconnected")
  await ws_manager.disconnect(websocket)
  print("WebSocket disconnected")
  return

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