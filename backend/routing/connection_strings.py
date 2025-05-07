import sys, os
sys.path.insert(0, os.path.abspath('..'))

import database as db
from classes import DeleteConnectionString, ConnectionStrings
from containers import *
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from web_utils import get_session
from logger import logger
from web_auth import authenticate_cookie, AuthToken

router = APIRouter(prefix="/connection-strings")

@router.get("/fetch-all")
async def return_all_connection_strings(request: Request, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)) -> JSONResponse:
  if token:
    conn_strs=db.get_connection_strings(session)
    conn_strs_json = []
    for conn_str in conn_strs:
      filtered_conn_str = ConnectionStrings(
        name=conn_str.name,
        connection_string=conn_str.connection_string,
        description=conn_str.description
      )
      conn_strs_json.append(filtered_conn_str.model_dump())
    return JSONResponse(content={'connection_strings': conn_strs_json}, status_code=200)
  logger.warning("Unauthorized request to fetch connection strings")
  return JSONResponse(status_code=401, content={"message": "Unauthorized"})

@router.delete("/delete-connstr")
async def delete_connection_string(deleteConnStrReq: DeleteConnectionString, session = Depends(get_session), token: AuthToken = Depends(authenticate_cookie)):
  if token:
    try:
      # delete the connection string
      db.delete_connection_string(
        session,
        deleteConnStrReq.connstr_name
      )
    except Exception as e:
      logger.error(f"Error deleting connection string: {e}")
      return JSONResponse(content={'message': 'Error deleting connection string'}, status_code=500)
    return JSONResponse(content={'message': 'Connection string deleted successfully'}, status_code=200)
  return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)