from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Annotated

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
@router.get("/display/systems", response_class=HTMLResponse)
@router.get("/display/systems/{system_id}", response_class=HTMLResponse)
@router.get("/display/systems/{system_id}/nodes/{node_id}", response_class=HTMLResponse)
@router.get("/display/systems/{system_id}/nodes/{node_id}/environments/{env_id}", response_class=HTMLResponse)
@router.get("/config/systems", response_class=HTMLResponse)
@router.get("/config/systems/{system_id}", response_class=HTMLResponse)
@router.get("/config/systems/{system_id}/nodes/{node_id}", response_class=HTMLResponse)
@router.get("/config/systems/{system_id}/nodes/{node_id}/environments/{env_id}", response_class=HTMLResponse)
@router.get("/config/profiles", response_class=HTMLResponse)
@router.get("/config/containers", response_class=HTMLResponse)
@router.get("/users", response_class=HTMLResponse)
@router.get("/access", response_class=HTMLResponse)
async def serve_frontend(
    request: Request,
    templates: Annotated[Jinja2Templates, Depends(get_templates)]
):
    return templates.TemplateResponse('index.html', {'request': request})