"""
Generador de PDF para Análisis de Exigencia (Terapia Ocupacional)
Formato basado en Positiva S.A. - Análisis de Exigencia/Homologación
Versión: 01 - 2022/07
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
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.graphics import renderPDF


def generar_pdf_analisis_exigencia(
    analisis,
    identificacion,
    secciones,
    desempeno,
    tareas: list,
    materiales: list,
    peligros: list,
    recomendaciones,
    perfil,
    registro,
    output_dir: str = "pdfs",
) -> str:
    """Genera el PDF de Análisis de Exigencia y retorna la ruta del archivo."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_trab = (identificacion.nombre_trabajador or "sin_nombre").replace(" ", "_") if identificacion else "sin_nombre"
    filename = f"Analisis_Exigencia_{analisis.id}_{nombre_trab}_{timestamp}.pdf"
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
    styles.add(ParagraphStyle(name="SectionTitle", fontSize=8, fontName="Helvetica-Bold", spaceAfter=0, spaceBefore=0, textColor=colors.black, alignment=TA_LEFT, leftIndent=4))
    styles.add(ParagraphStyle(name="CellText", fontSize=7, fontName="Helvetica", leading=8.5))
    styles.add(ParagraphStyle(name="CellBold", fontSize=7, fontName="Helvetica-Bold", leading=8.5))
    styles.add(ParagraphStyle(name="LongText", fontSize=7, fontName="Helvetica", leading=9, alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle(name="FieldLabel", fontSize=7, fontName="Helvetica-Bold", leading=9, textColor=colors.HexColor("#333333")))
    styles.add(ParagraphStyle(name="FieldValue", fontSize=7, fontName="Helvetica", leading=9))
    styles.add(ParagraphStyle(name="CheckLabel", fontSize=6, fontName="Helvetica", leading=7.5))

    elements = []
    page_width = letter[0] - 2.4 * cm  # usable width

    # ── COLORES ──────────────────────────────────────────────────────
    ORANGE_BG = colors.HexColor("#FFE0B2")       # Naranja muy suave (Peach) para headers secciones
    HEADER_BG = colors.HexColor("#FFFFFF")        # Blanco para header principal
    BORDER_COLOR = colors.HexColor("#000000")     # Negro para bordes (según imagen)

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

    def format_date_cells(date_obj):
        """Formats a date into 3 cells [DD] [MM] [YYYY]"""
        if not date_obj:
             return ["", "", ""]
        try:
            if isinstance(date_obj, str):
                dt = datetime.strptime(date_obj, "%Y-%m-%d")
            else:
                dt = date_obj
            return [f"{dt.day:02}", f"{dt.month:02}", f"{dt.year:04}"]
        except:
            return ["", "", ""]

    def make_checkbox_drawing(checked, size=8):
        """Creates a checkbox using ReportLab Drawing shapes"""
        d = Drawing(size, size)
        d.add(Rect(0, 0, size, size,
                   fillColor=colors.white,
                   strokeColor=colors.black,
                   strokeWidth=0.6))
        if checked:
            # Draw X
            d.add(Line(1, 1, size - 1, size - 1, strokeColor=colors.black, strokeWidth=1))
            d.add(Line(1, size - 1, size - 1, 1, strokeColor=colors.black, strokeWidth=1))
        return d

    def checkbox(checked, label_text=""):
        """Returns a checkbox + label as a mini table"""
        cb = make_checkbox_drawing(checked)
        if label_text:
            lbl = Paragraph(label_text, styles["CheckLabel"])
            t = Table([[cb, lbl]], colWidths=[0.4 * cm, None])
            t.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 1),
            ]))
            return t
        return cb

    def p(text, style_name="ValueSmall"):
        return Paragraph(str(text) if text else "", styles[style_name])

    def bold(text):
        return Paragraph(f"<b>{text}</b>", styles["CellBold"])

    def section_title_table(text):
        """Creates a full-width table with orange background for section titles"""
        data = [[Paragraph(f"<b>{text}</b>", styles["SectionTitle"])]]
        t = Table(data, colWidths=[page_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), ORANGE_BG),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR), # Thick border
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        return t

    def bordered_text_block(text_content):
        """Wraps text in a bordered table cell"""
        data = [[Paragraph(str(text_content) if text_content else "", styles["LongText"])]]
        t = Table(data, colWidths=[page_width])
        t.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return t

    # ── ENCABEZADO (HEADER) ──────────────────────────────────────────
    _backend_dir = Path(__file__).resolve().parent.parent.parent
    _static_images = _backend_dir / "static" / "images"
    _logo_positiva = _static_images / "logo_positiva.png"
    _logo_santa = _static_images / "logo_santa_isabel.png"

    logo_left = Image(str(_logo_positiva), width=2.8 * cm, height=1.4 * cm) if _logo_positiva.exists() else bold("POSITIVA")
    logo_right = Image(str(_logo_santa), width=2.8 * cm, height=1.4 * cm) if _logo_santa.exists() else bold("LOGO PROVEEDOR")

    center_text = Paragraph(
        "<b>POSITIVA S.A</b><br/>"
        "Compañía de Seguros / ARL<br/>"
        "-Gestión Documental-<br/>"
        "<b>VALORACIÓN<br/>ANALISIS DE EXIGENCIAS/HOMOLOGACIÓN</b>",
        styles["HeaderSub"]
    )

    r2_left = Paragraph("<b>Código</b><br/><b>Fecha</b>&nbsp;&nbsp;&nbsp;&nbsp;2022/07", styles["HeaderSubLeft"])
    r2_right = Paragraph("Página 1 de ___", styles["HeaderSub"])

    r3_c1 = Paragraph("Aprobado por:<br/><b>Gerencia Médica</b>", styles["HeaderSub"])
    r3_c2 = Paragraph("Proceso:<br/><b>Rehabilitación Integral</b>", styles["HeaderSub"])
    r3_c3 = Paragraph("Revisado por:<br/><b>Coordinación Técnica</b>", styles["HeaderSub"])
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
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 0), (0, 0)),
        ('SPAN', (1, 0), (1, 1)),
        ('SPAN', (0, 3), (2, 3)),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(header_t)

    # ── FECHA DE VALORACIÓN ──────────────────────────────────────────
    i = identificacion
    # Date cells
    fv_cells = format_date_cells(i.fecha_valoracion if i else None)
    
    # Create mini table for date cells
    def date_cell_table(d, m, y):
        data = [[d, m, y]]
        t = Table(data, colWidths=[0.8*cm, 0.8*cm, 1.2*cm])
        t.setStyle(TableStyle([
             ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
             ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
             ('FONTSIZE', (0, 0), (-1, -1), 7),
        ]))
        return t
        
    fv_table = date_cell_table(*fv_cells)

    # Header Date Row: Right aligned "FECHA DE VALORACIÓN: [D][M][Y]"
    date_row = [[
        "", 
        Paragraph("<b>FECHA DE VALORACIÓN:</b>", styles["LabelSmall"]),
        fv_table
    ]]
    date_t = Table(date_row, colWidths=[page_width * 0.55, page_width * 0.25, page_width * 0.20])
    date_t.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(date_t)
    elements.append(Spacer(1, 4))

    # ── SECCIÓN 1: IDENTIFICACIÓN ────────────────────────────────────
    elements.append(section_title_table("1   IDENTIFICACIÓN"))
    
    # Subheader
    sub_h = [[Paragraph("<b>(Datos trabajador, evento ATEL, Empresa)</b>", styles["CellBold"])]]
    sub_ht = Table(sub_h, colWidths=[page_width])
    sub_ht.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(sub_ht)

    # 1.1 Worker Info (Complex Grid)
    # Row 1: Nombre
    # Row 2: Documento
    # Row 3: Siniestro
    # Row 4: Fecha Nac | Edad | Dominancia
    
    def row_2col_simple(lbl, val):
        return [bold(lbl), p(val)]

    id_rows = []
    id_rows.append(row_2col_simple("Nombre del trabajador", i.nombre_trabajador if i else ""))
    id_rows.append(row_2col_simple("Número de documento", i.numero_documento if i else ""))
    id_rows.append(row_2col_simple("Identificación del siniestro", i.id_siniestro if i else ""))
    
    id_t1 = Table(id_rows, colWidths=[page_width * 0.30, page_width * 0.70])
    id_t1.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(id_t1)
    
    # Fecha Nacimiento / Edad Row
    # Col 1: Label "Fecha de nacimiento/edad"
    # Col 2: Date Cells
    # Col 3: empty
    # Col 4: edad val
    # Col 5: "años"
    
    nac_cells = format_date_cells(i.fecha_nacimiento if i else None)
    nac_table = date_cell_table(*nac_cells)
    edad_val = f"{i.edad or ''}" if i else ""
    
    # This row is tricky in the image. It looks like:
    # [Label Fecha/Edad] | [D][M][Y] | [Label Edad?? or empty] | [Value] | [Label años]
    # Let's approximate with a 4 col layout
    
    nac_row = [[
        bold("Fecha de nacimiento/edad"),
        nac_table,
        p(edad_val, "DateDigit"),
        p("años")
    ]]
    # Adjust widths to match visual
    nac_t = Table(nac_row, colWidths=[page_width * 0.30, page_width * 0.30, page_width * 0.10, page_width * 0.30])
    nac_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (2, 0), (2, 0), 'CENTER'), # Center age
    ]))
    elements.append(nac_t)
    
    # Dominancia
    dom = i.dominancia.lower() if i and i.dominancia else ""
    dom_row = [[
        bold("Dominancia"),
        checkbox(dom == "derecha", "Derecha"),
        checkbox(dom == "izquierda", "Izquierda"),
        checkbox(dom == "ambidiestra", "Ambidiestra"),
    ]]
    dom_t = Table(dom_row, colWidths=[page_width * 0.30, page_width * 0.23, page_width * 0.23, page_width * 0.24])
    dom_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(dom_t)
    
    # Estado Civil
    ec_t = Table([row_2col_simple("Estado civil", i.estado_civil if i else "")], colWidths=[page_width * 0.30, page_width * 0.70])
    ec_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(ec_t)

    # Nivel Educativo (Matrix)
    ne = i.nivel_educativo.lower() if i and i.nivel_educativo else ""
    
    # Defining grid like the image: 2 cols of options inside the main value cell? 
    # Image shows:
    # [Nivel educativo] | [Formación empirica] [Basica primaria] [Bachillerato: vocacional] ...
    # It's a grid inside the right cell.
    
    ne_opts = [
        ("formacion_empirica", "Formación empírica"),
        ("basica_primaria", "Básica primaria"),
        ("bachillerato_vocacional", "Bachillerato:\nvocacional 9°"),
        ("bachillerato_modalidad", "Bachillerato: modalidad"),
        ("tecnico", "Técnico/\nTecnológico"),
        ("profesional", "Profesional"),
        ("postgrado", "Especialización/\npostgrado/ maestría"),
        ("formacion_informal", "Formación\ninformal oficios"),
        ("analfabeta", "Analfabeta"),
        ("otros", "Otros"),
    ]
    
    # Create 3xN grid or 2xN grid? Image looks like 3 columns.
    # Let's do 3 columns.
    ne_cells = []
    for key, label_text in ne_opts:
        checked = (ne == key or key in ne)
        ne_cells.append([checkbox(checked), p(label_text)])
        
    # We construct a table for the right side
    # 3 columns of (checkbox + label)
    # We need to reshape list to grid
    rows_ne = []
    curr_row = []
    for cell in ne_cells:
        curr_row.extend(cell) # adds cb, label
        if len(curr_row) >= 6: # 3 pairs
            rows_ne.append(curr_row)
            curr_row = []
    if curr_row:
        # pad
        while len(curr_row) < 6:
            curr_row.append("")
        rows_ne.append(curr_row)
        
    ne_inner = Table(rows_ne, colWidths=[0.5*cm, 3.5*cm, 0.5*cm, 3.5*cm, 0.5*cm, 3.5*cm])
    ne_inner.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 1),
    ]))
    
    ne_outer = Table([[bold("Nivel educativo"), ne_inner]], colWidths=[page_width * 0.30, page_width * 0.70])
    ne_outer.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(ne_outer)

    # Rest of Identification
    simple_fields = [
        ("Teléfonos trabajador", i.telefonos_trabajador),
        ("Dirección residencia/ciudad", i.direccion_residencia),
        ("Diagnóstico(s) clínico(s) por evento ATEL", i.diagnosticos_atel),
        ("Fecha(s) del evento(s) ATEL", i.fechas_eventos_atel),
        ("EPS - IPS", i.eps_ips),
        ("AFP", i.afp),
    ]
    
    s_rows = [[bold(l), p(v)] for l, v in simple_fields]
    s_table = Table(s_rows, colWidths=[page_width * 0.30, page_width * 0.70])
    s_table.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(s_table)
    
    # Tiempo incapacidad
    tti_row = [[bold("Tiempo total de incapacidad"), p(str(i.tiempo_incapacidad_dias or "")), bold("días")]]
    tti_t = Table(tti_row, colWidths=[page_width*0.30, page_width*0.60, page_width*0.10])
    tti_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('ALIGN', (2,0), (2,0), 'CENTER')]))
    elements.append(tti_t)
    
    # Empresa Info
    emp_fields = [
        ("Empresa donde labora", i.empresa),
        ("NIT de la Empresa", i.nit_empresa),
        ("Cargo actual", i.cargo_actual),
    ]
    e_rows = [[bold(l), p(v)] for l, v in emp_fields]
    e_table = Table(e_rows, colWidths=[page_width * 0.30, page_width * 0.70])
    e_table.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(e_table)

    # Cargo Unico
    cu = i.cargo_unico
    cu_row = [[
        bold("Cargo unico de las mismas caracteristicas"),
        checkbox(cu is True, "si"),
        checkbox(cu is False, "no"),  # If False or None but check logic
        ""
    ]]
    cu_t = Table(cu_row, colWidths=[page_width * 0.40, page_width * 0.10, page_width * 0.10, page_width * 0.40])
    cu_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(cu_t)
    
    # Area
    area_t = Table([[bold("Área/sección/proceso"), p(i.area_seccion)]], colWidths=[page_width * 0.30, page_width * 0.70])
    area_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(area_t)
    
    # Fechas ingreso (Complex again with calculated time)
    # [Label] | [D][M][Y] | [ ] | [Value] | [años]
    # Let's simplify and use string date for now as standard text
    
    fic_fecha = i.fecha_ingreso_cargo
    fic_ant = i.antiguedad_cargo or ""
    fie_fecha = i.fecha_ingreso_empresa
    fie_ant = i.antiguedad_empresa or ""
    
    fi_rows = [
        [bold("Fecha ingreso cargo/antigüedad en el cargo"), p(format_date(fic_fecha)), bold("tiempo"), p(fic_ant), p("años")],
        [bold("Fecha ingreso a la empresa/antigüedad en la empresa"), p(format_date(fie_fecha)), bold("tiempo"), p(fie_ant), p("años")]
    ]
    fi_t = Table(fi_rows, colWidths=[page_width*0.30, page_width*0.30, page_width*0.10, page_width*0.20, page_width*0.10])
    fi_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(fi_t)

    # Modalidad y Contacto
    mod = i.modalidad.lower() if i and i.modalidad else ""
    mod_row = [[
        bold("Modalidad"),
        checkbox(mod == "presencial", "Presencial"),
        checkbox(mod == "teletrabajo", "teletrabajo"),
        checkbox("casa" in mod, "trabajo en casa"),
    ]]
    mod_t = Table(mod_row, colWidths=[page_width*0.20, page_width*0.25, page_width*0.25, page_width*0.30])
    mod_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(mod_t)
    
    # Contact extra info
    extra_rows = [
        [bold("Tiempo de la modalidad"), p(i.tiempo_modalidad)],
        [bold("Contacto en empresa/cargo"), p(i.contacto_empresa)],
        [bold("Correo(s) electrónico(s)"), p(i.correos_electronicos)],
        [bold("Teléfonos de contacto empresa"), p(i.telefonos_empresa)],
        [bold("Dirección de empresa/ciudad"), p(i.direccion_empresa)],
    ]
    ex_t = Table(extra_rows, colWidths=[page_width*0.30, page_width*0.70])
    ex_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    elements.append(ex_t)
    
    elements.append(Spacer(1, 10))
    
    # ── SECCIÓN 2: METODOLOGÍA ───────────────────────────────────────
    elements.append(section_title_table("2   METODOLOGIA"))
    elements.append(bordered_text_block(secciones.metodologia if secciones else ""))
    elements.append(Spacer(1, 6))

    # ── SECCIÓN 3: CONDICIONES DE TRABAJO ────────────────────────────
    elements.append(section_title_table("3   CONDICIONES DE TRABAJO"))
    
    # 3.1
    elements.append(Table([[bold("3.1  DESCRIPCION DEL PROCESO PRODUCTIVO")]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), ORANGE_BG)])))
    elements.append(bordered_text_block(secciones.descripcion_proceso_productivo if secciones else ""))
    
    # 3.2 Desempeño Organizacional
    elements.append(Table([[bold("3.2  REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL")]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), ORANGE_BG)])))
    if desempeno:
        d = desempeno
        do_data = [
            [bold("Jornada"), p(d.jornada), bold("Ritmo"), p(d.ritmo)],
            [bold("Descansos programados"), p(d.descansos_programados), bold("Turnos"), p(d.turnos)],
            [bold("Tiempos efectivos en la jornada laboral"), p(d.tiempos_efectivos), bold("Rotaciones"), p(d.rotaciones)],
            [bold("Horas extras"), p(d.horas_extras), bold("Distribución semanal"), p(d.distribucion_semanal)],
        ]
        do_table = Table(do_data, colWidths=[page_width * 0.25, page_width * 0.25, page_width * 0.25, page_width * 0.25])
        do_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(do_table)
    
    elements.append(Spacer(1, 10))

    # ── SECCIÓN 4: TAREAS ────────────────────────────────────────────
    elements.append(section_title_table("4   REQUERIMIENTOS DEL PROCESO PRODUCTIVO (Identificando tareas críticas)"))
    elements.append(Spacer(1, 4))

    for idx, tarea in enumerate(tareas):
        # 4.1 Header of each task
        # Actividad | Ciclo
        # Subactividad | Estandar Prod
        
        t_data = [
            [bold("Actividad"), p(tarea.actividad), bold("Ciclo"), p(tarea.ciclo)],
            [bold("Subactividad"), p(tarea.subactividad), bold("Estándar de\nProductividad"), p(tarea.estandar_productividad)],
        ]
        t_table = Table(t_data, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.20, page_width * 0.30])
        t_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (0, -1), ORANGE_BG),
            ('BACKGROUND', (2, 0), (2, -1), ORANGE_BG),
        ]))
        elements.append(t_table)
        
        # 4.2 Photos and Description
        # Header Row
        h_row = [[
            Paragraph("<b>Registro fotográfico</b>", styles["CellBold"]),
            Paragraph("<b>Descripción subactividad<br/>Requerimientos motrices - analisis biomecanico</b>", styles["CellBold"]),
        ]]
        h_t = Table(h_row, colWidths=[page_width * 0.35, page_width * 0.65])
        h_t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(h_t)
        
        # Content Row
        # Left: Images stack
        # Right: Description text
        
        # Process images
        all_img_paths = []
        if tarea.registro_fotografico:
            all_img_paths = [path.strip().lstrip("/") for path in tarea.registro_fotografico.split(';') if path.strip()]
        valid_img_paths = [p_img for p_img in all_img_paths if os.path.exists(p_img)]
        
        foto_content = []
        if valid_img_paths:
            from reportlab.lib.utils import ImageReader
            img_max_w = page_width * 0.33
            img_max_h = 6 * cm
            for img_p in valid_img_paths:
                try:
                    ir = ImageReader(img_p)
                    iw, ih = ir.getSize()
                    sc = min(img_max_w / iw, img_max_h / ih)
                    foto_content.append(Image(img_p, width=iw * sc, height=ih * sc))
                    foto_content.append(Spacer(1, 4))
                except Exception as e:
                    print(f"Error embedding image: {e}")
        
        if not foto_content:
            foto_content = [Spacer(1, 2*cm)] # Placeholder space
            
        foto_table = Table([[item] for item in foto_content], colWidths=[page_width * 0.35])
        # Center contents
        foto_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
        
        desc_text = f"<b>Descripción subactividad:</b><br/>{tarea.descripcion_biomecanica or ''}<br/><br/><b>Requerimientos motrices:</b><br/>{tarea.requerimientos_motrices or ''}"
        
        content_row = [[foto_table, Paragraph(desc_text, styles["LongText"])]]
        content_t = Table(content_row, colWidths=[page_width * 0.35, page_width * 0.65])
        content_t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            # Padding for text cell
            ('LEFTPADDING', (1, 0), (1, 0), 4),
            ('TOPPADDING', (1, 0), (1, 0), 4),
        ]))
        elements.append(content_t)
        
        # 4.3 Apreciación y Conclusión
        # Row: Apreciación profesional...
        elements.append(Table([[bold("Apreciación del profesional de la salud que evalúa y plan de reincorporacion laboral:")]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#E0E0E0"))])))
        elements.append(bordered_text_block(tarea.apreciacion_profesional))
        elements.append(Spacer(1, 2))
        
        # Row: Conclusión respect a la actividad
        elements.append(Table([[bold("Conclusión con respecto a la actividad")]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), ORANGE_BG)])))
        
        concl = tarea.conclusion
        c_row = [[
            checkbox(concl == "reintegro_sin_modificaciones", "reintegro\nsin modificaciones"),
            checkbox(concl == "reintegro_con_modificaciones", "reintegro\ncon modificaciones"),
            checkbox(concl == "desarrollo_capacidades", "Desarrollo de capacidades"),
            checkbox(concl == "no_puede_desempenarla", "No puede\ndesempeñarla"),
        ]]
        c_t = Table(c_row, colWidths=[page_width * 0.25] * 4)
        c_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        elements.append(c_t)
        
        elements.append(Spacer(1, 10))
        # End of Task Loop

    # ── SECCIÓN 5: MATERIALES ────────────────────────────────────────
    elements.append(section_title_table("5   Identificación de materiales, equipos y herramientas en el proceso productivo"))
    
    # Header
    mat_h = [[bold("Nombre"), bold("Descripcion"), bold("Estado"), bold("Requerimientos para su operación")]]
    mat_ht = Table(mat_h, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.15, page_width * 0.35])
    mat_ht.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(mat_ht)
    
    # Rows
    for m in materiales:
        row = [[p(m.nombre), p(m.descripcion), p(m.estado), p(m.requerimientos_operacion)]]
        mt = Table(row, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.15, page_width * 0.35])
        mt.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        elements.append(mt)
        
    elements.append(Spacer(1, 10))

    # ── SECCIÓN 6: PELIGROS ──────────────────────────────────────────
    elements.append(section_title_table("6   Identificación de peligros dentro del proceso productivo"))
    
    # Header
    pel_h = [[bold("Nombre"), bold("Descripción"), bold("Tipos de control existente"), bold("Recomendaciones para su control")]]
    pel_ht = Table(pel_h, colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.25, page_width * 0.25])
    pel_ht.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(pel_ht)
    
    # Pre-defined categories
    cats = {
        "fisicos": "Físicos",
        "biologicos": "Biológicos",
        "biomecanicos": "Biomecánicos",
        "psicosociales": "Psicosociales",
        "quimicos": "Químicos",
        "cond_seguridad": "Cond. Seguridad"
    }
    
    # Organize dangers by category
    danger_map = {k: None for k in cats.keys()}
    for pelig in peligros:
        if pelig.categoria in danger_map:
            danger_map[pelig.categoria] = pelig
            
    for key, label in cats.items():
        d = danger_map[key]
        row = [
            bold(label),
            p(d.descripcion if d else ""),
            p(d.tipos_control_existente if d else ""),
            p(d.recomendaciones_control if d else "")
        ]
        pt = Table([row], colWidths=[page_width * 0.20, page_width * 0.30, page_width * 0.25, page_width * 0.25])
        pt.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        elements.append(pt)
        
    # 6.1 Verificacion acciones
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<b>6.1 Verificacion de las acciones correctivas puntuales frente al riesgo que propicio el evento.</b>", styles["LabelSmall"]))
    elements.append(bordered_text_block(secciones.verificacion_acciones_correctivas if secciones else ""))
    
    elements.append(Spacer(1, 10))

    # ── SECCIÓN 11: PERFIL DE EXIGENCIAS ─────────────────────────────
    elements.append(section_title_table("11  PERFIL DE EXIGENCIAS"))
    elements.append(Spacer(1, 4))
    
    def rating_table(title, items, data_dict):
        rows = []
        rows.append([bold(title or "FACTORES A EVALUAR"), bold("CALIFICACIÓN (0-4)"), bold("OBSERVACIONES")])
        
        for item in items:
            val = None
            obs = ""
            if data_dict and item in data_dict:
                val = data_dict[item].get("valor")
                obs = data_dict[item].get("observacion", "")
            
            num_cells = []
            for i in range(5):
                bg = colors.HexColor("#42A5F5") if val == i else colors.white
                text_color = colors.white if val == i else colors.black
                n_p = Paragraph(f"<font color='{text_color}'><b>{i}</b></font>" if val == i else str(i), 
                                ParagraphStyle('Num', parent=styles['DateDigit'], alignment=TA_CENTER))
                
                t = Table([[n_p]], colWidths=[0.5*cm])
                t.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('BACKGROUND', (0,0), (-1,-1), bg),
                    ('BOX', (0,0), (-1,-1), 0.5 if val != i else 0, colors.gray),
                ]))
                num_cells.append(t)
            
            rating_sub = Table([num_cells], colWidths=[0.6*cm]*5)
            rows.append([p(item), rating_sub, p(obs)])
            
        t = Table(rows, colWidths=[page_width * 0.35, page_width * 0.35, page_width * 0.30])
        t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E0E0E0")),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        return t

    if perfil:
        # Sensopercepcion
        elements.append(Table([[Paragraph("<b>SENSOPERCEPCIÓN</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        
        visionItems = ['Percepción del Color', 'Percepción de Formas', 'Percepción de Tamaño', 'Relaciones Espaciales']
        elements.append(rating_table("VISIÓN", visionItems, perfil.sensopercepcion))
        elements.append(Spacer(1, 4))
        
        audicionItems = ['Ubicación de Fuentes Sonoras', 'Discriminación Auditiva']
        elements.append(rating_table("AUDICIÓN", audicionItems, perfil.sensopercepcion))
        elements.append(Spacer(1, 4))
        
        sensItems = ['Estereognosia', 'Barognosia', 'Tacto Superficial', 'Percepción de Temperatura', 'Propiocepción']
        elements.append(rating_table("SENSIBILIDAD SUPERFICIAL Y PROPIOCEPCIÓN", sensItems, perfil.sensopercepcion))
        elements.append(Spacer(1, 4))
        
        olfatoItems = ['Percepción de olores o sabores', 'Discriminación de olores o sabores']
        elements.append(rating_table("OLFATO GUSTO", olfatoItems, perfil.sensopercepcion))
        elements.append(Spacer(1, 10))
        
        # Motricidad Gruesa
        elements.append(Table([[Paragraph("<b>MOTRICIDAD GRUESA</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        mgItems = [
            'Postura Bípeda', 'Postura Sedente', 'Posición de rodillas', 'Posición de Cuclillas',
            'Caminar', 'Subir (escaleras, rampas)', 'Bajar (escaleras, rampas)',
            'Levantar pesos', 'Transportar pesos', 'Agacharse', 'Inclinarse',
            'Alcanzar', 'Halar', 'Empujar', 'Rapidez Motriz', 'Equilibrio'
        ]
        elements.append(rating_table(None, mgItems, perfil.motricidad_gruesa))
        elements.append(Spacer(1, 10))
        
        # Motricidad Fina
        elements.append(Table([[Paragraph("<b>MOTRICIDAD FINA</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        mfItems = ['Enganche', 'Agarre', 'Pinza', 'Pinza Fina']
        elements.append(rating_table(None, mfItems, perfil.motricidad_fina))
        elements.append(Spacer(1, 10))
        
        # Armonia
        elements.append(Table([[Paragraph("<b>ARMONÍA</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        armItems = ['Uso de Ambas Manos', 'Coordinación Ojo - Mano', 'Coordinación Bimanual', 'Coordinación Mano - Pie']
        elements.append(rating_table(None, armItems, perfil.armonia))
        elements.append(Spacer(1, 10))
        
        # Cognitivos
        elements.append(Table([[Paragraph("<b>COGNITIVOS</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        cogItems = [
            'Atención', 'Concentración', 'Creatividad', 'Flexibilidad',
            'Responsabilidad', 'Rapidez de Reacción', 'Percepción Herramientas de Trabajo', 'Percepción Estética'
        ]
        elements.append(rating_table(None, cogItems, perfil.cognitivos))
        elements.append(Spacer(1, 10))
        
        # Psicosociales
        elements.append(Table([[Paragraph("<b>PSICOSOCIALES</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        psyItems = [
            'Adaptación al Grupo de Trabajo', 'Adaptación al Ambiente', 'Relación con la Autoridad',
            'Relación con Compañeros', 'Liderazgo', 'Enfoque Constructivo',
            'Cooperación', 'Confiabilidad', 'Estabilidad Emocional', 'Confianza en sí mismo'
        ]
        elements.append(rating_table(None, psyItems, perfil.psicosociales))
        elements.append(Spacer(1, 10))
        
        # Laborales
        elements.append(Table([[Paragraph("<b>LABORALES</b>", styles["SectionTitle"])]], colWidths=[page_width], style=TableStyle([('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#BBDEFB"))])))
        labItems = [
            'Rendimiento', 'Asistencia', 'Puntualidad', 'Compromiso',
            'Autocontrol', 'Eficiencia', 'Organización y Métodos de Trabajo',
            'Calidad de Trabajo', 'Cuidado con los elementos', 'Higiene', 'Pulcritud'
        ]
        if hasattr(perfil, 'laborales'): # ensure compatibility if field missing
             elements.append(rating_table(None, labItems, perfil.laborales))
        else:
             elements.append(rating_table(None, labItems, {}))
        
        elements.append(Spacer(1, 10))
    
    # ── SECCIÓN 9: REGISTRO ──────────────────────────────────────────
    elements.append(section_title_table("9. REGISTRO"))
    elements.append(Spacer(1, 4))
    
    # Headers
    sig_h = [[bold("ELABORÓ"), bold("REVISIÓN POR PROVEEDOR"), bold("EQUIPO DE REHABILITACIÓN INTEGRAL")]]
    sig_ht = Table(sig_h, colWidths=[page_width/3]*3)
    sig_ht.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#E0E0E0")),
    ]))
    elements.append(sig_ht)
    
    def get_sig_image(url):
        if not url: return Spacer(1, 2*cm)
        try:
            if "uploads/" in url:
                clean_url = url.split("uploads/")[-1]
                path = _backend_dir / "uploads" / clean_url
                if path.exists():
                    return Image(str(path), width=4*cm, height=2*cm)
            return Spacer(1, 2*cm)
        except:
            return Spacer(1, 2*cm)

    r = registro
    sig_elaboro = get_sig_image(r.firma_elaboro) if r else Spacer(1, 2*cm)
    sig_reviso = get_sig_image(r.firma_revisor) if r else Spacer(1, 2*cm)
    
    cell_elab = [
        sig_elaboro,
        Spacer(1, 5),
        bold("Nombre y Apellido"),
        p(r.nombre_elaboro if r else ""),
        Spacer(1, 10),
        Paragraph("<b>Profesionales que realizan la valoración</b>", styles["CheckLabel"])
    ]
    
    cell_rev = [
        sig_reviso,
        Spacer(1, 5),
        bold("Nombre y Apellido"),
        p(r.nombre_revisor if r else ""),
        Spacer(1, 10),
        Paragraph("<b>Profesional que revisa la valoración</b>", styles["CheckLabel"])
    ]
    
    cell_team = [
        Spacer(1, 2*cm), 
        bold("Nombre Proveedor"),
        p(r.nombre_proveedor if r else ""),
        Spacer(1, 10),
        Paragraph("<b>Gerencia Médica</b>", styles["CheckLabel"])
    ]
    
    def sig_cell_table(content):
        t = Table([[c] for c in content], colWidths=[page_width/3 - 10])
        t.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
        return t
        
    sig_row = [[sig_cell_table(cell_elab), sig_cell_table(cell_rev), sig_cell_table(cell_team)]]
    sig_t = Table(sig_row, colWidths=[page_width/3]*3)
    sig_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(sig_t)
    
    elements.append(Spacer(1, 10))

