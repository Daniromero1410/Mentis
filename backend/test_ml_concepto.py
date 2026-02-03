"""
Script de prueba para demostrar el sistema ML de generación de conceptos
"""

from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo
from app.services.ml_concepto_generator import generar_concepto_ml, analizar_perfil_ml

def crear_evaluacion(categoria: str, item_num: int, item_texto: str, calificacion: str):
    """Helper para crear evaluaciones de prueba"""
    return EvaluacionRiesgo(
        id=None,
        valoracion_id=1,
        categoria=CategoriaRiesgo(categoria),
        item_numero=item_num,
        item_texto=item_texto,
        calificacion=CalificacionRiesgo(calificacion) if calificacion != 'na' else None,
        observaciones=None
    )

# ==================== ESCENARIO 1: TODO ALTO ====================
print("=" * 80)
print("ESCENARIO 1: TODOS LOS FACTORES EN NIVEL ALTO")
print("=" * 80)

evaluaciones_alto = [
    # Demandas Cuantitativas - TODO ALTO
    crear_evaluacion('demandas_cuantitativas', 1, 'Ritmo de trabajo acelerado', 'alto'),
    crear_evaluacion('demandas_cuantitativas', 2, 'Imposibilidad de pausas', 'alto'),
    crear_evaluacion('demandas_cuantitativas', 3, 'Tiempo adicional requerido', 'alto'),
    crear_evaluacion('demandas_cuantitativas', 4, 'Volumen de carga laboral', 'alto'),

    # Demandas Carga Mental - TODO ALTO
    crear_evaluacion('demandas_carga_mental', 1, 'Exigencia de memoria y concentración', 'alto'),
    crear_evaluacion('demandas_carga_mental', 2, 'Altos niveles de detalle', 'alto'),
    crear_evaluacion('demandas_carga_mental', 3, 'Información bajo presión', 'alto'),
    crear_evaluacion('demandas_carga_mental', 4, 'Información simultánea', 'alto'),

    # Demandas Emocionales - TODO ALTO
    crear_evaluacion('demandas_emocionales', 1, 'Trato negativo de clientes', 'alto'),
    crear_evaluacion('demandas_emocionales', 2, 'Situaciones devastadoras', 'alto'),
    crear_evaluacion('demandas_emocionales', 3, 'Impacto emocional', 'alto'),

    # Exigencias Responsabilidad - TODO ALTO
    crear_evaluacion('exigencias_responsabilidad', 1, 'Responsabilidad por vida/salud', 'alto'),
    crear_evaluacion('exigencias_responsabilidad', 2, 'Supervisión de personal', 'alto'),

    # Consistencia Rol - TODO ALTO
    crear_evaluacion('consistencia_rol', 1, 'Falta de recursos', 'alto'),
    crear_evaluacion('consistencia_rol', 2, 'Órdenes contradictorias', 'alto'),

    # Demandas Ambientales - TODO ALTO
    crear_evaluacion('demandas_ambientales', 1, 'Ruido excesivo', 'alto'),
    crear_evaluacion('demandas_ambientales', 2, 'Iluminación deficiente', 'alto'),

    # Demandas Jornada - TODO ALTO
    crear_evaluacion('demandas_jornada', 1, 'Trabajo nocturno', 'alto'),
    crear_evaluacion('demandas_jornada', 2, 'Días consecutivos sin descanso', 'alto'),
]

perfil_alto = analizar_perfil_ml(evaluaciones_alto)
print(f"\nScore Global: {perfil_alto['score_global']:.2f}")
print(f"Severidad: {perfil_alto['severidad_global'].upper()}")
print(f"Categorías Críticas: {perfil_alto['categorias_criticas']}")
print(f"Categorías Altas: {perfil_alto['categorias_altas']}")

concepto_alto_dict = generar_concepto_ml(
    evaluaciones=evaluaciones_alto,
    nombre_trabajador="María González",
    tiene_diagnostico_mental=True
)
concepto_alto = concepto_alto_dict['concepto_completo']

print("\n--- CONCEPTO GENERADO (primeros 500 caracteres) ---")
print(concepto_alto[:500] + "...")
print(f"\nLongitud total del concepto: {len(concepto_alto)} caracteres")
print(f"Número de recomendaciones aprox: {concepto_alto.count('1. ') + concepto_alto.count('2. ')}")

# ==================== ESCENARIO 2: TODO BAJO ====================
print("\n\n" + "=" * 80)
print("ESCENARIO 2: TODOS LOS FACTORES EN NIVEL BAJO")
print("=" * 80)

