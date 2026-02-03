"""
Generador de Conceptos Psicológicos con Inteligencia Artificial
Sistema avanzado de análisis y generación personalizada sin APIs de pago
"""

from typing import List, Dict, Tuple
from app.models.evaluacion import CategoriaRiesgo, CalificacionRiesgo, EvaluacionRiesgo

# ==================== ANÁLISIS DETALLADO POR CATEGORÍA ====================

CATEGORIAS_INFO = {
    'demandas_cuantitativas': {
        'nombre': 'Demandas Cuantitativas del Trabajo',
        'descripcion_alta': 'presenta una carga laboral excesiva con ritmo acelerado y presión de tiempo constante',
        'descripcion_media': 'experimenta períodos de alta carga laboral que requieren gestión del tiempo',
        'descripcion_baja': 'maneja una carga laboral equilibrada y manejable',
        'impacto_alto': 'esto puede generar agotamiento físico y mental, afectando su desempeño y bienestar',
        'impacto_medio': 'esto requiere estrategias de organización para evitar sobrecarga',
        'impacto_bajo': 'esto favorece un desempeño sostenible y saludable',
    },
    'demandas_carga_mental': {
        'nombre': 'Demandas de Carga Mental',
        'descripcion_alta': 'enfrenta exigencias cognitivas significativas que requieren alta concentración, memoria y procesamiento de información compleja',
        'descripcion_media': 'debe manejar tareas que demandan atención y procesamiento mental moderado',
        'descripcion_baja': 'realiza tareas con demandas cognitivas manejables',
        'impacto_alto': 'esto puede ocasionar fatiga mental, dificultades de concentración y agotamiento cognitivo',
        'impacto_medio': 'esto requiere pausas y estrategias de gestión mental',
        'impacto_bajo': 'esto permite mantener claridad mental y rendimiento óptimo',
    },
    'demandas_emocionales': {
        'nombre': 'Demandas Emocionales',
        'descripcion_alta': 'está expuesto a situaciones emocionalmente desafiantes que involucran trato con personas en situaciones difíciles o tareas que generan tensión emocional',
        'descripcion_media': 'experimenta situaciones que requieren manejo emocional y control de tensiones',
        'descripcion_baja': 'trabaja en un ambiente emocionalmente estable',
        'impacto_alto': 'esto puede generar desgaste emocional, ansiedad y afectación de su estabilidad psicológica',
        'impacto_medio': 'esto requiere desarrollo de habilidades de regulación emocional',
        'impacto_bajo': 'esto favorece el bienestar emocional y la estabilidad',
    },
    'exigencias_responsabilidad': {
        'nombre': 'Exigencias de Responsabilidad del Cargo',
        'descripcion_alta': 'tiene responsabilidades significativas sobre resultados críticos, recursos importantes o la seguridad de otras personas',
        'descripcion_media': 'maneja responsabilidades importantes que requieren atención cuidadosa',
        'descripcion_baja': 'tiene responsabilidades acordes a su capacidad y recursos disponibles',
        'impacto_alto': 'esto puede generar presión constante y preocupación por las consecuencias de sus decisiones',
        'impacto_medio': 'esto requiere soporte y claridad en las expectativas del cargo',
        'impacto_bajo': 'esto permite trabajar con tranquilidad y confianza',
    },
    'consistencia_rol': {
        'nombre': 'Consistencia de Rol',
        'descripcion_alta': 'enfrenta contradicciones, falta de recursos o cambios frecuentes en sus tareas que dificultan el desempeño coherente de su rol',
        'descripcion_media': 'experimenta ocasionales inconsistencias que requieren adaptación',
        'descripcion_baja': 'tiene claridad en su rol y cuenta con los recursos necesarios',
        'impacto_alto': 'esto genera confusión, frustración y dificultad para cumplir adecuadamente con sus funciones',
        'impacto_medio': 'esto requiere comunicación clara con sus superiores',
        'impacto_bajo': 'esto facilita un desempeño efectivo y coherente',
    },
    'demandas_ambientales': {
        'nombre': 'Demandas Ambientales y de Esfuerzo Físico',
        'descripcion_alta': 'trabaja en condiciones ambientales adversas o con exigencias físicas significativas',
        'descripcion_media': 'enfrenta condiciones ambientales que requieren adaptación',
        'descripcion_baja': 'trabaja en condiciones ambientales adecuadas',
        'impacto_alto': 'esto puede afectar su salud física y capacidad de realizar sus tareas de manera segura',
        'impacto_medio': 'esto requiere medidas de protección y ajustes ergonómicos',
        'impacto_bajo': 'esto favorece su salud y seguridad laboral',
    },
    'demandas_jornada': {
        'nombre': 'Demandas de la Jornada de Trabajo',
        'descripcion_alta': 'trabaja en horarios extendidos, nocturnos o con días consecutivos sin descanso',
        'descripcion_media': 'tiene jornadas que ocasionalmente se extienden o varían',
        'descripcion_baja': 'mantiene horarios regulares y periodos de descanso adecuados',
        'impacto_alto': 'esto puede afectar su ritmo circadiano, descanso y vida familiar',
        'impacto_medio': 'esto requiere planificación para mantener el equilibrio',
        'impacto_bajo': 'esto favorece el balance vida-trabajo y recuperación',
    },
}

