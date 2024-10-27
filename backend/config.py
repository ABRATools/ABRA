from pydantic import SecretStr
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: SecretStr
    LDAP_SERVER: str
    LDAP_PORT: int
    LDAP_BIND_USER: str
    LDAP_BIND_PASSWORD: SecretStr
    LDAP_SEARCH_BASE: str
    LDAP_SEARCH_FILTER: str
    LDAP_USER_ATTRIBUTE: str
    LDAP_GROUP_DN: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
