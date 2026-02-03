from typing import List, Dict, Optional
from app.models.evaluacion import CategoriaRiesgo, CalificacionRiesgo, EvaluacionRiesgo

# Banco de recomendaciones para el TRABAJADOR
RECOMENDACIONES_TRABAJADOR = {
    "base_diagnostico_mental": (
        "Continuar con el tratamiento por psiquiatría y psicología, "
        "siguiendo las indicaciones dadas de forma proactiva y comprometida con el proceso."
    ),
    "base_legal": (
        "Continuar facilitando la información clara, veraz y completa sobre su estado de salud "
        "a la organización de conformidad con lo dispuesto en el art 27 de la Ley 1562 de 2012."
    ),
    "buenas_practicas": (
        "Mantenimiento de buenas prácticas laborales dispuestas por la organización que apoyan "
        "el desarrollo de la labor: cumplir el horario de trabajo asignado, participar en "
        "retroalimentaciones y/o reuniones del grupo de trabajo para estar al tanto de los cambios "
        "de la organización o bien para mejora del desempeño individual o grupal y mantener una "
        "actitud receptiva y propositiva frente a las oportunidades de mejora de su desempeño."
    ),
    "compromiso_normas": (
        "Mantener el compromiso y cumplimiento a las normas, responsabilidades, funciones y "
        "metas a corto plazo asignadas a su cargo por la organización."
    ),
    "pausas_activas": (
        "Realizar pausas periódicas cortas, alternar tareas y cambiar de actividad en la medida "
        "en que sea posible, para contrarrestar el estatismo postural y la tensión muscular."
    ),
    "red_apoyo": (
        "Se recomienda incrementar la interacción con las personas del grupo de trabajo o bien "
        "con grupos sociales externos a fin de fortalecer la red de apoyo social como factor protector."
    ),
    "actividades_recreativas": (
        "Se sugiere al trabajador incluir en su práctica diaria y/o semanal actividades deportivas, "
        "lúdicas y/o recreativas que favorezcan la liberación de emociones o tensiones y un estilo de vida saludable."
    ),
}

# Banco de recomendaciones para la EMPRESA
RECOMENDACIONES_EMPRESA = {
    "rehabilitacion": (
        "Participar del proceso de rehabilitación integral, informando al trabajador por escrito "
        "de las recomendaciones médico-laborales que debe tener en cuenta, conforme a su capacidad "
        "laboral actual, con el fin de poder llevar a cabo el seguimiento del cumplimiento de estas."
    ),
    "permisos_citas": (
        "Permitir los permisos para las citas y controles que el médico y psicóloga tratantes consideren necesarios."
    ),
    "privacidad": (
        "Mantener la privacidad adecuada en el uso de información con respecto a la historia clínica del paciente."
    ),
    "buen_trato": (
        "Se sugiere favorecer el buen trato y la no discriminación hacia el trabajador, evitando la "
        "estigmatización y retroalimentando su desempeño de forma periódica y asertiva para favorecer "
        "el desarrollo y mejoramiento del trabajo."
    ),
    "horario": (
        "El trabajador debe cumplir el horario establecido por su empresa. Se sugiere no asignar horas extras, "
        "horarios extendidos, turnos nocturnos o en fin de semana. Esto incluye no asignar trabajo fuera del horario laboral."
    ),
    "carga_laboral": (
        "Se sugiere a su jefe directo, evaluar la carga laboral, definir claramente las funciones del trabajador "
        "acorde a sus capacidades y aptitudes, teniendo en cuenta la condición de salud del paciente y su capacidad laboral actual."
    ),
    "estabilidad_cargo": (
        "Se recomienda dar estabilidad a los cargos asignados."
    ),
    "retroalimentacion": (
        "Retroalimentar periódicamente el desempeño del trabajador de forma clara, oportuna y útil "
        "para favorecer el desarrollo y mejoramiento del trabajo."
    ),
}


