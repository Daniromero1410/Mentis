from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.database.connection import create_db_and_tables
from app.routers import auth, valoraciones, usuarios, conceptos, reportes, uploads, pruebas_trabajo
from app.routers import pruebas_trabajo_to

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema de Valoración Psicológica para Recomendaciones Laborales",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones del frontend
# Los orígenes se configuran desde variables de entorno para producción
# AGREGADO: Lista explícita para asegurar funcionamiento en Vercel
origins = settings.get_cors_origins()
origins.extend([
    "https://mentis-nu.vercel.app",
    "https://mentis-nu.vercel.app/",
    "http://localhost:3000"
])
allowed_origins = list(set(origins))

print(f"✅ CORS CONFIGURADO CON ORIGENES: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(valoraciones.router)
app.include_router(usuarios.router)
app.include_router(conceptos.router)
app.include_router(reportes.router)
app.include_router(uploads.router)
app.include_router(pruebas_trabajo.router)
app.include_router(pruebas_trabajo_to.router)

# Montar directorio de uploads como archivos estáticos
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Montar directorio de PDFs como archivos estáticos
PDFS_DIR = Path("pdfs")
PDFS_DIR.mkdir(exist_ok=True)
app.mount("/pdfs", StaticFiles(directory="pdfs"), name="pdfs")

# Evento de inicio: migrar y crear tablas
@app.on_event("startup")
def on_startup():
    # Ejecutar migraciones automáticas antes de crear tablas nuevas
    _run_migrations()
    create_db_and_tables()
    print("Base de datos inicializada correctamente")


def _run_migrations():
    """Ejecuta migraciones pendientes de forma segura (idempotente)."""
    from sqlalchemy import text
    from app.database.connection import engine

    migrations = [
        # Agregar valor al enum rolusuario
        """
        DO $$
        BEGIN
            ALTER TYPE rolusuario ADD VALUE IF NOT EXISTS 'terapeuta_ocupacional';
        EXCEPTION WHEN others THEN
            NULL;
        END $$;
        """,
        # Agregar columna acceso_formatos_to a usuarios
        """
        ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_formatos_to BOOLEAN DEFAULT FALSE;
        """,
        # Dar acceso al admin
        """
        UPDATE usuarios SET acceso_formatos_to = TRUE WHERE email = 'danielromero.software@gmail.com' AND (acceso_formatos_to IS NULL OR acceso_formatos_to = FALSE);
        """,
        # Asegurar que no queden NULLs (causa errores de serialización)
        """
        UPDATE usuarios SET acceso_formatos_to = FALSE WHERE acceso_formatos_to IS NULL;
        """,
    ]

    try:
        with engine.connect() as conn:
            for sql in migrations:
                conn.execute(text(sql))
            conn.commit()
        print("[MIGRATIONS] Migraciones ejecutadas correctamente")
    except Exception as e:
        print(f"[MIGRATIONS] Aviso: {e}")

# Ruta de prueba
@app.get("/")
def root():
    return {
        "message": f"Bienvenido a {settings.APP_NAME}",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/test/libreoffice")
def test_libreoffice():
    """
    Endpoint de prueba para verificar que LibreOffice está instalado.
    Útil para verificar el despliegue en Railway.
    """
    import subprocess
    import platform
    try:
        result = subprocess.run(
            ['libreoffice', '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return {
            "installed": True,
            "version": result.stdout.strip(),
            "platform": platform.system(),
            "message": "LibreOffice está instalado y funcionando correctamente"
        }
    except FileNotFoundError:
        return {
            "installed": False,
            "error": "LibreOffice no encontrado en el sistema",
            "platform": platform.system(),
            "message": "Instale LibreOffice o verifique que el Dockerfile se haya ejecutado correctamente"
        }
    except Exception as e:
        return {
            "installed": False,
            "error": str(e),
            "platform": platform.system(),
            "message": "Error al verificar LibreOffice"
        }