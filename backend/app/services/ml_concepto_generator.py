"""
Sistema de Generación de Conceptos Psicológicos con Machine Learning
Utiliza NLP, análisis contextual y generación adaptativa de texto
"""

from typing import List, Dict, Tuple
import numpy as np
from collections import Counter
from app.models.evaluacion import CategoriaRiesgo, CalificacionRiesgo, EvaluacionRiesgo

# ==================== CONFIGURACIÓN DEL MODELO ====================

# Mapeo de calificaciones a valores numéricos para análisis cuantitativo
CALIFICACION_SCORES = {
    'alto': 3.0,
    'medio': 2.0,
    'bajo': 1.0,
    'na': 0.0
}

# Pesos por categoría (importancia clínica)
PESOS_CATEGORIAS = {
    'demandas_cuantitativas': 1.2,
    'demandas_carga_mental': 1.3,
    'demandas_emocionales': 1.4,  # Mayor peso por impacto psicológico
    'exigencias_responsabilidad': 1.1,
    'consistencia_rol': 1.2,
    'demandas_ambientales': 1.0,
    'demandas_jornada': 1.1,
}

# ==================== BANCO DE VARIACIONES TEXTUALES ====================

INTRODUCCIONES = {
    'critico': [
        "Del análisis exhaustivo y detallado de la valoración psicológica realizada a {nombre}, se identifica un perfil de riesgo psicosocial de nivel crítico que demanda intervención inmediata y seguimiento riguroso. {Articulo_cap} {trabajador} enfrenta múltiples factores de riesgo en niveles altos de manera simultánea, lo cual configura una situación de vulnerabilidad significativa para su salud mental y bienestar integral.",
        "Una vez {evaluado} integralmente {sustantivo} del asunto a través de la presente valoración psicológica, se evidencia un escenario clínico complejo caracterizado por la confluencia de diversos factores de riesgo psicosocial en niveles críticos. Esta situación representa una amenaza seria e inminente para la estabilidad emocional, salud mental y capacidad funcional de {nombre}, requiriendo acciones correctivas urgentes.",
        "Del estudio psicológico ocupacional realizado a {nombre}, emerge un perfil psicosocial que amerita atención prioritaria y urgente. {Articulo_cap} {trabajador} presenta exposición simultánea a múltiples estresores laborales de alta intensidad, configurando un cuadro de riesgo psicosocial severo que, de no intervenirse oportunamente, podría derivar en deterioro significativo de su salud mental.",
    ],
    'muy_alto': [
        "Del análisis de la valoración psicológica efectuada a {nombre}, se identifica que {articulo} {trabajador} presenta diversos factores de riesgo psicosocial en niveles elevados, configurando un perfil que requiere intervención prioritaria. La concurrencia de estos factores genera una situación de riesgo importante para su bienestar psicológico y desempeño laboral sostenible.",
        "Una vez {evaluado} {sustantivo} del asunto, quien presenta un diagnóstico de la esfera mental, se evidencia mediante la presente valoración un perfil psicosocial caracterizado por la presencia de múltiples factores de riesgo en niveles altos. Esta situación amerita la implementación inmediata de medidas correctivas y preventivas para salvaguardar la salud mental de {nombre}.",
        "Del análisis psicológico ocupacional realizado a {nombre}, se desprende que {articulo} {trabajador} enfrenta condiciones laborales que involucran varios factores de riesgo psicosocial significativos. El perfil identificado sugiere exposición a demandas laborales que exceden los recursos de afrontamiento disponibles, requiriendo ajustes sustanciales.",
    ],
    'alto': [
        "Del análisis de la valoración psicológica realizada a {nombre}, se observa que {articulo} {trabajador} presenta factores de riesgo psicosocial que ameritan atención e intervención oportuna. Si bien no se configura una situación crítica, la presencia de estos factores en niveles elevados requiere implementación de medidas preventivas y correctivas.",
        "Una vez {evaluado} {sustantivo} del asunto mediante valoración psicológica ocupacional, se identifica un perfil psicosocial que incluye factores de riesgo que requieren manejo proactivo. {Articulo_cap} {trabajador} enfrenta demandas laborales significativas que, sin la debida intervención, podrían impactar su salud mental y bienestar.",
        "Del estudio psicológico efectuado a {nombre}, se evidencia la presencia de factores de riesgo psicosocial que, aunque manejables con intervención adecuada, requieren atención para prevenir su agravamiento. {Articulo_cap} {trabajador} presenta exposición a condiciones que demandan implementación de ajustes razonables.",
    ],
    'medio': [
        "Del análisis de la valoración psicológica realizada a {nombre}, se identifica que {articulo} {trabajador} presenta un perfil psicosocial con factores de riesgo en niveles moderados que ameritan monitoreo y medidas preventivas. Las condiciones actuales, si bien no representan riesgo inmediato, requieren seguimiento para evitar su progresión.",
        "Una vez {evaluado} {sustantivo} del asunto mediante valoración psicológica ocupacional, se observa que {articulo} {trabajador} enfrenta demandas laborales en rangos moderados. El perfil identificado sugiere que con implementación de medidas preventivas y fortalecimiento de recursos de afrontamiento, se puede mantener un equilibrio saludable.",
        "Del análisis psicológico ocupacional de {nombre}, se desprende un perfil psicosocial que incluye factores en niveles moderados. {Articulo_cap} {trabajador} presenta condiciones laborales que, con el debido acompañamiento y ajustes menores, pueden gestionarse adecuadamente sin comprometer su salud mental.",
    ],
    'bajo': [
        "Del análisis de la valoración psicológica realizada a {nombre}, se evidencia un perfil psicosocial favorable caracterizado por factores de riesgo en niveles bajos y manejables. {Articulo_cap} {trabajador} presenta condiciones laborales que favorecen su bienestar psicológico, aunque se recomienda mantener estas condiciones y realizar seguimiento preventivo.",
        "Una vez {evaluado} {sustantivo} del asunto mediante valoración psicológica ocupacional, se identifica que {articulo} {trabajador} enfrenta demandas laborales en rangos bajos y controlados. El perfil actual es compatible con el mantenimiento del bienestar psicológico y desempeño sostenible, recomendándose preservar las condiciones actuales.",
        "Del estudio psicológico efectuado a {nombre}, se desprende un perfil psicosocial positivo con factores de riesgo mínimos. {Articulo_cap} {trabajador} presenta condiciones laborales adecuadas que permiten un desempeño saludable, sugiriéndose mantener monitoreo preventivo para detectar cambios oportunamente.",
    ],
}

