"""
Sistema de Generación de Conceptos para Pruebas de Trabajo
Adaptado para cumplir con el estilo específico del usuario (Factores Protectores, Cargo, Empresa).
"""

from typing import List, Dict, Tuple
import numpy as np
from datetime import datetime
import locale

# Intentar establecer locale a español para fechas
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_TIME, 'es_ES')
    except:
        pass # Fallback a default

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
    tiene_diagnostico_mental: bool = False,
    cargo: str = "trabajador",
    empresa: str = "la empresa"
) -> Dict[str, str]:
    """
    Genera concepto para Pruebas de Trabajo con estilo específico del usuario.
    Retorna diccionario estructurado.
    Args:
        evaluaciones: Lista de riesgos evaluados.
        nombre_trabajador: Nombre completo.
        tiene_diagnostico_mental: Booleano.
        cargo: Cargo del trabajador (para el texto legal).
        empresa: Empresa (para el texto de introducción).
    """

    if not evaluaciones:
        return {
            "analisis": "No se pueden generar análisis sin evaluaciones de riesgo completadas.",
            "recomendaciones": "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas.",
            "concepto_completo": "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas."
        }

    # Análisis profundo con ML
    perfil = analizar_perfil_ml(evaluaciones)
    severidad = perfil['severidad_global'] # bajo, medio, alto, muy_alto, critico

    # Detectar género y variables
    genero = detectar_genero(nombre_trabajador)
    
    # Mapeo de meses
    meses = {
        1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio",
        7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"
    }
    mes_actual = meses[datetime.now().month]
    anio_actual = datetime.now().year

    variables_texto = {
        'nombre': nombre_trabajador,
        'articulo': "la" if genero == 'F' else "el",
        'Articulo_cap': "La" if genero == 'F' else "El",
        'trabajador': "trabajadora" if genero == 'F' else "trabajador",
        'sustantivo': "la funcionaria" if genero == 'F' else "el funcionario", # User preference: "funcionaria/o"
        'cargo': cargo or "cargo no especificado",
        'empresa': empresa or "la entidad",
        'mes_actual': mes_actual,
        'anio_actual': anio_actual
    }

    # Seed para variación determinista
    nombre_hash = hash(nombre_trabajador)

    parrafos_analisis = []

    # ===== SECCIÓN 1: ANÁLISIS ESPECÍFICO POR NIVEL (ESTILO USUARIO) =====
    
    # 1.1 Intro común con Cargo y Empresa
    intro_base = (
        f"Del análisis de los resultados de la prueba de trabajo de esfera mental realizada a {variables_texto['nombre']}, "
        f"{variables_texto['cargo']} de {variables_texto['empresa']}, se identifica que {variables_texto['articulo']} {variables_texto['trabajador']} "
    )

    if severidad in ['bajo', 'sin_riesgo', 'riesgo_bajo']:
        # Texto específico para Riesgo Bajo (Factores Protectores)
        texto_riesgo = (
            "presenta un perfil psicosocial con factores de riesgo en niveles bajos que no representan una incidencia inminente "
            "en el estado emocional actual, ni su desempeño laboral. Si bien no representan riesgo inmediato, requieren identificarlos "
            "como factores protectores por el hecho de ser condiciones que, si bien se consideran controladas, requiere seguimiento y "
            "monitoreo periódico con el fin de mantener la estabilidad de las características laborales actuales y prevenir posibles "
            "variaciones desfavorables."
        )
        parrafos_analisis.append(intro_base + texto_riesgo)
        
        # Conclusión específica bajo
        conclusion_final = "En términos generales, el resultado de la Prueba de trabajo de esfera mental sugiere un estado de estabilidad de las tareas asignadas."

    elif severidad in ['medio', 'riesgo_medio']:
         # Texto específico para Riesgo Medio
        texto_riesgo = (
            "presenta un perfil psicosocial con factores de riesgo en niveles moderados. "
            "No obstante, en términos de exigencia están ajustados a los requerimientos de la tarea y la expectativa de cumplimiento "
            "según los estándares del área y de la institución, sin evidenciar desajustes significativos entre las capacidades "
            "de {sustantivo} y las demandas del cargo."
        ).format(**variables_texto)
        parrafos_analisis.append(intro_base + texto_riesgo)
        
        conclusion_final = (
            "Cualquier medida prevista como mecanismo de afianzamiento de los factores protectores o considerados sin riesgo "
            "permitirán evitar manifestaciones psico-somáticas de estrés moderado, cansancio, y necesidad de fortalecer estrategias de afrontamiento."
        )

    else: # Alto, Muy Alto, Crítico
        # Texto adaptado al estilo pero indicando riesgo
        texto_riesgo = (
            "presenta un perfil psicosocial con factores de riesgo en niveles altos que requieren atención prioritaria. "
            "A diferencia de un escenario de estabilidad, se evidencian desajustes entre las demandas del cargo y los recursos actuales, "
            "lo cual representa una incidencia potencial en el estado emocional y desempeño laboral. Estas condiciones requieren "
            "acciones correctivas para mitigar el riesgo de manifestaciones asociadas al estrés laboral."
        )
        parrafos_analisis.append(intro_base + texto_riesgo)
        
        conclusion_final = (
            "En términos generales, el resultado sugiere la necesidad de intervención inmediata para restablecer el equilibrio "
            "entre las demandas laborales y la capacidad de respuesta, previniendo afectaciones mayores en la salud."
        )

    # ===== SECCIÓN 2: DETALLE DE CATEGORÍAS (Solo si hay relevantes) =====
    # Agregamos detalle técnico breve si hay categorías altas/medias
    categorias_analizar = perfil['categorias_criticas'] + perfil['categorias_altas'] + perfil['categorias_medias']
    
    if categorias_analizar and severidad not in ['bajo', 'sin_riesgo']:
        detalles = []
        # Priorizar críticas y altas
        cats_mostrar = perfil['categorias_criticas'] + perfil['categorias_altas']
        if not cats_mostrar and severidad == 'medio':
             cats_mostrar = perfil['categorias_medias']

        for cat in cats_mostrar:
             # Nombre de categoría legible
            nombres_cat = {
                'demandas_cuantitativas': 'Demandas Cuantitativas',
                'demandas_carga_mental': 'Carga Mental',
                'demandas_emocionales': 'Demandas Emocionales',
                'exigencias_responsabilidad': 'Responsabilidad del Cargo',
                'consistencia_rol': 'Consistencia del Rol',
                'demandas_ambientales': 'Demandas Ambientales',
                'demandas_jornada': 'Jornada de Trabajo',
            }
            nombre_cat = nombres_cat.get(cat, cat.replace('_', ' ').title())
            detalles.append(nombre_cat)
            
        if detalles:
            # Limitar a 3 para no saturar
            detalles = detalles[:3]
            texto_detalles = ", ".join(detalles)
            parrafo_detalles = (
                f"Por otra parte, {variables_texto['articulo']} {variables_texto['trabajador']} valora niveles importantes en {texto_detalles}, "
                "lo cual amerita acciones preventivas y de intervención para evitar su escalamiento."
            )
            parrafos_analisis.append(parrafo_detalles)

    # Agregar conclusión de cierre del análisis (si no es None)
    if conclusion_final:
        parrafos_analisis.append(conclusion_final)
    
    # Construir texto final de Análisis
    texto_analisis = "\n\n".join(parrafos_analisis)
    
    # ===== SECCIÓN 3: TEXTO LEGAL Y RECOMENDACIONES (ESTILO USUARIO) =====
    
    texto_legal = (
        "Una vez evaluado el cargo {cargo} mediante la realización de una Prueba de trabajo de esfera mental, "
        "con antecedente de enfermedad laboral y analizados los requerimientos de {cargo}, basado en la visita "
        "al puesto de trabajo y entrevista con {sustantivo}, realizada en el mes de {mes_actual} de {anio_actual}, "
        "nos permitimos expedir las siguientes recomendaciones que a continuación se mencionan, por un periodo de 12 meses.\n\n"
        "Lo anterior con el objetivo de preservar el estado de salud y funcionalidad, favoreciendo su estabilidad emocional "
        "y la productividad, de conformidad con los artículos 2, 4 y 8 de la Ley 776 de 2002."
    ).format(**variables_texto)

    # Recomendaciones específicas del usuario (Hardcoded base + dinámicas)
    # El usuario dio un ejemplo muy bueno, trataremos de usar esas como base
    
    recs_trabajador_base = [
        "Mantener comunicación transparente, veraz y oportuna con la empresa sobre su estado de salud y capacidad laboral actual, en cumplimiento del artículo 27 de la Ley 1562 de 2012, lo cual facilita la implementación de ajustes razonables necesarios.",
        "Implementar pausas breves regulares para mantener la concentración óptima.",
        "Fortalecer su red de apoyo social dentro de la institución con sus compañeros de trabajo y mantener comunicación regular con familiares y amigos.",
        "Incorporar en su rutina semanal actividades físicas, recreativas o de esparcimiento que promuevan bienestar integral y liberación de tensiones.",
        "Seguir informando a jefe inmediato o profesional en Seguridad y Salud en el Trabajo ante cualquier cambio en su estado de salud que pueda interferir o afectar su ámbito laboral, así como de condiciones propias del trabajo que ejerzan afectación en su bienestar, salud o rendimiento laboral.",
        "Continuar con el cumplimiento de normas, reglamentos e instrucciones del Sistema de Gestión de la Seguridad y Salud en el Trabajo.",
        "Asistir periódicamente a las actividades de Promoción y Prevención a los que sea convocada por la entidad."
    ]

    recs_empresa_base = [
        "Informar oportunamente las recomendaciones a la funcionaria y a su jefe inmediato, con el fin de dar cumplimiento y evitar exacerbación de los síntomas.",
        "Continuar otorgando los permisos a la funcionaria para asistir a los controles programados por el médico tratante de la ARL y consultas psicológicas.",
        "Seguir involucrando al funcionario en las actividades enfocadas a la prevención de la salud física y/o mental, especialmente en actividades dirigidas a la prevención de factores de riesgo psicosocial.",
        "Participar activamente en el proceso de rehabilitación integral del trabajador, implementando ajustes razonables según capacidades actuales certificadas médicamente y proporcionando seguimiento continuo a su evolución.",
        "Fomentar ambiente laboral de respeto absoluto, no discriminación y apoyo genuino hacia el trabajador.",
        "Proporcionar retroalimentación constructiva sobre desempeño de manera regular, asertiva, específica y orientada al desarrollo."
    ]

    # Si hay riesgo alto, agregamos recomendaciones de intervención inmediata
    if severidad in ['alto', 'muy_alto', 'critico']:
        recs_empresa_base.insert(0, "MANTENER SEGUIMIENTO ESTRICTO y activar protocolo de intervención psicosocial prioritario debido al nivel de riesgo identificado.")

    # Formateo de lista numerada
    texto_trabajador = f"RECOMENDACIONES PARA {variables_texto['trabajador'].upper()}:\n"
    for i, rec in enumerate(recs_trabajador_base, 1):
        texto_trabajador += f"\n{i}. {rec}" 

    texto_empresa = f"\n\nRECOMENDACIONES PARA LA EMPRESA:\n"
    for i, rec in enumerate(recs_empresa_base, 1):
        texto_empresa += f"\n{i}. {rec}"

    # Cierre
    cierre = (
        "\n\nEstas recomendaciones tienen una vigencia de doce (12) meses contados a partir de la fecha de emisión, "
        "periodo durante el cual se recomienda seguimiento trimestral para verificar implementación y efectividad de las medidas sugeridas.\n"
        "En caso de cualquier inquietud, A.R.L. POSITIVA está dispuesta a brindarle la asesoría, para lo cual deberá comunicarse con la línea positiva 01 8000 111 170 o en Bogotá al 3307000."
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
        texto_analisis + "\n\nAsunto: Recomendaciones psicosociales del funcionario " + 
        f"{variables_texto['nombre'].upper()}.\n\n" +
        texto_recomendaciones
    )

    return {
        "analisis": texto_analisis,
        "recomendaciones": texto_recomendaciones,
        "concepto_completo": concepto_completo
    }
