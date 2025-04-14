

from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from web_auth import authenticate_cookie, AuthToken
from logger import logger
from web_utils import get_session

router = APIRouter(prefix="/ebpf")

@router.get("/get_ebpf_module_names")
async def get_ebpf_module_names(request: Request, token: AuthToken = Depends(authenticate_cookie)):
    if token:
        
        # placeholder for getting folder names from folder
        def foo():
            return None
        names = foo()
        if names is None: # fallback
            names = [
                'command viewage',
                'hacker mode',
                'asexual mode',
            ]

        return JSONResponse(
            content={
                "module_names": names
            },
            status_code=200
        )
    return JSONResponse(content={'message': 'Unauthorized', 'redirect': '/login'}, status_code=401)