evaluaciones_bajo = [
    # Demandas Cuantitativas - TODO BAJO
    crear_evaluacion('demandas_cuantitativas', 1, 'Ritmo de trabajo acelerado', 'bajo'),
    crear_evaluacion('demandas_cuantitativas', 2, 'Imposibilidad de pausas', 'bajo'),
    crear_evaluacion('demandas_cuantitativas', 3, 'Tiempo adicional requerido', 'bajo'),
    crear_evaluacion('demandas_cuantitativas', 4, 'Volumen de carga laboral', 'bajo'),

    # Demandas Carga Mental - TODO BAJO
    crear_evaluacion('demandas_carga_mental', 1, 'Exigencia de memoria y concentración', 'bajo'),
    crear_evaluacion('demandas_carga_mental', 2, 'Altos niveles de detalle', 'bajo'),
    crear_evaluacion('demandas_carga_mental', 3, 'Información bajo presión', 'bajo'),
    crear_evaluacion('demandas_carga_mental', 4, 'Información simultánea', 'bajo'),

    # Demandas Emocionales - TODO BAJO
    crear_evaluacion('demandas_emocionales', 1, 'Trato negativo de clientes', 'bajo'),
    crear_evaluacion('demandas_emocionales', 2, 'Situaciones devastadoras', 'bajo'),
    crear_evaluacion('demandas_emocionales', 3, 'Impacto emocional', 'bajo'),

    # Exigencias Responsabilidad - TODO BAJO
    crear_evaluacion('exigencias_responsabilidad', 1, 'Responsabilidad por vida/salud', 'bajo'),
    crear_evaluacion('exigencias_responsabilidad', 2, 'Supervisión de personal', 'bajo'),

    # Consistencia Rol - TODO BAJO
    crear_evaluacion('consistencia_rol', 1, 'Falta de recursos', 'bajo'),
    crear_evaluacion('consistencia_rol', 2, 'Órdenes contradictorias', 'bajo'),

    # Demandas Ambientales - TODO BAJO
    crear_evaluacion('demandas_ambientales', 1, 'Ruido excesivo', 'bajo'),
    crear_evaluacion('demandas_ambientales', 2, 'Iluminación deficiente', 'bajo'),

    # Demandas Jornada - TODO BAJO
    crear_evaluacion('demandas_jornada', 1, 'Trabajo nocturno', 'bajo'),
    crear_evaluacion('demandas_jornada', 2, 'Días consecutivos sin descanso', 'bajo'),
]

perfil_bajo = analizar_perfil_ml(evaluaciones_bajo)
print(f"\nScore Global: {perfil_bajo['score_global']:.2f}")
print(f"Severidad: {perfil_bajo['severidad_global'].upper()}")
print(f"Categorías Críticas: {perfil_bajo['categorias_criticas']}")
print(f"Categorías Bajas: {perfil_bajo['categorias_bajas']}")

concepto_bajo_dict = generar_concepto_ml(
    evaluaciones=evaluaciones_bajo,
    nombre_trabajador="María González",
    tiene_diagnostico_mental=True
)
concepto_bajo = concepto_bajo_dict['concepto_completo']

print("\n--- CONCEPTO GENERADO (primeros 500 caracteres) ---")
print(concepto_bajo[:500] + "...")
print(f"\nLongitud total del concepto: {len(concepto_bajo)} caracteres")
print(f"Número de recomendaciones aprox: {concepto_bajo.count('1. ') + concepto_bajo.count('2. ')}")

# ==================== COMPARACIÓN ====================
print("\n\n" + "=" * 80)
print("COMPARACIÓN DE ESCENARIOS")
print("=" * 80)
print(f"Score ALTO: {perfil_alto['score_global']:.2f} vs Score BAJO: {perfil_bajo['score_global']:.2f}")
print(f"Diferencia de score: {abs(perfil_alto['score_global'] - perfil_bajo['score_global']):.2f}")
print(f"\nLongitud concepto ALTO: {len(concepto_alto)} caracteres")
print(f"Longitud concepto BAJO: {len(concepto_bajo)} caracteres")
print(f"Diferencia de longitud: {abs(len(concepto_alto) - len(concepto_bajo))} caracteres")
print("\n¿Los conceptos son diferentes?", "SÍ" if concepto_alto != concepto_bajo else "NO")
print("\n" + "=" * 80)
