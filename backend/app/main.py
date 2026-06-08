from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.database.connection import create_db_and_tables
from app.routers import auth, valoraciones, usuarios, conceptos, reportes, uploads, pruebas_trabajo
from app.routers import pruebas_trabajo_to
from app.routers import analisis_exigencia
from app.routers import analisis_exigencias_mental
from app.routers import valoracion_ocupacional
from app.routers import cuentas
from app.routers import notificaciones

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema de Valoración Psicológica para Recomendaciones Laborales",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones del frontend
# Los orígenes se configuran desde variables de entorno para producción
# AGREGADO: Lista explícita para asegurar funcionamiento en Vercel y Railway
origins = settings.get_cors_origins()
origins.extend([
    "https://mentis-nu.vercel.app",
    "https://mentis-nu.vercel.app/",
    "https://mentis.sol-sas.com",
    "https://mentis.sol-sas.com/",
    "http://localhost:3000",
    "http://localhost:3000/",
])
allowed_origins = list(set(origins))

print(f"✅ CORS CONFIGURADO CON ORIGENES ACTUALIZADOS: {allowed_origins}")


# ── Protección de archivos sensibles (PDFs médicos, firmas, evidencias) ──
# Los directorios /pdfs y /uploads contienen información clínica. Antes se
# servían públicamente; ahora exigen un token JWT válido, aceptado por header
# Authorization (descargas con fetch) o por query ?token= (para <img>/window.open).
async def _proteger_archivos(request, call_next):
    from fastapi.responses import JSONResponse
    from app.services.auth import decode_token

    path = request.url.path
    if request.method == "GET" and (path.startswith("/pdfs/") or path.startswith("/uploads/")):
        token = request.query_params.get("token")
        if not token:
            auth_header = request.headers.get("authorization", "")
            if auth_header.lower().startswith("bearer "):
                token = auth_header[7:]
        payload = decode_token(token) if token else None
        if not payload or not payload.get("sub"):
            return JSONResponse(
                status_code=401,
                content={"detail": "No autorizado para acceder a este archivo"},
            )
    return await call_next(request)


# IMPORTANTE: el orden importa. El último middleware agregado es el MÁS EXTERNO.
# CORS debe quedar de último para que TODAS las respuestas (incluidas las 401
# del middleware de archivos) lleven los headers CORS y el navegador no reporte
# "Load Failed".
from starlette.middleware.base import BaseHTTPMiddleware
app.add_middleware(BaseHTTPMiddleware, dispatch=_proteger_archivos)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Manejador global de excepciones: garantiza que los errores 500 se devuelvan
# como JSON (pasando por CORS) en vez de propagarse al nivel más externo sin
# headers CORS, lo que el navegador reporta como "Load Failed".
from fastapi import Request
from fastapi.responses import JSONResponse as _JSONResponse

@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR no controlado] {request.method} {request.url.path}: {exc}")
    return _JSONResponse(
        status_code=500,
        content={"detail": "Ocurrió un error en el servidor. Intente nuevamente."},
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
app.include_router(analisis_exigencia.router)
app.include_router(analisis_exigencias_mental.router)
app.include_router(valoracion_ocupacional.router)
app.include_router(cuentas.router)
app.include_router(notificaciones.router)

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
    _migrar_columna_rol()
    create_db_and_tables()
    _seed_catalogo_servicios()
    print("Base de datos inicializada correctamente")


def _migrar_columna_rol():
    """Convierte la columna usuarios.rol de tipo ENUM de PostgreSQL a VARCHAR.

    El tipo ENUM 'rolusuario' fue creado con los valores en MAYÚSCULAS (nombres
    de los miembros del Enum). El modelo actual usa minúsculas ('admin', etc.),
    por lo que escribir fallaba: 'invalid input value for enum rolusuario: admin'.
    Cada sentencia corre en su propia transacción para ser robusta e idempotente.
    """
    from sqlalchemy import text
    from app.database.connection import engine

    sentencias = [
        "ALTER TABLE usuarios ALTER COLUMN rol DROP DEFAULT",
        "ALTER TABLE usuarios ALTER COLUMN rol TYPE VARCHAR(50) USING rol::text",
        "UPDATE usuarios SET rol = LOWER(rol)",
    ]
    for s in sentencias:
        try:
            with engine.connect() as conn:
                conn.execute(text(s))
                conn.commit()
        except Exception as e:
            print(f"[MIGRATION rol] Aviso en '{s[:45]}...': {e}")


def _seed_catalogo_servicios():
    """Inserta los servicios por defecto si el catálogo está vacío."""
    from sqlmodel import Session, select
    from app.database.connection import engine
    from app.models.cuenta import CatalogoServicio

    servicios_default = [
        "CONSULTA 1ER VEZ TERAPIA OCUPACIONAL",
        "VALORACIÓN OCUPACIONAL",
        "PRUEBA DE TRABAJO",
        "ANÁLISIS DE EXIGENCIA",
        "RECOMENDACIONES",
        "SEGUIMIENTO A RECOMENDACIONES",
        "NOTIFICACIÓN REINTEGRO EN PLENO",
        "PERFIL OCUPACIONAL",
        "COMITÉ",
        "INTERCONSULTA POR TO",
        "TERAPIA OCUPACIONAL",
    ]
    try:
        with Session(engine) as session:
            existe = session.exec(select(CatalogoServicio).limit(1)).first()
            if existe:
                return
            for i, nombre in enumerate(servicios_default):
                session.add(CatalogoServicio(nombre=nombre, activo=True, orden=i))
            session.commit()
            print("[SEED] Catálogo de servicios inicializado")
    except Exception as e:
        print(f"[SEED] Aviso: {e}")


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
        # Agregar columna "laborales" a perfil_exigencias_ae si no existe
        """
        ALTER TABLE perfil_exigencias_ae ADD COLUMN IF NOT EXISTS laborales JSON;
        """,
        # Agregar columna `acceso_valoracion_ocupacional` a usuarios
        """
        ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_valoracion_ocupacional BOOLEAN DEFAULT FALSE;
        """,
        # Campos nuevos para RegistroVO
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS concepto_ocupacional TEXT;
        """,
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS orientacion_ocupacional TEXT;
        """,
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS nombre_proveedor VARCHAR;
        """,
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS firma_proveedor VARCHAR;
        """,
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS nombre_equipo_rhb VARCHAR;
        """,
        """
        ALTER TABLE registro_vo ADD COLUMN IF NOT EXISTS firma_equipo_rhb VARCHAR;
        """,
        # Campos nuevos en actividad_actual_vo (sección V VO)
        """
        ALTER TABLE actividad_actual_vo ADD COLUMN IF NOT EXISTS que_hacia_atel TEXT;
        """,
        """
        ALTER TABLE actividad_actual_vo ADD COLUMN IF NOT EXISTS relato_atel TEXT;
        """,
        # Módulo de Cuentas: permiso de acceso
        """
        ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_cuentas BOOLEAN DEFAULT FALSE;
        """,
        """
        UPDATE usuarios SET acceso_cuentas = FALSE WHERE acceso_cuentas IS NULL;
        """,
        """
        UPDATE usuarios SET acceso_cuentas = TRUE WHERE email = 'danielromero.software@gmail.com' AND (acceso_cuentas IS NULL OR acceso_cuentas = FALSE);
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