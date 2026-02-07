"""
Sistema de Generación de Conceptos para Pruebas de Trabajo
Adaptado de ml_concepto_generator.py pero separado para no afectar valoraciones psicológicas.
Retorna estructura diccionario {analisis, recomendaciones, concepto_completo}
"""

from typing import List, Dict, Tuple
import numpy as np
from app.models.evaluacion import EvaluacionRiesgo
# Usamos los mismos modelos de evaluación ya que comparten la estructura básica
# Si en el futuro divergen, importar de app.models.prueba_trabajo

# Reutilizamos constantes y lógica de análisis de ml_concepto_generator
# para mantener consistencia en los algoritmos, pero encapsulados aquí.
from app.services.ml_concepto_generator import (
    analizar_perfil_ml,
    detectar_genero,
    seleccionar_texto_variado,
    generar_recomendaciones_ml,
    INTRODUCCIONES,
    DESCRIPCIONES_DETALLADAS,
    CONECTORES_IMPACTO,
    CONSECUENCIAS,
    CONECTORES_TRANSICION,
    FRASES_EVIDENCIA,
    FRASES_PORCENTAJE
)

def generar_concepto_prueba_trabajo(
    evaluaciones: List[EvaluacionRiesgo],
    nombre_trabajador: str,
    tiene_diagnostico_mental: bool = False
) -> Dict[str, str]:
    """
    Genera concepto para Pruebas de Trabajo.
    Retorna diccionario estructurado.
    """

    if not evaluaciones:
        return {
            "analisis": "No se pueden generar análisis sin evaluaciones de riesgo completadas.",
            "recomendaciones": "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas.",
            "concepto_completo": "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas."
        }

    # Análisis profundo con ML (Reutilizamos la lógica de cálculo)
    perfil = analizar_perfil_ml(evaluaciones)

    # Detectar género
    genero = detectar_genero(nombre_trabajador)
    variables_texto = {
        'nombre': nombre_trabajador,
        'articulo': "la" if genero == 'F' else "el",
        'Articulo_cap': "La" if genero == 'F' else "El",
        'trabajador': "trabajadora" if genero == 'F' else "trabajador",
        'sustantivo': "la afiliada" if genero == 'F' else "el afiliado",
        'evaluado': "evaluada" if genero == 'F' else "evaluado",
    }

    # Seed para variación determinista
    nombre_hash = hash(nombre_trabajador)

    # ===== SECCIÓN 1: INTRODUCCIÓN =====
    severidad = perfil['severidad_global']
    intro_opciones = INTRODUCCIONES.get(severidad, INTRODUCCIONES['medio'])
    intro = seleccionar_texto_variado(intro_opciones, nombre_hash).format(**variables_texto)

    parrafos_analisis = [intro]

    # ===== SECCIÓN 2: ANÁLISIS DETALLADO POR CATEGORÍA =====
    categorias_analizar = perfil['categorias_criticas'] + perfil['categorias_altas']

    for i, cat in enumerate(categorias_analizar):
        info_cat = perfil['scores_categorias'][cat]
        nivel = info_cat['nivel']

        if cat in DESCRIPCIONES_DETALLADAS and nivel in DESCRIPCIONES_DETALLADAS[cat]:
            descripcion = DESCRIPCIONES_DETALLADAS[cat][nivel]

            # Nombre de categoría legible
            nombres_cat = {
                'demandas_cuantitativas': 'Demandas Cuantitativas del Trabajo',
                'demandas_carga_mental': 'Demandas de Carga Mental',
                'demandas_emocionales': 'Demandas Emocionales',
                'exigencias_responsabilidad': 'Exigencias de Responsabilidad del Cargo',
                'consistencia_rol': 'Consistencia del Rol',
                'demandas_ambientales': 'Demandas Ambientales y de Esfuerzo Físico',
                'demandas_jornada': 'Demandas de la Jornada de Trabajo',
            }

            nombre_categoria = nombres_cat.get(cat, cat.replace('_', ' ').title())

            # Items específicos
            items_cat = perfil['evaluaciones_raw'][cat]
            items_altos = [
                ev.item_texto for ev in items_cat
                if ev.calificacion and (
                    ev.calificacion.value if hasattr(ev.calificacion, 'value') else str(ev.calificacion)
                ) == 'alto'
            ]

            # Construir párrafo con CONECTORES VARIADOS
            if i == 0:
                conector = "Específicamente, en relación a"
            else:
                # Seleccionar conector rotativo
                idx_conector = (nombre_hash + i) % len(CONECTORES_TRANSICION)
                conector = CONECTORES_TRANSICION[idx_conector]

            parrafo = f"{conector} {nombre_categoria}, {variables_texto['articulo']} {variables_texto['trabajador']} {descripcion}."

            # Agregar ejemplos específicos con FRASES VARIADAS
            if items_altos:
                idx_frase = (nombre_hash + i) % len(FRASES_EVIDENCIA)
                frase_intro = FRASES_EVIDENCIA[idx_frase]
                
                ejemplos = items_altos[:2]
                if len(ejemplos) == 1:
                    parrafo += f' {frase_intro} "{ejemplos[0]}".'
                else:
                    parrafo += f' {frase_intro} "{ejemplos[0]}" y "{ejemplos[1]}".'

            # Porcentaje con FRASES VARIADAS
            pct_alto = info_cat['porcentajes']['alto']
            if pct_alto >= 50:
                idx_pct = (nombre_hash + i) % len(FRASES_PORCENTAJE)
                frase_pct = FRASES_PORCENTAJE[idx_pct].format(pct=pct_alto)
                parrafo += f" {frase_pct}"

            parrafos_analisis.append(parrafo)

    # ===== Categorías medias (mención breve) =====
    if perfil['categorias_medias']:
        nombres_cat_medias = []
        for cat in perfil['categorias_medias']:
            nombres = {
                'demandas_cuantitativas': 'Demandas Cuantitativas',
                'demandas_carga_mental': 'Carga Mental',
                'demandas_emocionales': 'Demandas Emocionales',
                'exigencias_responsabilidad': 'Exigencias de Responsabilidad',
                'consistencia_rol': 'Consistencia de Rol',
                'demandas_ambientales': 'Demandas Ambientales',
                'demandas_jornada': 'Demandas de Jornada',
            }
            nombres_cat_medias.append(nombres.get(cat, cat))

        if len(nombres_cat_medias) == 1:
            texto_medias = nombres_cat_medias[0]
        elif len(nombres_cat_medias) == 2:
            texto_medias = f"{nombres_cat_medias[0]} y {nombres_cat_medias[1]}"
        else:
            texto_medias = f"{', '.join(nombres_cat_medias[:-1])} y {nombres_cat_medias[-1]}"

        parrafos_analisis.append(
            f"Por otra parte, se observan niveles moderados en {texto_medias}, "
            f"lo cual amerita monitoreo continuo y acciones preventivas para evitar su escalamiento."
        )

    # ===== SECCIÓN 3: IMPACTO Y CONSECUENCIAS =====
    conectores = CONECTORES_IMPACTO.get(severidad, CONECTORES_IMPACTO['medio'])
    conector_impacto = seleccionar_texto_variado(conectores, nombre_hash + 1)
    consecuencia = CONSECUENCIAS[severidad]

    parrafo_impacto = f"{conector_impacto} {consecuencia}."
    parrafos_analisis.append(parrafo_impacto)

    # Construir texto final de Análisis / Conclusiones
    texto_analisis = "\n\n".join(parrafos_analisis)

    # ===== SECCIÓN 4: TEXTO LEGAL PREVIO A RECOMENDACIONES =====
    texto_legal = (
        "\n\nCon base en la evaluación integral presentad de {sustantivo}, quien cursa con un diagnóstico de la esfera mental, "
        "se emiten las siguientes recomendaciones orientadas a la prevención de agravamiento sintomático y al fomento "
        "de su rehabilitación integral, en concordancia con los artículos 2°, 4° y 8° de la Ley 776 de 2002."
    )
    texto_legal = texto_legal.format(**variables_texto)

    # ===== SECCIÓN 5: RECOMENDACIONES =====
    # Reutilizamos la lógica de recomendaciones existente
    recs_trabajador, recs_empresa = generar_recomendaciones_ml(perfil, tiene_diagnostico_mental)

    texto_trabajador = f"RECOMENDACIONES PARA {variables_texto['trabajador'].upper()}:\n"
    for i, rec in enumerate(recs_trabajador, 1):
        texto_trabajador += f"\n{i}. {rec}\n"

    texto_empresa = f"\nRECOMENDACIONES PARA LA EMPRESA:\n"
    for i, rec in enumerate(recs_empresa, 1):
        texto_empresa += f"\n{i}. {rec}\n"

    # ===== CIERRE =====
    if severidad in ['critico', 'muy_alto']:
        cierre = (
            "\nThese recomendaciones tienen carácter URGENTE y deben implementarse de manera inmediata. "
            "Se requiere seguimiento mensual durante los próximos seis (6) meses para evaluar efectividad "
            "de las intervenciones y realizar ajustes según evolución del caso. La vigencia de estas "
            "recomendaciones es de doce (12) meses contados a partir de la fecha de emisión."
        )
    else:
        cierre = (
            "\nEstas recomendaciones tienen una vigencia de doce (12) meses contados a partir de la fecha "
            "de emisión, periodo durante el cual se recomienda seguimiento trimestral para verificar "
            "implementación y efectividad de las medidas sugeridas."
        )

    # Construir texto final de Recomendaciones
    texto_recomendaciones = (
        texto_legal + "\n\n" +
        texto_trabajador +
        texto_empresa +
        cierre
    )

    # ===== CONCEPTO FINAL (COMPATIBILIDAD) =====
    concepto_completo = (
        texto_analisis + "\n\n" +
        texto_recomendaciones
    )

    return {
        "analisis": texto_analisis,
        "recomendaciones": texto_recomendaciones,
        "concepto_completo": concepto_completo
    }
