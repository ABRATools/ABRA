import os
import json
from pydantic import SecretStr
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: SecretStr = "supersecretkey"
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: Optional[int] = 6379
    LDAP_SERVER: Optional[str] = None
    LDAP_PORT: Optional[int] = 389
    LDAP_BIND_USER: Optional[str] = None
    LDAP_BIND_PASSWORD: Optional[SecretStr] = None
    LDAP_SEARCH_BASE: Optional[str] = None
    LDAP_SEARCH_FILTER: Optional[str] = None
    LDAP_USER_ATTRIBUTE: Optional[str] = None
    LDAP_GROUP_DN: Optional[str] = None
    DB_CONNECTION_STRING: Optional[SecretStr] = None
    LOCAL_DB: bool = True
    NODE_UPDATE_INTERVAL: int = 5
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 1800

settings = None

def load_config_file(filepath):
    global settings
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            config_data = json.load(f)
            if int(config_data.get('NODE_UPDATE_INTERVAL')) < 5:
                raise ValueError("NODE_UPDATE_INTERVAL must be at least 5 seconds")
            settings = Settings(**config_data)
    else:
        raise FileNotFoundError("Config file not found")

def load_default_config():
    global settings
    settings = Settings()

settings = Settings()