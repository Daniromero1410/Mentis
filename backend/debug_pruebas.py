
import sys
import os
import logging

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Disable sqlalchemy logging
logging.getLogger('sqlalchemy').setLevel(logging.WARNING)

from sqlmodel import select, Session
from app.database.connection import get_session
from app.models.prueba_trabajo import PruebaTrabajo, TrabajadorPrueba, DatosEmpresaPrueba
from app.schemas.prueba_trabajo import PruebaTrabajoListItem

def log(msg):
    print(msg)
    with open("debug_result.log", "a", encoding="utf-8") as f:
        f.write(str(msg) + "\n")

# Clear log
with open("debug_result.log", "w", encoding="utf-8") as f:
    f.write("Starting debug...\n")

# Mock a session
log("Connecting to DB...")
try:
    session_gen = get_session()
    session = next(session_gen)
    log("Session created.")
    
    try:
        query = select(PruebaTrabajo).order_by(PruebaTrabajo.fecha_creacion.desc())
        pruebas = session.exec(query).all()
        log(f"Found {len(pruebas)} pruebas.")
    except Exception as e:
        log(f"ERROR executing query: {e}")
        pruebas = []

    for prueba in pruebas:
        log(f"Processing prueba ID: {prueba.id}, Estado: {prueba.estado}")
        
        try:
            trabajador = session.exec(
                select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba.id)
            ).first()

            empresa = session.exec(
                select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba.id)
            ).first()

            log(f"  Trabajador: {trabajador}")
            log(f"  Empresa: {empresa}")

            item = PruebaTrabajoListItem(
                id=prueba.id,
                estado=prueba.estado,
                fecha_creacion=prueba.fecha_creacion,
                fecha_actualizacion=prueba.fecha_actualizacion,
                trabajador_nombre=trabajador.nombre if trabajador else None,
                trabajador_identificacion=trabajador.identificacion if trabajador else None,
                empresa=empresa.empresa if empresa else None
            )
            log(f"  -> Valid item created: {item.id}")
        except Exception as e:
            log(f"  -> ERROR validating item {prueba.id}: {e}")
            import traceback
            with open("debug_result.log", "a", encoding="utf-8") as f:
                traceback.print_exc(file=f)

except Exception as e:
    log(f"CRITICAL ERROR: {e}")
    import traceback
    with open("debug_result.log", "a", encoding="utf-8") as f:
        traceback.print_exc(file=f)
