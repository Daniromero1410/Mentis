from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://william_admin:william_secure_2024@localhost:5432/william_romero"
    )

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "william-romero-secret-key-2024-muy-segura")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # App
    APP_NAME: str = "Mentis - Psicologia Ocupacional"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # CORS - URLs permitidas (separadas por coma)
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001"
    )

    class Config:
        env_file = ".env"
        extra = "allow"

    def get_cors_origins(self) -> list[str]:
        """Retorna la lista de orígenes CORS permitidos"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()