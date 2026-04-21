"""
Servicio de generación con IA usando Groq (llama-3.3-70b-versatile).
Expone tres funciones de alto nivel, una por formato TO.
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
                    "en español colombiano. Usa lenguaje técnico profesional, redacta en tercera persona, "
                    "sé concreto y no repitas información. No uses markdown (sin asteriscos ni #). "
                    "Numera las recomendaciones con dígitos seguidos de punto."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.65,
        max_tokens=1800,
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────────────────────────────────────
# 1. PRUEBA DE TRABAJO TO — Recomendaciones
# ─────────────────────────────────────────────────────────────────────────────

def generar_recomendaciones_pto(
    nombre_trabajador: str,
    cargo: str,
    empresa: str,
    diagnosticos_atel: str,
    tareas: list,       # list of dicts: actividad, conclusion, descripcion_biomecanica
    peligros: list,     # list of dicts: categoria, descripcion
) -> dict:
    """
    Genera recomendaciones para el trabajador y la empresa basadas en las
    tareas evaluadas, peligros identificados y diagnóstico de eventos ATEL.
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
        f"- Actividad: {t.get('actividad', '')} | "
        f"Conclusión: {CONCLUSIONES.get(t.get('conclusion', ''), t.get('conclusion', ''))} | "
        f"Biomecánica: {t.get('descripcion_biomecanica', '')[:120]}"
        for t in tareas
    ) or "No se registraron tareas."

    peligros_texto = "\n".join(
        f"- [{PELIGROS_LABEL.get(p.get('categoria', ''), p.get('categoria', ''))}] {p.get('descripcion', '')}"
        for p in peligros
    ) or "No se identificaron peligros."

    prompt = f"""Genera recomendaciones para una Prueba de Trabajo TO para el siguiente caso:

Trabajador: {nombre_trabajador}
Cargo: {cargo}
Empresa: {empresa}
Diagnóstico(s) ATEL: {diagnosticos_atel or 'No especificado'}

TAREAS EVALUADAS:
{tareas_texto}

PELIGROS IDENTIFICADOS:
{peligros_texto}

Redacta DOS secciones separadas claramente:

SECCIÓN 1 — RECOMENDACIONES PARA EL TRABAJADOR:
Escribe entre 4 y 6 recomendaciones numeradas, específicas al diagnóstico ATEL y a las tareas con conclusión de reintegro con modificaciones o desarrollo de capacidades. Incluye pautas de higiene postural y pausas activas relacionadas con los peligros biomecánicos identificados.

SECCIÓN 2 — RECOMENDACIONES PARA LA EMPRESA:
Escribe entre 4 y 6 recomendaciones numeradas, orientadas a ajustes del puesto de trabajo, seguimiento al reintegro, control de los peligros identificados y apoyo al proceso de rehabilitación.

Usa exactamente los encabezados: "RECOMENDACIONES PARA EL TRABAJADOR:" y "RECOMENDACIONES PARA LA EMPRESA:"
"""
    raw = _llamar_groq(prompt)

    para_trabajador, para_empresa = _separar_secciones(
        raw,
        "RECOMENDACIONES PARA EL TRABAJADOR:",
        "RECOMENDACIONES PARA LA EMPRESA:",
    )
    return {"para_trabajador": para_trabajador.strip(), "para_empresa": para_empresa.strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 2. ANÁLISIS DE EXIGENCIAS TO — Recomendaciones terapéuticas
# ─────────────────────────────────────────────────────────────────────────────

def generar_recomendaciones_ae(
    nombre_trabajador: str,
    cargo: str,
    diagnosticos_atel: str,
    tareas: list,           # actividad, descripcion_biomecanica, requerimientos_motrices, conclusion
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
        f"- Actividad: {t.get('actividad', '')} | "
        f"Ciclo: {t.get('ciclo', '')} | "
        f"Conclusión: {CONCLUSIONES.get(t.get('conclusion', ''), t.get('conclusion', ''))} | "
        f"Biomecánica: {t.get('descripcion_biomecanica', '')[:120]} | "
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
            perfil_texto = "Perfil de exigencias (escala 0-4): " + ", ".join(areas[:8])

    prompt = f"""Genera un plan terapéutico de reincorporación laboral para un Análisis de Exigencias TO:

Trabajador: {nombre_trabajador}
Cargo: {cargo}
Diagnóstico(s) ATEL: {diagnosticos_atel or 'No especificado'}
{perfil_texto}

TAREAS ANALIZADAS:
{tareas_texto}

Redacta DOS secciones:

SECCIÓN 1 — RECOMENDACIONES PARA EL TRABAJADOR:
Escribe entre 4 y 6 recomendaciones numeradas. La primera recomendación DEBE enfocarse en la simulación progresiva de la tarea laboral como objetivo principal de reincorporación (especificar la tarea, el tiempo inicial y el incremento gradual). Las siguientes deben abordar habilitación de los requerimientos motrices identificados, tolerancia al esfuerzo sostenido y manejo de la condición de salud.

SECCIÓN 2 — RECOMENDACIONES PARA LA EMPRESA:
Escribe entre 3 y 5 recomendaciones numeradas sobre preparación del puesto de trabajo, período de adaptación supervisado y coordinación con el terapeuta ocupacional tratante.

Usa exactamente los encabezados: "RECOMENDACIONES PARA EL TRABAJADOR:" y "RECOMENDACIONES PARA LA EMPRESA:"
"""
    raw = _llamar_groq(prompt)

    para_trabajador, para_empresa = _separar_secciones(
        raw,
        "RECOMENDACIONES PARA EL TRABAJADOR:",
        "RECOMENDACIONES PARA LA EMPRESA:",
    )
    return {"para_trabajador": para_trabajador.strip(), "para_empresa": para_empresa.strip()}


# ─────────────────────────────────────────────────────────────────────────────
# 3. VALORACIÓN OCUPACIONAL — Concepto Ocupacional en párrafo narrativo
# ─────────────────────────────────────────────────────────────────────────────

def generar_concepto_vo(
    nombre_trabajador: str,
    cargo: str,
    otras_areas: dict | None,   # calificaciones por área con observaciones
    orientacion_previa: str,
) -> dict:
    """
    Genera el Concepto Ocupacional como párrafo narrativo integrando
    las calificaciones y observaciones de todas las áreas.
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

    prompt = f"""Genera el Concepto Ocupacional para una Valoración Ocupacional TO:

Trabajador: {nombre_trabajador}
Cargo: {cargo}

CALIFICACIONES POR ÁREA (escala 0-4):
{areas_texto}

Redacta DOS secciones:

SECCIÓN 1 — CONCEPTO OCUPACIONAL:
Redacta un párrafo narrativo continuo (no lista) que integre TODAS las áreas calificadas. Para cada área menciona la calificación obtenida y la observación registrada. Usa frases de transición entre áreas (por su parte, en cuanto a, respecto a, adicionalmente). Finaliza con una conclusión sobre la aptitud funcional para el cargo.

SECCIÓN 2 — ORIENTACIÓN OCUPACIONAL:
Redacta un párrafo con las orientaciones y recomendaciones derivadas del concepto. Si hay orientación previa registrada, complémntala: "{orientacion_previa or 'ninguna'}"

Usa exactamente los encabezados: "CONCEPTO OCUPACIONAL:" y "ORIENTACIÓN OCUPACIONAL:"
"""
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
    """Divide el texto en dos partes usando los encabezados como marcadores."""
    t = texto
    idx1 = t.upper().find(encabezado1.upper())
    idx2 = t.upper().find(encabezado2.upper())

    if idx1 == -1 and idx2 == -1:
        return t, ""
    if idx1 == -1:
        return "", t[idx2 + len(encabezado2):].strip()
    if idx2 == -1:
        return t[idx1 + len(encabezado1):].strip(), ""

    parte1 = t[idx1 + len(encabezado1): idx2].strip()
    parte2 = t[idx2 + len(encabezado2):].strip()
    return parte1, parte2
