# main.py
from fastapi import FastAPI
import uvicorn
import asyncio
from run_aggregator import service_main, obtain_session
from contextlib import asynccontextmanager
import multiprocessing

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("Starting FastAPI")
  session = obtain_session()
  aggregator_task = asyncio.create_task(service_main(session))
  try:
    yield
  except asyncio.CancelledError:
    print("Cancelled")
    aggregator_task.cancel()
    try:
      await aggregator_task
    except asyncio.CancelledError:
      print("Aggregator task cancelled gracefully")
  finally:
    print("Cleaning up")
    aggregator_task.cancel()
    try:
      await aggregator_task
    except asyncio.CancelledError:
      print("Aggregator task cancelled gracefully.")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
  multiprocessing.freeze_support()
  uvicorn.run(app, host="127.0.0.1", port=8008)
