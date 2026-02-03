"""
Generador de PDF profesional para valoraciones psicológicas
Genera PDF usando ReportLab (funciona en Windows sin dependencias)
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime, date
from pathlib import Path
import os


def calcular_edad(fecha_nacimiento: date) -> int:
    """Calcula la edad a partir de la fecha de nacimiento"""
    today = date.today()
    edad = today.year - fecha_nacimiento.year - (
        (today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
    )
    return edad


def sanitize_filename(text: str) -> str:
    """Limpia un texto para usarlo como nombre de archivo"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        text = text.replace(char, '')
    text = text.replace(' ', '_')
    if len(text) > 50:
        text = text[:50]
    return text


def generar_pdf_valoracion(
    valoracion,
    trabajador,
    info_laboral,
    historia_ocupacional,
    actividad_laboral,
    evaluaciones,
    concepto,
    output_dir: str = "pdfs"
) -> str:
    """
    Genera PDF profesional de valoración usando ReportLab
    Estilo: Replica al Formato Excel (Cuadrícula, Encabezados Azules)
    """
    # Crear directorio si no existe
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)

    # Generar nombre de archivo
    nombre = trabajador.nombre if trabajador else "sin_nombre"
    documento = trabajador.documento if trabajador else "sin_documento"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    pdf_filename = f"valoracion_{sanitize_filename(nombre)}_{sanitize_filename(documento)}_{timestamp}.pdf"
    pdf_path = output_path / pdf_filename

    # Configuración de márgenes estrechos para formulario denso
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    # Estilos
    styles = getSampleStyleSheet()

    # COLORES - Todo en tonos azules
    COLOR_HEADER_BG = colors.HexColor('#DAE8FC') # Azul claro Excel para celdas
    COLOR_SECTION_BG = colors.HexColor('#B8CCE4') # Azul un poco más oscuro para títulos de sección
    COLOR_LABEL_BG = colors.HexColor('#DAE8FC') # Azul claro para etiquetas (antes gris)
    COLOR_BORDER = colors.black
    COLOR_TEXT = colors.black

    # Estilos de texto
    style_normal = ParagraphStyle(
        'NormalGrid',
        parent=styles['Normal'],
        fontSize=8,
        leading=9,
        alignment=TA_LEFT,
        textColor=COLOR_TEXT
    )
    
    style_center = ParagraphStyle(
        'CenterGrid',
        parent=style_normal,
        alignment=TA_CENTER
    )
    
    style_bold = ParagraphStyle(
        'BoldGrid',
        parent=style_normal,
        fontName='Helvetica-Bold'
    )
    
    style_bold_center = ParagraphStyle(
        'BoldCenterGrid',
        parent=style_bold,
        alignment=TA_CENTER
    )

    story = []

    # ===== TÍTULO =====
    story.append(Paragraph("<b>VALORACIÓN DE PSICOLOGIA PARA RECOMENDACIONES LABORALES</b>", 
                 ParagraphStyle('Title', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER, spaceAfter=10)))

    # ===== FECHA (Tabla Superior Derecha) =====
    # Estructura: [FECHA DE VALORACIÓN:] [dia] [mes] [año]
    fecha_val = valoracion.fecha_valoracion if valoracion else datetime.now()
    dia = str(fecha_val.day) if fecha_val else ""
    mes = str(fecha_val.month) if fecha_val else ""
    ano = str(fecha_val.year) if fecha_val else ""

    # Tabla Header Fecha
    data_fecha = [
        [
            Paragraph("<b>FECHA DE VALORACIÓN:</b>", style_bold),
            Paragraph("dia", style_center), Paragraph("mes", style_center), Paragraph("año", style_center)
        ],
        [
            "",
            Paragraph(dia, style_center), Paragraph(mes, style_center), Paragraph(ano, style_center)
        ]
    ]
    t_fecha = Table(data_fecha, colWidths=[2*inch, 0.5*inch, 0.5*inch, 0.5*inch])
    t_fecha.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_SECTION_BG), # Header Azul
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('SPAN', (0, 0), (0, 1)), # Merge label vertical
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    # Alinear tabla fecha a la derecha
    t_fecha_wrapper = Table([[None, t_fecha]], colWidths=[3.5*inch, 3.5*inch])
    story.append(t_fecha_wrapper)
    story.append(Spacer(1, 5))

    # ===== IDENTIFICACIÓN (Grid Denso) =====
    # Fila 1: Header Identificación
    # Fila 2: Nombre
    # Fila 3: Documento
    # etc... imitando el layout exacto
    
    # Helper para celdas
    def P(text, style=style_normal): return Paragraph(str(text or ''), style)
    def B(text): return Paragraph(str(text or ''), style_bold)

    # Datos básicos
    data_ident = [
        [B("IDENTIFICACIÓN"), "", "", "", "", "", "", "", "", ""], # Header Section
        [B("Nombre del trabajador"), P(trabajador.nombre, style_bold), "", "", "", "", "", "", "", ""], # Merged content
        [B("Número de documento"), P(trabajador.documento), "", "", "", "", "", "", "", ""],
        [B("Identificación del siniestro"), P(trabajador.identificacion_siniestro), "", "", "", "", "", "", "", ""],
    ]
    
    # Tabla Identificación Parte 1
    t_ident = Table(data_ident, colWidths=[2*inch] + [0.55*inch]*9, rowHeights=[15]*4)
    t_ident.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECTION_BG), # Main Header
        ('SPAN', (0, 0), (-1, 0)), # Span Header
        
        # Merge celdas de contenido (Nombre, Doc, Siniestro ocupan resto de fila)
        ('SPAN', (1, 1), (-1, 1)),
        ('SPAN', (1, 2), (-1, 2)),
        ('SPAN', (1, 3), (-1, 3)),
        
        ('BACKGROUND', (0, 1), (0, 3), COLOR_SECTION_BG), # Labels Column Blueish? Check image... 
        # Image shows white labels for specific rows, but let's keep it mostly white with bold labels
        ('BACKGROUND', (0, 1), (0, 3), COLOR_LABEL_BG), # Gris suave para labels laterales
        
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_ident)
    story.append(Spacer(1, 8))

    # Fecha Nacimiento / Edad (Simplificado)
    f_nac = trabajador.fecha_nacimiento
    edad = calcular_edad(f_nac) if f_nac else ""
    fecha_nac_str = f_nac.strftime('%d/%m/%Y') if f_nac else ""

    data_nac = [
        [B("Fecha de nacimiento"), P(fecha_nac_str, style_normal)],
        [B("Edad"), P(f"{edad} años" if edad else "", style_normal)],
    ]
    t_nac = Table(data_nac, colWidths=[2*inch, 5.4*inch])
    t_nac.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_nac)

    # Estado Civil (Simplificado)
    ec = (trabajador.estado_civil.value if hasattr(trabajador.estado_civil, 'value') else str(trabajador.estado_civil or '')).replace('_', ' ').title()
    data_ec = [
        [B("Estado civil"), P(ec, style_normal)],
    ]
    t_ec = Table(data_ec, colWidths=[2*inch, 5.4*inch])
    t_ec.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, 0), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_ec)

    # Nivel Educativo (Tabla simplificada)
    ne = (trabajador.nivel_educativo or '').lower()
    
    # Layout más limpio: 2 columnas principales
    data_edu = [
        [B("Nivel educativo"), P(trabajador.nivel_educativo or "", style_normal)],
        [B("Formación específica"), P(trabajador.formacion_especifica or "", style_normal)],
    ]
    
    t_edu = Table(data_edu, colWidths=[2*inch, 5.4*inch])
    t_edu.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_edu)

    # Info Dirección
    data_dir = [
        [B("Teléfonos trabajador"), P(trabajador.telefonos), "", ""],
        [B("Dirección residencia y ciudad"), P(trabajador.direccion), B("Urbano"), P("X" if trabajador.zona and "urbano" in trabajador.zona.value.lower() else "", style_center), B("Rural"), P("X" if trabajador.zona and "rural" in trabajador.zona.value.lower() else "", style_center)]
    ]
    t_dir = Table(data_dir, colWidths=[2*inch, 3*inch, 0.8*inch, 0.4*inch, 0.8*inch, 0.4*inch])
    t_dir.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, 1), COLOR_LABEL_BG),
        ('SPAN', (1, 0), (-1, 0)), # Merge tel celular content row 1
    ]))
    story.append(t_dir)

    # Diagnóstico Mental
    data_diag = [
        [B("Diagnóstico de esfera mental\nreconocidos"), P(trabajador.diagnostico_mental)]
    ]
    t_diag = Table(data_diag, colWidths=[2*inch, 5.4*inch])
    t_diag.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, 0), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('MINROWHEIGHT', (0, 0), (-1, 0), 30), # Altura mínima
    ]))
    story.append(t_diag)
    
    # ===== INFO LABORAL =====
    # Fecha ATEL
    f_atel = info_laboral.fecha_evento_atel.strftime('%d-%m-%Y') if info_laboral and info_laboral.fecha_evento_atel else ""
    data_atel = [[B("Fecha(s) del evento(s) ATEL"), P(f_atel)]]
    t_atel = Table(data_atel, colWidths=[2*inch, 5.4*inch])
    t_atel.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]))
    story.append(t_atel)

    # Eventos No laborales
    evt_no = info_laboral.eventos_no_laborales if info_laboral else False
    data_no_lab = [
        [B("Eventos No laborales"), 
         B("si"), P("X" if evt_no else "", style_center), 
         B("No"), P("X" if not evt_no else "", style_center),
         B("Fecha"), P(info_laboral.evento_no_laboral_fecha.strftime('%d-%m-%Y') if info_laboral and info_laboral.evento_no_laboral_fecha else ""),
         B("Diagnostico"), P(info_laboral.evento_no_laboral_diagnostico or "")]
    ]
    t_no_lab = Table(data_no_lab, colWidths=[2*inch, 0.4*inch, 0.4*inch, 0.4*inch, 0.4*inch, 0.8*inch, 1*inch, 1*inch, 1*inch])
    t_no_lab.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]))
    story.append(t_no_lab)

    # EPS / Pension
    data_ss = [
        [B("EPS"), P(info_laboral.eps or "")],
        [B("Fondo de Pension"), P(info_laboral.fondo_pension or "")]
    ]
    t_ss = Table(data_ss, colWidths=[2*inch, 5.4*inch])
    t_ss.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,1), COLOR_LABEL_BG)]))
    story.append(t_ss)

    # Incapacidad y Empresa
    data_inc = [
        [B("Tiempo total de incapacidad"), P(str(info_laboral.dias_incapacidad or "") + " días", style_center)],
        [B("Empresa donde labora*"), P(info_laboral.empresa or "")]
    ]
    t_inc = Table(data_inc, colWidths=[2*inch, 5.4*inch])
    t_inc.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,1), COLOR_LABEL_BG)]))
    story.append(t_inc)

    # Vinculación
    vinc = info_laboral.vinculacion_laboral if info_laboral else False
    data_vinc = [
        [B("Vinculacion laboral:"), B("NO"), P("X" if not vinc else "", style_center), B("SI"), P("X" if vinc else "", style_center), P("")]
    ]
    t_vinc = Table(data_vinc, colWidths=[2*inch, 0.5*inch, 0.5*inch, 0.5*inch, 0.5*inch, 3.4*inch])
    t_vinc.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]))
    story.append(t_vinc)

    story.append(Table([[B("Tipo de vinculación laboral"), P(info_laboral.tipo_vinculacion or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))

    # Modalidad (Tabla azulada estilo screenshot)
    mod = (info_laboral.modalidad.value if info_laboral and hasattr(info_laboral.modalidad, 'value') else str((info_laboral and info_laboral.modalidad) or '')).lower()
    data_mod = [
        [B("modalidad"), 
         B("Presencial"), P("X" if "presencial" in mod else "", style_center),
         B("teletrabajo"), P("X" if "teletrabajo" in mod else "", style_center),
         B("trabajo en casa"), P("X" if "casa" in mod else "", style_center)]
    ]
    t_mod = Table(data_mod, colWidths=[2*inch, 1*inch, 0.5*inch, 1.2*inch, 0.5*inch, 1.7*inch, 0.5*inch])
    t_mod.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG),
        # Fondos azules intermedios
        ('BACKGROUND', (3,0), (3,0), COLOR_SECTION_BG),
        ('BACKGROUND', (5,0), (5,0), COLOR_SECTION_BG)
    ]))
    story.append(t_mod)

    story.append(Table([[B("tiempo de la modalidad"), P(info_laboral.tiempo_modalidad or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))
    story.append(Table([[B("NIT de la Empresa"), P(info_laboral.nit_empresa or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))

    # Antiguedad (Tabla compleja)
    f_ing = info_laboral.fecha_ingreso_empresa if info_laboral else None
    dia_ing = str(f_ing.day) if f_ing else ""
    mes_ing = str(f_ing.month) if f_ing else ""
    ano_ing = str(f_ing.year) if f_ing else ""
    
    ant_emp_a = str(info_laboral.antiguedad_empresa_anos or "") if info_laboral else ""
    ant_emp_m = str(info_laboral.antiguedad_empresa_meses or "") if info_laboral else ""
    ant_car_a = str(info_laboral.antiguedad_cargo_anos or "") if info_laboral else ""
    ant_car_m = str(info_laboral.antiguedad_cargo_meses or "") if info_laboral else ""

    data_ant = [
        [B("Fecha ingreso a la\nempresa/antigüedad en la empresa"), B("dia"), B("mes"), B("ano"), B("Tiempo")],
        ["", P(dia_ing, style_center), P(mes_ing, style_center), P(ano_ing, style_center), Table([[P(ant_emp_a + " años"), P(ant_emp_m + " meses")]], colWidths=[1.5*inch, 1.5*inch])], # Nested for layout
        [B("antigüedad en el cargo"), "", "", "", Table([[P(ant_car_a + " años"), P(ant_car_m + " meses")]], colWidths=[1.5*inch, 1.5*inch])]
    ]
    t_ant = Table(data_ant, colWidths=[2*inch, 0.6*inch, 0.6*inch, 0.6*inch, 3.6*inch])
    t_ant.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0,0), (0,1), COLOR_LABEL_BG), # Left label merged
        ('SPAN', (0,0), (0,1)),
        ('BACKGROUND', (1,0), (-1,0), COLOR_SECTION_BG), # Header row internal
        ('SPAN', (0,2), (3,2)), # Merge left for 'antigüedad en el cargo'
        ('ALIGN', (0,2), (0,2), 'CENTER'),
        ('BACKGROUND', (0,2), (3,2), COLOR_LABEL_BG),
    ]))
    story.append(t_ant)

    # Contacto
    story.append(Table([[B("Contacto en empresa/cargo"), P(info_laboral.contacto_empresa or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))
    story.append(Table([[B("Correo(s) electrónico(s)"), P(info_laboral.correos or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))
    story.append(Table([[B("Teléfonos de contacto empresa"), P(info_laboral.telefonos_empresa or "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,0), COLOR_LABEL_BG)]) ))

    # ===== HISTORIA OCUPACIONAL =====
    story.append(Spacer(1, 5))
    story.append(Table([[B("HISTORIA OCUPACIONAL: *"), P("")]], colWidths=[3*inch, 4.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG)])))
    story.append(Table([[B("(Trabajos desempeñados, comenzando por el primero de su historia laboral )")]], colWidths=[7.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG)])))

    data_hist = [[B("Empresa"), B("Cargo - funciones / tareas"), B("Tiempo/duración"), B("Motivo de retiro")]]
    for h in historia_ocupacional[:3]:
        data_hist.append([P(h.empresa), P(h.cargo_funciones), P(h.duracion), P(h.motivo_retiro)])
    
    # Rellenar si faltan
    while len(data_hist) < 4:
        data_hist.append(["", "", "", ""])

    t_hist = Table(data_hist, colWidths=[1.85*inch, 2.85*inch, 1*inch, 1.7*inch])
    t_hist.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG), # Header Blue
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ]))
    story.append(t_hist)
    story.append(Spacer(1, 5))

    # Otros oficios y Actividad Actual
    story.append(Table([[B("Otros Oficios desempeñados:"), P(actividad_laboral.otros_oficios if actividad_laboral else "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER)])))
    story.append(Table([[B("Oficios de interes:"), P(actividad_laboral.oficios_interes if actividad_laboral else "")]], colWidths=[2*inch, 5.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER)])))
    
    story.append(Spacer(1, 5))
    story.append(Table([[B("DESCRIPCION ACTIVIDAD LABORAL ACTUAL * (antes del evento)")]], colWidths=[7.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG)])))
    
    act_data = [
        [B("Nombre del cargo"), P(actividad_laboral.nombre_cargo if actividad_laboral else "")],
        [B("Tareas (nombre y descripcion):"), P(actividad_laboral.tareas if actividad_laboral else "")],
        [B("Herramientas de trabajo:"), P(actividad_laboral.herramientas if actividad_laboral else "")],
        [B("Horario de trabajo:"), P(actividad_laboral.horario if actividad_laboral else "")],
        [B("Elementos de Proteccion Personal:"), P(actividad_laboral.elementos_proteccion if actividad_laboral else "")]
    ]
    t_act = Table(act_data, colWidths=[2*inch, 5.4*inch])
    t_act.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (0,-1), COLOR_LABEL_BG)]))
    story.append(t_act)

    # ===== FACTORES DE RIESGO (Grid Denso) =====
    # Header
    story.append(Table([[B("FACTORES DE RIESGO PSICOSOCIALES")]], colWidths=[7.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG), ('ALIGN', (0,0), (-1,-1), 'CENTER')])))
    
    # Tabla factores header
    data_fac = [[B("DEMANDAS / FACTOR"), B("ALTO"), B("MEDIO"), B("BAJO"), B("N/A"), B("OBSERVACIONES")]]
    
    # Helper for X marks
    def get_x(val, target): return "X" if val and val.lower() == target else ""

    last_cat = ""
    for eval in evaluaciones:
        cat_text = eval.categoria.value.replace('_', ' ').upper() if eval.categoria else ""
        if cat_text != last_cat:
            # Header de categoría
            data_fac.append([B(cat_text), "", "", "", "", ""])
            last_cat = cat_text
        
        calif = (eval.calificacion.value if eval.calificacion and hasattr(eval.calificacion, 'value') else str(eval.calificacion or '')).lower()
        
        data_fac.append([
            P(eval.item_texto),
            P(get_x(calif, 'alto'), style_center),
            P(get_x(calif, 'medio'), style_center),
            P(get_x(calif, 'bajo'), style_center),
            P(get_x(calif, 'na') or get_x(calif, 'n/a'), style_center),
            P(eval.observaciones or "")
        ])

    t_fac = Table(data_fac, colWidths=[3*inch, 0.5*inch, 0.5*inch, 0.5*inch, 0.5*inch, 2.4*inch])
    t_fac.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG), # Header Row
        ('ALIGN', (1,0), (4,-1), 'CENTER'),
        # Highlight category rows (cells where col 1 is bold and empty others - hacked by detecting empty cells in render loop logic but here we added row manually)
    ]))
    
    # Colorear filas de categoría manualmente (son las que tienen strings vacios en calificaciones)
    for i, row in enumerate(data_fac):
        if i > 0 and row[1] == "": 
            t_fac.setStyle(TableStyle([('BACKGROUND', (0,i), (-1,i), COLOR_HEADER_BG)]))

    story.append(t_fac)
    story.append(Spacer(1, 10))

    # ===== RESULTADOS Y FIRMAS (Bloque indivisible) =====
    elements_final = []
    
    elements_final.append(Table([[B("CONCEPTO PSICOLOGICO FINAL")]], colWidths=[7.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG)])))
    
    # Texto del concepto con mejor formato
    concepto_texto = concepto.concepto_editado or concepto.concepto_generado or ''
    # Usar Paragraph con estilo que permita wrap
    concepto_para = Paragraph(concepto_texto.replace('\n', '<br/>'), style_normal)
    t_concepto = Table([[concepto_para]], colWidths=[7.4*inch])
    t_concepto.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements_final.append(t_concepto)
    
    elements_final.append(Table([[B("ORIENTACION PSICOLOGICA PARA REINTEGRO LABORAL")]], colWidths=[7.4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER), ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG)])))
    recomendaciones = concepto.orientacion_reintegro or ''
    recom_para = Paragraph(recomendaciones.replace('\n', '<br/>'), style_normal)
    t_recom = Table([[recom_para]], colWidths=[7.4*inch])
    t_recom.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements_final.append(t_recom)
    
    elements_final.append(Spacer(1, 10))

    # Firmas (Estilo exacto screenshot: Header Azul, tabla 2 cols)
    # Headers
    h_firmas = [B("Elaboró"), B("Revisión por Proveedor")]
    
    # Images
    from reportlab.platypus import Image as ReportLabImage
    img_elab = Spacer(1, 40)
    if concepto.elaboro_firma and os.path.exists(concepto.elaboro_firma):
        try: img_elab = ReportLabImage(concepto.elaboro_firma, width=1.5*inch, height=0.6*inch)
        except: pass
        
    img_rev = Spacer(1, 40)
    if concepto.reviso_firma and os.path.exists(concepto.reviso_firma):
        try: img_rev = ReportLabImage(concepto.reviso_firma, width=1.5*inch, height=0.6*inch)
        except: pass
        
    row_imgs = [img_elab, img_rev]
    row_names = [P(concepto.elaboro_nombre or "", style_center), P(concepto.reviso_nombre or "", style_center)]
    row_cargos = [P("Profesionales que realizan la valoración", style_center), P("Profesional que revisa la valoración", style_center)]
    
    data_firmas = [h_firmas, row_imgs, [P("Nombre y Apellido", style_bold_center), P("Nombre y Apellido", style_bold_center)], row_names, row_cargos]
    
    t_firmas = Table(data_firmas, colWidths=[3.7*inch, 3.7*inch])
    t_firmas.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0,0), (-1,0), COLOR_SECTION_BG), # Header Azul
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements_final.append(t_firmas)
    
    # Agregar todo envuelto en KeepTogether
    story.append(KeepTogether(elements_final))

    # Generar
    doc.build(story)
    return str(pdf_path)
