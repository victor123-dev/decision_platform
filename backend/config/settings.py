from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Neo4j Configuration
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    
    # MongoDB Configuration
    mongodb_uri: str = "mongodb://localhost:27017/"
    mongodb_db: str = "decision_db"
    
    # SQLite Configuration
    sqlite_path: str = "./data/example_db.sqlite"
    
    # LLM Configuration
    llm_api_key: Optional[str] = None
    llm_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    llm_model: str = "qwen3.7-plus"
    
    # Logging
    log_level: str = "INFO"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
