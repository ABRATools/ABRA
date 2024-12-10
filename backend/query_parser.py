import json
import logging
import os
from datetime import datetime
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



# validates structure and fields of json outputs
class JSONValidator:
	# constructor
	def __init__(self, schemas: Dict[str, Dict[str, type]]):
		self.schemas = schemas
		self.report = []
		self.logger = logging.getLogger(__name__)
		self.logger.setLevel(logging.INFO)

		formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
		file_handler = RotatingFileHandler("json_validator.log", maxBytes=5242800, backupCount=2)
		file_handler.setFormatter(formatter)
		self.logger.addHandler(file_handler)

	
	# validate single JSON entry using correct schema
	def validate_entry(self, entry: Dict[str, Any]) -> bool:
		action = entry.get("action")
		if not action:
			self.report.append(f"Invalid or missing action in entry: {entry}")
			self.logger.warning(f"Invalid or missing action in entry: {entry}")
			return False
		
		if action not in self.schemas:
			self.report.append(f"Invalid or missing action in entry: {entry}")
			self.logger.warning(f"Invalid or missing action in entry: {entry}")
			return False
		
		schema = self.schemas[action]
		is_valid = True

		for field, type in schema.items():
			if field not in entry:
				self.report.append(f"Missing field {field} in entry: {entry}")
				self.logger.warning(f"Missing field {field} in entry: {entry}")
				is_valid = False

			elif not isinstance(entry[field], type):
				self.report.append(f"Incorrect type for {field} in entry: {entry}")
				self.logger.warning(f"Incorrect type for {field} in entry: {entry}")
				is_valid = False

		# verify extra fields
		for field in entry.keys():
			if field not in schema:
				self.report.append(f"Unexpected field {field} in entry: {entry}")
				self.logger.warning(f"Unexpected field {field} in entry: {entry}")

		return is_valid
		
	
	# validates structure of each entry item in json data
	def validate_json_structure(self, data: List[Dict]) -> bool:
		for item in data:
			for field, type in self.schemas.items():
				if field not in item:
					self.report.append(f"Validation error: Missing {field} in {item}")
					return False

				if not isinstance(item[field], type):
					self.report.append(f"Validation error: Field '{field}' in entry {item} is not of type {type.__name__}")
					return False
				
		return True
	

	# validate against schema
	def validate(self, input_file: str) -> None:
		if not os.path.exists(input_file):
			self.logger.error(f"Input file {input_file} could not be found.")
			return
		
		try:
			with open(input_file, "r") as ifile:
				data = json.load(ifile)

			if not isinstance(data, list):
				self.logger.error("JSON structure invalid, expected type list.")
				return
			
			if self.validate_json_structure(data):
				self.logger.info(f"Successfully validated {input_file}.")
				pass
			else:
				self.logger.error(f"Validation failed for file '{input_file}'.")
				pass

		except json.JSONDecodeError as e:
			self.logger.error(f"Error decoding JSON file: {e}")
			pass
		
		except Exception as e:
			self.logger.error(f"Error occured during validation: {e}")
			pass

	
	# generate detailed validation report
	def generate_JSON_validation_report(self, report_file: str="validation_report.log") -> None:
		try:
			with open(report_file, "w") as ofile:
				if self.report:
					ofile.write("\n".join(self.report))
				
				else:
					ofile.write("Entries passed validation.\n")
			
			self.logger.info(f"JSON validation report saved to {report_file}")

		except Exception as e:
			self.logger.error(f"Error writing JSON validation report: {e}")



schemas = {
	# create container schema
    "create": {
        "action": str,
        "container_name": str,
        "template": str,
        "template_style": str,
        "extra_parameters": list
    },

	# start container schema
    "start": {
        "action": str,
        "container_name": str,
        "extra_parameters": list
    },

	# stop container schema
    "stop": {
        "action": str,
        "container_name": str,
        "extra_parameters": list
    },

	# delete container schema
    "delete": {
        "action": str,
        "container_name": str,
        "extra_parameters": list
    },
	
	# update container schema
    "update": {
        "action": str,
        "container_name": str,
        "template": str,
        "extra_parameters": list
    }
}

# query_validator = JSONValidator(schemas)

# example usage
example_json_data = [
	# create container
	{
		"action": "create",
		"container_name": "test_container",
		"template": "ubuntu",
		"template_style": "alpine",
		"extra_parameters": ["--flag"]
	},

	# start container
	{
		"action": "start",
		"container_name": "test_container",
		"extra_parameters": []
	},

	# other action on container
	{
		"action": "other",
		"container_name": "test_container",
		"extra_parameters": []
	}
]



class ValidationReporter:
	# constructor
	def __init__(self, report_dir: str = "reports"):
		self.report_dir = report_dir

		try:
			if not os.path.exists(report_dir):
				os.makedirs(report_dir)
			
		except OSError as e:
			raise RuntimeError(f"Error creating directory {report_dir}: {e}")

	
	# generates validation reoprt based on validation results
	def generate_report(self, input_file: str, results: List[Dict[str, Any]]) -> Dict[str, Any]:
		if not input_file:
			raise ValueError("Input file name must have a value.")
		
		if not results:
			raise ValueError("Given validation results list is empty.")

		if not isinstance(results, list):
			raise ValueError("Expected a filled list of dictionaries.")
		
		timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
		ifile = os.path.basename(input_file).replace(".json", "").replace(" ", "_")
		report_name = f"validation_report_{ifile}_{timestamp}"
		path = os.path.join(self.report_dir, report_name)
		
		try:
			# calculate results
			total_entries = len(results)
			total_valid_entries = 0
			for result in results:
				if result.get("is_valid", True):
					total_valid_entries += 1

			invalid_entries = total_entries - total_valid_entries

			# report structure
			report = {
				"structure": {
					"timestamp": timestamp,
					"input_file": input_file,
					"valid_entries": total_valid_entries,
					"invalid_entries": invalid_entries,
					"total_entries": total_entries
				},
				
				"results": results
			}

			# save report
			with open(path, "w") as ofile:
				json.dump(report, ofile, indent=4)

			return report
		
		except OSError as e:
			raise RuntimeError(f"Error witing report to {path}: {e}")
		
		except IOError as e:
			raise RuntimeError(f"Error witing report to {path}: {e}")
		
	
	# export to plaintext file
	def export_to_plaintext(self, report: Dict[str, Any], ofile: str="validation_report.txt"):
		if not report:
			raise ValueError("Report data missing.")
		
		if not isinstance(report, dict):
			raise ValueError("Invalid report data, expected type dictionary.")
			
		plaintext_path = os.path.join(self.report_dir, ofile)
		try:
			with open(plaintext_path, "w") as plaintext_file:
				plaintext_file.write("JSON Validation Report")
				plaintext_file.write("\n")
				plaintext_file.write("\nTimestamp: {report['structure']['timestamp']}")
				plaintext_file.write("\nInput File: {report['structure']['input_file']}")
				plaintext_file.write("\nValid Entries: {report['structure']['valid_entries']}")
				plaintext_file.write("\nInvalid Entries: {report['structure']['invalid_entries']}")
				plaintext_file.write("\nTotal Entries: {report['structure']['total_entries']}")
				plaintext_file.write("\n\nDetails:\n")

				for detail in report["details"]:
					plaintext_file.write(f"{json.dumps(detail, indent=4)}")

		except OSError as e:
			raise RuntimeError(f"Error writing report to {plaintext_path}: {e}")
		
		except IOError as e:
			raise RuntimeError(f"Error writing report to {plaintext_path}: {e}")
				
