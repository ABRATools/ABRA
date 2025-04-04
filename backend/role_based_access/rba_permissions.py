"""
Anthony Silva
3/25/25
Link permissions to specific routes
"""

import database as db
from typing import Dict, List, Optional, Set, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.models import Permission, Group, User
from logger import logger

# route - permission mapping
ROUTE_PERMISSIONS = {
    "/display/systems": "view:systems",
    "/display/systems/:systemId": "view:system_detail",
    "/display/systems/:systemId/nodes/:nodeId": "view:node_detail",
    "/display/systems/:systemId/nodes/:nodeId/environments/:envId": "view:environment_detail",
    
    "/config/systems": "config:systems",
    "/config/systems/:systemId": "config:system_detail",
    "/config/systems/:systemId/nodes/:nodeId": "config:node_detail",
    "/config/systems/:systemId/nodes/:nodeId/environments/:envId": "config:environment_detail", 
    "/config/profiles": "config:profiles",
    "/config/containers": "config:containers",
    
    "/users": "admin:users",
    "/access": "admin:access",
    "/audit": "admin:audit",
    
    "/debug/websocket": "admin:debug"
}

def initialize_default_permissions(session: Session) -> None:
    """
    Initialize the default permissions in the database based on ROUTE_PERMISSIONS
    """
    try:
        existing_permissions = {p.name: p for p in session.query(Permission).all()}
        
        for route, perm_name in ROUTE_PERMISSIONS.items():
            if perm_name not in existing_permissions:
                logger.info(f"Creating permission {perm_name} for route {route}")
                new_permission = Permission(
                    name=perm_name,
                    description=f"Permission to access {route}"
                )
                session.add(new_permission)
        
        # create admin permission that grants access to everything
        if "admin:all" not in existing_permissions:
            logger.info("Creating admin:all permission")
            admin_all = Permission(
                name="admin:all",
                description="Full administrative access to all routes"
            )
            session.add(admin_all)
            
        session.commit()
        logger.info("Default permissions initialized successfully")
    
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Error initializing default permissions: {str(e)}")
        raise

def setup_default_groups(session: Session) -> None:
    """
    Setup default groups with appropriate permissions
    """
    try:
        # get all permissions
        all_permissions = session.query(Permission).all()
        admin_permission = session.query(Permission).filter(Permission.name == "admin:all").first()
        
        # define default groups with their permissions
        default_groups = {
            "admin": [admin_permission] if admin_permission else all_permissions,
            "viewer": [p for p in all_permissions if p.name.startswith("view:")],
            "configurator": [p for p in all_permissions if p.name.startswith("view:") or p.name.startswith("config:")],
        }
        
        # create or update the groups
        for group_name, permissions in default_groups.items():
            group = session.query(Group).filter(Group.name == group_name).first()
            
            if not group:
                logger.info(f"Creating group: {group_name}")
                group = Group(name=group_name)
                session.add(group)
                session.flush()  # Flush to get the group ID
            
            # clear existing permissions for this group
            group.permissions = []
            
            # add the appropriate permissions
            for permission in permissions:
                if permission not in group.permissions:
                    group.permissions.append(permission)
        
        session.commit()
        logger.info("Default groups setup successfully")
    
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Error setting up default groups: {str(e)}")
        raise

def check_route_permission(session: Session, username: str, route: str) -> Dict[str, Any]:
    """
    Check if a user has permission to access a specific route
    """
    try:
        # sanitize route and normalize parameters
        sanitized_route = sanitize_route(route)
        
        # get the required permission for this route
        required_permission = ROUTE_PERMISSIONS.get(sanitized_route)
        
        if not required_permission:
            # no specific permission needed for this route
            return {
                "success": True,
                "has_permission": True,
                "message": f"No specific permission required for route: {route}"
            }

        # get the user
        user = session.query(User).filter(User.username == username).first()
        if not user:
            return {
                "success": False,
                "message": f"User not found: {username}"
            }
        
        # check if user has admin:all permission
        for group in user.groups:
            for permission in group.permissions:
                if permission.name == "admin:all":
                    return {
                        "success": True,
                        "has_permission": True,
                        "message": f"User has admin:all permission"
                    }
                    
                # check for exact permission match
                if permission.name == required_permission:
                    return {
                        "success": True, 
                        "has_permission": True,
                        "message": f"User has required permission: {required_permission}"
                    }
        
        # if we get here, user doesn't have the required permission
        return {
            "success": True,
            "has_permission": False,
            "message": f"User lacks required permission: {required_permission} for route: {route}"
        }
    
    except SQLAlchemyError as e:
        return {
            "success": False,
            "message": f"Database error: {str(e)}"
        }
    
def get_accessible_routes(session: Session, username: str, auth_source, ldap_conn) -> Dict[str, Any]:
    """
    Get all routes that a user has permission to access
    """

    try:
        user_data = None
        # get all permissions for this user
        user_permissions = set()
        admin_access = False

        if auth_source == "ldap":
            if ldap_conn is None:
                raise ValueError("LDAP connection not initialized")
            user_data = ldap_conn.query_user(username)
            print(user_data)
            if user_data is None:
                logger.error(f"User data not found in LDAP: {username}")
                return {
                    "success": False,
                    "message": f"User not found in LDAP: {username}"
                }
        elif auth_source == "database":
            user_data = db.get_user_info(session, username)
            if user_data is None:
                logger.error(f"User data not found in database: {username}")
                return {
                    "success": False,
                    "message": f"User data not found in database: {username}"
                }
        else:
            return {
                "success": False,
                "message": f"Unsupported authentication source: {auth_source}"
            }
        
        for group in user_data.get('groups'):
            print(group)
            group_db_obj = db.get_or_add_group(session, group)
            if group_db_obj is None:
                logger.error(f"Group not found in database: {group}")
                return {
                    "success": False,
                    "message": f"Group not found in database: {group}"
                }
            # add group permissions to user permissions
            for permission in group_db_obj.permissions:
                user_permissions.add(permission.name)
                if permission.name == "admin:all":
                    admin_access = True
        
        accessible_routes = []
        
        # if user has admin access, they can access all routes
        if admin_access:
            accessible_routes = list(ROUTE_PERMISSIONS.keys())
        else:
            # otherwise, check each route
            for route, permission in ROUTE_PERMISSIONS.items():
                if permission in user_permissions:
                    accessible_routes.append(route)
        
        return {
            "success": True,
            "routes": accessible_routes,
            "permissions": list(user_permissions)
        }
    
    except SQLAlchemyError as e:
        return {
            "success": False,
            "message": f"Database error: {str(e)}"
        }

def sanitize_route(route: str) -> str:
    """
    Sanitize and normalize a route to match our permission mapping
    e.g., /display/systems/123/nodes/456 -> /display/systems/:systemId/nodes/:nodeId
    """
    # get path segments
    parts = route.strip('/').split('/')
    
    # replace numeric or UUID segments with parameter placeholders
    for i in range(len(parts)):
        # if this part is potentially a parameter (numeric or UUID-like)
        if i > 0 and parts[i-1] in ["systems", "nodes", "environments"]:
            if parts[i-1] == "systems":
                parts[i] = ":systemId"
            elif parts[i-1] == "nodes":
                parts[i] = ":nodeId"
            elif parts[i-1] == "environments":
                parts[i] = ":envId"
    
    # reconstruct the normalized path
    normalized = '/' + '/'.join(parts)
    
    # handle special case for root routes of sections
    if normalized not in ROUTE_PERMISSIONS and normalized + "s" in ROUTE_PERMISSIONS:
        normalized = normalized + "s"
    
    return normalized