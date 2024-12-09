import json
import logging
import os
from typing import Dict, List, Any
from logging.handlers import RotatingFileHandler

class QueryParser:
	# constructor
	def __init__(self, input_file: str):
		self.input_file = input_file
		self.output_file = "parsed_queries/parsed_queries.json"

		# set up logging
		self.logger = logging.getLogger(__name__)
		self.logger.setLevel(logging.INFO)
		formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

		# manage ever-growing log files, 5MB
		file_handler = RotatingFileHandler("query_parser.log", maxBytes=5242880, backupCount=2)
		file_handler.setFormatter(formatter)
		self.logger.addHandler(file_handler)

		# verify output directory
		try:
			os.makedirs(os.path.dirname(self.output_file), exist_ok=True)
		except Exception as e:
			self.logger.error(f"Failed creating parsed query output directory: {e}")
			raise


	# parse and map single line
	def parse_line(self, line: str) -> Dict[str, Any]:
		try:
			# split the query
			sections = line.strip().split(",")
			if len(sections) < 4:
				raise ValueError(f"Invalid query format: {line}")
			
			# check for required fields (action, container_name)
			action = sections[0].strip()
			container_name = sections[1].strip()

			if len(sections) > 2:
				template = sections[2].strip()
			else:
				template = None
				self.logger.warning(f"Query template field is missing in: {line}")

			if len(sections) > 3:
				template_style = sections[3].strip()
				self.logger.warning(f"Query template_style is missing in: {line}")
			else:
				template_style = None

			if not action:
				raise ValueError(f"Missing required query action field: {line}")
			if not container_name:
				raise ValueError(f"Missing required query container_name field: {line}")

			# return with parameters if given
			if len(sections) > 4:
				query = {
					"action": action,
					"container_name": container_name,
					"template": template,
					"template_style": template_style,
					"extra_parameters": [parameter.strip() for parameter in sections[4:]]
				}
			
			# else return without parameters
			else:
				query = {
					"action": action,
					"container_name": container_name,
					"template": template,
					"template_style": template_style,
					"extra_parameters": []
				}
			
			return query
				
		except Exception as e:
			self.logger.error(f"Error in line {line}: {e}")
			return {}
	

	# calls parse_line for each line of queries given
	def parse_queries(self) -> List[Dict[str, Any]]:
		if not self.input_file:
			self.logger.error("Undefined input file.")
			return []
		
		try:
			with open(self.input_file, "r") as ifile:
				lines = ifile.readlines()

			if not lines:
				self.logger.warning(f"Input file {self.input_file} is empty.")
				return []

			parsed = []
			for line in lines:
				if line.strip():
					parsed_query = self.parse_line(line)
					if parsed_query:
						parsed.append(parsed_query)

			if not parsed:
				self.logger.warning(f"No valid queries in input file {self.input_file}")

			return parsed

		except FileNotFoundError:
			self.logger.error(f"Input file {self.input_file} not found.")
			return []
		except Exception as e:
			self.logger.error(f"Error reading input file: {e}")
			return []


	# export passed query to json
	def queries_to_json(self, parsed_queries: List[Dict[str, Any]]) -> None:
		if not parsed_queries:
			self.logger.warning("No valid queries to export.")
			return

		try:
			if not self.output_file:
				self.logger.error("Output file not given.")
				raise ValueError("Output file not given.")

			with open(self.output_file, "w") as outfile:
				json.dump(parsed_queries, outfile, indent=4)

			self.logger.info(f"Successfully parsed queries. Saved to {self.output_file}")

		except PermissionError:
			self.logger.error(f"Invalid permission to write to {self.output_file}.")
			
		except Exception as e:
			self.logger.error(f"Error exporting to JSON: {e}")


	# driver function
	def begin_parser(self) -> None:
		try:
			parsed_queries = self.parse_queries()
			if parsed_queries:
				self.queries_to_json(parsed_queries)
			else:
				self.logger.info("No queries processed.")

		except Exception as e:
			self.logger.error(f"Unexpected error during parsing process: {e}")