"""
Generador de PDF para Prueba de Trabajo TO (Terapia Ocupacional)
Formato basado en Positiva S.A. - Valoración Prueba de Trabajo
Diseño alineado al formato institucional 2022/07
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
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.graphics import renderPDF


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
        topMargin=0.8 * cm,
        bottomMargin=0.8 * cm,
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
    )

    # ── ESTILOS PERSONALIZADOS ───────────────────────────────────────
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="HeaderTitle", fontSize=9, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=11))
    styles.add(ParagraphStyle(name="HeaderSub", fontSize=7, fontName="Helvetica", alignment=TA_CENTER, leading=9))
    styles.add(ParagraphStyle(name="HeaderSubBold", fontSize=7, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=9))
    styles.add(ParagraphStyle(name="HeaderSubLeft", fontSize=7, fontName="Helvetica", alignment=TA_LEFT, leading=9))
    styles.add(ParagraphStyle(name="LabelSmall", fontSize=6.5, fontName="Helvetica-Bold", leading=8, textColor=colors.black))
    styles.add(ParagraphStyle(name="ValueSmall", fontSize=6.5, fontName="Helvetica", leading=8, textColor=colors.black))
    styles.add(ParagraphStyle(name="DateDigit", fontSize=7, fontName="Helvetica", alignment=TA_CENTER, leading=9))
    styles.add(ParagraphStyle(name="DateLabel", fontSize=5.5, fontName="Helvetica", alignment=TA_CENTER, leading=7, textColor=colors.HexColor("#666666")))
    styles.add(ParagraphStyle(name="SectionTitle", fontSize=8, fontName="Helvetica-Bold", spaceAfter=0, spaceBefore=0, textColor=colors.white, alignment=TA_LEFT, leftIndent=4))
    styles.add(ParagraphStyle(name="CellText", fontSize=7, fontName="Helvetica", leading=8.5))
    styles.add(ParagraphStyle(name="CellBold", fontSize=7, fontName="Helvetica-Bold", leading=8.5))
    styles.add(ParagraphStyle(name="LongText", fontSize=7, fontName="Helvetica", leading=9, alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle(name="FieldLabel", fontSize=7, fontName="Helvetica-Bold", leading=9, textColor=colors.HexColor("#333333")))
    styles.add(ParagraphStyle(name="FieldValue", fontSize=7, fontName="Helvetica", leading=9))
    styles.add(ParagraphStyle(name="CheckLabel", fontSize=6, fontName="Helvetica", leading=7.5))

    elements = []
    page_width = letter[0] - 2.4 * cm  # usable width

    # ── COLORES ──────────────────────────────────────────────────────
    ORANGE_BG = colors.HexColor("#E65100")       # Naranja oscuro para headers
    LIGHT_ORANGE_BG = colors.HexColor("#FFF3E0")  # Naranja suave para headers de fechas
    BORDER_COLOR = colors.HexColor("#424242")     # Gris oscuro bordes
    LIGHT_GRAY = colors.HexColor("#f5f5f5")

    # ── HELPER FUNCTIONS ─────────────────────────────────────────────
    def format_date(date_obj):
        """Formats a date as DD / MM / YYYY plain text"""
        if not date_obj:
            return ""
        try:
            if isinstance(date_obj, str):
                dt = datetime.strptime(date_obj, "%Y-%m-%d")
            else:
                dt = date_obj
            return f"{dt.day:02} / {dt.month:02} / {dt.year:04}"
        except Exception:
            return str(date_obj)

    def make_checkbox_drawing(checked, size=8):
        """Creates a professional checkbox using ReportLab Drawing shapes"""
        d = Drawing(size, size)
        d.add(Rect(0, 0, size, size,
                   fillColor=colors.HexColor('#E65100') if checked else colors.white,
                   strokeColor=colors.HexColor('#424242'),
                   strokeWidth=0.6))
        if checked:
            # Draw white X inside orange box
            d.add(Line(2, 2, size - 2, size - 2, strokeColor=colors.white, strokeWidth=1))
            d.add(Line(2, size - 2, size - 2, 2, strokeColor=colors.white, strokeWidth=1))
        return d

    def checkbox(checked, label_text):
        """Returns a professional checkbox + label as a mini table"""
        cb = make_checkbox_drawing(checked)
        lbl = Paragraph(label_text, styles["CheckLabel"])
        t = Table([[cb, lbl]], colWidths=[0.4 * cm, None])
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 1),
            ('RIGHTPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        return t

    def p(text, style_name="ValueSmall"):
        return Paragraph(str(text) if text else "", styles[style_name])

    def bold(text):
        return Paragraph(str(text), styles["LabelSmall"])

    def section_title_table(text):
        """Creates a full-width table with dark orange background for section titles"""
        data = [[Paragraph(f"<b>{text}</b>", styles["SectionTitle"])]]
        t = Table(data, colWidths=[page_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), ORANGE_BG),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        return t

    def bordered_text_block(text_content):
        """Wraps text in a bordered table cell"""
        data = [[Paragraph(str(text_content) if text_content else "", styles["LongText"])]]
        t = Table(data, colWidths=[page_width])
        t.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return t

    def subsection_header(text):
        """Creates a sub-section header row with light background"""
        data = [[Paragraph(f"<b>{text}</b>", styles["CellBold"])]]
        t = Table(data, colWidths=[page_width])
        t.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        return t

    def long_text(text):
        return Paragraph(str(text) if text else "", styles["LongText"])

    def value(text):
        return Paragraph(str(text) if text else "", styles["FieldValue"])

    def label(text):
        return Paragraph(text, styles["FieldLabel"])

    # ── ENCABEZADO (HEADER) ──────────────────────────────────────────
    # Resolve logo paths: backend/app/services → 2 parents up → backend/static/images
    _backend_dir = Path(__file__).resolve().parent.parent.parent  # backend/
    _static_images = _backend_dir / "static" / "images"

    _logo_positiva = _static_images / "logo_positiva.png"
    _logo_santa = _static_images / "logo_santa_isabel.png"

    # Row 1: Logo | Center text | Logo Proveedor
    logo_left = Image(str(_logo_positiva), width=2.8 * cm, height=1.4 * cm) if _logo_positiva.exists() else bold("POSITIVA")
    logo_right = Image(str(_logo_santa), width=2.8 * cm, height=1.4 * cm) if _logo_santa.exists() else Paragraph("<b>Logo Proveedor</b>", styles["HeaderSubBold"])

    center_text = Paragraph(
        "<b>POSITIVA S.A</b><br/>"
        "Compañía de Seguros / ARL<br/>"
        "-Gestión Documental-<br/>"
        "<b>VALORACIÓN<br/>PRUBA DE TRABAJO</b>",
        styles["HeaderSub"]
    )

    # Row 2: Código + Fecha | (merged with title) | Página
    r2_left = Paragraph("<b>Código</b><br/><b>Fecha</b>&nbsp;&nbsp;&nbsp;&nbsp;2022/07", styles["HeaderSubLeft"])
    r2_right = Paragraph("Página 1 de ___", styles["HeaderSub"])

    # Row 3: Aprobado por | Proceso | Revisado por
    r3_c1 = Paragraph("Aprobado por:<br/><b>Gerencia Médica</b>", styles["HeaderSub"])
    r3_c2 = Paragraph("Proceso:<br/><b>Rehabilitación Integral</b>", styles["HeaderSub"])
    r3_c3 = Paragraph("Revisado por:<br/><b>Coordinación Técnica</b>", styles["HeaderSub"])

    # Row 4: Version
    r4 = Paragraph("Versión: 01", styles["HeaderSubBold"])

    col_left = page_width * 0.22
    col_center = page_width * 0.56
    col_right = page_width * 0.22

    h_data = [
        [logo_left, center_text, logo_right],
        [r2_left, "", r2_right],
        [r3_c1, r3_c2, r3_c3],
        [r4, "", ""],
    ]

    header_t = Table(h_data, colWidths=[col_left, col_center, col_right])
    header_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 0), (0, 0)),
        ('SPAN', (1, 0), (1, 1)),  # Center text spans rows 0-1
        ('SPAN', (0, 3), (2, 3)),  # Version spans full width
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(header_t)

    # ── FECHA DE VALORACIÓN & ÚLTIMO DÍA INCAPACIDAD ────────────────
    i = identificacion
    val_fecha = format_date(i.fecha_valoracion if i else None)
    val_incap = format_date(i.ultimo_dia_incapacidad if i else None)

    date_rows = [
        [
            "",
            Paragraph("<b>FECHA DE VALORACIÓN:</b>", styles["LabelSmall"]),
            p(val_fecha),
        ],
        [
            Paragraph("<b>ÚLTIMO DIA DE INCAPACIDAD RECONOCIDO POR LA ARL:</b>", styles["LabelSmall"]),
            "",
            p(val_incap),
        ]
    ]

    date_t = Table(date_rows, colWidths=[page_width * 0.42, page_width * 0.22, page_width * 0.36])
    date_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 1), (1, 1)),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_ORANGE_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(date_t)

    # ── SECCIÓN 1: IDENTIFICACIÓN ────────────────────────────────────
    # Build section as a series of 2-column and 4-column rows
    lw = page_width * 0.30  # label width
    vw = page_width * 0.70  # value width
    lw2 = page_width * 0.30  # label width (4-col)
    vw2 = page_width * 0.20  # value width (4-col)
    lw3 = page_width * 0.20  # label width small
    vw3 = page_width * 0.30  # value width small

    # Section header
    sec1_header = [[Paragraph("<b>1&nbsp;&nbsp;&nbsp;IDENTIFICACIÓN</b>", styles["SectionTitle"])]]
    sec1_ht = Table(sec1_header, colWidths=[page_width])
    sec1_ht.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(sec1_ht)

    # Sub-header
    sub_h = [[Paragraph("<b>(Datos trabajador, evento ATEL, Empresa)</b>", styles["CellBold"])]]
    sub_ht = Table(sub_h, colWidths=[page_width])
    sub_ht.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(sub_ht)

    # Helper: 2-column row (label | value spanning rest)
    def id_row_2col(lbl, val):
        return [bold(lbl), p(val)]

    # Helper: 4-column row
    def id_row_4col(l1, v1, l2, v2):
        return [bold(l1), p(v1), bold(l2), p(v2)]

    # Build identification rows
    id_rows = []

    # Nombre del trabajador
    id_rows.append(id_row_2col("Nombre del trabajador", i.nombre_trabajador if i else ""))

    # Número de documento
    id_rows.append(id_row_2col("Número de documento", i.numero_documento if i else ""))

    # Identificación del siniestro
    id_rows.append(id_row_2col("Identificación del siniestro", i.id_siniestro if i else ""))

    id_table_basic = Table(id_rows, colWidths=[lw, vw])
    id_table_basic.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(id_table_basic)

    # Fecha de nacimiento/edad row
    nac_fecha = format_date(i.fecha_nacimiento if i else None)
    edad_val = f"{i.edad or ''}" if i else ""

    nac_row = [
        [bold("Fecha de nacimiento/edad"), p(nac_fecha), bold("edad"), p(f"{edad_val}    años" if edad_val else "")]
    ]
    nac_t = Table(nac_row, colWidths=[page_width * 0.30, page_width * 0.30, page_width * 0.10, page_width * 0.30])
    nac_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(nac_t)

    # Dominancia row: label | Derecha | Izquierda | Ambidiestra
    dom = i.dominancia.lower().strip() if i and i.dominancia else ""
    dom_row = [[
        bold("Dominancia"),
        checkbox(dom == "derecha", "Derecha"),
        checkbox(dom == "izquierda", "Izquierda"),
        checkbox(dom == "ambidiestra", "Ambidiestra"),
    ]]
    dom_t = Table(dom_row, colWidths=[page_width * 0.30, page_width * 0.23, page_width * 0.23, page_width * 0.24])
    dom_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(dom_t)

    # Estado civil
    ec_row = [[bold("Estado civil"), p(i.estado_civil if i else "")]]
    ec_t = Table(ec_row, colWidths=[lw, vw])
    ec_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(ec_t)

    # Nivel educativo - Grid of checkboxes (3 columns x N rows)
    ne = i.nivel_educativo.lower().strip() if i and i.nivel_educativo else ""

    ne_options = [
        ("formacion_empirica", "Formación empírica"),
        ("basica_primaria", "Básica primaria"),
        ("bachillerato_vocacional", "Bachillerato:\nvocacional 9°"),
        ("bachillerato_modalidad", "Bachillerato: modalidad"),
        ("tecnico_tecnologico", "Técnico/\nTecnológico"),
        ("profesional", "Profesional"),
        ("especializacion", "Especialización/\npostgrado/ maestría"),
        ("formacion_informal", "Formación\ninformal oficios"),
        ("analfabeta", "Analfabeta"),
        ("otros", "Otros"),
    ]

    # Build 2 rows x 5 columns for education checkboxes
    ne_cells_r1 = []
    ne_cells_r2 = []
    for idx, (key, lbl) in enumerate(ne_options):
        cb = checkbox(ne == key or key in ne or ne in key, lbl)
        if idx < 5:
            ne_cells_r1.append(cb)
        else:
            ne_cells_r2.append(cb)

    # Pad second row if needed
    while len(ne_cells_r2) < 5:
        ne_cells_r2.append("")

    ne_inner = Table([ne_cells_r1, ne_cells_r2], colWidths=[page_width * 0.14] * 5)
    ne_inner.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor("#BDBDBD")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    ne_row_data = [[bold("Nivel educativo"), ne_inner]]
    ne_t = Table(ne_row_data, colWidths=[page_width * 0.30, page_width * 0.70])
    ne_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (0, -1), 4),
        ('LEFTPADDING', (1, 0), (1, -1), 0),
        ('RIGHTPADDING', (1, 0), (1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(ne_t)

    # Remaining simple 2-column rows
    simple_rows_data = [
        ("Teléfonos trabajador", i.telefonos_trabajador if i else ""),
        ("Dirección residencia/ciudad", i.direccion_residencia if i else ""),
        ("Diagnóstico(s) clínico(s) por evento ATEL", i.diagnosticos_atel if i else ""),
        ("Fecha(s) del evento(s) ATEL", i.fechas_eventos_atel if i else ""),
        ("EPS - IPS", i.eps_ips if i else ""),
        ("AFP", i.afp if i else ""),
    ]

    simple_rows = [[bold(lbl_text), p(val_text)] for lbl_text, val_text in simple_rows_data]
    simple_t = Table(simple_rows, colWidths=[lw, vw])
    simple_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(simple_t)

    # Tiempo total incapacidad (with "días" label)
    tti_val = f"{i.tiempo_incapacidad_dias or ''}" if i else ""
    tti_row = [[bold("Tiempo total de incapacidad"), p(tti_val), bold("días"), ""]]
    tti_t = Table(tti_row, colWidths=[page_width * 0.30, page_width * 0.30, page_width * 0.10, page_width * 0.30])
    tti_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(tti_t)

    # Empresa section rows
    empresa_rows_data = [
        ("Empresa donde labora", i.empresa if i else ""),
        ("NIT de la Empresa", i.nit_empresa if i else ""),
        ("Cargo actual", i.cargo_actual if i else ""),
    ]
    empresa_rows = [[bold(lbl_text), p(val_text)] for lbl_text, val_text in empresa_rows_data]
    empresa_t = Table(empresa_rows, colWidths=[lw, vw])
    empresa_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(empresa_t)

    # Cargo unico de las mismas características (si | no checkboxes)
    c_unico = i.cargo_unico if i else None
    cu_row = [[
        bold("Cargo unico de las mismas\ncaracterísticas"),
        checkbox(c_unico is True, "si"),
        checkbox(c_unico is not True, "no"),
        "",
    ]]
    cu_t = Table(cu_row, colWidths=[page_width * 0.30, page_width * 0.15, page_width * 0.15, page_width * 0.40])
    cu_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(cu_t)

    # Área/sección/proceso
    area_row = [[bold("Área/sección/proceso"), p(i.area_seccion if i else "")]]
    area_t = Table(area_row, colWidths=[lw, vw])
    area_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(area_t)

    # Fecha ingreso cargo/antigüedad
    fic_fecha = format_date(i.fecha_ingreso_cargo if i else None)
    fic_row = [[
        bold("Fecha ingreso cargo/antigüedad en\nel cargo"),
        p(fic_fecha),
        bold("tiempo"),
        p(f"{i.antiguedad_cargo or ''}    años" if i else ""),
    ]]
    fic_t = Table(fic_row, colWidths=[page_width * 0.30, page_width * 0.30, page_width * 0.10, page_width * 0.30])
    fic_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(fic_t)

    # Fecha ingreso empresa/antigüedad
    fie_fecha = format_date(i.fecha_ingreso_empresa if i else None)
    fie_row = [[
        bold("Fecha ingreso a la\nempresa/antigüedad en la empresa"),
        p(fie_fecha),
        bold("tiempo"),
        p(f"{i.antiguedad_empresa or ''}    años" if i else ""),
    ]]
    fie_t = Table(fie_row, colWidths=[page_width * 0.30, page_width * 0.30, page_width * 0.10, page_width * 0.30])
    fie_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(fie_t)

    # Forma de vinculación laboral
    fv_row = [[bold("Forma de vinculación laboral"), p(i.forma_vinculacion if i else "")]]
    fv_t = Table(fv_row, colWidths=[lw, vw])
    fv_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(fv_t)

    # Modalidad: Presencial | teletrabajo | trabajo en casa
    mod = i.modalidad.lower().strip() if i and i.modalidad else ""
    mod_row = [[
        bold("Modalidad"),
        checkbox(mod == "presencial", "Presencial"),
        checkbox(mod == "teletrabajo", "teletrabajo"),
        checkbox(mod == "trabajo_en_casa" or mod == "trabajo en casa", "trabajo en casa"),
    ]]
    mod_t = Table(mod_row, colWidths=[page_width * 0.30, page_width * 0.23, page_width * 0.23, page_width * 0.24])
    mod_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(mod_t)

    # Remaining contact rows
    contact_rows_data = [
        ("tiempo de la Modalidad", i.tiempo_modalidad if i else ""),
        ("Contacto en empresa/cargo", i.contacto_empresa if i else ""),
        ("Correo(s) electrónico(s)", i.correos_electronicos if i else ""),
        ("Teléfonos de contacto empresa", i.telefonos_empresa if i else ""),
        ("Dirección de empresa/ciudad", i.direccion_empresa if i else ""),
    ]
    contact_rows = [[bold(lbl_text), p(val_text)] for lbl_text, val_text in contact_rows_data]
    contact_t = Table(contact_rows, colWidths=[lw, vw])
    contact_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(contact_t)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 2: METODOLOGÍA ───────────────────────────────────────
    elements.append(section_title_table("2   METODOLOGIA"))
    elements.append(bordered_text_block(secciones.metodologia if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 3: CONDICIONES DE TRABAJO ────────────────────────────
    elements.append(section_title_table("3   CONDICIONES DE TRABAJO"))

    # 3.1
    elements.append(subsection_header("3.1  DESCRIPCION DEL PROCESO PRODUCTIVO"))
    elements.append(bordered_text_block(secciones.descripcion_proceso_productivo if secciones else ""))
    elements.append(Spacer(1, 4))

    # 3.2
    elements.append(subsection_header("3.2  Apreciación del trabajador frente a su proceso productivo"))
    elements.append(bordered_text_block(secciones.apreciacion_trabajador_proceso if secciones else ""))
    elements.append(Spacer(1, 4))

    # 3.3
    elements.append(subsection_header("3.3  Estándares de productividad"))
    elements.append(bordered_text_block(secciones.estandares_productividad if secciones else ""))
    elements.append(Spacer(1, 4))

    # 3.4 Desempeño Organizacional
    elements.append(subsection_header("3.4  Requerimientos del desempeño organizacional"))
    if desempeno:
        d = desempeno
        do_data = [
            [bold("Jornada"), p(d.jornada), bold("Ritmo"), p(d.ritmo)],
            [bold("Descansos programados"), p(d.descansos_programados), bold("Turnos"), p(d.turnos)],
            [bold("Tiempos efectivos"), p(d.tiempos_efectivos), bold("Rotaciones"), p(d.rotaciones)],
            [bold("Horas extras"), p(d.horas_extras), bold("Distribución semanal"), p(d.distribucion_semanal)],
        ]
        do_table = Table(do_data, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.20, page_width * 0.30])
        do_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
            ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(do_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 4: TAREAS ────────────────────────────────────────────
    elements.append(section_title_table("4   REQUERIMIENTOS DEL PROCESO PRODUCTIVO POR TAREA"))
    elements.append(Spacer(1, 4))

    conclusion_labels = {
        "reintegro_sin_modificaciones": "Reintegro sin modificaciones",
        "reintegro_con_modificaciones": "Reintegro con modificaciones",
        "desarrollo_capacidades": "Desarrollo de capacidades",
        "no_puede_desempenarla": "No puede desempeñarla",
    }

    for idx, tarea in enumerate(tareas):
        # Actividad / Ciclo row
        t_data = [
            [bold("Actividad"), p(tarea.actividad), bold("Ciclo"), p(tarea.ciclo)],
            [bold("Subactividad"), p(tarea.subactividad), bold("Estándar productividad"), p(tarea.estandar_productividad)],
        ]
        t_table = Table(t_data, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.20, page_width * 0.30])
        t_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
            ('BACKGROUND', (2, 0), (2, -1), LIGHT_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(t_table)

        # Registro fotográfico + Descripción biomecánica (side by side)
        # Header row
        foto_desc_header = [[
            Paragraph("<b>Registro fotográfico</b>", styles["CellBold"]),
            Paragraph("<b>Descripción subactividad y requerimientos motrices por tarea (Biomecánica)</b>", styles["CellBold"]),
        ]]
        fd_ht = Table(foto_desc_header, colWidths=[page_width * 0.35, page_width * 0.65])
        fd_ht.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(fd_ht)

        # Content row: image on left, description on right
        foto_cell = ""
        all_img_paths = []
        if tarea.registro_fotografico:
            all_img_paths = [path.strip().lstrip("/") for path in tarea.registro_fotografico.split(';') if path.strip()]

        if all_img_paths and os.path.exists(all_img_paths[0]):
            try:
                from reportlab.lib.utils import ImageReader
                img_reader = ImageReader(all_img_paths[0])
                iw, ih = img_reader.getSize()
                max_w = page_width * 0.30
                max_h = 7 * cm
                scale = min(max_w / iw, max_h / ih)
                foto_cell = Image(all_img_paths[0], width=iw * scale, height=ih * scale)
            except Exception as e:
                print(f"Error embedding image {all_img_paths[0]}: {e}")
                foto_cell = p("(Imagen no disponible)")

        desc_cell = Paragraph(str(tarea.descripcion_biomecanica) if tarea.descripcion_biomecanica else "", styles["LongText"])

        fd_content = [[foto_cell, desc_cell]]
        fd_ct = Table(fd_content, colWidths=[page_width * 0.35, page_width * 0.65])
        fd_ct.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(fd_ct)

        # Additional images in a 2-column grid (same proportional size)
        extra_imgs = all_img_paths[1:] if len(all_img_paths) > 1 else []
        if extra_imgs:
            from reportlab.lib.utils import ImageReader
            img_max_w = page_width * 0.45
            img_max_h = 8 * cm
            loaded_imgs = []
            for ep in extra_imgs:
                if os.path.exists(ep):
                    try:
                        ir = ImageReader(ep)
                        iw, ih = ir.getSize()
                        sc = min(img_max_w / iw, img_max_h / ih)
                        loaded_imgs.append(Image(ep, width=iw * sc, height=ih * sc))
                    except Exception:
                        pass

            # Arrange in rows of 2
            for ri in range(0, len(loaded_imgs), 2):
                row_cells = [loaded_imgs[ri]]
                if ri + 1 < len(loaded_imgs):
                    row_cells.append(loaded_imgs[ri + 1])
                else:
                    row_cells.append("")
                extra_t = Table([row_cells], colWidths=[page_width * 0.50, page_width * 0.50])
                extra_t.setStyle(TableStyle([
                    ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('INNERGRID', (0, 0), (-1, -1), 0.3, colors.HexColor("#BDBDBD")),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(extra_t)

        # Apreciación del trabajador
        elements.append(subsection_header("Apreciación del trabajador"))
        elements.append(bordered_text_block(tarea.apreciacion_trabajador))

        # Apreciación del profesional de la salud que evalúa
        elements.append(subsection_header("Apreciación del profesional de la salud que evalúa"))
        elements.append(bordered_text_block(tarea.apreciacion_profesional))

        # Conclusión con respecto a la actividad
        elements.append(subsection_header("Conclusión con respecto a la actividad"))

        # 4 checkbox columns for conclusion
        concl_val = (tarea.conclusion or "").strip()
        concl_row = [[
            checkbox(concl_val == "reintegro_sin_modificaciones", "Reintegro sin\nmodificaciones"),
            checkbox(concl_val == "reintegro_con_modificaciones", "Reintegro con\nmodificaciones"),
            checkbox(concl_val == "desarrollo_capacidades", "Desarrollo de\ncapacidades"),
            checkbox(concl_val == "no_puede_desempenarla", "No puede\ndesempeñarla"),
        ]]
        concl_t = Table(concl_row, colWidths=[page_width * 0.25] * 4)
        concl_t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(concl_t)

        # Descripción de conclusión (if any)
        if tarea.descripcion_conclusion:
            elements.append(bordered_text_block(tarea.descripcion_conclusion))

        elements.append(Spacer(1, 6))

    # ── SECCIÓN 5: MATERIALES ────────────────────────────────────────
    elements.append(section_title_table("5   MATERIALES, EQUIPOS Y HERRAMIENTAS"))
    if materiales:
        m_header = [bold("Nombre"), bold("Descripción"), bold("Requerimientos"), bold("Observaciones")]
        m_rows = [m_header]
        for mat in materiales:
            m_rows.append([p(mat.nombre), p(mat.descripcion),
                           p(mat.requerimientos_operacion), p(mat.observaciones)])

        m_table = Table(m_rows, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.25, page_width * 0.25])
        m_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), ORANGE_BG),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(m_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 6: PELIGROS ──────────────────────────────────────────
    elements.append(section_title_table("6   IDENTIFICACIÓN DE PELIGROS"))
    cat_labels = {
        "fisicos": "Físicos", "biologicos": "Biológicos", "biomecanicos": "Biomecánicos",
        "psicosociales": "Psicosociales", "quimicos": "Químicos", "cond_seguridad": "Cond. Seguridad",
    }
    if peligros:
        p_header = [bold("Categoría"), bold("Descripción"), bold("Tipos de control"), bold("Recomendaciones")]
        p_rows = [p_header]
        for pel in peligros:
            p_rows.append([
                p(cat_labels.get(pel.categoria, pel.categoria)),
                p(pel.descripcion),
                p(pel.tipos_control_existente),
                p(pel.recomendaciones_control),
            ])

        p_table = Table(p_rows, colWidths=[page_width * 0.18, page_width * 0.27, page_width * 0.27, page_width * 0.28])
        p_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), ORANGE_BG),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(p_table)
    elements.append(Spacer(1, 4))

    elements.append(subsection_header("6.1  Verificación de acciones correctivas"))
    elements.append(bordered_text_block(secciones.verificacion_acciones_correctivas if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 7: CONCEPTO ──────────────────────────────────────────
    elements.append(section_title_table("7   CONCEPTO PARA PRUEBA DE TRABAJO"))
    elements.append(Spacer(1, 2))
    elements.append(subsection_header("COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS"))
    elements.append(bordered_text_block(secciones.concepto_prueba_trabajo if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 8: RECOMENDACIONES ───────────────────────────────────
    elements.append(section_title_table("8   RECOMENDACIONES"))
    elements.append(Spacer(1, 2))

    rec_data = [
        [
            Paragraph("<b>PARA EL TRABAJADOR</b>", styles["CellBold"]),
            Paragraph("<b>PARA LA EMPRESA</b>", styles["CellBold"])
        ],
        [
            p(recomendaciones.para_trabajador if recomendaciones else ""),
            p(recomendaciones.para_empresa if recomendaciones else "")
        ]
    ]
    rec_table = Table(rec_data, colWidths=[page_width * 0.50, page_width * 0.50])
    rec_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(rec_table)
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 9: REGISTRO ──────────────────────────────────────────
    elements.append(section_title_table("9   REGISTRO"))
    elements.append(Spacer(1, 2))

    if registro:
        # Header row
        reg_header = [
            Paragraph("<b>ELABORÓ</b>", styles["CellBold"]),
            Paragraph("<b>REVISÓ</b>", styles["CellBold"]),
            Paragraph("<b>DATOS DEL USUARIO</b>", styles["CellBold"]),
        ]

        # Build cell content for each column
        def build_sig_cell(nombre_label, nombre_val, firma_path, extra_label, extra_val):
            cell_parts = []
            cell_parts.append(Paragraph(f"<b>{nombre_label}:</b> {nombre_val or ''}", styles["ValueSmall"]))
            cell_parts.append(Spacer(1, 4))
            cell_parts.append(Paragraph("<b>FIRMA:</b>", styles["ValueSmall"]))
            if firma_path and os.path.exists(firma_path.lstrip("/")):
                try:
                    cell_parts.append(Image(firma_path.lstrip("/"), width=3 * cm, height=1.5 * cm))
                except Exception:
                    cell_parts.append(Spacer(1, 30))
            else:
                cell_parts.append(Spacer(1, 30))
            cell_parts.append(Spacer(1, 4))
            cell_parts.append(Paragraph(f"<b>{extra_label}:</b> {extra_val or ''}", styles["ValueSmall"]))
            return cell_parts

        elaboro_cell = build_sig_cell(
            "NOMBRE", registro.nombre_elaboro,
            registro.firma_elaboro,
            "LICENCIA S.O", registro.licencia_so_elaboro if hasattr(registro, 'licencia_so_elaboro') else ""
        )
        reviso_cell = build_sig_cell(
            "NOMBRE", registro.nombre_revisor,
            registro.firma_revisor,
            "LICENCIA S.O", registro.licencia_so_revisor if hasattr(registro, 'licencia_so_revisor') else ""
        )
        trabajador_cell = build_sig_cell(
            "NOMBRE",
            registro.nombre_trabajador if hasattr(registro, 'nombre_trabajador') else (identificacion.nombre_trabajador if identificacion else ""),
            registro.firma_trabajador,
            "C.C", identificacion.numero_documento if identificacion else ""
        )

        # Header table
        reg_header_table = Table([reg_header], colWidths=[page_width / 3] * 3)
        reg_header_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(reg_header_table)

        # Content table
        reg_data = [[elaboro_cell, reviso_cell, trabajador_cell]]
        reg_table = Table(reg_data, colWidths=[page_width / 3] * 3)
        reg_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(reg_table)

    # ── BUILD ────────────────────────────────────────────────────────
    doc.build(elements)
    return filepath
