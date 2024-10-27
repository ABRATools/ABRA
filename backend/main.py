#!/usr/bin/env python

import psutil
import datetime
from pydantic import BaseModel
from typing import Optional, List

# database stuff
import database as db

# webserver stuff
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse, RedirectResponse, JSONResponse

app = FastAPI()

templates = Jinja2Templates(directory='templates')
app.mount('/static', StaticFiles(directory='static'), name='static')

app.add_middleware(SessionMiddleware, secret_key='!thisisasupersecretkeyandyouwouldneverguessitevengivenatrillionyears!')

class Resource(BaseModel):
  date: str
  cpu_percent: float
  mem_percent: float
  total_mem: float
  avail_mem: float
  disk_percent: float
  total_disk: float
  used_disk: float
  free_disk: float

class Environment(BaseModel):
  id: int
  machine_name: str
  description: Optional[str]
  os: str
  total_cpu: int
  total_memory: float
  total_disk: float
  ip: Optional[str]
  port: Optional[int]
  status: str

class Node(BaseModel):
  id: int
  name: str
  ip: str
  port: int
  status: str
  environments: List[Environment]

# endpoints to render index page with react-router

@app.get("/")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/login")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/dashboard")
async def root(request: Request):
  return templates.TemplateResponse('index.html', {'request': request})

@app.get("/get_resources")
async def get_resources(request: Request) -> Resource:
  cpu_percent = psutil.cpu_percent(interval=1)
  mem = psutil.virtual_memory()
  disk = psutil.disk_usage('/')
  resource = Resource(
    date=datetime.datetime.now().strftime("%Y-%m-%d"),
    cpu_percent=cpu_percent,
    mem_percent=mem.percent,
    total_mem=mem.total / (1024 ** 3),
    avail_mem=mem.available / (1024 ** 3),
    disk_percent=disk.percent,
    total_disk=disk.total / (1024 ** 3),
    used_disk=disk.used / (1024 ** 3),
    free_disk=disk.free / (1024 ** 3)
  )
  return JSONResponse(content=resource.model_dump_json(), status_code=200)

@app.get("/get_nodes")
async def get_nodes(request: Request):
  nodes = []
  node1_env1 = Environment(
    id=1,
    machine_name="env1",
    description="env1 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.50",
    port=22,
    status="running"
  )
  node1_env2 = Environment(
    id=2,
    machine_name="env2",
    description="env2 description",
    os="linux",
    total_cpu=4,
    total_memory=8,
    total_disk=100,
    ip="192.168.1.51",
    port=22,
    status="running"
  )
  node1 = Node(
    id=1,
    name="node1",
    ip="192.168.1.1",
    port=22,
    status="running",
    environments=[node1_env1, node1_env2]
    )
  nodes.append(node1)
  return JSONResponse(response=nodes, status_code=200)


if __name__ == "__main__":
  uvicorn.run('main:app', host='127.0.0.1', port=8000)
