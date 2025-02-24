from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from typing import Annotated

from web_auth import authenticate_cookie, AuthToken

router = APIRouter()

# Create a dependency function to get templates
def get_templates():
    return Jinja2Templates(directory="templates")

@router.get("/", response_class=HTMLResponse)
async def root(
    request: Request,
    templates: Annotated[Jinja2Templates, Depends(get_templates)]
):
    return templates.TemplateResponse('index.html', {'request': request})

@router.get("/login", response_class=HTMLResponse)
async def serve_frontend_public(
    request: Request,
    templates: Annotated[Jinja2Templates, Depends(get_templates)]
):
    return templates.TemplateResponse('index.html', {'request': request})

@router.get("/display/systems")
@router.get("/display/systems/{system_id}")
@router.get("/display/systems/{system_id}/nodes/{node_id}")
@router.get("/display/systems/{system_id}/nodes/{node_id}/environments/{env_id}")
@router.get("/config/systems")
@router.get("/config/systems/{system_id}")
@router.get("/config/systems/{system_id}/nodes/{node_id}")
@router.get("/config/systems/{system_id}/nodes/{node_id}/environments/{env_id}")
@router.get("/config/profiles",)
@router.get("/config/containers")
@router.get("/access")
async def serve_frontend_protected(
    request: Request,
    templates: Annotated[Jinja2Templates, Depends(get_templates)],
    authenticated: Annotated[AuthToken, Depends(authenticate_cookie)]
):
    try:
        if not authenticated:
            return RedirectResponse(url='/login', status_code=302)
        return templates.TemplateResponse('index.html', {'request': request})
    except Exception as e:
        print(f"Exception occurred: {e}")
        return JSONResponse(content={'message': 'An error occurred'}, status_code=500)