def calcular_nivel_por_categoria(evaluaciones: List[EvaluacionRiesgo]) -> Dict[str, str]:
    """
    Calcula el nivel predominante por categoría.
    Regla: Si hay mayoría ALTO → ALTO, si hay mayoría MEDIO → MEDIO, sino BAJO
    """
    categorias = {}
    
    for eval in evaluaciones:
        cat = eval.categoria.value if hasattr(eval.categoria, 'value') else str(eval.categoria)
        if cat not in categorias:
            categorias[cat] = {'alto': 0, 'medio': 0, 'bajo': 0, 'total': 0}
        
        if eval.calificacion:
            calif = eval.calificacion.value if hasattr(eval.calificacion, 'value') else str(eval.calificacion)
            categorias[cat][calif] += 1
            categorias[cat]['total'] += 1
    
    niveles = {}
    for cat, conteo in categorias.items():
        total = conteo['total']
        if total == 0:
            niveles[cat] = 'bajo'
        elif conteo['alto'] >= total * 0.5:
            niveles[cat] = 'alto'
        elif (conteo['alto'] + conteo['medio']) >= total * 0.5:
            niveles[cat] = 'medio'
        else:
            niveles[cat] = 'bajo'
    
    return niveles


def calcular_nivel_global(niveles_categoria: Dict[str, str]) -> str:
    """Calcula el nivel de riesgo global"""
    conteo = {'alto': 0, 'medio': 0, 'bajo': 0}
    
    for nivel in niveles_categoria.values():
        conteo[nivel] += 1
    
    total = len(niveles_categoria)
    if total == 0:
        return 'bajo'
    
    if conteo['alto'] >= 3:
        return 'muy_alto'
    elif conteo['alto'] >= 2:
        return 'alto'
    elif conteo['medio'] >= 3:
        return 'medio'
    else:
        return 'bajo'


def detectar_genero(nombre: str) -> str:
    """
    Detecta el género basado en el nombre para usar el artículo correcto.
    Retorna 'M' para masculino, 'F' para femenino.
    """
    nombre_lower = nombre.lower().strip().split()[0] if nombre else ""
    
    # Terminaciones comunes femeninas
    terminaciones_femeninas = ['a', 'is', 'iz', 'th', 'ny', 'ly', 'ey']
    
    # Nombres específicos masculinos que terminan en 'a'
    nombres_masculinos = ['joshua', 'josua', 'nikita', 'garcia', 'peña']
    
    # Nombres específicos femeninos
    nombres_femeninos = ['carmen', 'pilar', 'mercedes', 'dolores', 'flor', 'luz', 'mar', 'sol']
    
    if nombre_lower in nombres_masculinos:
        return 'M'
    if nombre_lower in nombres_femeninos:
        return 'F'
    
    for term in terminaciones_femeninas:
        if nombre_lower.endswith(term):
            return 'F'
    
    return 'M'


