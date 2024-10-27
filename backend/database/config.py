from pydantic import SecretStr
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: SecretStr
    DB_NAME: str
    LOCAL_DB: bool = True
    HASH_ALGORITHM: str = "bcrypt"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
