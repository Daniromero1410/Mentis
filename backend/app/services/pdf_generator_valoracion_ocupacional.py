"""
Generador de PDF para Valoración Ocupacional (Formatos TO)
Diseño profesional y estético
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, KeepTogether, Image as ReportLabImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
from pathlib import Path
import os


# Path al logo del encabezado
LOGO_PATH = Path(__file__).parent.parent.parent / "static" / "images" / "logo_encabezado.jpg"


def sanitize_filename(text: str) -> str:
    """Limpia un texto para usarlo como nombre de archivo"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        text = text.replace(char, '')
    text = text.replace(' ', '_')
    if len(text) > 50:
        text = text[:50]
    return text


def generar_pdf_valoracion_ocupacional(
    valoracion,
    identificacion,
    secciones_texto,
    historia_ocupacional,
    eventos_no_laborales,
    actividad_actual,
    rol_laboral,
    evento_atel,
    composicion_familiar,
    miembros_familiares,
    evaluacion_otras_areas,
    registro,
    evaluacion_otras_areas_raw,
    evaluador,
    output_dir: str = "pdfs"
) -> str:
    """
    Genera PDF profesional de la Valoración Ocupacional
    """
    # Crear directorio si no existe
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)

    # Generar nombre de archivo
    nombre = identificacion.nombre_trabajador if identificacion and identificacion.nombre_trabajador else "sin_nombre"
    doc_id = identificacion.numero_documento if identificacion and identificacion.numero_documento else "sin_id"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    pdf_filename = f"valoracion_ocupacional_{sanitize_filename(nombre)}_{sanitize_filename(str(doc_id))}_{timestamp}.pdf"
    pdf_path = output_path / pdf_filename

    # Configuración del documento
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=25,
        bottomMargin=25
    )

    # Estilos
    styles = getSampleStyleSheet()

    # Colores profesionales (Theme Positiva S.A)
    COLOR_HEADER = colors.HexColor('#E65100')     # Naranja oscuro
    COLOR_LABEL_BG = colors.HexColor('#f5f5f5')   # Gris claro
    COLOR_BORDER = colors.HexColor('#424242')     # Gris oscuro
    COLOR_TEXT = colors.black

    PAGE_WIDTH = 7.4 * inch

    style_normal = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        alignment=TA_LEFT,
        textColor=COLOR_TEXT
    )

    style_bold = ParagraphStyle(
        'Bold',
        parent=style_normal,
        fontName='Helvetica-Bold',
        fontSize=8
    )

    style_center = ParagraphStyle(
        'Center',
        parent=style_normal,
        alignment=TA_CENTER
    )

    style_section_header = ParagraphStyle(
        'SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.white
    )

    style_small = ParagraphStyle(
        'Small',
        parent=style_normal,
        fontSize=7,
        leading=9
    )

    # Helpers
    def P(text, style=style_normal):
        return Paragraph(str(text or ''), style)

    def B(text, style=style_bold):
        return Paragraph(f"<b>{text or ''}</b>", style)

    def Header(text):
        return Paragraph(f"<b>{text}</b>", style_section_header)

    def crear_seccion_header(texto):
        t = Table([[Header(texto)]], colWidths=[PAGE_WIDTH])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLOR_HEADER),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ]))
        return t

    def make_checkbox_drawing(checked, size=8):
        from reportlab.graphics.shapes import Drawing, Rect, Line
        d = Drawing(size, size)
        d.add(Rect(0, 0, size, size,
                   fillColor=COLOR_HEADER if checked else colors.white,
                   strokeColor=COLOR_BORDER,
                   strokeWidth=0.6))
        if checked:
            d.add(Line(2, 2, size - 2, size - 2, strokeColor=colors.white, strokeWidth=1))
            d.add(Line(2, size - 2, size - 2, 2, strokeColor=colors.white, strokeWidth=1))
        return d

    def checkbox(checked, label_text):
        cb = make_checkbox_drawing(checked)
        lbl = Paragraph(label_text, style_small)
        t = Table([[cb, lbl]], colWidths=[0.4 * cm, None])
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 1),
            ('RIGHTPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        return t

    def fmt_fecha(f):
        if not f: return ""
        if hasattr(f, 'strftime'): return f.strftime('%d/%m/%Y')
        if isinstance(f, str):
            try:
                if 'T' in f: f = f.split('T')[0]
                d = datetime.strptime(f, "%Y-%m-%d")
                return d.strftime('%d/%m/%Y')
            except:
                return f[:10]
        return str(f)[:10]

    def calcular_edad(fecha_nac):
        if not fecha_nac: return ""
        if isinstance(fecha_nac, str):
            try:
                if 'T' in fecha_nac: fecha_nac = fecha_nac.split('T')[0]
                fecha_nac = datetime.strptime(fecha_nac, "%Y-%m-%d").date()
            except: return ""
        elif hasattr(fecha_nac, 'date'): fecha_nac = fecha_nac.date()
        elif isinstance(fecha_nac, datetime): fecha_nac = fecha_nac.date()
        else: return ""
        
        today = datetime.now().date()
        edad = today.year - fecha_nac.year - ((today.month, today.day) < (fecha_nac.month, fecha_nac.day))
        return f"{edad} años"

    def calcular_antiguedad(fecha_ingreso):
        if not fecha_ingreso: return ""
        if isinstance(fecha_ingreso, str):
            try:
                if 'T' in fecha_ingreso: fecha_ingreso = fecha_ingreso.split('T')[0]
                fecha_ingreso = datetime.strptime(fecha_ingreso, "%Y-%m-%d").date()
            except: return ""
        elif hasattr(fecha_ingreso, 'date'): fecha_ingreso = fecha_ingreso.date()
        elif isinstance(fecha_ingreso, datetime): fecha_ingreso = fecha_ingreso.date()
        else: return ""
        
        today = datetime.now().date()
        anios = today.year - fecha_ingreso.year - ((today.month, today.day) < (fecha_ingreso.month, fecha_ingreso.day))
        return f"{anios} años" if anios > 0 else "Menos de 1 año"

    story = []

    # ===== ENCABEZADO (HEADER) ESTILO POSITIVA =====
    # Resolve logos
    _backend_dir = Path(__file__).resolve().parent.parent.parent  # backend/
    _static_images = _backend_dir / "static" / "images"
    _logo_positiva = _static_images / "logo_positiva.png"
    _logo_santa = _static_images / "logo_santa_isabel.png"

    # Logo styling
    logo_left = ReportLabImage(str(_logo_positiva), width=2.8 * cm, height=1.4 * cm) if _logo_positiva.exists() else B("POSITIVA")
    logo_right = ReportLabImage(str(_logo_santa), width=2.8 * cm, height=1.4 * cm) if _logo_santa.exists() else Paragraph("<b>Logo Proveedor</b>", style_small)

    center_text = Paragraph(
        "<para align=center><b>POSITIVA S.A</b><br/>"
        "Compañía de Seguros / ARL<br/>"
        "-Gestión Documental-<br/>"
        "<b>VALORACIÓN OCUPACIONAL</b></para>",
        style_normal
    )

    r2_left = Paragraph("<b>Código</b><br/><b>Fecha</b>&nbsp;&nbsp;&nbsp;&nbsp;2022/07", style_small)
    r2_right = Paragraph("Página 1 de ___", style_small)

    r3_c1 = Paragraph("<para align=center>Aprobado por:<br/><b>Gerencia Médica</b></para>", style_small)
    r3_c2 = Paragraph("<para align=center>Proceso:<br/><b>Rehabilitación Integral</b></para>", style_small)
    r3_c3 = Paragraph("<para align=center>Revisado por:<br/><b>Coordinación Técnica</b></para>", style_small)

    r4 = Paragraph("<para align=center><b>Versión: 04</b></para>", style_small)

    col_left = PAGE_WIDTH * 0.22
    col_center = PAGE_WIDTH * 0.56
    col_right = PAGE_WIDTH * 0.22

    h_data = [
        [logo_left, center_text, logo_right],
        [r2_left, "", r2_right],
        [r3_c1, r3_c2, r3_c3],
        [r4, "", ""],
    ]

    header_t = Table(h_data, colWidths=[col_left, col_center, col_right])
    header_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 0), (0, 0)),
        ('SPAN', (1, 0), (1, 1)),  # Center text spans
        ('SPAN', (0, 3), (2, 3)),  # Version spans full width
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_t)

    # Fecha row
    date_val = fmt_fecha(identificacion.fecha_valoracion if identificacion else None)
    date_rows = [
        ["", B("FECHA DE VALORACIÓN:"), P(date_val)]
    ]
    date_t = Table(date_rows, colWidths=[PAGE_WIDTH * 0.42, PAGE_WIDTH * 0.30, PAGE_WIDTH * 0.28])
    date_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
    ]))
    story.append(date_t)


    # ===== OBJETIVO DE LA VALORACIÓN =====
    if secciones_texto and secciones_texto.objetivo_valoracion:
        story.append(crear_seccion_header("I. OBJETIVO DE LA VALORACIÓN"))
        t_obj = Table([[Paragraph(secciones_texto.objetivo_valoracion.replace('\n', '<br/>'), style_normal)]], colWidths=[PAGE_WIDTH])
        t_obj.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_obj)
        story.append(Spacer(1, 8))

    # ===== DATOS DE IDENTIFICACIÓN Y EMPRESA =====
    story.append(crear_seccion_header("2. IDENTIFICACIÓN"))
    
    # Sub-header orange light
    sub_h = [[B("(Datos trabajador, evento ATEL, Empresa)")]]
    sub_ht = Table(sub_h, colWidths=[PAGE_WIDTH])
    sub_ht.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(sub_ht)

    lw = PAGE_WIDTH * 0.30
    vw = PAGE_WIDTH * 0.70

    i = identificacion
    id_rows_1 = [
        [B("Nombre del trabajador*"), P(i.nombre_trabajador if i else "")],
        [B("Número de documento*"), P(str(i.numero_documento) if i else "")],
        [B("Identificación del siniestro*"), P(i.identificacion_siniestro if i else "")],
    ]
    t_id_1 = Table(id_rows_1, colWidths=[lw, vw])
    t_id_1.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_id_1)

    nac_row = [[B("Fecha de nacimiento/edad*"), P(fmt_fecha(i.fecha_nacimiento if i else None)), B("edad"), P(calcular_edad(i.fecha_nacimiento if i else None))]]
    nac_t = Table(nac_row, colWidths=[PAGE_WIDTH * 0.30, PAGE_WIDTH * 0.40, PAGE_WIDTH * 0.10, PAGE_WIDTH * 0.20])
    nac_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(nac_t)

    dom = i.dominancia.lower().strip() if i and i.dominancia else ""
    dom_row = [[B("Dominancia*"), checkbox(dom == "derecha", "Derecha"), checkbox(dom == "izquierda", "Izquierda"), checkbox(dom == "ambidiestra", "Ambidiestra")]]
    dom_t = Table(dom_row, colWidths=[PAGE_WIDTH * 0.30, PAGE_WIDTH * 0.23, PAGE_WIDTH * 0.23, PAGE_WIDTH * 0.24])
    dom_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(dom_t)

    ec_row = [[B("Estado civil*"), P(i.estado_civil if i else "")]]
    ec_t = Table(ec_row, colWidths=[lw, vw])
    ec_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(ec_t)

    ne = i.nivel_educativo.lower().strip() if i and i.nivel_educativo else ""
    ne_options = [
        ("formacion_empirica", "Formación empírica"), ("basica_primaria", "Básica primaria"), ("bachillerato_vocacional", "Bachillerato vocacional 9º"),
        ("bachillerato_modalidad", "Bachillerato: modalidad"), ("tecnico", "Técnico/ Tecnológico"), ("profesional", "Profesional"),
        ("postgrado", "Especialización/ postgrado/ maestría"), ("formacion_informal", "Formación informal oficios"), ("analfabeta", "Analfabeta")
    ]
    ne_cells_r1 = [checkbox(ne == key or key in ne, lbl) for key, lbl in ne_options[:3]]
    ne_cells_r2 = [checkbox(ne == key or key in ne, lbl) for key, lbl in ne_options[3:6]]
    ne_cells_r3 = [checkbox(ne == key or key in ne, lbl) for key, lbl in ne_options[6:]]
    ne_inner = Table([ne_cells_r1, ne_cells_r2, ne_cells_r3], colWidths=[PAGE_WIDTH * 0.233]*3)
    ne_inner.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.3, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    
    ne_t = Table([[B("Nivel educativo*"), ne_inner]], colWidths=[PAGE_WIDTH * 0.30, PAGE_WIDTH * 0.70])
    ne_t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('LEFTPADDING', (0, 0), (0, -1), 4),
        ('LEFTPADDING', (1, 0), (1, -1), 0),
        ('RIGHTPADDING', (1, 0), (1, -1), 0),
        ('BOTTOMPADDING', (1, 0), (1, -1), 0),
        ('TOPPADDING', (1, 0), (1, -1), 0),
    ]))
    story.append(ne_t)
    
    esp_t = Table([[B("Especificar formacion y oficios que conoce"), P(i.especificar_formacion if i else "")]], colWidths=[PAGE_WIDTH*0.4, PAGE_WIDTH*0.6])
    esp_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(esp_t)

    zr = i.zona_residencia.lower().strip() if i and i.zona_residencia else ""
    dir_row = [
        [B("Teléfonos trabajador*"), P(i.telefonos_trabajador if i else ""), "", ""],
        [B("Dirección residencia y ciudad*"), P(i.direccion_residencia if i else ""), checkbox(zr == "urbano" or zr == "urbana", "Urbano"), checkbox(zr == "rural", "Rural")]
    ]
    dir_t = Table(dir_row, colWidths=[PAGE_WIDTH*0.30, PAGE_WIDTH*0.46, PAGE_WIDTH*0.12, PAGE_WIDTH*0.12])
    dir_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('SPAN', (1, 0), (3, 0)), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(dir_t)

    diag_t = Table([[B("Diagnóstico(s) clínico(s) por evento ATEL*"), P(i.diagnosticos_atel if i else "")], [B("Fecha(s) del evento(s) ATEL*"), P(i.fechas_eventos_atel if i else "")]], colWidths=[PAGE_WIDTH*0.35, PAGE_WIDTH*0.65])
    diag_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(diag_t)

    ev_inner_data = [[B("si"), B("No"), B("Fecha"), B("Diagnostico")]]
    if eventos_no_laborales and len(eventos_no_laborales) > 0:
        for ev in eventos_no_laborales:
            si_no = ev.si_no.lower().strip() if ev.si_no else ""
            ev_inner_data.append([checkbox(si_no == "si", "si"), checkbox(si_no == "no", "No"), P(ev.fecha), P(ev.diagnostico)])
    else:
        ev_inner_data.append([checkbox(False, "si"), checkbox(False, "No"), P(""), P("")])
        
    t_ev_inner = Table(ev_inner_data, colWidths=[PAGE_WIDTH*0.1, PAGE_WIDTH*0.1, PAGE_WIDTH*0.15, PAGE_WIDTH*0.4])
    t_ev_inner.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    
    ev_t = Table([[B("Eventos No laborales"), t_ev_inner]], colWidths=[PAGE_WIDTH*0.25, PAGE_WIDTH*0.75])
    ev_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4), ('LEFTPADDING', (1, 0), (1, -1), 0), ('RIGHTPADDING', (1, 0), (1, -1), 0), ('BOTTOMPADDING', (1, 0), (1, -1), 0), ('TOPPADDING', (1, 0), (1, -1), 0)]))
    story.append(ev_t)

    eps_t = Table([[B("EPS - IPS*"), P(i.eps_ips if i else "")], [B("AFP"), P(i.afp if i else "")]], colWidths=[lw, vw])
    eps_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(eps_t)
    
    inc_t = Table([[B("Tiempo total de incapacidad"), P(i.tiempo_incapacidad_dias if i else ""), B("dias")]], colWidths=[PAGE_WIDTH*0.35, PAGE_WIDTH*0.55, PAGE_WIDTH*0.10])
    inc_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(inc_t)
    
    vl = str(i.vinculacion_laboral).lower().strip() if i and i.vinculacion_laboral is not None else ""
    es_vinc = "si" if vl in ["true", "si", "1"] else ("no" if vl in ["false", "no", "0"] else "")
    mod = i.modalidad.lower().strip() if i and i.modalidad else ""

    emp_vt = Table([
        [B("Empresa donde labora*"), P(i.empresa if i else ""), "", ""],
        [B("Vinculacion laboral:"), checkbox(es_vinc == "no", "NO"), checkbox(es_vinc == "si", "SI"), ""],
        [B("Forma de vinculacion laboral"), P(i.forma_vinculacion if i else ""), "", ""],
        [B("modalidad"), checkbox(mod == "presencial", "Presencial"), checkbox(mod == "teletrabajo", "teletrabajo"), checkbox(mod == "trabajo en casa", "trabajo en casa")],
        [B("tiempo de la modalidad"), P(i.tiempo_modalidad if i else ""), "", ""],
        [B("NIT de la Empresa"), P(i.nit_empresa if i else ""), "", ""]
    ], colWidths=[PAGE_WIDTH*0.35, PAGE_WIDTH*0.25, PAGE_WIDTH*0.20, PAGE_WIDTH*0.20])
    emp_vt.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('SPAN', (1, 0), (3, 0)), ('SPAN', (1, 2), (3, 2)), ('SPAN', (1, 4), (3, 4)), ('SPAN', (1, 5), (3, 5)), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(emp_vt)

    f_ie_t = Table([[B("Fecha ingreso a la empresa / antigüedad en la empresa"), P(fmt_fecha(i.fecha_ingreso_empresa if i else None)), B("Tiempo"), P(f"{calcular_antiguedad(i.fecha_ingreso_empresa if i else None)}")]], colWidths=[PAGE_WIDTH*0.4, PAGE_WIDTH*0.3, PAGE_WIDTH*0.1, PAGE_WIDTH*0.2])
    f_ie_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(f_ie_t)
    
    lc_t = Table([
        [B("Contacto en empresa/cargo*"), P(i.contacto_empresa if i else "")],
        [B("Correo(s) electrónico(s)*"), P(i.correos_electronicos if hasattr(i, "correos_electronicos") else "")],
        [B("Teléfonos de contacto empresa*"), P(i.telefonos_empresa if i else "")],
    ], colWidths=[lw, vw])
    lc_t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
    story.append(lc_t)
    story.append(Spacer(1, 10))

    # ===== HISTORIA OCUPACIONAL =====
    story.append(crear_seccion_header("III. HISTORIA OCUPACIONAL"))
    
    if historia_ocupacional and len(historia_ocupacional) > 0:
        hist_headers = [B("Empresa"), B("Cargo/Funciones"), B("Tiempo Duración"), B("Motivo Retiro")]
        hist_data = [hist_headers]
        for hist in historia_ocupacional:
            hist_data.append([
                P(hist.empresa),
                P(hist.cargo_funciones),
                P(hist.tiempo_duracion),
                P(hist.motivo_retiro)
            ])
            
        t_hist = Table(hist_data, colWidths=[PAGE_WIDTH*0.25, PAGE_WIDTH*0.25, PAGE_WIDTH*0.25, PAGE_WIDTH*0.25])
        t_hist.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (-1, 0), COLOR_LABEL_BG),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_hist)
    else:
        story.append(P("No se registraron antecedentes de historia ocupacional relevantes.", style_center))
    
    story.append(Spacer(1, 8))

    # ===== ACT EXTRALABORAL Y EVENTOS =====
    if eventos_no_laborales and len(eventos_no_laborales) > 0:
        story.append(crear_seccion_header("IV. ACTIVIDAD EXTRALABORAL RELEVANTE Y EVENTOS MÉDICOS"))
        
        ev_headers = [B("SI/NO"), B("Fecha"), B("Diagnóstico")]
        ev_data = [ev_headers]
        
        for ev in eventos_no_laborales:
            ev_data.append([
                P(ev.si_no),
                P(ev.fecha),
                P(ev.diagnostico)
            ])
            
        t_ev = Table(ev_data, colWidths=[PAGE_WIDTH*0.2, PAGE_WIDTH*0.3, PAGE_WIDTH*0.5])
        t_ev.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (-1, 0), COLOR_LABEL_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_ev)
        story.append(Spacer(1, 10))

    # ===== ACTIVIDAD ACTUAL =====
    story.append(crear_seccion_header("V. ACTIVIDAD ACTUAL (A QUÉ SE DEDICA RECIENTEMENTE)"))
    ActT = lambda text: text.replace("\n", "<br/>") if text else ""
    
    act_rows = [
        [B("Trabaja actualmente / Cargo:"), P(actividad_actual.nombre_cargo if actividad_actual else "")],
        [B("Herramientas, materiales y equipos:"), P(actividad_actual.herramientas_trabajo if actividad_actual else "")],
        [B("Otras actividades de trabajo:"), P(actividad_actual.tareas_descripcion if actividad_actual else "")],
        [B("Qué se encontraba haciendo durante la ATEL:"), P("")],
        [B("Relato del evento ATEL (del trabajador):"), P("")],
    ]
    t_act = Table(act_rows, colWidths=[2.2*inch, PAGE_WIDTH - 2.2*inch])
    t_act.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_act)
    story.append(Spacer(1, 10))

    # ===== ROL LABORAL DENTRO DE LA EMPRESA (EXIGENCIAS) =====
    story.append(crear_seccion_header("VI. ROL LABORAL DENTRO DE LA EMPRESA (DE SU CARGO)"))
    
    rol_rows = [
        [B("Tareas y Operaciones:"), P(ActT(rol_laboral.tareas_operaciones if rol_laboral else ""))],
        [B("Componentes de Desempeño:"), P(ActT(rol_laboral.componentes_desempeno if rol_laboral else ""))],
        [B("Forma de Integración:"), P(ActT(rol_laboral.forma_integracion if rol_laboral else ""))],
    ]
    t_rol = Table(rol_rows, colWidths=[2.2*inch, PAGE_WIDTH - 2.2*inch])
    t_rol.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_rol)
    story.append(Spacer(1, 10))

    # ===== EVENTO ATEL =====
    story.append(crear_seccion_header("VII. INFORMACIÓN DEL EVENTO ATEL Y REHABILITACIÓN"))
    
    atel_rows = [
        [B("Tratamientos e intervención recibida:"), P(ActT(evento_atel.tratamiento_rehabilitacion if evento_atel else ""))],
        [B("Calificación PCL / Adaptaciones:"), P(str(evento_atel.calificacion_pcl_porcentaje) if evento_atel and evento_atel.calificacion_pcl_si else "No Calificado")],
    ]
    t_atel = Table(atel_rows, colWidths=[2.2*inch, PAGE_WIDTH - 2.2*inch])
    t_atel.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_atel)
    story.append(Spacer(1, 10))

    # ===== COMPOSICIÓN Y DINÁMICA FAMILIAR =====
    story.append(crear_seccion_header("VIII. COMPOSICIÓN Y DINÁMICA FAMILIAR"))
    
    if composicion_familiar:
        cf_rows = [
            [B("Convivencia actual:"), P(composicion_familiar.convivencia_actual), B("Personas que sostienen el hogar:"), P(composicion_familiar.personas_sostienen_hogar)],
            [B("Ingreso promedio:"), P(composicion_familiar.ingreso_promedio), "", ""],
        ]
        t_cf = Table(cf_rows, colWidths=[1.5*inch, 2.2*inch, 1.5*inch, 2.2*inch])
        t_cf.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
            ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('SPAN', (1, 1), (3, 1)),
        ]))
        story.append(t_cf)
        story.append(Spacer(1, 5))

    if miembros_familiares and len(miembros_familiares) > 0:
        fam_headers = [B("Composición Núcleo"), B("Fecha Nacimiento")]
        fam_data = [fam_headers]
        for m in miembros_familiares:
            fam_data.append([
                P(m.composicion_nucleo),
                P(m.fecha_nacimiento),
            ])
            
        t_fam = Table(fam_data, colWidths=[PAGE_WIDTH*0.6, PAGE_WIDTH*0.4])
        t_fam.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (-1, 0), COLOR_LABEL_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_fam)
    
    story.append(Spacer(1, 10))

    # ===== EVALUACIÓN OTRAS ÁREAS OCUPACIONALES =====
    if evaluacion_otras_areas_raw:
        story.append(crear_seccion_header("IX. EVALUACIÓN OTRAS ÁREAS OCUPACIONALES"))
        
        # Simplemente renderizar los JSON (o strings) guardados por el momento
        areas_rows = [
            [B("Cuidado Personal:"), P(ActT(evaluacion_otras_areas_raw.cuidado_personal if evaluacion_otras_areas_raw.cuidado_personal else "Sin datos"))],
            [B("Comunicación:"), P(ActT(evaluacion_otras_areas_raw.comunicacion if evaluacion_otras_areas_raw.comunicacion else "Sin datos"))],
            [B("Movilidad:"), P(ActT(evaluacion_otras_areas_raw.movilidad if evaluacion_otras_areas_raw.movilidad else "Sin datos"))],
            [B("Aprendizaje / Sensopercepción:"), P(ActT(evaluacion_otras_areas_raw.aprendizaje_sensopercepcion if evaluacion_otras_areas_raw.aprendizaje_sensopercepcion else "Sin datos"))],
            [B("Vida Doméstica:"), P(ActT(evaluacion_otras_areas_raw.vida_domestica if evaluacion_otras_areas_raw.vida_domestica else "Sin datos"))],
        ]
        
        t_o_areas = Table(areas_rows, colWidths=[2.2*inch, PAGE_WIDTH - 2.2*inch])
        t_o_areas.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_o_areas)
        story.append(Spacer(1, 10))

    # ===== CONCEPTOS (REGISTRO) =====
    concepto = getattr(registro, 'concepto_ocupacional', None) or getattr(registro, 'concepto_to', None) or ""
    orientacion = getattr(registro, 'orientacion_ocupacional', None) or ""

    # 9. CONCEPTO OCUPACIONAL
    story.append(Table([[B("9.    CONCEPTO OCUPACIONAL")]], colWidths=[PAGE_WIDTH], style=[
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    t_conc = Table([[P(ActT(concepto))]], colWidths=[PAGE_WIDTH], minRowHeights=[40])
    t_conc.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_conc)

    # 10. ORIENTACION OCUPACIONAL
    story.append(Table([[B("10.   ORIENTACION OCUPACIONAL *")]], colWidths=[PAGE_WIDTH], style=[
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    t_ori = Table([[P(ActT(orientacion))]], colWidths=[PAGE_WIDTH], minRowHeights=[40])
    t_ori.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_ori)

    # 11. REGISTRO (FIRMAS)
    story.append(Table([[B("11.   REGISTRO")]], colWidths=[PAGE_WIDTH], style=[
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    firma_eval = Spacer(1, 30)
    if evaluador and hasattr(evaluador, 'firma_path') and evaluador.firma_path and os.path.exists(evaluador.firma_path):
        try: firma_eval = ReportLabImage(evaluador.firma_path, width=1.4*inch, height=0.5*inch)
        except: pass

    firma_prov_img = Spacer(1, 30)
    if registro and getattr(registro, 'firma_proveedor', None) and os.path.exists(registro.firma_proveedor):
        try: firma_prov_img = ReportLabImage(registro.firma_proveedor, width=1.4*inch, height=0.5*inch)
        except: pass
        
    firma_rhb_img = Spacer(1, 30)
    if registro and getattr(registro, 'firma_equipo_rhb', None) and os.path.exists(registro.firma_equipo_rhb):
        try: firma_rhb_img = ReportLabImage(registro.firma_equipo_rhb, width=1.4*inch, height=0.5*inch)
        except: pass

    col_w = PAGE_WIDTH / 3.0
    
    firmas_data = [
        [Paragraph("<para align=center><b>Elaboró</b></para>", style_small), 
         Paragraph("<para align=center><b>Revisión por Proveedor</b></para>", style_small), 
         Paragraph("<para align=center><b>Equipo de<br/>Rehabilitación Integral</b></para>", style_small)],
         
        [firma_eval, firma_prov_img, firma_rhb_img],
        
        [Paragraph(f"<para align=center><b>{getattr(registro, 'nombre_elaboro', evaluador.nombre if evaluador else '')}</b></para>", style_small),
         Paragraph(f"<para align=center><b>{getattr(registro, 'nombre_proveedor', '')}</b></para>", style_small),
         Paragraph(f"<para align=center><font color='#0284c7'>{getattr(registro, 'nombre_equipo_rhb', 'Nombre Proveedor')}</font></para>", style_small)],
         
        [Paragraph("<para align=center><b>Profesionales que realizan la valoración</b></para>", style_small),
         Paragraph("<para align=center><b>Profesional que revisa la valoración</b></para>", style_small),
         Paragraph("<para align=center><b>Gerencia Médica</b></para>", style_small)]
    ]
    t_firmas = Table(firmas_data, colWidths=[col_w, col_w, col_w])
    t_firmas.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(KeepTogether([t_firmas]))

    doc.build(story)
    return str(pdf_path)