DESCRIPCIONES_DETALLADAS = {
    'demandas_cuantitativas': {
        'alto_critico': "se encuentra sometido a una carga cuantitativa de trabajo excesiva y sostenida, con ritmo laboral acelerado constante, presión temporal extrema para cumplir plazos, imposibilidad de realizar pausas adecuadas durante la jornada, y volumen de tareas que supera ampliamente su capacidad de procesamiento. Esta sobrecarga sistemática genera agotamiento físico y mental progresivo",
        'alto': "presenta carga laboral cuantitativa significativa, con ritmo de trabajo acelerado en múltiples momentos de la jornada, presión de tiempo frecuente, y volumen de tareas que demanda esfuerzo sostenido. Esta situación genera tensión y riesgo de agotamiento",
        'medio': "enfrenta períodos de alta carga laboral alternados con momentos de demanda moderada, requiriendo gestión eficiente del tiempo y priorización de tareas para mantener el cumplimiento sin sobrecarga excesiva",
        'bajo': "maneja un volumen de trabajo equilibrado y acorde a su jornada laboral, con ritmo de trabajo razonable que permite pausas adecuadas y cumplimiento de tareas sin presión excesiva",
    },
    'demandas_carga_mental': {
        'alto_critico': "enfrenta demandas cognitivas extremadamente altas de manera constante, requiriendo niveles máximos de concentración, memoria, procesamiento simultáneo de información compleja, precisión absoluta, y toma de decisiones bajo presión de tiempo. La exigencia mental sostenida excede los períodos de recuperación disponibles, generando fatiga cognitiva severa y riesgo de errores por saturación",
        'alto': "presenta demandas de carga mental significativas que requieren altos niveles de concentración, procesamiento de información compleja, atención a detalles críticos, y manejo de múltiples variables simultáneas. La exigencia cognitiva sostenida puede generar fatiga mental y dificultades de concentración",
        'medio': "debe procesar información y mantener niveles moderados de atención y concentración, con tareas que demandan procesamiento mental pero con períodos de recuperación que permiten evitar saturación cognitiva",
        'bajo': "realiza tareas con demandas cognitivas manejables, que permiten mantener claridad mental, concentración adecuada y recuperación suficiente para un desempeño cognitivo óptimo",
    },
    'demandas_emocionales': {
        'alto_critico': "está expuesto de manera constante e intensa a situaciones emocionalmente devastadoras, trato con personas en crisis, manejo de emociones negativas de usuarios o clientes, situaciones de alto impacto emocional que trascienden al ámbito personal, y presión emocional sostenida sin espacios adecuados de descompresión. Esta exposición genera desgaste emocional severo, riesgo de burnout y afectación de su estabilidad psicológica",
        'alto': "enfrenta situaciones emocionalmente desafiantes de manera frecuente, incluyendo exposición a emociones negativas, tensión en interacciones con usuarios, y situaciones que generan impacto emocional. Esta exposición sostenida puede generar desgaste emocional y afectación del bienestar psicológico",
        'medio': "experimenta situaciones que requieren manejo y regulación emocional, con exposición moderada a tensiones emocionales que demandan desarrollo de estrategias de afrontamiento",
        'bajo': "trabaja en condiciones emocionalmente estables, con exposición mínima a situaciones de tensión emocional, lo cual favorece su bienestar emocional y equilibrio psicológico",
    },
    'exigencias_responsabilidad': {
        'alto_critico': "tiene bajo su responsabilidad directa aspectos críticos como la vida, salud o seguridad de múltiples personas, resultados de alto impacto organizacional, supervisión de personal numeroso, manejo de recursos económicos significativos, o información altamente confidencial. El peso de estas responsabilidades genera presión psicológica constante y preocupación permanente por las consecuencias de sus decisiones o acciones",
        'alto': "maneja responsabilidades significativas que incluyen supervisión de personal, resultados críticos del área, recursos importantes o información sensible. El nivel de responsabilidad genera presión y requiere soporte organizacional adecuado",
        'medio': "tiene responsabilidades importantes que requieren atención cuidadosa y cumplimiento riguroso, aunque con soporte y recursos disponibles para su gestión adecuada",
        'bajo': "maneja responsabilidades acordes a su nivel en la organización, con recursos y soporte adecuados que permiten desempeñarse con tranquilidad y confianza",
    },
    'consistencia_rol': {
        'alto_critico': "enfrenta contradicciones severas y sistemáticas en su rol laboral, incluyendo órdenes contradictorias frecuentes de múltiples fuentes, falta crónica de recursos esenciales para cumplir funciones, cambios abruptos y constantes en tareas asignadas, solicitudes que van contra principios técnicos o éticos, y falta absoluta de claridad sobre expectativas y prioridades. Esta inconsistencia genera confusión profunda, frustración extrema e imposibilidad de desempeño coherente",
        'alto': "experimenta inconsistencias significativas en su rol, incluyendo instrucciones contradictorias ocasionales, variaciones frecuentes en tareas asignadas, o falta de recursos necesarios. Estas inconsistencias generan confusión y dificultan el desempeño efectivo",
        'medio': "presenta algunas inconsistencias ocasionales que requieren clarificación con supervisores y adaptación a cambios en funciones o prioridades",
        'bajo': "tiene claridad en su rol laboral, funciones bien definidas, recursos adecuados disponibles y coherencia en las expectativas de desempeño",
    },
    'demandas_ambientales': {
        'alto_critico': "trabaja en condiciones ambientales severamente adversas, incluyendo ruido excesivo que imposibilita comunicación, iluminación deficiente que afecta la visión, temperaturas extremas, ventilación inadecuada, exposición a agentes biológicos o químicos peligrosos, esfuerzo físico extenuante, o riesgo alto de accidentes. Estas condiciones representan amenaza directa para su salud física y seguridad, además de generar preocupación constante",
        'alto': "enfrenta condiciones ambientales adversas que incluyen ruido significativo, iluminación o temperatura inadecuadas, esfuerzo físico considerable, o preocupación por exposición a agentes de riesgo. Estas condiciones pueden afectar su salud y bienestar",
        'medio': "presenta exposición a condiciones ambientales que requieren adaptación y uso de protección, aunque manejables con los controles disponibles",
        'bajo': "trabaja en condiciones ambientales adecuadas y seguras que favorecen su salud física y le permiten desempeñarse sin preocupaciones por su integridad",
    },
    'demandas_jornada': {
        'alto_critico': "trabaja en jornadas extenuantes que incluyen horarios nocturnos frecuentes o permanentes, turnos rotativos que impiden establecer rutinas de sueño, trabajo en días festivos y fines de semana sistemáticamente, extensión habitual de jornada más allá de lo legal, y contacto laboral fuera del horario establecido. Esta situación altera gravemente sus ritmos circadianos, impide recuperación física y mental adecuada, y deteriora severamente el balance vida-trabajo-familia",
        'alto': "enfrenta demandas de jornada significativas que incluyen trabajo nocturno, horarios extendidos frecuentes, o días consecutivos sin descanso. Esta situación afecta sus ciclos de sueño y recuperación, generando fatiga acumulada",
        'medio': "presenta jornadas que ocasionalmente se extienden o varían, requiriendo planificación para mantener equilibrio entre trabajo y vida personal",
        'bajo': "mantiene horarios regulares con períodos de descanso adecuados que favorecen la recuperación física y mental, y permiten balance entre vida laboral y personal",
    },
}

