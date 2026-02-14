from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlmodel import Session
from pathlib import Path
import shutil
import uuid
from datetime import datetime
from app.database.connection import get_session
from app.models.usuario import Usuario
from app.services.auth import get_current_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])

# Directorio base para archivos subidos
UPLOAD_DIR = Path("uploads")
FIRMAS_DIR = UPLOAD_DIR / "firmas"

# Crear directorios si no existen
UPLOAD_DIR.mkdir(exist_ok=True)
FIRMAS_DIR.mkdir(exist_ok=True)

# Extensiones permitidas para firmas
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_file(file: UploadFile) -> None:
    """Valida el archivo subido"""
    # Validar extensión
    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Extensiones válidas: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Nota: La validación de tamaño se hace al leer el archivo

@router.post("/firma")
async def subir_firma(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Sube un archivo de firma (imagen o PDF).
    Retorna la URL/path del archivo subido.
    """
    try:
        # Validar archivo
        validate_file(file)

        # Generar nombre único para el archivo
        file_ext = Path(file.filename or "").suffix.lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        new_filename = f"firma_{current_user.id}_{timestamp}_{unique_id}{file_ext}"

        # Ruta completa del archivo
        file_path = FIRMAS_DIR / new_filename

        # Leer y validar tamaño del archivo
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
            )

        # Guardar archivo
        with open(file_path, "wb") as f:
            f.write(contents)

        # Retornar ruta relativa para almacenar en la BD
        relative_path = f"uploads/firmas/{new_filename}"

        return {
            "filename": new_filename,
            "path": relative_path,
            "url": f"/uploads/firmas/{new_filename}",
            "size": len(contents),
            "content_type": file.content_type
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir el archivo: {str(e)}"
        )

@router.get("/firmas/{filename}")
async def descargar_firma(
    filename: str
):
    """Descarga/muestra un archivo de firma"""
    file_path = FIRMAS_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )

@router.delete("/firma/{filename}")
async def eliminar_firma(
    filename: str,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina un archivo de firma"""
    try:
        file_path = FIRMAS_DIR / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Archivo no encontrado"
            )

        # Eliminar archivo
        file_path.unlink()

        return {"message": "Archivo eliminado exitosamente"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el archivo: {str(e)}"
        )


# ── Evidencias Fotográficas ─────────────────────────────────────────

EVIDENCIAS_DIR = UPLOAD_DIR / "evidencias"
EVIDENCIAS_DIR.mkdir(exist_ok=True)

@router.post("/evidencia")
async def subir_evidencia(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Sube una evidencia fotográfica.
    Retorna la URL/path del archivo subido.
    """
    try:
        # Validar archivo
        validate_file(file)

        # Generar nombre único
        file_ext = Path(file.filename or "").suffix.lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        new_filename = f"evidencia_{current_user.id}_{timestamp}_{unique_id}{file_ext}"

        # Ruta completa
        file_path = EVIDENCIAS_DIR / new_filename

        # Leer y validar tamaño
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
            )

        # Guardar archivo
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "filename": new_filename,
            "path": f"uploads/evidencias/{new_filename}",
            "url": f"/uploads/evidencias/{new_filename}",
            "size": len(contents),
            "content_type": file.content_type
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir evidencia: {str(e)}"
        )

@router.get("/evidencias/{filename}")
async def descargar_evidencia(
    filename: str
):
    """Descarga/muestra una evidencia fotográfica"""
    file_path = EVIDENCIAS_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream" 
    )

@router.delete("/evidencia/{filename}")
async def eliminar_evidencia(
    filename: str,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una evidencia"""
    try:
        file_path = EVIDENCIAS_DIR / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evidencia no encontrada"
            )

        file_path.unlink()
        return {"message": "Evidencia eliminada exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar evidencia: {str(e)}"
        )