# ==================== RECOMENDACIONES ESPECÍFICAS POR FACTOR ====================

RECOMENDACIONES_ESPECIFICAS_TRABAJADOR = {
    'demandas_cuantitativas_alto': [
        'Implementar técnicas de gestión del tiempo como la técnica Pomodoro (25 minutos de trabajo concentrado seguidos de 5 minutos de descanso)',
        'Priorizar tareas según urgencia e importancia utilizando la matriz de Eisenhower',
        'Comunicar proactivamente cuando la carga laboral exceda su capacidad para evitar compromisos irreales',
        'Desarrollar habilidades de delegación cuando sea posible',
    ],
    'demandas_cuantitativas_medio': [
        'Organizar el trabajo en bloques de tiempo definidos para optimizar la productividad',
        'Mantener comunicación abierta con el supervisor sobre plazos y prioridades',
    ],
    'demandas_carga_mental_alto': [
        'Realizar pausas mentales cada 60-90 minutos para permitir la recuperación cognitiva',
        'Practicar técnicas de mindfulness o meditación breve (5-10 minutos) durante la jornada',
        'Asegurar descanso nocturno de 7-8 horas para consolidación de memoria y recuperación mental',
        'Evitar multitasking excesivo; enfocarse en una tarea compleja a la vez',
        'Participar en actividades recreativas que no demanden alto procesamiento cognitivo fuera del horario laboral',
    ],
    'demandas_carga_mental_medio': [
        'Implementar pausas breves para mantener la concentración',
        'Organizar la información de trabajo de manera clara y accesible',
    ],
    'demandas_emocionales_alto': [
        'Desarrollar estrategias de distanciamiento emocional saludable (no indiferencia, sino regulación)',
        'Practicar técnicas de respiración consciente ante situaciones de tensión emocional',
        'Buscar espacios de desahogo emocional apropiados (conversaciones con colegas, supervisor o apoyo psicológico)',
        'Establecer límites claros entre vida laboral y personal',
        'Participar en actividades que promuevan bienestar emocional fuera del trabajo (ejercicio, arte, música)',
    ],
    'demandas_emocionales_medio': [
        'Mantener canales de comunicación abiertos con el equipo de trabajo',
        'Identificar y comunicar situaciones que generen tensión emocional',
    ],
    'exigencias_responsabilidad_alto': [
        'Documentar decisiones importantes y procesos críticos para reducir incertidumbre',
        'Solicitar retroalimentación regular sobre el desempeño para validar decisiones',
        'Compartir responsabilidades con el equipo cuando sea apropiado',
        'Mantener actualización constante en conocimientos críticos para su cargo',
    ],
    'exigencias_responsabilidad_medio': [
        'Clarificar con el supervisor el alcance de sus responsabilidades',
        'Mantener comunicación constante sobre avances y desafíos',
    ],
    'consistencia_rol_alto': [
        'Solicitar reuniones de clarificación con el supervisor inmediato cuando reciba instrucciones contradictorias',
        'Documentar por escrito las tareas y responsabilidades asignadas',
        'Mantener comunicación asertiva sobre necesidades de recursos o herramientas faltantes',
        'Proponer soluciones constructivas ante inconsistencias identificadas',
    ],
    'consistencia_rol_medio': [
        'Mantener comunicación clara sobre cambios en las tareas asignadas',
        'Solicitar clarificación cuando haya dudas sobre prioridades',
    ],
    'demandas_ambientales_alto': [
        'Utilizar de manera rigurosa todos los elementos de protección personal asignados',
        'Reportar de inmediato condiciones ambientales que pongan en riesgo la salud o seguridad',
        'Realizar pausas en ambientes más confortables cuando sea posible',
        'Practicar ejercicios de estiramiento y movilidad para contrarrestar esfuerzo físico',
    ],
    'demandas_ambientales_medio': [
        'Usar adecuadamente los equipos de protección disponibles',
        'Reportar condiciones que requieran mejora',
    ],
    'demandas_jornada_alto': [
        'Priorizar un sueño de calidad en horarios disponibles (habitación oscura, sin ruido, temperatura adecuada)',
        'Mantener rutinas de descanso constantes incluso en horarios irregulares',
        'Evitar horas extras no programadas que afecten periodos de recuperación',
        'Comunicar efectos negativos de la jornada en su salud o desempeño',
    ],
    'demandas_jornada_medio': [
        'Planificar actividades personales considerando la variabilidad de horarios',
        'Mantener rutinas de sueño regulares',
    ],
}

