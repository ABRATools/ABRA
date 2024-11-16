from pydantic import BaseModel
from typing import Optional, List
import datetime

class User(BaseModel):
  username: str
  email: Optional[str]
  password: str
  passwordChangeDate: Optional[datetime.datetime]
  groups: Optional[List[str]]
  is_active: bool
  totp_secret: Optional[str]
  is_totp_enabled: bool
  is_totp_confirmed: bool

class Group(BaseModel):
  name: str
  permissions: Optional[List[str]]
  users: List[User]

class Environment(BaseModel):
  machine_name: str
  description: Optional[str]
  os: str
  ip: Optional[str]
  status: str
  max_cpus: int
  max_memory: int
  max_disk: int
  current_cpu_percent: int
  current_memory_percent: int
  current_disk_percent: int
  node_id: int

class Node(BaseModel):
  name: str
  ip: str
  port: int
  status: str
  environments: List[Environment]

class Service(BaseModel):
  name: str
  description: str
  status: str
  port_number: int

class Task(BaseModel):
  name: str
  description: str
  start_time: datetime.datetime
  end_time: Optional[datetime.datetime]
  completed: bool
  status: str
  output: Optional[str]

class Notification(BaseModel):
  name: str
  description: str
  date_created: datetime.datetime
  is_read: bool
  is_active: bool
  users: List[User]
