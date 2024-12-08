import asyncio
import json
import os
from typing import List
from backend.NodeAPI import NodeAPI
import logging


# set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

file_handler = logging.FileHandler("aggregator.log")
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

os.makedirs("aggregator_logs", exist_ok=True)

# current nodes
nodes = ["http://192.168.14.15", "http://192.168.14.16"]
# need to update as more are created

node_uris = [NodeAPI(node_uri) for node_uri in nodes]

# async function to fetch node data from all nodes
async def fetch_node_data():
	aggregated_data = {
		"individual_containers": [],	# data for individual nodes
		"combined_averages": []			# data averages for all nodes
	}

	tasks = []
	for node_api in node_uris:
		tasks.append(asyncio.create_task(fetch_node_data_helper(node_api)))

	# wait for all tasks to finish
	# handle exceptions to mitigate halts
	results = await asyncio.gather(*tasks, return_exceptions=True)
	for result in results:
		if isinstance(result, Exception):
			logger.error(f"Error fetching data from node {node_api}: {result}")
			continue

	# aggregate fetched data
	# TODO: total_uptime, fix individual environments
	cpu_percent = 0
	memory = 0
	disk = 0
	max_cpu = 0
	max_memory = 0
	max_disk = 0
	environment = 0

	total_cpu_percent = 0
	total_memory = 0
	total_disk = 0
	total_max_cpus = 0
	total_max_memory = 0
	total_max_disk = 0
	total_valid_nodes = 0
	total_environments = 0

	for result in results:
		if result:
			# aggregate node-level metrics, 0 if missing
			cpu_percent = result.get("cpu_percent", 0)
			memory = result.get("memory", 0)
			disk = result.get("disk", 0)
			max_cpu = result.get("max_cpus", 0)
			max_memory = result.get("max_memory", 0)
			max_disk = result.get("max_disk", 0)

			total_cpu_percent += cpu_percent
			total_memory += memory
			total_disk += disk
			total_max_cpus += max_cpu
			total_max_memory += max_memory
			total_max_disk += max_disk

			total_valid_nodes += 1

			# aggregate environment-level metrics		
			total_environments += len(result.get("environments",[]))

			for environment in result.get("environments", []):
				containers = environment.get("containers", [])
				if isinstance(containers, list):
					aggregated_data["individual_containers"].extend(containers)
				else:
					logger.warning(f"Error: Expected containers list, but got {type(containers)}: {containers}")
	
	# find averages for valid nodes
	if total_valid_nodes > 1:
		aggregated_data["combined_averages"] = {
			"cpu_percent": total_cpu_percent/total_valid_nodes,
			"memory": total_memory/total_valid_nodes,
			"disk": total_disk/total_valid_nodes,
			"max_cpus": total_max_cpus/total_valid_nodes,
			"max_memory": total_max_memory/total_valid_nodes,
			"max_disk": total_max_disk/total_valid_nodes
		}

	elif total_valid_nodes == 1:
		aggregated_data["combined_averages"] = {
			"cpu_percent": total_cpu_percent,
			"memory": total_memory,
			"disk": total_disk,
			"max_cpus": total_max_cpus,
			"max_memory": total_max_memory,
			"max_disk": total_max_disk
		}

	else:
		# handle all invalid node data
		aggregated_data["combined_averages"] = {
			"cpu_percent": None,
			"memory": None,
			"disk": None,
			"max_cpus": None,
			"max_memory": None,
			"max_disk": None
		}

	aggregated_data["node_count"] = total_valid_nodes
	aggregated_data["environments_count"] = total_environments

	return aggregated_data
	

# helper to fetch individual node data
async def fetch_node_data_helper(node_api: NodeAPI):
	try:
		# call get_node()
		node_data = await node_api.get_node()
		return node_data
	
	except Exception as e:
		logger.error(f"Error fetching data from node {node_api.uri}: {str(e)}")
		return None
	
# aggregate data to json conversion
# saves individual container data, then data averages
def convert_aggregated_data(aggregated_data) -> str:
	try:
		json_data = json.dumps(aggregated_data, indent=4)
		return json_data
	except Exception as e:
		logger.error(f"Error converting aggregated data to JSON: {e}")
		return "Error converting aggregated data to JSON"
	
# periodic node polling function
async def periodic_polling(interval: int = 60):		# change to desired period frequency
	while True:
		# fetch aggregated data from all nodes
		aggregated_data = await fetch_node_data()
		logger.info(f"Data Aggregate: {aggregated_data}")

		# process aggregated data
		json_data = convert_aggregated_data(aggregated_data)
		path = os.path.join("aggregator_logs", "aggregated_data.json")
		with open("aggregator_logs\\aggregated_data.json", "w") as json_file:
			json_file.write(json_data)
		logger.info("Aggregated data exported to aggregator_logs\\aggregated_data.json")

		# wait until next interval reached
		await asyncio.sleep(interval)