RECOMENDACIONES_ESPECIFICAS_EMPRESA = {
    'demandas_cuantitativas_alto': [
        'Realizar análisis de carga laboral del puesto y redistribuir tareas si se identifica sobrecarga sistemática',
        'Establecer prioridades claras y realistas en la asignación de tareas',
        'Considerar ampliación del equipo o redistribución de funciones si la carga es permanentemente alta',
        'Implementar sistemas de seguimiento de carga laboral para prevención temprana de sobrecarga',
    ],
    'demandas_cuantitativas_medio': [
        'Revisar periódicamente la distribución de tareas para evitar sobrecargas puntuales',
        'Facilitar herramientas de gestión del tiempo y productividad',
    ],
    'demandas_carga_mental_alto': [
        'Permitir pausas programadas durante tareas de alta complejidad cognitiva',
        'Evitar asignación simultánea de múltiples proyectos de alta complejidad',
        'Proporcionar capacitación en nuevos sistemas o procesos con tiempo adecuado de aprendizaje',
        'Considerar rotación de tareas muy demandantes cognitivamente con otras más ligeras',
    ],
    'demandas_carga_mental_medio': [
        'Facilitar capacitación en nuevas herramientas o procesos',
        'Permitir tiempo adecuado para tareas complejas',
    ],
    'demandas_emocionales_alto': [
        'Proporcionar entrenamiento en manejo de situaciones emocionalmente difíciles',
        'Ofrecer acceso a apoyo psicológico o programas de bienestar emocional',
        'Establecer espacios de descompresión o debriefing después de situaciones críticas',
        'Rotar personal en tareas de alta demanda emocional cuando sea posible',
        'Promover cultura de apoyo entre pares y supervisión empática',
    ],
    'demandas_emocionales_medio': [
        'Fomentar comunicación abierta sobre situaciones de tensión',
        'Ofrecer recursos de apoyo psicológico preventivo',
    ],
    'exigencias_responsabilidad_alto': [
        'Clarificar por escrito el alcance de las responsabilidades del cargo',
        'Establecer sistemas de supervisión y retroalimentación constante',
        'Proporcionar capacitación continua en áreas críticas de responsabilidad',
        'Implementar mecanismos de respaldo y soporte en decisiones de alto impacto',
        'Reconocer y valorar adecuadamente el nivel de responsabilidad asumido',
    ],
    'exigencias_responsabilidad_medio': [
        'Clarificar expectativas y alcance de responsabilidades',
        'Proporcionar retroalimentación regular sobre el desempeño',
    ],
    'consistencia_rol_alto': [
        'Realizar descripción clara y detallada del cargo por escrito',
        'Establecer un solo canal de instrucción directo para evitar contradicciones',
        'Proporcionar los recursos, herramientas y personal necesarios para cumplir con las funciones asignadas',
        'Mantener estabilidad en las tareas asignadas, comunicando con anticipación cambios necesarios',
        'Implementar reuniones periódicas de alineación de expectativas y prioridades',
    ],
    'consistencia_rol_medio': [
        'Mejorar la comunicación sobre cambios en funciones o prioridades',
        'Asegurar disponibilidad de recursos necesarios',
    ],
    'demandas_ambientales_alto': [
        'Realizar evaluaciones ergonómicas y ambientales del puesto de trabajo',
        'Implementar controles de ingeniería para mejorar condiciones (ventilación, iluminación, temperatura)',
        'Proporcionar elementos de protección personal adecuados y de calidad',
        'Establecer protocolos de seguridad claros y capacitación en su uso',
        'Realizar pausas en ambientes más confortables cuando las condiciones sean adversas',
        'Considerar rotación de personal en condiciones especialmente demandantes',
    ],
    'demandas_ambientales_medio': [
        'Mejorar condiciones ergonómicas y ambientales identificadas',
        'Asegurar disponibilidad de equipos de protección',
    ],
    'demandas_jornada_alto': [
        'Cumplir estrictamente con la jornada laboral establecida, evitando horas extras sistemáticas',
        'No asignar trabajo nocturno salvo que sea inherente al cargo y con rotación adecuada',
        'Garantizar al menos un día de descanso por semana',
        'Evitar contacto laboral fuera de la jornada establecida (llamadas, mensajes, correos)',
        'Implementar sistemas de turnos que respeten periodos de descanso y recuperación',
    ],
    'demandas_jornada_medio': [
        'Respetar horarios establecidos y evitar extensiones frecuentes',
        'Planificar trabajo para evitar sobrecargas puntuales',
    ],
}

