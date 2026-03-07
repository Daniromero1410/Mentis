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

    # Colores profesionales
    COLOR_HEADER = colors.HexColor('#4F46E5')     # Indigo 600
    COLOR_LABEL_BG = colors.HexColor('#EEF2FF')   # Indigo 50
    COLOR_BORDER = colors.HexColor('#A1A1AA')     # Zinc 400
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
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
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

    # ===== ENCABEZADO CON LOGO =====
    if LOGO_PATH.exists():
        try:
            logo = ReportLabImage(str(LOGO_PATH), width=4*inch, height=0.8*inch)
            logo.hAlign = 'LEFT'
            story.append(logo)
            story.append(Spacer(1, 10))
        except Exception as e:
            print(f"Error cargando logo: {e}")

    # Título principal
    story.append(crear_seccion_header("FORMATO DE VALORACIÓN OCUPACIONAL INICIAL Y/O DE SEGUIMIENTO"))
    story.append(Spacer(1, 8))

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

    # ===== DATOS DE IDENTIFICACIÓN Y GENERALES DEL TRABAJADOR =====
    story.append(crear_seccion_header("II. DATOS DE IDENTIFICACIÓN Y GENERALES DEL TRABAJADOR"))
    
    col_label = 1.3 * inch
    col_val = (PAGE_WIDTH - (col_label * 2)) / 2

    ident_rows = [
        [B("Identificación de siniestro:"), P(identificacion.identificacion_siniestro if identificacion else ""), 
         B("Fecha valoración:"), P(fmt_fecha(identificacion.fecha_valoracion if identificacion else None))],
        
        [B("Nombres y apellidos:"), P(identificacion.nombre_trabajador if identificacion else ""), 
         B("Documento de identidad:"), P(str(identificacion.numero_documento) if identificacion else "")],
        
        [B("Fecha de nacimiento:"), P(fmt_fecha(identificacion.fecha_nacimiento if identificacion else None)), 
         B("Edad:"), P(calcular_edad(identificacion.fecha_nacimiento if identificacion else None))],
        
        [B("Dominancia:"), P(identificacion.dominancia if identificacion else ""), 
         B("Estado civil:"), P(identificacion.estado_civil if identificacion else "")],
        
        [B("Nivel escolaridad:"), P(identificacion.nivel_educativo if identificacion else ""), 
         B("Especifique formación:"), P(identificacion.especificar_formacion if identificacion else "")],
        
        [B("Dirección residencia:"), P(identificacion.direccion_residencia if identificacion else ""), 
         B("Zona (Urbana/Rural):"), P(identificacion.zona_residencia if identificacion else "")],
        
        [B("Teléfono(s):"), P(identificacion.telefonos_trabajador if identificacion else ""), 
         B("EPS / IPS / AFP:"), P(f"{identificacion.eps_ips or ''} / {identificacion.afp or ''}" if identificacion else "")],
         
        [B("Diagnóstico del ATEL y/o CIE10:"), P(identificacion.diagnosticos_atel if identificacion else ""), "", ""],
        [B("Fechas Eventos ATEL:"), P(fmt_fecha(identificacion.fechas_eventos_atel if identificacion else None)), "", ""],
    ]

    t_ident = Table(ident_rows, colWidths=[col_label*1.1, col_val*0.9, col_label*1.1, col_val*0.9])
    t_ident.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('SPAN', (1, 7), (3, 7)),
        ('SPAN', (1, 8), (3, 8)),
    ]))
    story.append(t_ident)
    story.append(Spacer(1, 8))

    # ===== DATOS DE LA EMPRESA =====
    empresa_rows = [
        [B("Empresa donde labora:"), P(identificacion.empresa if identificacion else ""), 
         B("NIT:"), P(identificacion.nit_empresa if identificacion else "")],
        
        [B("Vinculación laboral:"), P("SÍ" if identificacion and identificacion.vinculacion_laboral else "NO"),
         B("Modalidad:"), P(identificacion.modalidad if identificacion else "")],
         
        [B("Forma vinculación/cesación:"), P(identificacion.forma_vinculacion if identificacion else ""),
         B("Tiempo en modalidad:"), P(identificacion.tiempo_modalidad if identificacion else "")],

        [B("Fecha ingreso a empresa:"), P(fmt_fecha(identificacion.fecha_ingreso_empresa if identificacion else None)),
         B("Antigüedad:"), P(calcular_antiguedad(identificacion.fecha_ingreso_empresa if identificacion else None))],

        [B("Contacto en empresa:"), P(identificacion.contacto_empresa if identificacion else ""),
         B("Cargo del contacto:"), P("")],

        [B("Teléfono de empresa:"), P(identificacion.telefonos_empresa if identificacion else ""),
         B("Correos electrónicos:"), P(identificacion.correos_empresa if hasattr(identificacion, 'correos_empresa') else "")],
    ]

    t_empresa = Table(empresa_rows, colWidths=[col_label*1.1, col_val*0.9, col_label*1.1, col_val*0.9])
    t_empresa.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_empresa)
    story.append(Spacer(1, 10))

    # ===== HISTORIA OCUPACIONAL =====
    story.append(crear_seccion_header("III. HISTORIA OCUPACIONAL"))
    
    if historia_ocupacional and len(historia_ocupacional) > 0:
        hist_headers = [B("Empresas"), B("Cargo / Duración"), B("Exigencias (Bio/Psico/Cogn)"), B("Ocurrencia ATEL")]
        hist_data = [hist_headers]
        for hist in historia_ocupacional:
            hist_data.append([
                P(hist.empresas),
                P(hist.cargo_duracion),
                P(hist.exigencias),
                P(hist.ocurrencia_atel)
            ])
            
        t_hist = Table(hist_data, colWidths=[PAGE_WIDTH*0.25, PAGE_WIDTH*0.2, PAGE_WIDTH*0.35, PAGE_WIDTH*0.2])
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
        
        ev_headers = [B("Actividad o Evento Médico"), B("Fecha/Tiempo"), B("Observaciones / Secuelas")]
        ev_data = [ev_headers]
        
        for ev in eventos_no_laborales:
            ev_data.append([
                P(ev.evento),
                P(ev.fecha_tiempo),
                P(ev.observaciones)
            ])
            
        t_ev = Table(ev_data, colWidths=[PAGE_WIDTH*0.35, PAGE_WIDTH*0.25, PAGE_WIDTH*0.4])
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
        [B("Trabaja actualmente / Cargo:"), P(actividad_actual.trabaja_actualmente if actividad_actual else "")],
        [B("Herramientas, materiales y equipos:"), P(actividad_actual.herramientas_equipos if actividad_actual else "")],
        [B("Otras actividades de trabajo:"), P(actividad_actual.otras_actividades if actividad_actual else "")],
        [B("Qué se encontraba haciendo durante la ATEL:"), P(ActT(actividad_actual.haciendo_atel if actividad_actual else ""))],
        [B("Relato del evento ATEL (del trabajador):"), P(ActT(actividad_actual.relato_evento if actividad_actual else ""))],
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
        [B("Biomecánicas y Posturales:"), P(ActT(rol_laboral.exigencias_biomecanicas if rol_laboral else ""))],
        [B("Psicosociales, de Rol y Tarea:"), P(ActT(rol_laboral.exigencias_psicosociales if rol_laboral else ""))],
        [B("Cognitivas y de Organización:"), P(ActT(rol_laboral.exigencias_cognitivas if rol_laboral else ""))],
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
        [B("Tratamientos e intervención recibida:"), P(ActT(evento_atel.tratamientos_intervencion if evento_atel else ""))],
        [B("Prótesis, ortesis, apoyos:"), P(ActT(evento_atel.protesis_ortesis if evento_atel else ""))],
        [B("Estado general respecto a ATEL:"), P(ActT(evento_atel.estado_general if evento_atel else ""))],
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
            [B("Estado civil/convivencia:"), P(composicion_familiar.estado_civil_dinamica), B("No. hijos / Cuidadores:"), P(composicion_familiar.num_hijos_cuidadores)],
            [B("Observaciones de dinámica/apoyo:"), P(composicion_familiar.observaciones_dinamica), "", ""],
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
        fam_headers = [B("Parentezco / Nombre"), B("Edad"), B("Ocupación"), B("Convivencia / Aportes")]
        fam_data = [fam_headers]
        for m in miembros_familiares:
            fam_data.append([
                P(m.parentezco_nombre),
                P(str(m.edad)),
                P(m.ocupacion),
                P(m.convivencia_aportes)
            ])
            
        t_fam = Table(fam_data, colWidths=[PAGE_WIDTH*0.4, PAGE_WIDTH*0.1, PAGE_WIDTH*0.25, PAGE_WIDTH*0.25])
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

    # ===== IMPRESIONES Y CONCEPTOS (REGISTRO) =====
    story.append(crear_seccion_header("X. IMPRESIONES GENERALES Y CONCEPTO DE T.O."))
    
    # Intenta usar conceptos nuevos si existen, sino recae en los viejos o deja en blanco
    concepto = getattr(registro, 'concepto_ocupacional', None) or getattr(registro, 'concepto_to', None) or ""
    orientacion = getattr(registro, 'orientacion_ocupacional', None) or ""

    reg_rows = [
        [B("Observación de conducta:"), P(ActT(getattr(registro, 'observacion_conducta', "")))],
        [B("Aspecto socio-familiar:"), P(ActT(getattr(registro, 'aspecto_socio_familiar', "")))],
        [B("Concepto Ocupacional:"), P(ActT(concepto))],
        [B("Orientación Ocupacional:"), P(ActT(orientacion))],
    ]
    t_reg = Table(reg_rows, colWidths=[1.8*inch, PAGE_WIDTH - 1.8*inch])
    t_reg.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 25))

    # ===== FIRMAS =====
    firma_eval = Spacer(1, 40)
    if evaluador and hasattr(evaluador, 'firma_path') and evaluador.firma_path and os.path.exists(evaluador.firma_path):
        try: firma_eval = ReportLabImage(evaluador.firma_path, width=1.5*inch, height=0.6*inch)
        except: pass

    firma_trab_img = Spacer(1, 40)
    if registro and registro.firma_trabajador and os.path.exists(registro.firma_trabajador):
        try: firma_trab_img = ReportLabImage(registro.firma_trabajador, width=1.5*inch, height=0.6*inch)
        except: pass
        
    firma_prov_img = Spacer(1, 40)
    if registro and getattr(registro, 'firma_proveedor', None) and os.path.exists(registro.firma_proveedor):
        try: firma_prov_img = ReportLabImage(registro.firma_proveedor, width=1.5*inch, height=0.6*inch)
        except: pass

    firma_rhb_img = Spacer(1, 40)
    if registro and getattr(registro, 'firma_equipo_rhb', None) and os.path.exists(registro.firma_equipo_rhb):
        try: firma_rhb_img = ReportLabImage(registro.firma_equipo_rhb, width=1.5*inch, height=0.6*inch)
        except: pass

    # Fila 1: Elaboró y Trabajador
    firmas_data_1 = [
        [firma_eval, firma_trab_img],
        [P("_" * 35, style_center), P("_" * 35, style_center)],
        [B("Elaboró (Gestor/Profesional T.O)", style_center), B("Trabajador(a)", style_center)],
        [P(getattr(registro, 'nombre_elaboro', evaluador.nombre if evaluador else "Profesional"), style_center), P(getattr(registro, 'nombre_trabajador', nombre), style_center)],
    ]
    t_firmas_1 = Table(firmas_data_1, colWidths=[PAGE_WIDTH/2, PAGE_WIDTH/2])
    t_firmas_1.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    story.append(KeepTogether([t_firmas_1]))
    story.append(Spacer(1, 25))

    # Fila 2: Proveedor y Equipo RHB
    firmas_data_2 = [
        [firma_prov_img, firma_rhb_img],
        [P("_" * 35, style_center), P("_" * 35, style_center)],
        [B("Revisión Proveedor / Profesional Interviniente", style_center), B("Equipo de Rehabilitación EPS", style_center)],
        [P(getattr(registro, 'nombre_proveedor', "Nombre del Proveedor"), style_center), P(getattr(registro, 'nombre_equipo_rhb', "Nombre Equipo RHB"), style_center)],
    ]
    t_firmas_2 = Table(firmas_data_2, colWidths=[PAGE_WIDTH/2, PAGE_WIDTH/2])
    t_firmas_2.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    story.append(KeepTogether([t_firmas_2]))

    # Generar PDF
    doc.build(story)
    return str(pdf_path)
