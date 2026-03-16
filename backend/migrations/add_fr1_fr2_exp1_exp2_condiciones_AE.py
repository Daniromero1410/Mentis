import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database.connection import engine


def run():
    print("Agregando columnas frecuencia_1, frecuencia_2, exposicion_1, exposicion_2 a condiciones_riesgo_AE...")
    with engine.connect() as conn:
        statements = [
            'ALTER TABLE "condiciones_riesgo_AE" ADD COLUMN IF NOT EXISTS frecuencia_1 INTEGER;',
            'ALTER TABLE "condiciones_riesgo_AE" ADD COLUMN IF NOT EXISTS frecuencia_2 INTEGER;',
            'ALTER TABLE "condiciones_riesgo_AE" ADD COLUMN IF NOT EXISTS exposicion_1 INTEGER;',
            'ALTER TABLE "condiciones_riesgo_AE" ADD COLUMN IF NOT EXISTS exposicion_2 INTEGER;',
        ]
        for stmt in statements:
            try:
                conn.execute(text(stmt))
                print(f"  OK: {stmt}")
            except Exception as e:
                print(f"  ERROR: {stmt} -> {e}")
        conn.commit()
    print("Migración completada.")


if __name__ == "__main__":
    run()