# ==================== GENERADOR INTELIGENTE DE CONCEPTOS ====================

def analizar_perfil_riesgo(evaluaciones: List[EvaluacionRiesgo]) -> Dict:
    """
    Analiza en profundidad el perfil de riesgo del trabajador
    """
    perfil = {
        'niveles_por_categoria': {},
        'factores_criticos': [],
        'factores_atencion': [],
        'factores_positivos': [],
        'items_alto_riesgo': [],
        'patron_general': '',
        'severidad_global': '',
    }

    # Agrupar por categoría
    por_categoria = {}
    for eval in evaluaciones:
        cat = eval.categoria.value if hasattr(eval.categoria, 'value') else str(eval.categoria)
        if cat not in por_categoria:
            por_categoria[cat] = []
        por_categoria[cat].append(eval)

    # Analizar cada categoría
    categorias_altas = []
    categorias_medias = []
    categorias_bajas = []

    for cat, evals in por_categoria.items():
        conteo = {'alto': 0, 'medio': 0, 'bajo': 0}
        items_detalle = []

        for ev in evals:
            if ev.calificacion:
                calif = ev.calificacion.value if hasattr(ev.calificacion, 'value') else str(ev.calificacion)
                conteo[calif] += 1
                items_detalle.append({
                    'item': ev.item_texto,
                    'calificacion': calif,
                    'observaciones': ev.observaciones
                })

        total = sum(conteo.values())
        if total == 0:
            continue

        # Determinar nivel predominante
        if conteo['alto'] >= total * 0.5:
            nivel = 'alto'
            categorias_altas.append(cat)
        elif (conteo['alto'] + conteo['medio']) >= total * 0.5:
            nivel = 'medio'
            categorias_medias.append(cat)
        else:
            nivel = 'bajo'
            categorias_bajas.append(cat)

        perfil['niveles_por_categoria'][cat] = {
            'nivel': nivel,
            'conteo': conteo,
            'items': items_detalle,
            'porcentaje_alto': round(conteo['alto'] / total * 100, 1),
            'porcentaje_medio': round(conteo['medio'] / total * 100, 1),
        }

    # Determinar severidad global
    num_categorias = len(perfil['niveles_por_categoria'])
    if len(categorias_altas) >= 3:
        perfil['severidad_global'] = 'muy_alto'
        perfil['patron_general'] = 'presenta múltiples factores de riesgo psicosocial en nivel alto'
    elif len(categorias_altas) >= 2:
        perfil['severidad_global'] = 'alto'
        perfil['patron_general'] = 'presenta factores de riesgo psicosocial significativos'
    elif len(categorias_medias) >= 3:
        perfil['severidad_global'] = 'medio'
        perfil['patron_general'] = 'presenta factores de riesgo psicosocial moderados'
    else:
        perfil['severidad_global'] = 'bajo'
        perfil['patron_general'] = 'presenta factores de riesgo psicosocial en niveles manejables'

    perfil['factores_criticos'] = categorias_altas
    perfil['factores_atencion'] = categorias_medias
    perfil['factores_positivos'] = categorias_bajas

    return perfil


