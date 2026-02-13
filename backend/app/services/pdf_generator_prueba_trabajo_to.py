"""
Generador de PDF para Prueba de Trabajo TO (Terapia Ocupacional)
Formato basado en Positiva S.A. - Valoración Prueba de Trabajo
"""
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


def generar_pdf_prueba_trabajo_to(
    prueba,
    identificacion,
    secciones,
    desempeno,
    tareas: list,
    materiales: list,
    peligros: list,
    recomendaciones,
    registro,
    output_dir: str = "pdfs",
) -> str:
    """Genera el PDF de Prueba de Trabajo TO y retorna la ruta del archivo."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_trab = (identificacion.nombre_trabajador or "sin_nombre").replace(" ", "_") if identificacion else "sin_nombre"
    filename = f"Prueba_Trabajo_TO_{prueba.id}_{nombre_trab}_{timestamp}.pdf"
    filepath = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        topMargin=1 * cm,
        bottomMargin=1 * cm,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SectionTitle", fontSize=10, fontName="Helvetica-Bold",
                              spaceAfter=4, spaceBefore=8, textColor=colors.HexColor("#1a237e")))
    styles.add(ParagraphStyle(name="CellText", fontSize=8, fontName="Helvetica", leading=10))
    styles.add(ParagraphStyle(name="CellBold", fontSize=8, fontName="Helvetica-Bold", leading=10))
    styles.add(ParagraphStyle(name="FieldLabel", fontSize=8, fontName="Helvetica-Bold",
                              leading=10, textColor=colors.HexColor("#333333")))
    styles.add(ParagraphStyle(name="FieldValue", fontSize=8, fontName="Helvetica", leading=10))
    styles.add(ParagraphStyle(name="LongText", fontSize=8, fontName="Helvetica",
                              leading=11, alignment=TA_JUSTIFY))

    elements = []
    page_width = letter[0] - 3 * cm  # usable width

    # ── ESTILOS DE TABLA COMUNES ─────────────────────────────────────
    header_bg = colors.HexColor("#283593")
    header_text = colors.white
    alt_row = colors.HexColor("#f5f5f5")
    border_color = colors.HexColor("#9e9e9e")

    base_style = [
        ("GRID", (0, 0), (-1, -1), 0.5, border_color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]

    def section_header(text):
        return Paragraph(text, styles["SectionTitle"])

    def label(text):
        return Paragraph(text, styles["FieldLabel"])

    def value(text):
        return Paragraph(str(text) if text else "", styles["FieldValue"])

    def long_text(text):
        return Paragraph(str(text) if text else "", styles["LongText"])

    # ── ENCABEZADO ───────────────────────────────────────────────────
    header_data = [
        [Paragraph("<b>VALORACIÓN - PRUEBA DE TRABAJO TO</b>", styles["CellBold"]),
         "", "", ""],
        [label("Código"), value(""), label("Página"), value("1 de __")],
    ]
    header_table = Table(header_data, colWidths=[page_width * 0.3, page_width * 0.2,
                                                  page_width * 0.2, page_width * 0.3])
    header_table.setStyle(TableStyle(base_style + [
        ("SPAN", (0, 0), (3, 0)),
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("TEXTCOLOR", (0, 0), (-1, 0), header_text),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 1: IDENTIFICACIÓN ────────────────────────────────────
    elements.append(section_header("1. IDENTIFICACIÓN"))
    i = identificacion
    if i:
        id_data = [
            [label("Fecha de valoración"), value(str(i.fecha_valoracion) if i.fecha_valoracion else ""),
             label("Último día incapacidad ARL"), value(str(i.ultimo_dia_incapacidad) if i.ultimo_dia_incapacidad else "")],
            [label("Nombre del trabajador"), value(i.nombre_trabajador),
             label("Número de documento"), value(i.numero_documento)],
            [label("Id. siniestro"), value(i.id_siniestro),
             label("Fecha nacimiento / Edad"), value(f"{i.fecha_nacimiento or ''} / {i.edad or ''} años")],
            [label("Dominancia"), value(i.dominancia),
             label("Estado civil"), value(i.estado_civil)],
            [label("Nivel educativo"), value(i.nivel_educativo),
             label("Teléfonos trabajador"), value(i.telefonos_trabajador)],
            [label("Dirección residencia"), value(i.direccion_residencia),
             label("Diagnósticos ATEL"), value(i.diagnosticos_atel)],
            [label("Fechas eventos ATEL"), value(i.fechas_eventos_atel),
             label("EPS / IPS"), value(i.eps_ips)],
            [label("AFP"), value(i.afp),
             label("Tiempo incapacidad"), value(f"{i.tiempo_incapacidad_dias or ''} días")],
            [label("Empresa"), value(i.empresa),
             label("NIT"), value(i.nit_empresa)],
            [label("Cargo actual"), value(i.cargo_actual),
             label("Cargo único"), value("Sí" if i.cargo_unico else "No" if i.cargo_unico is not None else "")],
            [label("Área/sección"), value(i.area_seccion),
             label("Fecha ingreso cargo"), value(str(i.fecha_ingreso_cargo) if i.fecha_ingreso_cargo else "")],
            [label("Antigüedad cargo"), value(i.antiguedad_cargo),
             label("Fecha ingreso empresa"), value(str(i.fecha_ingreso_empresa) if i.fecha_ingreso_empresa else "")],
            [label("Antigüedad empresa"), value(i.antiguedad_empresa),
             label("Forma vinculación"), value(i.forma_vinculacion)],
            [label("Modalidad"), value(i.modalidad),
             label("Tiempo modalidad"), value(i.tiempo_modalidad)],
            [label("Contacto empresa"), value(i.contacto_empresa),
             label("Correos"), value(i.correos_electronicos)],
            [label("Teléfonos empresa"), value(i.telefonos_empresa),
             label("Dirección empresa"), value(i.direccion_empresa)],
        ]
        col_w = page_width / 4
        id_table = Table(id_data, colWidths=[col_w] * 4)
        id_table.setStyle(TableStyle(base_style + [
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8eaf6")),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#e8eaf6")),
        ]))
        elements.append(id_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 2: METODOLOGÍA ───────────────────────────────────────
    elements.append(section_header("2. METODOLOGÍA"))
    elements.append(long_text(secciones.metodologia if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 3: CONDICIONES DE TRABAJO ────────────────────────────
    elements.append(section_header("3. CONDICIONES DE TRABAJO"))

    elements.append(Paragraph("<b>3.1 Descripción del proceso productivo</b>", styles["CellBold"]))
    elements.append(long_text(secciones.descripcion_proceso_productivo if secciones else ""))
    elements.append(Spacer(1, 4))

    elements.append(Paragraph("<b>3.2 Apreciación del trabajador frente a su proceso productivo</b>", styles["CellBold"]))
    elements.append(long_text(secciones.apreciacion_trabajador_proceso if secciones else ""))
    elements.append(Spacer(1, 4))

    elements.append(Paragraph("<b>3.3 Estándares de productividad</b>", styles["CellBold"]))
    elements.append(long_text(secciones.estandares_productividad if secciones else ""))
    elements.append(Spacer(1, 4))

    # 3.4 Desempeño Organizacional
    elements.append(Paragraph("<b>3.4 Requerimientos del desempeño organizacional</b>", styles["CellBold"]))
    if desempeno:
        d = desempeno
        do_data = [
            [label("Jornada"), value(d.jornada), label("Ritmo"), value(d.ritmo)],
            [label("Descansos programados"), value(d.descansos_programados), label("Turnos"), value(d.turnos)],
            [label("Tiempos efectivos"), value(d.tiempos_efectivos), label("Rotaciones"), value(d.rotaciones)],
            [label("Horas extras"), value(d.horas_extras), label("Distribución semanal"), value(d.distribucion_semanal)],
        ]
        do_table = Table(do_data, colWidths=[col_w] * 4 if i else [page_width / 4] * 4)
        do_table.setStyle(TableStyle(base_style + [
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8eaf6")),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#e8eaf6")),
        ]))
        elements.append(do_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 4: TAREAS ────────────────────────────────────────────
    elements.append(section_header("4. REQUERIMIENTOS DEL PROCESO PRODUCTIVO POR TAREA"))
    conclusion_labels = {
        "reintegro_sin_modificaciones": "Reintegro sin modificaciones",
        "reintegro_con_modificaciones": "Reintegro con modificaciones",
        "desarrollo_capacidades": "Desarrollo de capacidades",
        "no_puede_desempenarla": "No puede desempeñarla",
    }
    for idx, tarea in enumerate(tareas):
        elements.append(Paragraph(f"<b>Tarea {idx + 1}</b>", styles["CellBold"]))
        t_data = [
            [label("Actividad"), value(tarea.actividad), label("Ciclo"), value(tarea.ciclo)],
            [label("Subactividad"), value(tarea.subactividad), label("Estándar productividad"), value(tarea.estandar_productividad)],
        ]
        t_table = Table(t_data, colWidths=[page_width / 4] * 4)
        t_table.setStyle(TableStyle(base_style))
        elements.append(t_table)

        elements.append(Paragraph("<i>Descripción y requerimientos biomecánicos:</i>", styles["CellText"]))
        elements.append(long_text(tarea.descripcion_biomecanica))
        elements.append(Paragraph("<i>Apreciación del trabajador:</i>", styles["CellText"]))
        elements.append(long_text(tarea.apreciacion_trabajador))
        elements.append(Paragraph("<i>Apreciación del profesional:</i>", styles["CellText"]))
        elements.append(long_text(tarea.apreciacion_profesional))

        concl_text = conclusion_labels.get(tarea.conclusion or "", tarea.conclusion or "")
        elements.append(Paragraph(f"<b>Conclusión:</b> {concl_text}", styles["CellBold"]))
        elements.append(long_text(tarea.descripcion_conclusion))
        elements.append(Spacer(1, 4))

        # Registro Fotográfico
        if tarea.registro_fotografico:
            # Remove leading slash if present to get relative file path
            img_path = tarea.registro_fotografico.lstrip("/")
            # Also handle potential backward slashes if stored differently, though URL usually /
            if os.path.exists(img_path):
                try:
                    elements.append(Paragraph("<b>Registro Fotográfico:</b>", styles["CellBold"]))
                    elements.append(Spacer(1, 2))
                    # Add image with fixed size for consistency
                    img = Image(img_path, width=7*cm, height=5*cm)
                    elements.append(img)
                    elements.append(Spacer(1, 4))
                except Exception as e:
                    print(f"Error embedding image {img_path}: {e}")
                    pass
        
        elements.append(Spacer(1, 6))

    # ── SECCIÓN 5: MATERIALES ────────────────────────────────────────
    elements.append(section_header("5. MATERIALES, EQUIPOS Y HERRAMIENTAS"))
    if materiales:
        m_header = [label("Nombre"), label("Descripción"), label("Requerimientos"), label("Observaciones")]
        m_rows = [m_header]
        for mat in materiales:
            m_rows.append([value(mat.nombre), value(mat.descripcion),
                           value(mat.requerimientos_operacion), value(mat.observaciones)])
        m_table = Table(m_rows, colWidths=[page_width * 0.2, page_width * 0.3, page_width * 0.25, page_width * 0.25])
        m_table.setStyle(TableStyle(base_style + [
            ("BACKGROUND", (0, 0), (-1, 0), header_bg),
            ("TEXTCOLOR", (0, 0), (-1, 0), header_text),
        ]))
        elements.append(m_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 6: PELIGROS ──────────────────────────────────────────
    elements.append(section_header("6. IDENTIFICACIÓN DE PELIGROS"))
    cat_labels = {
        "fisicos": "Físicos", "biologicos": "Biológicos", "biomecanicos": "Biomecánicos",
        "psicosociales": "Psicosociales", "quimicos": "Químicos", "cond_seguridad": "Cond. Seguridad",
    }
    if peligros:
        p_header = [label("Categoría"), label("Descripción"), label("Tipos de control"), label("Recomendaciones")]
        p_rows = [p_header]
        for pel in peligros:
            p_rows.append([
                value(cat_labels.get(pel.categoria, pel.categoria)),
                value(pel.descripcion),
                value(pel.tipos_control_existente),
                value(pel.recomendaciones_control),
            ])
        p_table = Table(p_rows, colWidths=[page_width * 0.18, page_width * 0.27, page_width * 0.27, page_width * 0.28])
        p_table.setStyle(TableStyle(base_style + [
            ("BACKGROUND", (0, 0), (-1, 0), header_bg),
            ("TEXTCOLOR", (0, 0), (-1, 0), header_text),
        ]))
        elements.append(p_table)
    elements.append(Spacer(1, 4))

    elements.append(Paragraph("<b>6.1 Verificación de acciones correctivas</b>", styles["CellBold"]))
    elements.append(long_text(secciones.verificacion_acciones_correctivas if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 7: CONCEPTO ──────────────────────────────────────────
    elements.append(section_header("7. CONCEPTO PARA PRUEBA DE TRABAJO"))
    elements.append(long_text(secciones.concepto_prueba_trabajo if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 8: RECOMENDACIONES ───────────────────────────────────
    elements.append(section_header("8. RECOMENDACIONES"))
    elements.append(Paragraph("<b>Para el trabajador:</b>", styles["CellBold"]))
    elements.append(long_text(recomendaciones.para_trabajador if recomendaciones else ""))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Para la empresa:</b>", styles["CellBold"]))
    elements.append(long_text(recomendaciones.para_empresa if recomendaciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 9: REGISTRO ──────────────────────────────────────────
    elements.append(section_header("9. REGISTRO"))
    if registro:
        r_data = [
            [label("Elaboró"), value(registro.nombre_elaboro),
             label("Revisor"), value(registro.nombre_revisor)],
            [label("Proveedor"), value(registro.nombre_proveedor), "", ""],
        ]
        r_table = Table(r_data, colWidths=[page_width / 4] * 4)
        r_table.setStyle(TableStyle(base_style))
        elements.append(r_table)

        # Firma images
        for firma_field, nombre in [(registro.firma_elaboro, "Firma Elaboró"),
                                     (registro.firma_revisor, "Firma Revisor")]:
            if firma_field and os.path.exists(firma_field):
                try:
                    elements.append(Spacer(1, 4))
                    elements.append(Paragraph(f"<b>{nombre}:</b>", styles["CellBold"]))
                    elements.append(Image(firma_field, width=4 * cm, height=2 * cm))
                except Exception:
                    pass

    # ── BUILD ────────────────────────────────────────────────────────
    doc.build(elements)
    return filepath
