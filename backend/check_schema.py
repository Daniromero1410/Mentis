
import sys
import os
import logging

# Disable logging
logging.getLogger('sqlalchemy').setLevel(logging.WARNING)

from sqlalchemy import inspect, text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine

def check_schema():
    inspector = inspect(engine)
    tables = [
        'pruebas_trabajo',
        'datos_empresa_prueba',
        'trabajadores_prueba',
        'datos_evaluador',
        'secciones_prueba',
        'condiciones_riesgo_prueba',
        'resumen_factores_prueba',
        'concepto_final_prueba'
    ]
    
    for table in tables:
        print(f"\nTABLE: {table}")
        try:
            columns = inspector.get_columns(table)
            for col in columns:
                print(f"  - {col['name']} ({col['type']})")
        except Exception as e:
            print(f"  Error inspecting table: {e}")

if __name__ == "__main__":
    check_schema()
