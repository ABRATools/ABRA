"""
Author: Anthony Silva
Date: 2/14/25
File: ldap_helpers.py
Purpose: helpers for processing ldap conections
"""

# imports
from ldap3 import Server, Connection, ALL

def LDAPAuth(domain : str, username : str, password : str) -> bool:
    """
    Check the ldap if the user is valid, return true
    Source: https://github.com/RetributionByRevenue/LDAP3-fastapi-auth-simple/blob/main/demo-auth-working.py
    """
    authenticated = False

    try:
        server = Server(f"ldaps://{domain}", get_info=ALL) # maybe ldap://
        connection = Connection(server, user=f"{username}@{domain}", password=password, auto_bind=True)

        connection.bind()
        if connection.result['result'] == 0:
            authenticated = True
            print("Auth successful.")
    except:
        print("Auth failed.")
    finally:
        try: 
            connection.unbind()
        except:
            ''
    
    return authenticated


def LDAPGroups() -> list:
    """
    returns 
    """

    pass