CONECTORES_IMPACTO = {
    'critico': [
        "Esta confluencia de factores configura un cuadro de riesgo psicosocial severo que está generando o tiene alto potencial de generar",
        "El conjunto de estas condiciones representa una amenaza seria para su salud mental, manifestándose en riesgo de",
        "La exposición sostenida a estos múltiples estresores laborales de alta intensidad puede derivar en",
    ],
    'muy_alto': [
        "La combinación de estos factores genera un perfil de riesgo importante que puede manifestarse en",
        "Esta situación, de mantenerse sin intervención, tiene potencial de generar",
        "El cuadro identificado representa riesgo significativo de desarrollar",
    ],
    'alto': [
        "Estos factores, sin la intervención adecuada, pueden conducir a",
        "La situación identificada amerita atención para prevenir",
        "De no implementarse ajustes, existe riesgo de",
    ],
    'medio': [
        "Con el manejo apropiado, se puede prevenir",
        "Las medidas preventivas permitirán evitar",
        "El seguimiento adecuado prevendrá",
    ],
}

CONSECUENCIAS = {
    'critico': "deterioro severo de la salud mental incluyendo trastornos de ansiedad, depresión mayor, burnout, trastornos del sueño, somatización, deterioro cognitivo significativo, y riesgo de incapacidad laboral prolongada o permanente",
    'muy_alto': "afectación importante de la salud mental con síntomas de ansiedad, depresión, agotamiento emocional, trastornos del sueño, irritabilidad, y disminución significativa del rendimiento laboral",
    'alto': "síntomas de estrés crónico, agotamiento, dificultades de concentración, alteraciones del ánimo, y deterioro gradual del bienestar psicológico",
    'medio': "manifestaciones de estrés moderado, cansancio, y necesidad de fortalecer estrategias de afrontamiento",
    'bajo': "condiciones que, aunque actualmente favorables, requieren monitoreo para mantener el bienestar",
}

