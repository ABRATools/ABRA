import sys, os
sys.path.insert(0, os.path.abspath('..'))

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from web_utils import get_session
from logger import logger
from web_auth.auth import authenticate_cookie, AuthToken

from role_based_access.rba_helpers import (
    add_group, remove_group, get_groups,
    assign_user_to_group, remove_user_from_group,
    create_permission, delete_permission, get_permissions,
    assign_permission_to_group, remove_permission_from_group,
    user_has_permission, get_user_permissions
)

router = APIRouter(prefix="/rbac")

# define models for request validation

class GroupCreate(BaseModel):
    name: str

class GroupResponse(BaseModel):
    id: int
    name: str
    user_count: int
    permissions: Optional[List[Dict[str, Any]]] = None

class GroupListResponse(BaseModel):
    success: bool
    groups: Optional[List[GroupResponse]] = None
    message: Optional[str] = None

class UserGroupAssignment(BaseModel):
    user_id: int
    group_id: int

class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    groups: Optional[List[Dict[str, Any]]] = None

class PermissionListResponse(BaseModel):
    success: bool
    permissions: Optional[List[PermissionResponse]] = None
    message: Optional[str] = None

class PermissionGroupAssignment(BaseModel):
    permission_id: int
    group_id: int

class PermissionCheck(BaseModel):
    permission_name: str
    user_id: Optional[int] = None

class GenericResponse(BaseModel):
    success: bool
    message: str
    id: Optional[int] = None

# admin only
def admin_required(token: AuthToken = Depends(authenticate_cookie)):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    
    # Check if user is in the admin group or has admin type
    is_admin = token.user_type == "admin" or "admin" in (token.groups or [])
    if not is_admin:
        return JSONResponse(content={"success": False, "message": "Admin privileges required"}, status_code=403)
    
    return token

# group management endpoints

@router.post("/groups", response_model=GenericResponse)
async def create_group(
    group_data: GroupCreate,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    logger.info(f"User {token.username} is creating group: {group_data.name}")
    result = add_group(session, group_data.name)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=201)
    else:
        return JSONResponse(content=result, status_code=400)

@router.delete("/groups/{group_id}", response_model=GenericResponse)
async def delete_group(
    group_id: int,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    logger.info(f"User {token.username} is deleting group ID: {group_id}")
    result = remove_group(session, group_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=404)

@router.get("/groups", response_model=GroupListResponse)
async def list_groups(
    include_permissions: bool = False,
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    
    logger.info(f"User {token.username} is listing all groups")
    result = get_groups(session, include_permissions)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=500)

# user-group assignment endpoints

@router.post("/users/groups", response_model=GenericResponse)
async def add_user_to_group(
    assignment: UserGroupAssignment,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    
    logger.info(f"User {token.username} is assigning user ID {assignment.user_id} to group ID {assignment.group_id}")
    result = assign_user_to_group(session, assignment.user_id, assignment.group_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

@router.delete("/users/groups", response_model=GenericResponse)
async def remove_user_from_group_endpoint(
    assignment: UserGroupAssignment,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    logger.info(f"User {token.username} is removing user ID {assignment.user_id} from group ID {assignment.group_id}")
    result = remove_user_from_group(session, assignment.user_id, assignment.group_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

# permission management endpoints

@router.post("/permissions", response_model=GenericResponse)
async def create_permission_endpoint(
    permission_data: PermissionCreate,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    logger.info(f"User {token.username} is creating permission: {permission_data.name}")
    result = create_permission(session, permission_data.name, permission_data.description)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=201)
    else:
        return JSONResponse(content=result, status_code=400)

@router.delete("/permissions/{permission_id}", response_model=GenericResponse)
async def delete_permission_endpoint(
    permission_id: int,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    logger.info(f"User {token.username} is deleting permission ID: {permission_id}")
    result = delete_permission(session, permission_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=404)

@router.get("/permissions", response_model=PermissionListResponse)
async def list_permissions(
    include_groups: bool = False,
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    
    logger.info(f"User {token.username} is listing all permissions")
    result = get_permissions(session, include_groups)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=500)

# permission-group assignment endpoints

@router.post("/permissions/groups", response_model=GenericResponse)
async def assign_permission_to_group_endpoint(
    assignment: PermissionGroupAssignment,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    print(assignment)
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    logger.info(f"User {token.username} is assigning permission ID {assignment.permission_id} to group ID {assignment.group_id}")
    result = assign_permission_to_group(session, assignment.permission_id, assignment.group_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

@router.delete("/permissions/groups", response_model=GenericResponse)
async def remove_permission_from_group_endpoint(
    assignment: PermissionGroupAssignment,
    token: AuthToken = Depends(admin_required),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    logger.info(f"User {token.username} is removing permission ID {assignment.permission_id} from group ID {assignment.group_id}")
    result = remove_permission_from_group(session, assignment.permission_id, assignment.group_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

# permission check endpoints

@router.post("/check-permission", response_model=Dict[str, Any])
async def check_user_permission(
    permission_check: PermissionCheck,
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    
    # use the authenticated user's ID if none provided
    user_id = permission_check.user_id
    
    # only admins can check permissions for other users
    if user_id and user_id != token.username:
        is_admin = token.user_type == "admin" or "admin" in (token.groups or [])
        if not is_admin:
            return JSONResponse(content={
                "success": False, 
                "message": "You can only check your own permissions"
            }, status_code=403)
    
    # if no user_id provided, check the current user
    if not user_id:
        # just get it from username for now as a placeholder
        user_id = token.username 
    
    logger.info(f"Checking if user ID {user_id} has permission: {permission_check.permission_name}")
    result = user_has_permission(session, user_id, permission_check.permission_name)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

@router.get("/users/{user_id}/permissions", response_model=Dict[str, Any])
async def get_user_permission_list(
    user_id: int,
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    
    # allow users to see their own permissions or admins to see anyone's
    is_admin = token.user_type == "admin" or "admin" in (token.groups or [])
    if user_id != token.username and not is_admin:
        return JSONResponse(content={
            "success": False, 
            "message": "You can only view your own permissions"
        }, status_code=403)
    
    logger.info(f"Getting permissions for user ID {user_id}")
    result = get_user_permissions(session, user_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

# current user endpoints

@router.get("/me/permissions", response_model=Dict[str, Any])
async def get_my_permissions(
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    """Get all permissions for the current user"""
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token

    user_id = token.username  # this should be the user ID 
    
    logger.info(f"Getting permissions for current user: {token.username}")
    result = get_user_permissions(session, user_id)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)

@router.post("/me/check-permission", response_model=Dict[str, Any])
async def check_my_permission(
    permission_check: PermissionCheck,
    token: AuthToken = Depends(authenticate_cookie),
    session = Depends(get_session)
):
    if not token:
        return JSONResponse(content={"success": False, "message": "Authentication required"}, status_code=401)
    if token is JSONResponse:
        return token
    
    
    user_id = token.username  # fix this later
    
    logger.info(f"Checking if current user has permission: {permission_check.permission_name}")
    result = user_has_permission(session, user_id, permission_check.permission_name)
    
    if result["success"]:
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content=result, status_code=400)