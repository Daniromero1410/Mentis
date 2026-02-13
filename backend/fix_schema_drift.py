
import sys
import os
import logging
from sqlalchemy import text, inspect

# Disable logging
logging.getLogger('sqlalchemy').setLevel(logging.WARNING)

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine

def fix_schema():
    print("Starting schema fix...")
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        
        # Helper function
        def ensure_columns(table_name, updates):
            print(f"\nChecking {table_name}...")
            try:
                columns = [c['name'] for c in inspector.get_columns(table_name)]
                for col_name, col_type in updates:
                    if col_name not in columns:
                        print(f"  Adding missing column: {col_name}")
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    else:
                        print(f"  Column {col_name} already exists.")
            except Exception as e:
                print(f"  Error inspecting/updating {table_name}: {e}")

        # 1. trabajadores_prueba
        ensure_columns('trabajadores_prueba', [
            ("fecha_nacimiento", "DATE"),
            ("genero", "VARCHAR"),
            ("escolaridad", "VARCHAR"),
            ("eps", "VARCHAR"),
            ("puesto_trabajo_evaluado", "VARCHAR"),
            ("fecha_ingreso_empresa", "DATE"),
            ("fecha_ingreso_puesto_evaluado", "DATE"),
            ("antiguedad_puesto_evaluado", "VARCHAR"),
            ("diagnostico", "VARCHAR"),
            ("codigo_cie10", "VARCHAR"),
            ("fecha_siniestro", "DATE"),
        ])

        # 2. datos_empresa_prueba
        ensure_columns('datos_empresa_prueba', [
            ("tipo_documento", "VARCHAR"),
            ("nit", "VARCHAR"),
            ("persona_contacto", "VARCHAR"),
            ("email_notificaciones", "VARCHAR"),
            ("direccion", "VARCHAR"),
            ("arl", "VARCHAR"),
            ("ciudad", "VARCHAR"),
        ])

        # 3. datos_evaluador
        ensure_columns('datos_evaluador', [
            ("nombre", "VARCHAR"),
            ("identificacion", "VARCHAR"),
            ("formacion", "VARCHAR"),
            ("tarjeta_profesional", "VARCHAR"),
            ("licencia_sst", "VARCHAR"),
            ("fecha_evaluacion", "DATE"),
        ])

        # 4. secciones_prueba
        ensure_columns('secciones_prueba', [
            ("metodologia", "VARCHAR"),
            ("revision_documental", "VARCHAR"),
            ("descripcion_puesto", "VARCHAR"),
            ("condicion_actual", "VARCHAR"),
            ("descripcion_funciones", "VARCHAR"),
            ("participante_trabajador", "VARCHAR"),
            ("participante_jefe", "VARCHAR"),
            ("participante_cargo_jefe", "VARCHAR"),
            ("fuente_trabajador_fecha", "DATE"),
            ("fuente_jefe_fecha", "DATE"),
            ("fuente_par_fecha", "DATE"),
            ("nombre_puesto", "VARCHAR"),
            ("area_puesto", "VARCHAR"),
            ("antiguedad_cargo_ocupacional", "VARCHAR"),
            ("antiguedad_empresa_ocupacional", "VARCHAR"),
            ("nivel_educativo_requerido", "VARCHAR"),
            ("jornada_laboral", "VARCHAR"),
            ("horas_extras", "VARCHAR"),
            ("turnos", "VARCHAR"),
        ])

        # 5. condiciones_riesgo_prueba
        ensure_columns('condiciones_riesgo_prueba', [
            ("descripcion_detallada", "VARCHAR"),
            ("frecuencia", "INTEGER"),
            ("exposicion", "INTEGER"),
            ("intensidad", "INTEGER"),
            ("total_condicion", "INTEGER"),
            ("fuentes_informacion", "VARCHAR"),
        ])

        # 6. resumen_factores_prueba
        ensure_columns('resumen_factores_prueba', [
            ("puntuacion_total", "INTEGER"),
            ("nivel_riesgo_trabajador", "VARCHAR"),
            ("nivel_riesgo_experto", "VARCHAR"),
            ("factores_detectados_trabajador", "VARCHAR"),
            ("factores_detectados_experto", "VARCHAR"),
            ("observaciones_experto", "VARCHAR"),
        ])

        # 7. concepto_final_prueba
        ensure_columns('concepto_final_prueba', [
            ("conclusion_evaluacion", "VARCHAR"),
            ("concordancia_items", "VARCHAR"),
            ("no_concordancia_items", "VARCHAR"),
            ("concepto_generado_ml", "VARCHAR"),
            ("conclusiones_finales", "VARCHAR"),
            ("recomendaciones", "VARCHAR"),
            ("firma_evaluador", "VARCHAR"),
        ])

    print("\nComprehensive schema fix completed.")

if __name__ == "__main__":
    fix_schema()