# ==================== ANÁLISIS CUANTITATIVO AVANZADO ====================

def calcular_score_categoria(evaluaciones_cat: List[EvaluacionRiesgo], peso_categoria: float) -> Dict:
    """Calcula score cuantitativo ponderado de una categoría"""
    if not evaluaciones_cat:
        return {'score': 0, 'nivel': 'bajo', 'detalle': {}}

    scores = []
    conteo = {'alto': 0, 'medio': 0, 'bajo': 0}

    for eval in evaluaciones_cat:
        if eval.calificacion:
            calif = eval.calificacion.value if hasattr(eval.calificacion, 'value') else str(eval.calificacion)
            if calif in CALIFICACION_SCORES:
                scores.append(CALIFICACION_SCORES[calif])
                if calif in conteo:
                    conteo[calif] += 1

    if not scores:
        return {'score': 0, 'nivel': 'bajo', 'detalle': conteo}

    # Score promedio ponderado
    score_promedio = np.mean(scores) * peso_categoria

    # Análisis de distribución
    total = len(scores)
    pct_alto = conteo['alto'] / total * 100
    pct_medio = conteo['medio'] / total * 100
    pct_bajo = conteo['bajo'] / total * 100

    # Determinar nivel con lógica refinada
    if pct_alto >= 70:
        nivel = 'alto_critico'
    elif pct_alto >= 50:
        nivel = 'alto'
    elif pct_alto >= 30 or (pct_alto + pct_medio) >= 60:
        nivel = 'medio'
    else:
        nivel = 'bajo'

    return {
        'score': score_promedio,
        'score_raw': np.mean(scores),
        'nivel': nivel,
        'detalle': conteo,
        'porcentajes': {'alto': pct_alto, 'medio': pct_medio, 'bajo': pct_bajo},
        'items_count': total,
    }


