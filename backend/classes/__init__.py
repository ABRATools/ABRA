from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
  user_id: int
  username: str
  email: Optional[str]
  password: str
  passwordChangeDate: Optional[str]
  groups: Optional[List[str]]
  is_active: bool
  totp_secret: Optional[str]
  is_totp_enabled: bool
  is_totp_confirmed: bool

class FilteredUser(BaseModel):
  user_id: int
  username: str
  email: Optional[str]
  groups: Optional[List[str]]
  passwordChangeDate: Optional[str]
  is_active: bool
  is_totp_enabled: bool
  is_totp_confirmed: bool

class Group(BaseModel):
  name: str
  permissions: Optional[List[str]] = []
  # permissions: Optional[str]
  users: List[str]

class ConnectionStrings(BaseModel):
  name: str
  connection_string: str
  description: Optional[str] = None

class Environment(BaseModel):
  env_id: str
  image: str
  names: List[str]
  state: str
  started_at: int
  ports: List[int]
  ip: str
  networks: List[str]
  exited: bool
  exit_code: int
  exited_at: int
  status: str
  cpu_percentage: float
  memory_percent: float 
  uptime: int

class Node(BaseModel):
  node_id: str
  ip_address: str
  os_name: str
  os_version: str
  cpu_count: int
  cpu_percent: float
  mem_percent: float
  total_memory: float
  num_containers: int
  environments: List[Environment]

class Service(BaseModel):
  name: str
  description: str
  status: str
  port_number: int

class Task(BaseModel):
  name: str
  description: str
  start_time: str
  end_time: Optional[str]
  completed: bool
  status: str
  output: Optional[str]

class Notification(BaseModel):
  name: str
  description: str
  date_created: str
  is_read: bool
  is_active: bool
  users: List[User]

class InputConnString(BaseModel):
  name: str
  connection_string: str
  description: Optional[str] = None

class InputUser(BaseModel):
  username: str
  email: Optional[str] = None
  password: str
  confirm_password: str
  groups: Optional[List[str]] = None
  is_active: bool = True
  totp_secret: Optional[str] = None
  is_totp_enabled: bool = False
  is_totp_confirmed: bool = False

class Notifier(BaseModel):
  webhook_name: str
  webhook_url: str
  enabled: bool

class Notification(BaseModel):
  notification_id: int
  name: str
  description: Optional[str] = None
  date_created: int
  severity: str
  is_read: bool
  notification_type: str

class DeleteNotifierRequest(BaseModel):
  webhook_name: str

class ToggleNotifierRequest(BaseModel):
  webhook_name: str
  enabled: bool

class DeleteConnectionString(BaseModel):
  connstr_name: str