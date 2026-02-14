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

    # ── ESTILOS PERSONALIZADOS ───────────────────────────────────────
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="HeaderTitle", fontSize=10, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=12))
    styles.add(ParagraphStyle(name="HeaderSub", fontSize=8, fontName="Helvetica", alignment=TA_CENTER, leading=10))
    styles.add(ParagraphStyle(name="LabelSmall", fontSize=7, fontName="Helvetica-Bold", leading=8, textColor=colors.black))
    styles.add(ParagraphStyle(name="ValueSmall", fontSize=7, fontName="Helvetica", leading=8, textColor=colors.black))
    styles.add(ParagraphStyle(name="DateDigit", fontSize=8, fontName="Helvetica", alignment=TA_CENTER, leading=10))
    styles.add(ParagraphStyle(name="SectionTitle", fontSize=9, fontName="Helvetica-Bold", spaceAfter=2, spaceBefore=4, textColor=colors.black)) # Changed color to black to match image
    
    # Existing styles reuse/tweak
    styles.add(ParagraphStyle(name="CellText", fontSize=8, fontName="Helvetica", leading=9))
    styles.add(ParagraphStyle(name="CellBold", fontSize=8, fontName="Helvetica-Bold", leading=9))
    styles.add(ParagraphStyle(name="LongText", fontSize=8, fontName="Helvetica", leading=10, alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle(name="FieldLabel", fontSize=8, fontName="Helvetica-Bold", leading=10, textColor=colors.HexColor("#333333")))
    styles.add(ParagraphStyle(name="FieldValue", fontSize=8, fontName="Helvetica", leading=10))

    elements = []
    page_width = letter[0] - 3 * cm  # usable width

    # ── HELPER FUNCTIONS ─────────────────────────────────────────────
    def date_grid(date_obj):
        """Creates a mini-table for date [D][D] [M][M] [A][A][A][A]"""
        if not date_obj:
            d, m, y = "", "", ""
        else:
            # Handle both date object and string
            if isinstance(date_obj, str):
                try:
                    dt = datetime.strptime(date_obj, "%Y-%m-%d")
                    d, m, y = f"{dt.day:02}", f"{dt.month:02}", f"{dt.year:04}"
                except:
                    d, m, y = "", "", ""
            else:
                d, m, y = f"{date_obj.day:02}", f"{date_obj.month:02}", f"{date_obj.year:04}"
        
        # Digits
        d1, d2 = (d[0], d[1]) if len(d)==2 else ("","")
        m1, m2 = (m[0], m[1]) if len(m)==2 else ("","")
        y1, y2, y3, y4 = (y[0], y[1], y[2], y[3]) if len(y)==4 else ("","","","")

        data = [[
            Paragraph("día", styles["HeaderSub"]), "",
            Paragraph("mes", styles["HeaderSub"]), "",
            Paragraph("año", styles["HeaderSub"]), "", "", ""
        ], [
            Paragraph(d1, styles["DateDigit"]), Paragraph(d2, styles["DateDigit"]),
            Paragraph(m1, styles["DateDigit"]), Paragraph(m2, styles["DateDigit"]),
            Paragraph(y1, styles["DateDigit"]), Paragraph(y2, styles["DateDigit"]),
            Paragraph(y3, styles["DateDigit"]), Paragraph(y4, styles["DateDigit"])
        ]]
        
        # Column widths
        cw = 0.4 * cm
        t = Table(data, colWidths=[cw]*8)
        t.setStyle(TableStyle([
            ('GRID', (0, 1), (-1, -1), 0.5, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('SPAN', (0, 0), (1, 0)), # dia
            ('SPAN', (2, 0), (3, 0)), # mes
            ('SPAN', (4, 0), (7, 0)), # año
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 1),
            ('RIGHTPADDING', (0, 0), (-1, -1), 1),
        ]))
        return t

    def checkbox(checked, label_text):
        """Returns visual checkbox [X] Label"""
        mark = "X" if checked else " "
        return Paragraph(f"[{mark}] {label_text}", styles["ValueSmall"])

    def p(text, style_name="ValueSmall"):
        return Paragraph(str(text) if text else "", styles[style_name])

    def bold(text):
        return Paragraph(str(text), styles["LabelSmall"])

    # ── ESTILOS DE TABLA COMUNES (Legacy for Sections 2-9) ───────────
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
        return Paragraph(text, styles["FieldLabel"]) # Note: FieldLabel style needs to be present

    def value(text):
        return Paragraph(str(text) if text else "", styles["FieldValue"]) # Note: FieldValue style needs to be present

    def long_text(text):
        return Paragraph(str(text) if text else "", styles["LongText"])

        
    # ── ENCABEZADO (HEADER) ──────────────────────────────────────────
    # Logo placeholder / Text
    logo_path = "frontend/public/images/mentis-logo.svg" # Placeholder, using text for now to match style
    # Header Table Structure
    # Row 1: Logo | Title Stack | Provider Logo
    # Row 2: Code | Date | Title | Page
    # Row 3: Approver | Process | Reviewer
    # Row 4: Version

    # Row 1
    r1_c1 = Paragraph("<b>POSITIVA S.A</b><br/>Compañía de Seguros / ARL<br/>-Gestión Documental-", styles["HeaderSub"])
    
    # Row 2
    r2_c1 = bold("Código")
    r2_c2 = p("2022/07") # Static date from image, or dynamic? Image has 2022/07
    r2_c3 = Paragraph("<b>VALORACIÓN<br/>PRUEBA DE TRABAJO</b>", styles["HeaderTitle"])
    r2_c4 = p("Página 1 de __")

    # Row 3
    r3_c1 = Paragraph("Aprobado por:<br/><b>Gerencia Médica</b>", styles["HeaderSub"])
    r3_c2 = Paragraph("Proceso:<br/><b>Rehabilitación Integral</b>", styles["HeaderSub"])
    r3_c3 = Paragraph("Revisado por:<br/><b>Coordinación Técnica</b>", styles["HeaderSub"])

    header_data = [
        [Image("frontend/public/images/logo-positiva.png", width=2.5*cm, height=1*cm) if os.path.exists("frontend/public/images/logo-positiva.png") else bold("POSITIVA"), 
         r1_c1, 
         bold("Logo Proveedor")],
        [r2_c1, r2_c2, r2_c3, r2_c4],
        [r3_c1, r3_c2, r3_c3],
        [bold("Versión: 01")]
    ]
    
    # Table layout is complex, using nested tables or spans.
    # Let's use a main table with 3 cols.
    # Row 1 spans: [0,0] (Logo), [0,1] (Center Text), [0,2] (Right Logo)
    # The image shows complex borders.
    # Let's try to map grid:
    
    # Simplified approach: 3 main columns.
    # Col 1: Logo / Code / Approver
    # Col 2: Center Text / Title / Process
    # Col 3: Right Logo / Page / Reviewer
    
    # Actually, Row 2 has 4 cells in image. Row 1 has 3. Row 3 has 3.
    # Let's use a Main Table for the whole block.
    
    # Re-structuring header data for a 4-column grid to accommodate Row 2
    # Row 1: Logo (span 1), Center (span 2), Right (span 1)
    # Row 2: Code, Date, Title, Page
    # Row 3: Approv (span 1), Process (span 2), Review (span 1) - wait image shows 3 equal cols?
    # Image: 
    # R1: [Logo (small)] [     Center Text (wide)     ] [Logo Prov (small)]
    # R2: [Code] [Date] [         Title          ] [Page] -> 4 cols?
    # R3: [Approv] [          Process           ] [Review]
    
    # Let's use 4 columns with widths: 15%, 15%, 40%, 30%
    
    h_data = [
        # R1
        [bold("POSITIVA"), r1_c1, "", bold("Logo Proveedor")],
        # R2
        [r2_c1, r2_c2, r2_c3, r2_c4],
        # R3
        [r3_c1, r3_c2, "", r3_c3],
        # R4
        [bold("Versión: 01"), "", "", ""]
    ]
    
    header_t = Table(h_data, colWidths=[page_width*0.2, page_width*0.15, page_width*0.35, page_width*0.3])
    header_t.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        
        # Spans
        ('SPAN', (1,0), (2,0)), # Center Text R1
        ('SPAN', (1,2), (2,2)), # Process R3 - wait, image shows Proceso in middle.
        ('SPAN', (0,3), (-1,3)), # Version R4
        
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ]))
    elements.append(header_t)
    
    # Date Sub-header
    # Table with 2 columns: "FECHA DE VALORACIÓN: [GRID]" and "ULTIMO DIA...: [GRID]"
    # But image shows them stacked or side by side?
    # Image: 
    # Row 1 (Right aligned grid): [dia][mes][ano]...
    # Row 2: "FECHA DE VALORACION:" | [Grid]
    # Row 3: "ULTIMO DIA..." | [Grid]
    
    # Actually looking at image:
    # There is a sub-header table.
    # Row 1: Empty | "FECHA DE VALORACIÓN:" | [Grid]
    # Row 2: "ULTIMO DIA..." | [Grid]
    
    i = identificacion
    grid_valoracion = date_grid(i.fecha_valoracion if i else None)
    grid_incapacidad = date_grid(i.ultimo_dia_incapacidad if i else None)
    
    sub_data = [
        ["", bold("FECHA DE VALORACIÓN:"), grid_valoracion],
        [bold("ÚLTIMO DIA DE INCAPACIDAD RECONOCIDO POR LA ARL:"), "", grid_incapacidad]
    ]
    sub_t = Table(sub_data, colWidths=[page_width*0.4, page_width*0.25, page_width*0.35])
    sub_t.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('SPAN', (0,1), (1,1)), # Span label for Ultimo dia
        ('BACKGROUND', (0,1), (0,1), colors.HexColor("#fce4ec")), # Light pinkish background from image
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#fce4ec")),
    ]))
    elements.append(sub_t)


    # ── SECCIÓN 1: IDENTIFICACIÓN ────────────────────────────────────
    # Main Table for Section 1
    # 1. Header: "1 IDENTIFICACIÓN"
    # 2. Sub: "(Datos trabajador...)"
    # 3. Nombre
    # 4. Num Doc
    # 5. Siniestro
    # 6. Nacimiento / Edad (Grid + Value)
    # 7. Dominancia / Estado Civil
    # 8. ...
    
    orange_bg = colors.HexColor("#ffccbc") # Approximate orange from image header

    # Row helpers
    row_1 = [bold("1. IDENTIFICACIÓN"), "", "", ""]
    row_2 = [bold("(Datos trabajador, evento ATEL, Empresa)"), "", "", ""]
    row_3 = [bold("Nombre del trabajador"), p(i.nombre_trabajador if i else ""), "", ""]
    row_4 = [bold("Número de documento"), p(i.numero_documento if i else ""), "", ""]
    row_5 = [bold("Identificación del siniestro"), p(i.id_siniestro if i else ""), "", ""]
    
    # Birth/Age Row: "Fecha de nacimiento/edad" | [Grid] | "edad" | [Value] años
    grid_nac = date_grid(i.fecha_nacimiento if i else None)
    row_6 = [bold("Fecha de nacimiento/edad"), grid_nac, bold("edad"), p(f"{i.edad or ''} años")]
    
    # Dominancia Row: "Dominancia" | Derecha [] | Izquierda [] | Ambidiestra []
    dom = i.dominancia.lower() if i and i.dominancia else ""
    dom_cell = [
        checkbox("derecha" in dom, "Derecha"),
        checkbox("izquierda" in dom, "Izquierda"), 
        checkbox("ambidiestra" in dom, "Ambidiestra")
    ]
    # We need to nest this or structure it. Let's put it in one cell for now via a flowable?
    # Or just standard text.
    p_dom = Paragraph(f"{checkbox('derecha' in dom, 'Derecha').text}  {checkbox('izquierda' in dom, 'Izquierda').text}  {checkbox('ambidiestra' in dom, 'Ambidiestra').text}", styles["ValueSmall"])
    
    # Estado Civil: "Estado civil" | [Value] - Image has it on same row?
    # Image: Row 7: Dominancia | [Options] | Estado Civil | [Value] - NO.
    # Image Row 7: Dominancia | Derecha | Izquierda | Ambidiestra [ ] ??
    # Actually from image: 
    # Row: Dominancia | Derecha | Izquierda | Ambidiestra | (Empty)
    # Wait, the image shows "Estado civil" below or beside?
    # Let's look at image again.
    # Row 7: Dominancia | Derecha | Left | Ambi | (Empty)
    # Row 8: Estado Civil (spanning?)
    
    # Let's simplify and follow the field list roughly matching visual.
    row_7 = [bold("Dominancia"), p_dom, bold("Ambidiestra"), ""] # Simplified
    
    # Nivel Educativo - large block vertically.
    # We will skip complex vertical spans for now and just list it.
    row_8 = [bold("Estado civil"), p(i.estado_civil if i else ""), "", ""]
    
    row_9 = [bold("Nivel educativo"), p(i.nivel_educativo if i else ""), "", ""]

    # Contact
    row_10 = [bold("Teléfonos trabajador"), p(i.telefonos_trabajador if i else ""), "", ""]
    row_11 = [bold("Dirección residencia/ciudad"), p(i.direccion_residencia if i else ""), "", ""]
    row_12 = [bold("Diagnóstico(s) clínico(s)"), p(i.diagnosticos_atel if i else ""), "", ""]
    row_13 = [bold("Fecha(s) del evento(s) ATEL"), p(i.fechas_eventos_atel if i else ""), "", ""]
    row_14 = [bold("EPS - IPS"), p(i.eps_ips if i else ""), "", ""]
    row_15 = [bold("AFP"), p(i.afp if i else ""), "", ""]
    row_16 = [bold("Tiempo total incapacidad"), p(f"{i.tiempo_incapacidad_dias or ''} días"), "", ""]
    
    # Empresa
    row_17 = [bold("Empresa donde labora"), p(i.empresa if i else ""), "", ""]
    row_18 = [bold("NIT de la Empresa"), p(i.nit_empresa if i else ""), "", ""]
    row_19 = [bold("Cargo actual"), p(i.cargo_actual if i else ""), "", ""]
    
    # Cargo Unico
    c_unico = "Si" if i and i.cargo_unico else "No"
    row_20 = [bold("Cargo unico de las mismas caracteristicas"), p(c_unico), "", ""]
    
    # Fechas cargos
    # Row: Fecha ingreso cargo | Grid | tiempo | Value
    grid_fi_cargo = date_grid(i.fecha_ingreso_cargo if i else None)
    row_21 = [bold("Fecha ingreso cargo/antigüedad"), grid_fi_cargo, bold("tiempo"), p(i.antiguedad_cargo if i else "")]
    
    grid_fi_emp = date_grid(i.fecha_ingreso_empresa if i else None)
    row_22 = [bold("Fecha ingreso empresa/antigüedad"), grid_fi_emp, bold("tiempo"), p(i.antiguedad_empresa if i else "")]
    
    # Vinculacion
    row_23 = [bold("Forma de vinculación laboral"), p(i.forma_vinculacion if i else ""), "", ""]
    
    # Modalidad
    # Row: Modalidad | Presencial | Teletrabajo | Trabajo en casa
    mod = i.modalidad.lower() if i and i.modalidad else ""
    # Checkboxes
    cb_pres = checkbox("presencial" in mod, "Presencial")
    cb_tele = checkbox("teletrabajo" in mod, "Teletrabajo")
    cb_casa = checkbox("casa" in mod, "Trabajo en casa")
    
    row_24 = [bold("Modalidad"), cb_pres, cb_tele, cb_casa]
    
    row_25 = [bold("Tiempo de la Modalidad"), p(i.tiempo_modalidad if i else ""), "", ""]
    row_26 = [bold("Contacto en empresa/cargo"), p(i.contacto_empresa if i else ""), "", ""]
    row_27 = [bold("Correo(s) electrónico(s)"), p(i.correos_electronicos if i else ""), "", ""]
    row_28 = [bold("Teléfonos de contacto empresa"), p(i.telefonos_empresa if i else ""), "", ""]
    row_29 = [bold("Dirección de empresa/ciudad"), p(i.direccion_empresa if i else ""), "", ""]

    
    id_data = [
        row_1, row_2, row_3, row_4, row_5, 
        row_6, # Birth
        [bold("Dominancia"), p(i.dominancia if i else ""), bold("Estado Civil"), p(i.estado_civil if i else "")], # Combined for simplicity
        row_9, row_10, row_11, row_12, row_13, row_14, row_15, row_16,
        row_17, row_18, row_19, row_20,
        row_21, row_22,
        row_23, row_24, row_25, row_26, row_27, row_28, row_29
    ]

    id_table = Table(id_data, colWidths=[page_width*0.35, page_width*0.35, page_width*0.15, page_width*0.15])
    id_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        
        # Spans
        ('SPAN', (0,0), (-1,0)), # Title
        ('SPAN', (0,1), (-1,1)), # Subtitle
        ('SPAN', (1,2), (-1,2)), # Name val
        ('SPAN', (1,3), (-1,3)), # Doc val
        ('SPAN', (1,4), (-1,4)), # Siniestro val
        
        ('BACKGROUND', (0,0), (-1,1), orange_bg), # Headers orange
        
        # General formatting
        ('FONTSIZE', (0,0), (-1,-1), 7),
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
            # Split potentially multiple images
            img_paths = [p.strip() for p in tarea.registro_fotografico.split(';') if p.strip()]
            
            if img_paths:
                elements.append(Paragraph("<b>Registro Fotográfico:</b>", styles["CellBold"]))
                elements.append(Spacer(1, 2))
                
                # Render keys/images
                for img_path_raw in img_paths:
                    # Remove leading slash if present to get relative file path
                    img_path = img_path_raw.lstrip("/")
                    # Also handle potential backward slashes if stored differently, though URL usually /
                    if os.path.exists(img_path):
                        try:
                            # Add image with fixed size for consistency
                            img = Image(img_path, width=7*cm, height=5*cm)
                            elements.append(img)
                            elements.append(Spacer(1, 4))
                        except Exception as e:
                            print(f"Error embedding image {img_path}: {e}")
                            pass

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
        # Firma images
        firmas_to_render = [
            (registro.firma_elaboro, "Firma Elaboró"),
            (registro.firma_revisor, "Firma Revisor"),
            (registro.firma_trabajador, "Firma Trabajador")
        ]
        
        for firma_field, nombre in firmas_to_render:
            if firma_field:
                # Remove leading slash for local path check
                clean_path = firma_field.lstrip("/")
                if os.path.exists(clean_path):
                    try:
                        elements.append(Paragraph(f"<b>{nombre}:</b>", styles["CellBold"]))
                        elements.append(Spacer(1, 4))
                        img = Image(clean_path, width=4 * cm, height=2 * cm)
                        elements.append(img)
                        elements.append(Spacer(1, 8))
                    except Exception as e:
                        print(f"Error embedding signature {clean_path}: {e}")
                        pass

    # ── BUILD ────────────────────────────────────────────────────────
    doc.build(elements)
    return filepath
