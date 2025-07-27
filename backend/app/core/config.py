from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    # 应用配置
    app_name: str = "图片对比分析系统"
    debug: bool = True
    secret_key: str = "your-secret-key-change-in-production"
    
    # 数据库配置
    database_url: str = "sqlite:///./image_comparison.db"
    
    # Ollama API配置
    ollama_base_url: str = "http://192.168.31.80:11434"
    # ollama_model_name: str = "qwen2.5vl:32b"
    ollama_model_name: str = "qwen2.5vl:7b-fp16"
    
    # 文件上传配置
    upload_dir: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # CORS配置
    allowed_hosts: List[str] = ["localhost", "127.0.0.1", "192.158.31.80"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )


settings = Settings()


# 确保上传目录存在
os.makedirs(settings.upload_dir, exist_ok=True) 