"""
Author: Anthony Silva
Date: 2/13/25
File: containers.py
Description: helpers for serving, storage, and editing of container txts
"""

import os

BASE_DIR = "./container_images/"

def add_container(name : str, content : str) -> bool:
    """
    take the name of a file and its contents and add it to the storage
    """
    try:
        file = open(BASE_DIR + name, 'w')
        file.write(content)
        file.close()
        print("Added container")
        return True
    except:
        print("Failed to add container.")
        return False
    
def delete_container(name : str) -> bool:
    """
    delete a container txt file forever!
    """
    try:
        os.remove(BASE_DIR + name)
        return True
    except:
        print("Issue in container deletion.")
        return False
        

def edit_container(name : str, content : str) -> bool:
    """
    basically delete everything in the container file and then write it back
    same as add container
    """
    return add_container(name, content)

def fetch_containers() -> list:
    """
    get all of the containers in the container dir
    """
    try:
        containers = os.listdir(BASE_DIR)
        
        # add some error checking here maybe if a file is here that shouldnt be
        file = None
        output = []
        for container in containers:
            data = {}
            data['name'] = container

            file = open(BASE_DIR + container, 'r')
            data['content'] = file.read()
            file.close()

            output.append(data)
        
        return output
    except Exception as e:
        print(f"Exception occurred: {e}")
        if file:
            file.close()
        return []