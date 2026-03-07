import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Hardcoding URL from app/config.py
database_url = "postgresql://william_admin:william_secure_2024@localhost:5432/william_romero"

print(f"Connecting to database: {database_url}")
engine = create_engine(database_url)

with engine.connect() as conn:
    # 1. Tareas Prueba TO
    try:
        print("Agregando observaciones_fotograficas a tareas_to...")
        conn.execute(text("ALTER TABLE tareas_to ADD COLUMN observaciones_fotograficas VARCHAR;"))
        conn.commit()
        print("Columna agregada exitosamente a tareas_to.")
        
        # También vamos a descartar la columna agregada por error si quisiéramos, pero no es crítico
        # conn.execute(text("ALTER TABLE tareas_prueba_to DROP COLUMN IF EXISTS observaciones_fotograficas;"))
        # conn.commit()
    except Exception as e:
        print(f"Error o la columna ya existe en tareas_to: {e}")

    # 2. Tareas Análisis Exigencia
    try:
        print("Agregando observaciones_fotograficas a tareas_ae...")
        conn.execute(text("ALTER TABLE tareas_ae ADD COLUMN observaciones_fotograficas VARCHAR;"))
        conn.commit()
        print("Columna agregada exitosamente a tareas_ae.")
    except Exception as e:
        print(f"Error o la columna ya existe en tareas_ae: {e}")

print("Migración completada.")
