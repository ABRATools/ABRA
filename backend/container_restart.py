from podman import PodmanClient
from pydantic import BaseModel
import psutil
import os
from typing import List, Dict
from datetime import datetime
from backend.NodeAPI.classes import User, Environment, Node, Task, Notification
import json
from fastapi import HTTPException

podman_client = PodmanClient(base_url="unix:///run/podman/podman.sock")

log = "container_restarts.json"

tasks: List[Task] = []
notifications: List[Notification] = []
nodes: List[Node] = []


# return status for each environment field
def get_container_status():
	status = []
	for node in nodes:
		for environment in node.environments:
			status.append(
				{
					"environment_name": environment.name,
					"status": environment.status,
					"cpu_percent": environment.cpu_percent,
					"memory": environment.memory,
					"disk": environment.disk,
					"max_cpus": environment.max_cpus,
					"max_memory": environment.max_memory,
					"max_disk": environment.max_disk
				}
			)
	
	return {"status": status}


# start container
def start_container(container_name: str):
	try:
		with podman_client as client:
			container = client.containers.get(container_name)

			if not container:
				raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
			
			container.start()
			
			return {
				"status": "success",
				"message": f"Successfully started container {container_name}."
			}
	
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Error: {e}.")


# restart contianer
def restart_container(container_name: str):
	try:
		with podman_client as client:
			container = client.containers.get(container_name)

			if not container:
				raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
			
			container.restart()
			
			return {
				"status": "success",
				"message": f"Successfully restarted container {container_name}."
			}
	
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Error: {e}.")


# fetch restart container logs
def get_restart_logs():
	if os.path.exists(log):
		with open(log, "r") as file:
			logs = json.load(file)
		
		return {"logs": logs}

	return {"logs": []}


# get resource usage stats for container
def get_container_stats(container_name: str):
	try:
		for node in nodes:
			for environment in node.environments:
				if environment.name == container_name:
					statistics = {
						"name": environment.name,
						"status": environment.status,
						"cpu_percent": environment.cpu_percent,
						"memory": environment.memory,
						"disk": environment.disk,
						"max_cpus": environment.max_cpus,
						"max_memory": environment.max_memory,
						"max_disk": environment.max_disk,
						"created": environment.uptime
					}

					return {
						"container_name": container_name,
						"stats": statistics
					}
					
		raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
	
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Error: {e}")


# get container names and statuses
def get_all_containers() -> List[Dict]:
	data = []
	for node in nodes:
		for environment in node.environments:
			data.append(
				{
                "name": environment.name,
                "status": environment.status,
                "cpu_percent": environment.cpu_percent,
                "memory": environment.memory,
                "disk": environment.disk,
                "max_cpus": environment.max_cpus,
                "max_memory": environment.max_memory,
                "max_disk": environment.max_disk,
                "created": environment.uptime
				}
			)
	
	return data


# terminate container
def stop_container(container_name: str):
	try:
		with podman_client as client:
			container = client.containers.get(container_name)

			if not container:
				raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
			
			container.stop()
			
			return {
				"status": "success",
				"message": f"Successfully stopped container {container_name}."
			}
	
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Error: {e}.")


# get host node health
def get_node_health() -> Dict:
    node_health = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "cpu_count": psutil.cpu_count(),
        "memory_total": f"{psutil.virtual_memory().total / (1073741824):.2f} GB",
        "disk_total": f"{psutil.disk_usage('/').total / (1073741824):.2f} GB",
    }

    return {"node_health": node_health}


# get individual container log
def get_container_logs(container_name: str):
	try:
		with podman_client as client:
			container = client.containers.get(container_name)

			if not container:
				raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
			
			logs = container.logs(tail=10, stream=False)
			longs = logs.decode("utf-8")
			
			return {
				"container_name": container_name,
				"logs": logs
			}
	
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Error: {e}.")


# container health check
def perform_health_check(container_name: str):
    try:
        for node in nodes:
            for environment in node.environments:
                if environment.name == container_name:
                    # Simulate a health check (you could expand this with actual checks)
                    health_status = "healthy" if environment.cpu_percent < 80 else "unhealthy"
                    return {"status": health_status, "message": f"Container {container_name} is {health_status}."}

        raise HTTPException(status_code=404, detail=f"Container {container_name} not found.")
	
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Health check failed for {container_name}: {e}")


# return host node uptime
def get_node_uptime():
    uptime = os.popen("uptime -p").read().strip()

    return {
		"uptime": uptime
	}


# log task actions
def log_task(message: str):
    task = Task(
        name="Container Action",
        description=message,
        start_time=datetime.now().isoformat(),
        completed=True,
        status="success"
    )

    tasks.append(task)


# log user notification
def log_notification(user: User, message: str):
    notification = Notification(
        name="Container Action Notification",
        description=message,
        date_created=datetime.now().isoformat(),
        is_read=False,
        is_active=True,
        users=[user]
    )

    notifications.append(notification)


# reboot the container
def reboot_container(container_name: str):
    try:
        for node in nodes:
            for environment in node.environments:
                if environment.name == container_name:
                    # stop the container
                    environment.status = "rebooting"
                    log_task(f"Rebooted container {container_name} on node {node.name}")

                    # restart the container
                    environment.status = "running"
                    return {
						"status": "success",
						"message": f"Container {container_name} rebooted."
					}

        raise HTTPException(status_code=404, detail=f"Could not find container {container_name}.")
	
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unsuccessfully rebooted container {container_name}: {e}")