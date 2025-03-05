"""
Collection of helpers for doign RBA on the frontend
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict, Any, Union
from database.models import User, Group, Permission

def add_group(session: Session, name: str) -> Dict[str, Any]:
    try:
        # check if group with the same name already exists
        existing_group = session.query(Group).filter(Group.name == name).first()
        if existing_group:
            return {"success": False, "message": f"Group '{name}' already exists"}
        
        # create and add the new group
        new_group = Group(name=name)
        session.add(new_group)
        session.commit()
        
        return {"success": True, "message": f"Group '{name}' created successfully", "group_id": new_group.id}
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}

def remove_group(session: Session, group_id: int) -> Dict[str, Any]:
    try:
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            return {"success": False, "message": f"Group with ID {group_id} not found"}
        
        # remove the group
        session.delete(group)
        session.commit()
        
        return {"success": True, "message": f"Group '{group.name}' removed successfully"}
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}

def get_groups(session: Session, include_permissions: bool = False) -> Dict[str, Any]:
    try:
        groups = session.query(Group).all()
        
        result = []
        for group in groups:
            group_data = {
                "id": group.id,
                "name": group.name,
                "user_count": len(group.users)
            }
            
            if include_permissions:
                group_data["permissions"] = [
                    {"id": p.id, "name": p.name, "description": p.description}
                    for p in group.permissions
                ]
            
            result.append(group_data)
            
        return {"success": True, "groups": result}
    
    except SQLAlchemyError as e:
        return {"success": False, "message": f"Database error: {str(e)}"}

def assign_user_to_group(session: Session, user_id: int, group_id: int) -> Dict[str, Any]:
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "message": f"User with ID {user_id} not found"}
        
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            return {"success": False, "message": f"Group with ID {group_id} not found"}
        
        # check if user is already in the group
        if group in user.groups:
            return {"success": False, "message": f"User '{user.username}' is already in group '{group.name}'"}
        
        # add user to group
        user.groups.append(group)
        session.commit()
        
        return {
            "success": True, 
            "message": f"User '{user.username}' assigned to group '{group.name}' successfully"
        }
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}

def remove_user_from_group(session: Session, user_id: int, group_id: int) -> Dict[str, Any]:
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "message": f"User with ID {user_id} not found"}
        
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            return {"success": False, "message": f"Group with ID {group_id} not found"}
        
        # check if user is in the group
        if group not in user.groups:
            return {"success": False, "message": f"User '{user.username}' is not in group '{group.name}'"}
        
        # remove user from group
        user.groups.remove(group)
        session.commit()
        
        return {
            "success": True, 
            "message": f"User '{user.username}' removed from group '{group.name}' successfully"
        }
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}


def create_permission(session: Session, name: str, description: Optional[str] = None) -> Dict[str, Any]:
    try:
        existing_permission = session.query(Permission).filter(Permission.name == name).first()
        if existing_permission:
            return {"success": False, "message": f"Permission '{name}' already exists"}
        
        new_permission = Permission(name=name, description=description)
        session.add(new_permission)
        session.commit()
        
        return {
            "success": True, 
            "message": f"Permission '{name}' created successfully",
            "permission_id": new_permission.id
        }
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}


def delete_permission(session: Session, permission_id: int) -> Dict[str, Any]:
    try:
        permission = session.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            return {"success": False, "message": f"Permission with ID {permission_id} not found"}
        
        session.delete(permission)
        session.commit()
        
        return {"success": True, "message": f"Permission '{permission.name}' deleted successfully"}
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}


def get_permissions(session: Session, include_groups: bool = False) -> Dict[str, Any]:
    try:
        permissions = session.query(Permission).all()
        
        result = []
        for permission in permissions:
            permission_data = {
                "id": permission.id,
                "name": permission.name,
                "description": permission.description
            }
            
            if include_groups:
                permission_data["groups"] = [
                    {"id": g.id, "name": g.name}
                    for g in permission.groups
                ]
            
            result.append(permission_data)
            
        return {"success": True, "permissions": result}
    
    except SQLAlchemyError as e:
        return {"success": False, "message": f"Database error: {str(e)}"}


def assign_permission_to_group(session: Session, permission_id: int, group_id: int) -> Dict[str, Any]:
    try:
        permission = session.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            return {"success": False, "message": f"Permission with ID {permission_id} not found"}
        
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            return {"success": False, "message": f"Group with ID {group_id} not found"}
        
        # check if permission is already assigned to the group
        if permission in group.permissions:
            return {
                "success": False, 
                "message": f"Permission '{permission.name}' is already assigned to group '{group.name}'"
            }
        
        # assign permission to group
        group.permissions.append(permission)
        session.commit()
        
        return {
            "success": True, 
            "message": f"Permission '{permission.name}' assigned to group '{group.name}' successfully"
        }
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}


def remove_permission_from_group(session: Session, permission_id: int, group_id: int) -> Dict[str, Any]:
    try:
        permission = session.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            return {"success": False, "message": f"Permission with ID {permission_id} not found"}
        
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            return {"success": False, "message": f"Group with ID {group_id} not found"}
        
        # Check if permission is assigned to the group
        if permission not in group.permissions:
            return {
                "success": False, 
                "message": f"Permission '{permission.name}' is not assigned to group '{group.name}'"
            }
        
        # Remove permission from group
        group.permissions.remove(permission)
        session.commit()
        
        return {
            "success": True, 
            "message": f"Permission '{permission.name}' removed from group '{group.name}' successfully"
        }
    
    except SQLAlchemyError as e:
        session.rollback()
        return {"success": False, "message": f"Database error: {str(e)}"}

def user_has_permission(session: Session, user_id: int, permission_name: str) -> Dict[str, Any]:
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "message": f"User with ID {user_id} not found"}
        
        # loop through that user's group perms
        for group in user.groups:
            for permission in group.permissions:
                if permission.name == permission_name:
                    return {
                        "success": True, 
                        "has_permission": True,
                        "message": f"User '{user.username}' has permission '{permission_name}' through group '{group.name}'"
                    }
        
        return {
            "success": True, 
            "has_permission": False,
            "message": f"User '{user.username}' does not have permission '{permission_name}'"
        }
    
    except SQLAlchemyError as e:
        return {"success": False, "message": f"Database error: {str(e)}"}

def get_user_permissions(session: Session, user_id: int) -> Dict[str, Any]:
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "message": f"User with ID {user_id} not found"}
        
        # get all unique permissions the user has across all groups
        permissions_set = set()
        permissions_data = []
        
        for group in user.groups:
            for permission in group.permissions:
                if permission.id not in permissions_set:
                    permissions_set.add(permission.id)
                    permissions_data.append({
                        "id": permission.id,
                        "name": permission.name,
                        "description": permission.description,
                        "via_group": group.name
                    })
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username
            },
            "permissions": permissions_data
        }
    
    except SQLAlchemyError as e:
        return {"success": False, "message": f"Database error: {str(e)}"}