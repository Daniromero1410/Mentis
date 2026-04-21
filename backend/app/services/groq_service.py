"""
Servicio de generación con IA usando Groq (llama-3.3-70b-versatile).
Expone cuatro funciones de alto nivel para los formatos TO.
"""

import os
from groq import Groq

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY no configurada en el entorno")
        _client = Groq(api_key=api_key)
    return _client


def _llamar_groq(prompt: str) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un terapeuta ocupacional experto redactando documentos clínicos formales "
                    "en español colombiano. Usa lenguaje técnico-clínico preciso, redacta en tercera persona, "
                    "sé específico con estructuras anatómicas, movimientos y diagnósticos mencionados. "
                    "No uses markdown (sin asteriscos, sin #, sin guiones dobles). "
                    "No incluyas encabezados o etiquetas de sección en el cuerpo del texto. "
                    "Numera con dígito seguido de punto. Sé concreto, no genérico."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.55,
        max_tokens=2000,
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────────────────────────────────────
# 1. PRUEBA DE TRABAJO TO — Concepto conclusivo
# ─────────────────────────────────────────────────────────────────────────────

def generar_concepto_pto(
    nombre_trabajador: str,
    cargo: str,
    empresa: str,
    diagnosticos_atel: str,
    tareas: list,       # actividad, conclusion, descripcion_biomecanica
    peligros: list,     # categoria, descripcion
) -> dict:
    """
    Genera el Concepto de Prueba de Trabajo como párrafo narrativo conclusivo
    que integra tareas evaluadas, peligros y diagnóstico ATEL.
    Retorna {"concepto_prueba_trabajo": str}
    """
    CONCLUSIONES = {
        "reintegro_sin_modificaciones": "reintegro sin modificaciones",
        "reintegro_con_modificaciones": "reintegro con modificaciones",
        "desarrollo_capacidades": "desarrollo de capacidades",
        "no_puede_desempenarla": "no puede desempeñarla",
    }
    PELIGROS_LABEL = {
        "fisicos": "físicos", "biologicos": "biológicos",
        "biomecanicos": "biomecánicos", "psicosociales": "psicosociales",
        "quimicos": "químicos", "cond_seguridad": "condiciones de seguridad",
    }

    tareas_texto = "\n".join(
        f"- {t.get('actividad', '')} → {CONCLUSIONES.get(t.get('conclusion', ''), t.get('conclusion', ''))}"
        f" | Análisis biomecánico: {t.get('descripcion_biomecanica', '')[:250]}"
        for t in tareas
    ) or "No se registraron tareas."

    peligros_texto = ", ".join(
        f"{PELIGROS_LABEL.get(p.get('categoria', ''), p.get('categoria', ''))}: {p.get('descripcion', '')}"
        for p in peligros
    ) or "no identificados."

    prompt = f"""Redacta el Concepto de Prueba de Trabajo Terapia Ocupacional para el siguiente caso clínico:

Trabajador: {nombre_trabajador}
Cargo evaluado: {cargo}
Empresa: {empresa}
Diagnóstico(s) ATEL: {diagnosticos_atel or 'No especificado'}

TAREAS EVALUADAS Y CONCLUSIONES:
{tareas_texto}

PELIGROS DEL PROCESO: {peligros_texto}

REGLAS DE REDACCIÓN (obligatorias):
1. Escribe entre 6 y 8 oraciones. Cada oración termina en punto seguido. Está prohibido unir dos oraciones independientes con comas (sin comma-splicing).
2. ORACIÓN 1: Presenta al trabajador, cargo y empresa, y resume los diagnósticos ATEL agrupados por área anatómica (no los listes todos uno por uno; agrúpalos, por ejemplo: "lesiones osteoarticulares del tobillo izquierdo que comprenden fractura, artrosis postraumática y lesión de sindesmosis").
3. ORACIONES 2 a N-2: Menciona CADA tarea evaluada por su nombre exacto, describe los requerimientos biomecánicos relevantes observados y su conclusión. No omitas ninguna tarea.
4. PENÚLTIMA ORACIÓN: Describe las capacidades conservadas del trabajador en términos de competencia para el cargo, seguridad en la ejecución de las tareas y relaciones sociales en el entorno laboral.
5. ÚLTIMA ORACIÓN: Concluye con la valoración global de la capacidad funcional para el cargo. Usa "la evaluación concluye" solo UNA vez y solo aquí.
6. No repitas conectores. No uses el mismo sujeto gramatical en oraciones consecutivas.

Escribe solo el párrafo, sin título ni encabezado."""

    raw = _llamar_groq(prompt)
    return {"concepto_prueba_trabajo": raw.strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 2. PRUEBA DE TRABAJO TO — Recomendaciones
# ─────────────────────────────────────────────────────────────────────────────

def generar_recomendaciones_pto(
    nombre_trabajador: str,
    cargo: str,
    empresa: str,
    diagnosticos_atel: str,
    tareas: list,       # actividad, conclusion, descripcion_biomecanica
    peligros: list,     # categoria, descripcion
) -> dict:
    """
    Genera recomendaciones estructuradas para trabajador y empresa.
    Retorna {"para_trabajador": str, "para_empresa": str}
    """
    CONCLUSIONES = {
        "reintegro_sin_modificaciones": "reintegro sin modificaciones",
        "reintegro_con_modificaciones": "reintegro con modificaciones",
        "desarrollo_capacidades": "desarrollo de capacidades",
        "no_puede_desempenarla": "no puede desempeñarla",
    }
    PELIGROS_LABEL = {
        "fisicos": "Físicos", "biologicos": "Biológicos",
        "biomecanicos": "Biomecánicos", "psicosociales": "Psicosociales",
        "quimicos": "Químicos", "cond_seguridad": "Condiciones de Seguridad",
    }

    tareas_texto = "\n".join(
        f"- {t.get('actividad', '')} → {CONCLUSIONES.get(t.get('conclusion', ''), t.get('conclusion', ''))}"
        f" | Biomecánica: {t.get('descripcion_biomecanica', '')[:250]}"
        for t in tareas
    ) or "No se registraron tareas."

    peligros_texto = "\n".join(
        f"- [{PELIGROS_LABEL.get(p.get('categoria', ''), p.get('categoria', ''))}] {p.get('descripcion', '')}"
        for p in peligros
    ) or "No se identificaron peligros."

    prompt = f"""Genera recomendaciones clínicas para una Prueba de Trabajo TO:

Trabajador: {nombre_trabajador}
Cargo: {cargo}
Empresa: {empresa}
Diagnóstico(s) ATEL: {diagnosticos_atel or 'No especificado'}

TAREAS EVALUADAS:
{tareas_texto}

PELIGROS IDENTIFICADOS:
{peligros_texto}

REGLAS DE REDACCIÓN (obligatorias para AMBOS bloques):
- Cada recomendación es una oración completa que termina en punto. Sin comma-splicing.
- Cada recomendación debe mencionar: (a) a qué tarea o actividad aplica, (b) qué segmento corporal o diagnóstico aborda, y (c) la acción concreta con criterio clínico.
- Prohibido usar frases genéricas sin especificar: "mantener buena postura", "realizar pausas activas", "evitar sobreesfuerzo" son inaceptables solas; siempre deben ir con el contexto específico de este caso.
- No repitas la misma idea en dos recomendaciones distintas.

RECOMENDACIONES PARA EL TRABAJADOR:
Escribe entre 5 y 7 recomendaciones numeradas que cubran: higiene postural específica para cada tarea evaluada con sus requerimientos biomecánicos concretos, manejo del dolor y control de los segmentos anatómicos comprometidos por el diagnóstico ATEL durante las actividades laborales, pausas activas con descripción del ejercicio, duración y frecuencia específica según los peligros biomecánicos identificados, restricciones de movimiento o postura derivadas directamente de los diagnósticos, y autocuidado fuera de la jornada laboral.

RECOMENDACIONES PARA LA EMPRESA:
Escribe entre 4 y 6 recomendaciones numeradas que cubran: adaptaciones concretas del puesto para cada tarea evaluada, esquema de reintegro gradual con tiempos y criterios de progresión, controles operativos para los peligros identificados según su categoría, coordinación con el equipo de salud y seguimiento periódico del caso, y responsabilidades del empleador frente a las restricciones del trabajador.

Usa exactamente los encabezados: "RECOMENDACIONES PARA EL TRABAJADOR:" y "RECOMENDACIONES PARA LA EMPRESA:".
No uses "SECCIÓN" ni ningún otro prefijo antes de los encabezados."""

    raw = _llamar_groq(prompt)

    para_trabajador, para_empresa = _separar_secciones(
        raw,
        "RECOMENDACIONES PARA EL TRABAJADOR:",
        "RECOMENDACIONES PARA LA EMPRESA:",
    )
    return {"para_trabajador": para_trabajador.strip(), "para_empresa": para_empresa.strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 3. ANÁLISIS DE EXIGENCIAS TO — Recomendaciones terapéuticas
# ─────────────────────────────────────────────────────────────────────────────

def generar_recomendaciones_ae(
    nombre_trabajador: str,
    cargo: str,
    diagnosticos_atel: str,
    tareas: list,
    perfil_exigencias: dict | None,
) -> dict:
    """
    Genera plan terapéutico con simulación de tarea para reincorporación.
    Retorna {"para_trabajador": str, "para_empresa": str}
    """
    CONCLUSIONES = {
        "reintegro_sin_modificaciones": "reintegro sin modificaciones",
        "reintegro_con_modificaciones": "reintegro con modificaciones",
        "desarrollo_capacidades": "desarrollo de capacidades",
        "no_puede_desempenarla": "no puede desempeñarla",
    }

    tareas_texto = "\n".join(
        f"- {t.get('actividad', '')} | Ciclo: {t.get('ciclo', '')} | "
        f"Conclusión: {CONCLUSIONES.get(t.get('conclusion', ''), t.get('conclusion', ''))} | "
        f"Biomecánica: {t.get('descripcion_biomecanica', '')[:250]} | "
        f"Requerimientos motrices: {t.get('requerimientos_motrices', '')[:80]}"
        for t in tareas
    ) or "No se registraron tareas."

    perfil_texto = ""
    if perfil_exigencias:
        areas = []
        for area, datos in perfil_exigencias.items():
            if isinstance(datos, dict):
                for item, val in datos.items():
                    if isinstance(val, dict) and val.get('valor') is not None:
                        areas.append(f"{area}/{item}: {val.get('valor')}/4")
        if areas:
            perfil_texto = "\nPERFIL DE EXIGENCIAS (escala 0-4): " + ", ".join(areas[:10])

    prompt = f"""Genera un plan terapéutico de reincorporación laboral para un Análisis de Exigencias TO:

Trabajador: {nombre_trabajador}
Cargo: {cargo}
Diagnóstico(s) ATEL: {diagnosticos_atel or 'No especificado'}
{perfil_texto}

TAREAS ANALIZADAS:
{tareas_texto}

REGLAS DE REDACCIÓN (obligatorias para AMBOS bloques):
- Cada recomendación es una oración completa que termina en punto. Sin comma-splicing.
- Cada recomendación debe mencionar: (a) a qué tarea o actividad aplica, (b) qué segmento corporal o diagnóstico aborda, y (c) la acción terapéutica concreta con criterio clínico.
- Prohibido usar frases genéricas sin especificar el contexto de este caso.
- No repitas la misma idea en dos recomendaciones distintas.

RECOMENDACIONES PARA EL TRABAJADOR:
Escribe entre 5 y 7 recomendaciones numeradas. La primera DEBE ser la simulación progresiva de la tarea laboral más exigente (especificar el nombre exacto de la tarea, la duración inicial propuesta, el incremento gradual semanal y el criterio clínico de progresión). Las siguientes deben cubrir: habilitación de los requerimientos motrices específicos deficitarios identificados en el perfil de exigencias, técnicas de control del dolor en los segmentos anatómicos comprometidos durante los ciclos de trabajo evaluados, tolerancia al esfuerzo sostenido para las tareas de mayor duración, higiene postural específica para los requerimientos biomecánicos identificados, y autocuidado fuera de la jornada laboral relacionado con el diagnóstico ATEL.

RECOMENDACIONES PARA LA EMPRESA:
Escribe entre 4 y 5 recomendaciones numeradas que cubran: preparación y adecuación del puesto previo al reintegro con especificaciones concretas por tarea, cronograma de reincorporación gradual con porcentajes de carga de trabajo y criterios de avance, coordinación periódica con el terapeuta ocupacional tratante, medidas preventivas para los peligros biomecánicos identificados en las tareas analizadas, y responsabilidades del empleador durante el período de adaptación.

Usa exactamente los encabezados: "RECOMENDACIONES PARA EL TRABAJADOR:" y "RECOMENDACIONES PARA LA EMPRESA:".
No uses "SECCIÓN" ni ningún otro prefijo antes de los encabezados."""

    raw = _llamar_groq(prompt)

    para_trabajador, para_empresa = _separar_secciones(
        raw,
        "RECOMENDACIONES PARA EL TRABAJADOR:",
        "RECOMENDACIONES PARA LA EMPRESA:",
    )
    return {"para_trabajador": para_trabajador.strip(), "para_empresa": para_empresa.strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 4. VALORACIÓN OCUPACIONAL — Concepto Ocupacional narrativo
# ─────────────────────────────────────────────────────────────────────────────

def generar_concepto_vo(
    nombre_trabajador: str,
    cargo: str,
    otras_areas: dict | None,
    orientacion_previa: str,
) -> dict:
    """
    Genera el Concepto Ocupacional como párrafo narrativo integrando
    calificaciones y observaciones de todas las áreas.
    Retorna {"concepto_ocupacional": str, "orientacion_ocupacional": str}
    """
    if not otras_areas:
        areas_texto = "No se registraron calificaciones de áreas."
    else:
        lineas = []
        for area, datos in otras_areas.items():
            if isinstance(datos, dict):
                cal = datos.get("calificacion") or datos.get("valor") or datos.get("puntaje", "")
                obs = datos.get("observaciones") or datos.get("observacion", "")
                lineas.append(f"- {area.replace('_', ' ').title()}: {cal}/4 — {obs}")
            elif isinstance(datos, (int, float, str)):
                lineas.append(f"- {area.replace('_', ' ').title()}: {datos}")
        areas_texto = "\n".join(lineas) if lineas else "No se registraron calificaciones."

    prompt = f"""Genera el Concepto y la Orientación Ocupacional para una Valoración Ocupacional TO:

Trabajador: {nombre_trabajador}
Cargo: {cargo}

CALIFICACIONES POR ÁREA (escala 0-4 donde 0=sin limitación, 4=limitación total):
{areas_texto}

REGLAS DE REDACCIÓN (obligatorias):
- Cada oración termina en punto seguido. Está prohibido unir dos oraciones independientes con comas (sin comma-splicing).
- No repitas el mismo conector en oraciones consecutivas.
- No uses el mismo sujeto gramatical en dos oraciones seguidas.

CONCEPTO OCUPACIONAL:
Redacta entre 6 y 9 oraciones en un único párrafo narrativo continuo (sin listas, sin numeración). OBLIGATORIO: menciona CADA área calificada con su nombre, su calificación numérica y la observación clínica registrada. Usa conectores de transición entre áreas: "en cuanto a", "respecto al área de", "por su parte", "en relación con", "adicionalmente". La última oración concluye con la aptitud funcional global del trabajador para el cargo de {cargo}, usando "la valoración concluye" solo UNA vez y solo en esa oración.

ORIENTACIÓN OCUPACIONAL:
Redacta entre 3 y 5 oraciones con orientaciones concretas derivadas del concepto anterior. Cada oración describe una acción específica relacionada con las áreas de mayor compromiso. Si existe orientación previa, complementa y amplía: "{orientacion_previa or 'ninguna registrada'}". Incluye criterios de seguimiento funcional con periodicidad sugerida.

Usa exactamente los encabezados: "CONCEPTO OCUPACIONAL:" y "ORIENTACIÓN OCUPACIONAL:".
No uses "SECCIÓN" ni ningún otro prefijo antes de los encabezados."""

    raw = _llamar_groq(prompt)

    concepto, orientacion = _separar_secciones(
        raw,
        "CONCEPTO OCUPACIONAL:",
        "ORIENTACIÓN OCUPACIONAL:",
    )
    return {
        "concepto_ocupacional": concepto.strip(),
        "orientacion_ocupacional": orientacion.strip(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Utilidad: separar dos secciones del texto generado
# ─────────────────────────────────────────────────────────────────────────────

def _separar_secciones(texto: str, encabezado1: str, encabezado2: str) -> tuple[str, str]:
    """
    Divide el texto en dos partes usando los encabezados como marcadores.
    Busca el inicio de la línea que contiene cada encabezado para evitar
    que prefijos residuales queden al final de la primera sección.
    """
    t_upper = texto.upper()
    e1 = encabezado1.upper()
    e2 = encabezado2.upper()

    idx1 = t_upper.find(e1)
    idx2 = t_upper.find(e2)

    if idx1 == -1 and idx2 == -1:
        return texto, ""
    if idx1 == -1:
        return "", texto[idx2 + len(e2):].strip()
    if idx2 == -1:
        return texto[idx1 + len(e1):].strip(), ""

    # Retroceder hasta el inicio de la línea que contiene encabezado2
    # para no incluir ningún prefijo de esa línea al final de parte1
    line_start_idx2 = texto.rfind('\n', 0, idx2)
    if line_start_idx2 == -1:
        line_start_idx2 = idx2
    else:
        line_start_idx2 += 1  # saltar el \n

    parte1 = texto[idx1 + len(encabezado1): line_start_idx2].strip()
    parte2 = texto[idx2 + len(e2):].strip()
    return parte1, parte2