def analizar_perfil_ml(evaluaciones: List[EvaluacionRiesgo]) -> Dict:
    """Análisis profundo del perfil usando técnicas cuantitativas"""

    # Agrupar por categoría
    por_categoria = {}
    for eval in evaluaciones:
        cat = eval.categoria.value if hasattr(eval.categoria, 'value') else str(eval.categoria)
        if cat not in por_categoria:
            por_categoria[cat] = []
        por_categoria[cat].append(eval)

    # Calcular scores por categoría
    scores_categorias = {}
    for cat, evals in por_categoria.items():
        peso = PESOS_CATEGORIAS.get(cat, 1.0)
        scores_categorias[cat] = calcular_score_categoria(evals, peso)

    # Score global ponderado
    scores_valores = [info['score'] for info in scores_categorias.values() if info['score'] > 0]
    score_global = np.mean(scores_valores) if scores_valores else 0

    # Categorías por nivel
    categorias_criticas = []
    categorias_altas = []
    categorias_medias = []
    categorias_bajas = []

    for cat, info in scores_categorias.items():
        nivel = info['nivel']
        if nivel == 'alto_critico':
            categorias_criticas.append(cat)
        elif nivel == 'alto':
            categorias_altas.append(cat)
        elif nivel == 'medio':
            categorias_medias.append(cat)
        else:
            categorias_bajas.append(cat)

    # Determinar severidad global con algoritmo mejorado
    num_criticas = len(categorias_criticas)
    num_altas = len(categorias_altas)
    num_medias = len(categorias_medias)

    if num_criticas >= 2 or score_global >= 2.7:
        severidad = 'critico'
    elif num_criticas >= 1 or num_altas >= 3 or score_global >= 2.4:
        severidad = 'muy_alto'
    elif num_altas >= 2 or (num_altas >= 1 and num_medias >= 2) or score_global >= 2.0:
        severidad = 'alto'
    elif num_medias >= 3 or score_global >= 1.5:
        severidad = 'medio'
    else:
        severidad = 'bajo'

    return {
        'scores_categorias': scores_categorias,
        'score_global': score_global,
        'severidad_global': severidad,
        'categorias_criticas': categorias_criticas,
        'categorias_altas': categorias_altas,
        'categorias_medias': categorias_medias,
        'categorias_bajas': categorias_bajas,
        'evaluaciones_raw': por_categoria,
    }


# ==================== GENERACIÓN DE TEXTO INTELIGENTE ====================

def seleccionar_texto_variado(opciones: List[str], seed_hash: int) -> str:
    """Selecciona una variación de texto de manera determinista pero variada"""
    idx = seed_hash % len(opciones)
    return opciones[idx]


def detectar_genero(nombre: str) -> str:
    """Detecta género del nombre"""
    nombre_lower = nombre.lower().strip().split()[0] if nombre else ""

    terminaciones_femeninas = ['a', 'is', 'iz', 'th', 'ny', 'ly', 'ey', 'elle']
    nombres_masculinos = ['joshua', 'josua', 'nikita', 'garcia', 'peña', 'ezra', 'andrea']
    nombres_femeninos = ['carmen', 'pilar', 'mercedes', 'dolores', 'flor', 'luz', 'mar', 'sol']

    if nombre_lower in nombres_masculinos:
        return 'M'
    if nombre_lower in nombres_femeninos:
        return 'F'

    for term in terminaciones_femeninas:
        if nombre_lower.endswith(term):
            return 'F'

    return 'M'


def generar_concepto_ml(
    evaluaciones: List[EvaluacionRiesgo],
    nombre_trabajador: str,
    tiene_diagnostico_mental: bool = False
) -> str:
    """
    Genera concepto psicológico usando análisis ML y generación de texto inteligente
    """

    if not evaluaciones:
        return "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas."

    # Análisis profundo con ML
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

    parrafos = [intro]

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

            # Construir párrafo
            if i == 0:
                conector = "Específicamente, en relación a"
            else:
                conector = "Adicionalmente, respecto a"

            parrafo = f"{conector} {nombre_categoria}, {variables_texto['articulo']} {variables_texto['trabajador']} {descripcion}."

            # Agregar ejemplos específicos
            if items_altos:
                ejemplos = items_altos[:2]
                if len(ejemplos) == 1:
                    parrafo += f' Particularmente se identifica en nivel alto: "{ejemplos[0]}".'
                else:
                    parrafo += f' Particularmente se identifican en nivel alto aspectos como: "{ejemplos[0]}" y "{ejemplos[1]}".'

            # Porcentaje
            pct_alto = info_cat['porcentajes']['alto']
            if pct_alto >= 50:
                parrafo += f" Se evidencia este nivel en {pct_alto:.0f}% de los ítems evaluados en esta dimensión."

            parrafos.append(parrafo)

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

        parrafos.append(
            f"Por otra parte, se observan niveles moderados en {texto_medias}, "
            f"lo cual amerita monitoreo continuo y acciones preventivas para evitar su escalamiento."
        )

    # ===== SECCIÓN 3: IMPACTO Y CONSECUENCIAS =====
    conectores = CONECTORES_IMPACTO.get(severidad, CONECTORES_IMPACTO['medio'])
    conector_impacto = seleccionar_texto_variado(conectores, nombre_hash + 1)
    consecuencia = CONSECUENCIAS[severidad]

    parrafo_impacto = f"{conector_impacto} {consecuencia}."
    parrafos.append(parrafo_impacto)

    # ===== SECCIÓN 4: TEXTO LEGAL PREVIO A RECOMENDACIONES =====
    texto_legal = (
        "\n\nUna vez evaluado {sustantivo} del asunto, quien presenta un diagnóstico de la esfera mental, "
        "nos permitimos manifestar las recomendaciones que a continuación se mencionan, las cuales se emiten "
        "con el objetivo de prevenir agravamiento de su estado de salud y favorecer su rehabilitación, "
        "lo anterior de conformidad con los artículos 2°, 4° y 8° de la Ley 776 de 2002."
    )
    parrafos.append(texto_legal.format(**variables_texto))

    # ===== SECCIÓN 5: RECOMENDACIONES =====
    recs_trabajador, recs_empresa = generar_recomendaciones_ml(perfil, tiene_diagnostico_mental)

    texto_trabajador = f"\n\nRECOMENDACIONES PARA {variables_texto['trabajador'].upper()}:\n"
    for i, rec in enumerate(recs_trabajador, 1):
        texto_trabajador += f"\n{i}. {rec}\n"

    texto_empresa = f"\nRECOMENDACIONES PARA LA EMPRESA:\n"
    for i, rec in enumerate(recs_empresa, 1):
        texto_empresa += f"\n{i}. {rec}\n"

    # ===== CIERRE =====
    if severidad in ['critico', 'muy_alto']:
        cierre = (
            "\n\nEstas recomendaciones tienen carácter URGENTE y deben implementarse de manera inmediata. "
            "Se requiere seguimiento mensual durante los próximos seis (6) meses para evaluar efectividad "
            "de las intervenciones y realizar ajustes según evolución del caso. La vigencia de estas "
            "recomendaciones es de doce (12) meses contados a partir de la fecha de emisión."
        )
    else:
        cierre = (
            "\n\nEstas recomendaciones tienen una vigencia de doce (12) meses contados a partir de la fecha "
            "de emisión, periodo durante el cual se recomienda seguimiento trimestral para verificar "
            "implementación y efectividad de las medidas sugeridas."
        )

    # ===== CONCEPTO FINAL =====
    concepto_completo = (
        "\n\n".join(parrafos) +
        texto_trabajador +
        texto_empresa +
        cierre
    )

    return concepto_completo


