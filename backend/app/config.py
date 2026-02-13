import os

class Settings:
    def __init__(self):
        # Base de datos - Lee directamente de variable de entorno
        self.DATABASE_URL = os.environ.get(
            "DATABASE_URL",
            "postgresql://william_admin:william_secure_2024@localhost:5432/william_romero"
        )

        # JWT
        self.SECRET_KEY = os.environ.get(
            "SECRET_KEY",
            "william-romero-secret-key-2024-muy-segura"
        )
        self.ALGORITHM = "HS256"

        # Manejar ACCESS_TOKEN_EXPIRE_MINUTES con valor vacio
        token_expire = os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(token_expire) if token_expire else 480

        # App
        self.APP_NAME = "Mentis - Psicologia Ocupacional"
        self.DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

        # CORS - URLs permitidas (separadas por coma)
        self.CORS_ORIGINS = os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001"
        )

        # Log de conexion (sin mostrar credenciales)
        print(f"[CONFIG] DATABASE_URL configurada: {'Railway' if 'railway' in self.DATABASE_URL else 'Local'}")

    def get_cors_origins(self) -> list:
        """Retorna la lista de origenes CORS permitidos"""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        # Agregar dominios de producción explícitamente para asegurar acceso
        origins.append("https://mentis-nu.vercel.app")
        return list(set(origins))

settings = Settings()
