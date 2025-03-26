from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any

from web_utils import get_session
from logger import logger
from web_auth.auth import authenticate_cookie, AuthToken
from role_based_access.rba_permissions import (
    check_route_permission, 
    get_accessible_routes,
    initialize_default_permissions,
    setup_default_groups
)

router = APIRouter(prefix="/rbac/routes")

@router.get("/initialize")
async def initialize_route_permissions(
    request: Request, 
    session = Depends(get_session), 
    token: AuthToken = Depends(authenticate_cookie)
):
    """Initialize the default route permissions and groups"""
    if not token or "admin" not in (token.groups or []):
        return JSONResponse(
            content={"success": False, "message": "Admin privileges required"}, 
            status_code=403
        )
    
    try:
        initialize_default_permissions(session)
        setup_default_groups(session)
        return JSONResponse(
            content={"success": True, "message": "Route permissions initialized successfully"},
            status_code=200
        )
    except Exception as e:
        logger.error(f"Error initializing route permissions: {str(e)}")
        return JSONResponse(
            content={"success": False, "message": f"Error: {str(e)}"},
            status_code=500
        )

@router.get("/check/{route:path}")
async def check_user_route_permission(
    route: str,
    request: Request, 
    session = Depends(get_session), 
    token: AuthToken = Depends(authenticate_cookie)
):
    """Check if the current user has permission to access a specific route"""
    if not token:
        return JSONResponse(
            content={"success": False, "message": "Authentication required"}, 
            status_code=401
        )
    
    result = check_route_permission(session, token.username, route)
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

@router.get("/accessible")
async def get_user_accessible_routes(
    request: Request, 
    session = Depends(get_session), 
    token: AuthToken = Depends(authenticate_cookie)
):
    """Get all routes that the current user has permission to access"""
    if not token:
        return JSONResponse(
            content={"success": False, "message": "Authentication required"}, 
            status_code=401
        )
    
    result = get_accessible_routes(session, token.username)
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)