import os
import secrets

class Settings:
    def __init__(self):
        # Base de datos - SIEMPRE desde variable de entorno. El default es solo
        # un placeholder local sin credenciales reales (nunca usar en producción).
        self.DATABASE_URL = os.environ.get(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/mentis_local"
        )

        # JWT — la clave NUNCA debe tener un default predecible en el código.
        # Si no está configurada como variable de entorno, se genera una temporal
        # (segura pero efímera: invalida sesiones al reiniciar). Configure SECRET_KEY
        # en producción (Railway) para mantener las sesiones estables.
        self.SECRET_KEY = os.environ.get("SECRET_KEY")
        if not self.SECRET_KEY:
            self.SECRET_KEY = secrets.token_urlsafe(48)
            print(
                "[CONFIG][SEGURIDAD] ⚠️  SECRET_KEY no está configurada como variable "
                "de entorno. Se generó una clave temporal. Configure SECRET_KEY en "
                "producción para evitar que las sesiones se invaliden en cada reinicio."
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
        origins.append("https://mentis.sol-sas.com")
        return list(set(origins))

settings = Settings()
