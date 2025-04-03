import os
import json
from pydantic import SecretStr
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: SecretStr = "supersecretkey"
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: Optional[int] = 6379
    LDAP_ENABLED: Optional[bool] = False
    LDAP_SERVER: Optional[str] = None
    LDAP_PORT: Optional[int] = 389
    LDAP_BIND_DN: Optional[str] = None
    LDAP_BIND_PASSWORD: Optional[SecretStr] = None
    LDAP_USER_DN: Optional[str] = None
    LDAP_USER_ATTRIBUTE: Optional[str] = None
    LDAP_GROUP_DN: Optional[str] = None
    DB_CONNECTION_STRING: Optional[SecretStr] = None
    LOCAL_DB: bool = True
    NODE_UPDATE_INTERVAL: int = 5
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 1800

# the problem with this is that loading the settings once through the main file is not sufficient because every import has its own settings
# so we need to load the settings in every file that needs them
# quite the problem

# this currently just loads the settings from the config file if it exists
# and uses the defaults if it doesn't 

if os.path.exists('config.json'):
    with open('config.json', 'r') as f:
        try:
            config_data = json.load(f)
            if int(config_data.get('NODE_UPDATE_INTERVAL')) < 5:
                raise ValueError("NODE_UPDATE_INTERVAL must be at least 5 seconds")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON in config file")
        # print(config_data)
        settings = Settings(**config_data)
else:
    settings = Settings()

# print(settings)