def generar_parrafo_analisis(perfil: Dict, nombre_trabajador: str, genero: str) -> str:
    """
    Genera el párrafo de análisis detallado del caso
    """
    articulo = "la" if genero == 'F' else "el"
    trabajador = "la trabajadora" if genero == 'F' else "el trabajador"
    evaluado = "evaluada" if genero == 'F' else "evaluado"

    parrafos = []

    # Introducción personalizada según severidad
    if perfil['severidad_global'] == 'muy_alto':
        intro = (f"Del análisis exhaustivo de la valoración psicológica realizada a {nombre_trabajador}, "
                f"se identifica que {trabajador} {perfil['patron_general']}, lo cual representa una "
                f"situación de riesgo importante para su salud mental y bienestar laboral que requiere "
                f"intervención inmediata y seguimiento continuo.")
    elif perfil['severidad_global'] == 'alto':
        intro = (f"Del análisis de la valoración psicológica realizada a {nombre_trabajador}, "
                f"se evidencia que {trabajador} {perfil['patron_general']}, lo cual requiere "
                f"atención prioritaria para prevenir deterioro en su salud mental y desempeño laboral.")
    elif perfil['severidad_global'] == 'medio':
        intro = (f"Del análisis de la valoración psicológica realizada a {nombre_trabajador}, "
                f"se observa que {trabajador} {perfil['patron_general']}, situación que amerita "
                f"implementación de medidas preventivas para evitar escalamiento.")
    else:
        intro = (f"Del análisis de la valoración psicológica realizada a {nombre_trabajador}, "
                f"se evidencia que {trabajador} {perfil['patron_general']}, lo cual representa "
                f"una situación favorable, aunque se recomienda mantener las condiciones actuales "
                f"y estar atentos a cambios que pudieran surgir.")

    parrafos.append(intro)

    # Análisis detallado por categoría crítica
    for cat in perfil['factores_criticos']:
        info_cat = CATEGORIAS_INFO.get(cat, {})
        detalles = perfil['niveles_por_categoria'][cat]

        analisis = (f"En relación a {info_cat['nombre']}, {trabajador} "
                   f"{info_cat['descripcion_alta']}, evidenciándose esto en "
                   f"{detalles['porcentaje_alto']}% de los ítems evaluados en nivel alto. "
                   f"{info_cat['impacto_alto'].capitalize()}.")

        # Agregar items específicos más críticos
        items_altos = [item for item in detalles['items'] if item['calificacion'] == 'alto']
        if items_altos:
            items_texto = ', '.join([f'"{item["item"]}"' for item in items_altos[:2]])
            analisis += f" Específicamente se identifican aspectos como {items_texto}."

        parrafos.append(analisis)

    # Análisis de categorías en nivel medio (más breve)
    if perfil['factores_atencion']:
        categorias_nombres = [CATEGORIAS_INFO[cat]['nombre'] for cat in perfil['factores_atencion']]
        if len(categorias_nombres) == 1:
            texto_cats = categorias_nombres[0]
        elif len(categorias_nombres) == 2:
            texto_cats = f"{categorias_nombres[0]} y {categorias_nombres[1]}"
        else:
            texto_cats = f"{', '.join(categorias_nombres[:-1])} y {categorias_nombres[-1]}"

        parrafos.append(
            f"Adicionalmente, se observan niveles moderados en {texto_cats}, "
            f"lo cual requiere monitoreo y acciones preventivas para evitar su agravamiento."
        )

    return "\n\n".join(parrafos)


