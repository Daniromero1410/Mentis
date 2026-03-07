import os
from sqlalchemy import create_engine, text

# Railway remote database
database_url = "postgresql://postgres:yioHjzbJfMCaXoGORKHmCAGqUraAWics@interchange.proxy.rlwy.net:30267/railway"

print(f"Connecting to remote database: {database_url}")
engine = create_engine(database_url)

with engine.connect() as conn:
    # 1. Tareas Prueba TO
    try:
        print("Agregando observaciones_fotograficas a tareas_to...")
        conn.execute(text("ALTER TABLE tareas_to ADD COLUMN observaciones_fotograficas VARCHAR;"))
        conn.commit()
        print("Columna agregada exitosamente a tareas_to.")
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

print("Migración en producción (Railway) completada.")
