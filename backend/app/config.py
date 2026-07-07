from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "Autonomous HR Manager"
    app_version: str = "1.0.0"
    debug: bool = True

    # Database
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    database_url: str = ""

    # AI Provider
    ai_provider: str = "groq"
    groq_api_key: str = ""
    ai_model: str = "llama3-70b-8192"

    # Auth
    jwt_secret: str = "super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 3600

    # CORS
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