def generar_recomendaciones_personalizadas(
    perfil: Dict,
    tiene_diagnostico_mental: bool
) -> Tuple[List[str], List[str]]:
    """
    Genera recomendaciones específicas basadas en el perfil exacto del trabajador
    """
    recs_trabajador = []
    recs_empresa = []

    # Recomendación base si tiene diagnóstico mental
    if tiene_diagnostico_mental:
        recs_trabajador.append(
            "Continuar de manera rigurosa con el tratamiento médico y psicológico prescrito, "
            "asistiendo a todas las citas programadas y siguiendo las indicaciones terapéuticas. "
            "El seguimiento constante es fundamental para su recuperación y estabilización."
        )
        recs_empresa.append(
            "Facilitar los permisos necesarios para que el trabajador asista a sus citas médicas "
            "y terapéuticas, considerando estos espacios como inversión en su recuperación y "
            "productividad a largo plazo."
        )
        recs_empresa.append(
            "Mantener estricta confidencialidad sobre la condición de salud del trabajador, "
            "compartiendo información solo con personal autorizado y necesario para implementar ajustes."
        )

    # Recomendación legal siempre
    recs_trabajador.append(
        "Mantener comunicación transparente, veraz y oportuna con la empresa sobre su estado "
        "de salud y capacidad laboral, en cumplimiento del artículo 27 de la Ley 1562 de 2012, "
        "facilitando así los ajustes razonables necesarios."
    )

    # Recomendaciones específicas según factores críticos
    for cat in perfil['factores_criticos']:
        key_alto = f"{cat}_alto"
        if key_alto in RECOMENDACIONES_ESPECIFICAS_TRABAJADOR:
            recs_trabajador.extend(RECOMENDACIONES_ESPECIFICAS_TRABAJADOR[key_alto])
        if key_alto in RECOMENDACIONES_ESPECIFICAS_EMPRESA:
            recs_empresa.extend(RECOMENDACIONES_ESPECIFICAS_EMPRESA[key_alto])

    # Recomendaciones para factores medios
    for cat in perfil['factores_atencion']:
        key_medio = f"{cat}_medio"
        if key_medio in RECOMENDACIONES_ESPECIFICAS_TRABAJADOR:
            recs_trabajador.extend(RECOMENDACIONES_ESPECIFICAS_TRABAJADOR[key_medio])
        if key_medio in RECOMENDACIONES_ESPECIFICAS_EMPRESA:
            recs_empresa.extend(RECOMENDACIONES_ESPECIFICAS_EMPRESA[key_medio])

    # Recomendaciones universales
    recs_trabajador.append(
        "Fortalecer su red de apoyo social, tanto laboral como extralaboral, manteniendo "
        "comunicación regular con familiares, amigos y compañeros de trabajo."
    )

    recs_trabajador.append(
        "Incorporar en su rutina semanal actividades físicas, recreativas o artísticas que "
        "promuevan la liberación de tensiones y favorezcan un estilo de vida equilibrado."
    )

    recs_empresa.append(
        "Participar activamente en el proceso de rehabilitación integral del trabajador, "
        "realizando ajustes razonables según sus capacidades actuales y proporcionando "
        "seguimiento continuo a su evolución."
    )

    recs_empresa.append(
        "Fomentar un ambiente laboral de respeto, no discriminación y apoyo hacia el trabajador, "
        "proporcionando retroalimentación constructiva sobre su desempeño de manera regular y asertiva."
    )

    # Eliminar duplicados manteniendo orden
    recs_trabajador_unique = []
    for rec in recs_trabajador:
        if rec not in recs_trabajador_unique:
            recs_trabajador_unique.append(rec)

    recs_empresa_unique = []
    for rec in recs_empresa:
        if rec not in recs_empresa_unique:
            recs_empresa_unique.append(rec)

    return recs_trabajador_unique, recs_empresa_unique