def generar_recomendaciones_ml(perfil: Dict, tiene_diagnostico: bool) -> Tuple[List[str], List[str]]:
    """Genera recomendaciones basadas en análisis ML"""

    recs_trabajador = []
    recs_empresa = []

    severidad = perfil['severidad_global']

    # ===== RECOMENDACIONES BASE =====
    if tiene_diagnostico:
        if severidad in ['critico', 'muy_alto']:
            recs_trabajador.append(
                "Continuar de manera rigurosa y prioritaria con el tratamiento médico especializado en psiquiatría "
                "y psicología, asistiendo a TODAS las citas programadas sin excepción y siguiendo estrictamente "
                "las indicaciones terapéuticas y farmacológicas prescritas. Reportar inmediatamente cualquier "
                "cambio significativo en síntomas o efectos adversos de medicación."
            )
        else:
            recs_trabajador.append(
                "Continuar con el tratamiento médico por psiquiatría y psicología de manera constante, "
                "siguiendo las indicaciones profesionales y asistiendo regularmente a las citas programadas."
            )

    recs_trabajador.append(
        "Mantener comunicación transparente, veraz y oportuna con la empresa sobre su estado de salud "
        "y capacidad laboral actual, en cumplimiento del artículo 27 de la Ley 1562 de 2012, "
        "lo cual facilita la implementación de ajustes razonables necesarios."
    )

    # ===== RECOMENDACIONES ESPECÍFICAS POR CATEGORÍA =====
    todas_categorias = (
        perfil['categorias_criticas'] +
        perfil['categorias_altas'] +
        perfil['categorias_medias']
    )

    for cat in todas_categorias:
        info_cat = perfil['scores_categorias'][cat]
        nivel = info_cat['nivel']

        # DEMANDAS CUANTITATIVAS
        if cat == 'demandas_cuantitativas':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Implementar rigurosamente técnicas de gestión del tiempo, priorizando tareas según urgencia "
                    "e importancia real. Comunicar proactivamente al supervisor cuando la carga laboral exceda "
                    "su capacidad, estableciendo límites claros y negociando plazos realistas."
                )
                recs_empresa.append(
                    "Realizar análisis objetivo e inmediato de la carga laboral del puesto mediante estudio de "
                    "tiempos y movimientos. Redistribuir tareas si se confirma sobrecarga sistemática, considerando "
                    "seriamente ampliación del equipo o contratación de personal de apoyo. Establecer prioridades "
                    "claras y realistas, eliminando tareas innecesarias."
                )
            elif nivel == 'medio':
                recs_trabajador.append(
                    "Organizar el trabajo en bloques de tiempo definidos y mantener comunicación regular "
                    "con el supervisor sobre avances y dificultades en el cumplimiento de tareas."
                )
                recs_empresa.append(
                    "Revisar periódicamente la distribución de tareas y carga laboral, proporcionando "
                    "herramientas de gestión y soporte cuando se identifiquen picos de demanda."
                )

        # DEMANDAS CARGA MENTAL
        if cat == 'demandas_carga_mental':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Implementar pausas cognitivas obligatorias cada 60-90 minutos de trabajo mental intenso. "
                    "Practicar técnicas de mindfulness (atención plena) durante 5-10 minutos en estas pausas. "
                    "Asegurar sueño de 7-8 horas nocturnas sin interrupciones. Evitar multitasking; enfocarse "
                    "en una sola tarea compleja a la vez. Realizar actividades de baja demanda cognitiva fuera "
                    "del trabajo para permitir recuperación cerebral."
                )
                recs_empresa.append(
                    "Permitir y facilitar pausas programadas durante tareas de alta complejidad cognitiva. "
                    "Evitar asignación simultánea de múltiples proyectos complejos. Proporcionar tiempo adecuado "
                    "de capacitación en nuevos sistemas sin presión. Considerar rotación de tareas altamente "
                    "demandantes con otras más ligeras cognitivamente."
                )
            elif nivel == 'medio':
                recs_trabajador.append(
                    "Implementar pausas breves regulares para mantener la concentración óptima. "
                    "Organizar la información de trabajo de manera clara y sistemática."
                )
                recs_empresa.append(
                    "Facilitar capacitación en nuevas herramientas o procesos. "
                    "Permitir tiempo adecuado para completar tareas complejas sin presión excesiva."
                )

        # DEMANDAS EMOCIONALES
        if cat == 'demandas_emocionales':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Desarrollar y aplicar estrategias de regulación emocional profesional (distanciamiento "
                    "saludable sin indiferencia). Practicar técnicas de respiración diafragmática ante situaciones "
                    "de tensión emocional. Buscar apoyo psicológico profesional especializado en manejo de estrés "
                    "laboral. Establecer límites claros entre vida laboral y personal. Participar en actividades "
                    "de liberación emocional fuera del trabajo (ejercicio, arte, expresión creativa)."
                )
                recs_empresa.append(
                    "Proporcionar capacitación especializada en manejo de situaciones emocionalmente difíciles "
                    "y técnicas de comunicación en crisis. Ofrecer acceso a programa de apoyo psicológico "
                    "confidencial (EAP - Employee Assistance Program). Establecer espacios de debriefing o "
                    "descompresión después de situaciones críticas. Implementar rotación en tareas de muy alta "
                    "demanda emocional. Promover cultura de apoyo entre pares y supervisión empática."
                )
            elif nivel == 'medio':
                recs_trabajador.append(
                    "Desarrollar habilidades de regulación emocional básicas y mantener canales de "
                    "comunicación abiertos con compañeros de trabajo para apoyo mutuo."
                )
                recs_empresa.append(
                    "Fomentar comunicación abierta sobre situaciones de tensión emocional. "
                    "Ofrecer recursos básicos de apoyo psicológico preventivo."
                )

        # EXIGENCIAS RESPONSABILIDAD
        if cat == 'exigencias_responsabilidad':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Documentar meticulosamente decisiones importantes y procesos críticos. Solicitar "
                    "retroalimentación frecuente sobre desempeño para validar decisiones. Compartir "
                    "responsabilidades con el equipo de manera estructurada. Mantenerse actualizado "
                    "constantemente en conocimientos críticos para el cargo."
                )
                recs_empresa.append(
                    "Clarificar por escrito y de manera detallada el alcance exacto de las responsabilidades "
                    "del cargo. Establecer sistemas de supervisión, respaldo y retroalimentación constante. "
                    "Proporcionar capacitación continua intensiva en áreas críticas. Implementar mecanismos "
                    "de doble verificación en decisiones de alto impacto. Reconocer y compensar adecuadamente "
                    "el nivel de responsabilidad asumido."
                )

        # CONSISTENCIA ROL
        if cat == 'consistencia_rol':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Solicitar de manera asertiva pero firme reuniones de clarificación con el supervisor "
                    "inmediato cuando reciba instrucciones contradictorias. Documentar por escrito todas "
                    "las tareas, responsabilidades y cambios comunicados. Mantener comunicación proactiva "
                    "sobre necesidades de recursos o herramientas faltantes. Proponer soluciones constructivas "
                    "ante inconsistencias identificadas."
                )
                recs_empresa.append(
                    "Realizar descripción de cargo clara, detallada y por escrito. Establecer UN SOLO canal "
                    "de instrucción directo y exclusivo para evitar contradicciones. Proporcionar TODOS los "
                    "recursos, herramientas y personal necesarios documentados en el perfil del cargo. Mantener "
                    "estabilidad en tareas asignadas; comunicar cambios con anticipación mínima de 48 horas. "
                    "Implementar reuniones semanales de alineación de expectativas y prioridades."
                )

        # DEMANDAS AMBIENTALES
        if cat == 'demandas_ambientales':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Utilizar de manera rigurosa y sin excepciones todos los elementos de protección personal "
                    "asignados. Reportar de inmediato (mismo día) condiciones ambientales que pongan en riesgo "
                    "la salud o seguridad. Realizar pausas en ambientes más confortables cuando esté disponible. "
                    "Practicar ejercicios de estiramiento y movilidad cada 2 horas para contrarrestar esfuerzo físico."
                )
                recs_empresa.append(
                    "Realizar evaluación ergonómica y ambiental profesional e inmediata del puesto de trabajo. "
                    "Implementar controles de ingeniería prioritarios para mejorar condiciones (ventilación forzada, "
                    "iluminación LED adecuada, control de temperatura, aislamiento acústico). Proporcionar elementos "
                    "de protección personal de alta calidad certificados. Establecer y capacitar en protocolos de "
                    "seguridad específicos. Permitir pausas frecuentes en ambientes confortables. Considerar rotación "
                    "de personal en condiciones extremadamente demandantes."
                )

        # DEMANDAS JORNADA
        if cat == 'demandas_jornada':
            if nivel in ['alto_critico', 'alto']:
                recs_trabajador.append(
                    "Priorizar sueño de calidad en horarios disponibles: habitación completamente oscura, sin ruido, "
                    "temperatura fresca (18-20°C). Mantener rutinas de sueño lo más constantes posible incluso en "
                    "horarios irregulares. Rechazar firmemente horas extras no programadas que afecten periodos de "
                    "recuperación esenciales. Comunicar formalmente efectos negativos documentados de la jornada "
                    "en salud física o mental."
                )
                recs_empresa.append(
                    "Cumplir ESTRICTAMENTE con la jornada laboral legal establecida (máximo 48 horas semanales). "
                    "ELIMINAR trabajo nocturno salvo que sea absolutamente inherente al cargo y con rotación adecuada "
                    "quincenal. GARANTIZAR mínimo UN día completo de descanso por semana sin excepciones. PROHIBIR "
                    "contacto laboral fuera de jornada (llamadas, mensajes, correos) bajo sanciones. Implementar "
                    "sistema de turnos que respete mínimo 11 horas de descanso entre jornadas."
                )

    # ===== RECOMENDACIONES UNIVERSALES =====
    if severidad in ['critico', 'muy_alto']:
        recs_trabajador.append(
            "Fortalecer activamente su red de apoyo social y emocional, manteniendo comunicación regular y profunda "
            "con familiares cercanos, amigos de confianza y, si lo considera apropiado, grupos de apoyo o comunidad "
            "religiosa/espiritual. El aislamiento social agrava significativamente los problemas de salud mental."
        )
        recs_trabajador.append(
            "Incorporar de manera NO NEGOCIABLE en su rutina semanal mínimo 150 minutos de actividad física moderada "
            "(caminata rápida, natación, ciclismo) O 75 minutos de actividad vigorosa (trote, deportes). El ejercicio "
            "es tan efectivo como medicación antidepresiva para síntomas leves a moderados."
        )
    else:
        recs_trabajador.append(
            "Fortalecer su red de apoyo social, manteniendo comunicación regular con familiares, amigos y compañeros de trabajo."
        )
        recs_trabajador.append(
            "Incorporar en su rutina semanal actividades físicas, recreativas o artísticas que promuevan bienestar integral "
            "y liberación de tensiones."
        )

    recs_empresa.append(
        "Participar activamente en el proceso de rehabilitación integral del trabajador, implementando ajustes razonables "
        "según capacidades actuales certificadas médicamente y proporcionando seguimiento continuo mensual a su evolución."
    )

    recs_empresa.append(
        "Fomentar ambiente laboral de respeto absoluto, no discriminación y apoyo genuino hacia el trabajador. "
        "Proporcionar retroalimentación constructiva sobre desempeño de manera regular (mínimo mensual), asertiva, "
        "específica y orientada al desarrollo, no solo a la corrección."
    )

    # Eliminar duplicados
    recs_trabajador = list(dict.fromkeys(recs_trabajador))
    recs_empresa = list(dict.fromkeys(recs_empresa))

    return recs_trabajador, recs_empresa