def generar_concepto(
    evaluaciones: List[EvaluacionRiesgo],
    nombre_trabajador: str,
    tiene_diagnostico_mental: bool = False
) -> str:
    """
    Genera el concepto psicológico basado en las evaluaciones de riesgo.
    """
    # Calcular niveles
    niveles_categoria = calcular_nivel_por_categoria(evaluaciones)
    nivel_global = calcular_nivel_global(niveles_categoria)
    
    # Detectar género
    genero = detectar_genero(nombre_trabajador)
    articulo = "la" if genero == 'F' else "el"
    sustantivo = "la afiliada" if genero == 'F' else "el afiliado"
    trabajador_txt = "la trabajadora" if genero == 'F' else "el trabajador"
    
    # Construir introducción
    intro = (
        f"Una vez evaluado(a) {sustantivo} del asunto, quien presenta un diagnóstico "
        f"de la esfera mental, nos permitimos manifestar las recomendaciones que a "
        f"continuación se mencionan, las cuales se emiten con el objetivo de prevenir "
        f"agravamiento de su estado de salud y favorecer su rehabilitación, lo anterior "
        f"de conformidad con los artículos 2°, 4° y 8° de la Ley 776 de 2002."
    )
    
    # Seleccionar recomendaciones para trabajador
    recs_trabajador = []
    
    # Recomendación base si hay diagnóstico mental
    if tiene_diagnostico_mental:
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['base_diagnostico_mental'])
    
    # Recomendación legal siempre
    recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['base_legal'])
    
    # Según categorías
    cat_cuantitativas = niveles_categoria.get('demandas_cuantitativas', 'bajo')
    cat_carga_mental = niveles_categoria.get('demandas_carga_mental', 'bajo')
    cat_emocionales = niveles_categoria.get('demandas_emocionales', 'bajo')
    cat_responsabilidad = niveles_categoria.get('exigencias_responsabilidad', 'bajo')
    cat_consistencia = niveles_categoria.get('consistencia_rol', 'bajo')
    cat_ambientales = niveles_categoria.get('demandas_ambientales', 'bajo')
    cat_jornada = niveles_categoria.get('demandas_jornada', 'bajo')
    
    if cat_cuantitativas in ['alto', 'medio']:
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['buenas_practicas'])
    
    if cat_consistencia in ['alto', 'medio']:
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['compromiso_normas'])
    
    if cat_ambientales in ['alto', 'medio']:
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['pausas_activas'])
    
    if cat_emocionales in ['alto', 'medio']:
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['red_apoyo'])
    
    if cat_carga_mental == 'alto':
        recs_trabajador.append(RECOMENDACIONES_TRABAJADOR['actividades_recreativas'])
    
    # Seleccionar recomendaciones para empresa
    recs_empresa = []
    
    # Recomendaciones base
    recs_empresa.append(RECOMENDACIONES_EMPRESA['rehabilitacion'])
    recs_empresa.append(RECOMENDACIONES_EMPRESA['permisos_citas'])
    
    if tiene_diagnostico_mental:
        recs_empresa.append(RECOMENDACIONES_EMPRESA['privacidad'])
    
    if cat_emocionales == 'alto':
        recs_empresa.append(RECOMENDACIONES_EMPRESA['buen_trato'])
    
    if cat_jornada in ['alto', 'medio']:
        recs_empresa.append(RECOMENDACIONES_EMPRESA['horario'])
    
    if cat_cuantitativas == 'alto':
        recs_empresa.append(RECOMENDACIONES_EMPRESA['carga_laboral'])
    
    if cat_consistencia == 'alto':
        recs_empresa.append(RECOMENDACIONES_EMPRESA['estabilidad_cargo'])
    
    # Retroalimentación siempre
    recs_empresa.append(RECOMENDACIONES_EMPRESA['retroalimentacion'])
    
    # Construir texto final
    texto_trabajador = f"\n\nRECOMENDACIONES PARA {trabajador_txt.upper()}:\n"
    for i, rec in enumerate(recs_trabajador, 1):
        texto_trabajador += f"{i}. {rec}\n"
    
    texto_empresa = f"\nRECOMENDACIONES PARA LA EMPRESA:\n"
    for i, rec in enumerate(recs_empresa, 1):
        texto_empresa += f"{i}. {rec}\n"
    
    cierre = (
        "\nEstas recomendaciones tienen una vigencia de doce meses "
        "luego de la realización de las mismas."
    )
    
    concepto_final = intro + texto_trabajador + texto_empresa + cierre
    
    return concepto_final


def obtener_resumen_riesgos(evaluaciones: List[EvaluacionRiesgo]) -> Dict:
    """
    Obtiene un resumen de los niveles de riesgo por categoría.
    """
    niveles = calcular_nivel_por_categoria(evaluaciones)
    nivel_global = calcular_nivel_global(niveles)
    
    nombres_categorias = {
        'demandas_cuantitativas': 'Demandas Cuantitativas del Trabajo',
        'demandas_carga_mental': 'Demandas de Carga Mental',
        'demandas_emocionales': 'Demandas Emocionales',
        'exigencias_responsabilidad': 'Exigencias de Responsabilidad del Cargo',
        'consistencia_rol': 'Consistencia de Rol',
        'demandas_ambientales': 'Demandas Ambientales y de Esfuerzo Físico',
        'demandas_jornada': 'Demandas de la Jornada de Trabajo',
    }
    
    resumen = {
        'nivel_global': nivel_global,
        'categorias': {
            nombres_categorias.get(k, k): v.upper() 
            for k, v in niveles.items()
        }
    }
    
    return resumen