def detectar_genero(nombre: str) -> str:
    """Detecta el género basado en el nombre"""
    nombre_lower = nombre.lower().strip().split()[0] if nombre else ""

    terminaciones_femeninas = ['a', 'is', 'iz', 'th', 'ny', 'ly', 'ey']
    nombres_masculinos = ['joshua', 'josua', 'nikita', 'garcia', 'peña', 'ezra']
    nombres_femeninos = ['carmen', 'pilar', 'mercedes', 'dolores', 'flor', 'luz', 'mar', 'sol']

    if nombre_lower in nombres_masculinos:
        return 'M'
    if nombre_lower in nombres_femeninos:
        return 'F'

    for term in terminaciones_femeninas:
        if nombre_lower.endswith(term):
            return 'F'

    return 'M'


def generar_concepto_inteligente(
    evaluaciones: List[EvaluacionRiesgo],
    nombre_trabajador: str,
    tiene_diagnostico_mental: bool = False
) -> str:
    """
    Genera un concepto psicológico completamente personalizado usando análisis inteligente
    """
    if not evaluaciones:
        return "No se pueden generar recomendaciones sin evaluaciones de riesgo completadas."

    # Detectar género
    genero = detectar_genero(nombre_trabajador)
    trabajador_txt = "la trabajadora" if genero == 'F' else "el trabajador"
    sustantivo = "la afiliada" if genero == 'F' else "el afiliado"

    # Analizar perfil completo
    perfil = analizar_perfil_riesgo(evaluaciones)

    # Generar introducción
    intro = (
        f"Una vez {('evaluada' if genero == 'F' else 'evaluado')} {sustantivo} del asunto, "
        f"quien presenta un diagnóstico de la esfera mental, nos permitimos manifestar las "
        f"recomendaciones que a continuación se mencionan, las cuales se emiten con el objetivo "
        f"de prevenir agravamiento de su estado de salud y favorecer su rehabilitación, lo anterior "
        f"de conformidad con los artículos 2°, 4° y 8° de la Ley 776 de 2002."
    )

    # Generar análisis detallado
    analisis = generar_parrafo_analisis(perfil, nombre_trabajador, genero)

    # Generar recomendaciones personalizadas
    recs_trabajador, recs_empresa = generar_recomendaciones_personalizadas(
        perfil,
        tiene_diagnostico_mental
    )

    # Construir secciones
    texto_trabajador = f"\n\nRECOMENDACIONES PARA {trabajador_txt.upper()}:\n"
    for i, rec in enumerate(recs_trabajador, 1):
        texto_trabajador += f"\n{i}. {rec}\n"

    texto_empresa = f"\nRECOMENDACIONES PARA LA EMPRESA:\n"
    for i, rec in enumerate(recs_empresa, 1):
        texto_empresa += f"\n{i}. {rec}\n"

    # Cierre
    cierre = (
        "\n\nEstas recomendaciones tienen una vigencia de doce (12) meses contados a partir "
        "de la fecha de emisión de las mismas, periodo durante el cual se espera implementación "
        "y seguimiento continuo para verificar su efectividad en la mejora del bienestar del trabajador."
    )

    # Concepto final
    concepto_final = intro + "\n\n" + analisis + texto_trabajador + texto_empresa + cierre

    return concepto_final
