"""
Author: Anthony Silva
Date: 2/14/25
File: ldap_helpers.py
Purpose: helpers for processing ldap conections
"""
import json
from config import settings
from logger import logger
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import LDAPException, LDAPBindError

class LDAPConnection():
    """
    Class to handle LDAP connections
    """
    def __init__(self):
        try:
            self.server = Server(f"ldap://{settings.LDAP_SERVER}", port=int(settings.LDAP_PORT), get_info=ALL)
            self.connection = Connection(self.server, user=settings.LDAP_BIND_DN, password=settings.LDAP_BIND_PASSWORD.get_secret_value(), auto_bind=True)
            if not self.connection.bind():
                raise LDAPBindError("Failed to bind to LDAP server, check credentials")
        except LDAPException as e:
            logger.error(f"LDAP connection error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise

    def user_authenticate(self, username, password):
        """
        Authenticate a user against the LDAP server
        """
        try:
            self.connection.search(settings.LDAP_USER_DN, f'({settings.LDAP_USER_ATTRIBUTE}={username})', attributes=['cn'])
            if self.connection.entries:
                user_dn = self.connection.entries[0].entry_dn
                user_connection = Connection(self.server, user=user_dn, password=password)
                if user_connection.bind():
                    logger.info(f"User {username} authenticated successfully via LDAP")
                    return True

                else:
                    logger.warning(f"User {username} authentication failed")
                    return False
            else:
                logger.warning(f"User {username} not found in LDAP")
                return False
        except LDAPBindError as e:
            logger.error(f"LDAP bind error: {e}")
            return False

    def query_user(self, username):
        """
        Query the LDAP server for a user, and the groups they belong to.
        """
        self.connection.search(settings.LDAP_USER_DN, f'({settings.LDAP_USER_ATTRIBUTE}={username})', attributes=['cn', 'uid'])
        if self.connection.entries:
            user_info = {}
            user_info['username'] = self.connection.entries[0].uid.value
            self.connection.search(settings.LDAP_GROUP_DN, f'(&(objectClass=groupOfNames)(member={self.connection.entries[0].entry_dn}))', attributes=['cn'])
            groups = [entry.cn.value for entry in self.connection.entries]
            user_info['groups'] = groups
            user_info['user_type'] = 'admin' if 'admin' in groups else 'user'
            return user_info
        else:
            return None
        
    def get_all_users(self):
        """
        Query the LDAP server for all users
        """
        self.connection.search(settings.LDAP_USER_DN, '(objectClass=person)', attributes=['cn', 'mail'])
        if self.connection.entries:
            return self.connection.entries
        else:
            return None
    
    def query_groups_and_users(self):
        """
        Get all groups and users from the LDAP server. For each group, get the members of the group. Returns data as JSON.
        """
        self.connection.search(settings.LDAP_GROUP_DN, '(objectClass=groupOfNames)', attributes=['cn', 'member'])
        groups = []
        for entry in self.connection.entries:
            group = {}
            group['name'] = entry.cn.value
            group['members'] = []
            for member in entry.member:
                self.connection.search(settings.LDAP_USER_DN, f'(uid={member})', attributes=['cn'])
                if self.connection.entries:
                    group['members'].append(self.connection.entries[0].cn.value)
            groups.append(group)
        json_output = json.dumps(groups, indent=4)
        return json_output