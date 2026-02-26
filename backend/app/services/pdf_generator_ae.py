"""
Servicio de generación de PDF para valoraciones psicológicas
Convierte el archivo Excel generado directamente a PDF
"""

import subprocess
import platform
from pathlib import Path
from datetime import datetime
import os
import shutil

from app.models.valoracion import Valoracion


def sanitize_filename(text: str) -> str:
    """
    Limpia un texto para usarlo como nombre de archivo
    """
    # Reemplazar caracteres no permitidos
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        text = text.replace(char, '')
    # Reemplazar espacios con guiones bajos
    text = text.replace(' ', '_')
    # Limitar longitud
    if len(text) > 50:
        text = text[:50]
    return text


def convertir_excel_a_pdf_libreoffice(excel_path: str, output_dir: str) -> str:
    """
    Convierte un archivo Excel a PDF usando LibreOffice en modo headless

    Args:
        excel_path: Ruta al archivo Excel
        output_dir: Directorio de salida para el PDF

    Returns:
        Ruta del archivo PDF generado
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Detectar el sistema operativo
    sistema = platform.system()

    # Comandos de LibreOffice según el sistema operativo
    if sistema == "Windows":
        # Rutas comunes de LibreOffice en Windows
        posibles_rutas = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            r"C:\Program Files\LibreOffice 7\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice 7\program\soffice.exe",
        ]

        libreoffice_cmd = None
        for ruta in posibles_rutas:
            if os.path.exists(ruta):
                libreoffice_cmd = ruta
                break

        if not libreoffice_cmd:
            # Intentar buscar en PATH
            libreoffice_cmd = "soffice"
    else:
        # Linux/Mac
        libreoffice_cmd = "libreoffice"

    try:
        # Comando para convertir Excel a PDF
        cmd = [
            libreoffice_cmd,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', str(output_path),
            excel_path
        ]

        # Ejecutar el comando
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            # Obtener el nombre del PDF generado
            excel_filename = Path(excel_path).stem
            pdf_filename = f"{excel_filename}.pdf"
            pdf_path = output_path / pdf_filename

            if pdf_path.exists():
                return str(pdf_path)
            else:
                raise Exception(f"PDF no fue generado en {pdf_path}")
        else:
            raise Exception(f"Error al convertir: {result.stderr}")

    except FileNotFoundError:
        raise Exception(
            "LibreOffice no está instalado o no se encuentra en el PATH. "
            "Por favor instale LibreOffice para generar PDFs."
        )
    except subprocess.TimeoutExpired:
        raise Exception("Tiempo de espera excedido al convertir Excel a PDF")
    except Exception as e:
        raise Exception(f"Error al convertir Excel a PDF: {str(e)}")


def generar_pdf_desde_excel(
    excel_path: str,
    trabajador_nombre: str,
    trabajador_documento: str,
    output_dir: str = "pdfs"
) -> str:
    """
    Genera PDF a partir de un archivo Excel existente

    Args:
        excel_path: Ruta al archivo Excel fuente
        trabajador_nombre: Nombre del trabajador para el nombre del archivo
        trabajador_documento: Documento del trabajador para el nombre del archivo
        output_dir: Directorio de salida para el PDF

    Returns:
        Ruta del archivo PDF generado
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Generar nombre de archivo con nombre y documento del trabajador
    nombre_sanitizado = sanitize_filename(trabajador_nombre)
    documento_sanitizado = sanitize_filename(trabajador_documento)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    pdf_filename = f"valoracion_{nombre_sanitizado}_{documento_sanitizado}_{timestamp}.pdf"
    pdf_path = output_path / pdf_filename

    try:
        # Intentar convertir con LibreOffice
        pdf_temp = convertir_excel_a_pdf_libreoffice(excel_path, str(output_path))

        # Renombrar el archivo PDF al nombre deseado
        pdf_temp_path = Path(pdf_temp)
        if pdf_temp_path.exists():
            shutil.move(str(pdf_temp_path), str(pdf_path))
            return str(pdf_path)
        else:
            raise Exception("PDF temporal no encontrado")

    except Exception as e:
        # Si falla LibreOffice, copiar el Excel como respaldo
        # (esto es temporal, idealmente deberíamos tener otra solución)
        raise Exception(
            f"No se pudo generar el PDF: {str(e)}. "
            "Asegúrese de tener LibreOffice instalado en el sistema."
        )


def generar_pdf_valoracion(
    valoracion: Valoracion,
    excel_path: str,
    trabajador_nombre: str,
    trabajador_documento: str,
    output_dir: str = "pdfs"
) -> str:
    """
    Genera PDF de una valoración a partir de su archivo Excel

    Args:
        valoracion: Objeto Valoracion con todas las relaciones cargadas
        excel_path: Ruta al archivo Excel ya generado
        trabajador_nombre: Nombre del trabajador
        trabajador_documento: Documento del trabajador
        output_dir: Directorio de salida para el PDF

    Returns:
        Ruta del archivo PDF generado
    """
    return generar_pdf_desde_excel(
        excel_path=excel_path,
        trabajador_nombre=trabajador_nombre,
        trabajador_documento=trabajador_documento,
        output_dir=output_dir
    )
