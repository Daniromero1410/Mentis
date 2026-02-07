"""
Generador de PDF para Pruebas de Trabajo de Esfera Mental
Diseño profesional y estético
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, PageBreak, KeepTogether, Image as ReportLabImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime, date
from pathlib import Path
import os

from app.models.prueba_trabajo import DimensionRiesgo, NivelRiesgo


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


def obtener_nombre_dimension(dimension: DimensionRiesgo) -> str:
    """Retorna el nombre legible de la dimensión"""
    nombres = {
        DimensionRiesgo.DEMANDAS_CUANTITATIVAS: "Demandas Cuantitativas",
        DimensionRiesgo.DEMANDAS_CARGA_MENTAL: "Demandas de Carga Mental",
        DimensionRiesgo.DEMANDAS_EMOCIONALES: "Demandas Emocionales",
        DimensionRiesgo.EXIGENCIAS_RESPONSABILIDAD: "Exigencias de Responsabilidad",
        DimensionRiesgo.CONSISTENCIA_ROL: "Consistencia del Rol",
        DimensionRiesgo.DEMANDAS_AMBIENTALES: "Demandas Ambientales y Físicas",
        DimensionRiesgo.DEMANDAS_JORNADA: "Demandas de la Jornada de Trabajo"
    }
    return nombres.get(dimension, str(dimension))


# Baremos para cálculo de nivel de riesgo (replicados del frontend)
BAREMOS = {
    DimensionRiesgo.DEMANDAS_CUANTITATIVAS: {"sin": 12.6, "bajo": 25.3, "medio": 38, "alto": 50.6, "muy_alto": 63},
    DimensionRiesgo.DEMANDAS_CARGA_MENTAL: {"sin": 21, "bajo": 42, "medio": 63, "alto": 84, "muy_alto": 105},
    DimensionRiesgo.DEMANDAS_EMOCIONALES: {"sin": 12.6, "bajo": 25.3, "medio": 38, "alto": 50.6, "muy_alto": 63},
    DimensionRiesgo.EXIGENCIAS_RESPONSABILIDAD: {"sin": 25.2, "bajo": 50.4, "medio": 75.6, "alto": 100.8, "muy_alto": 126},
    DimensionRiesgo.CONSISTENCIA_ROL: {"sin": 16.8, "bajo": 33.6, "medio": 50.4, "alto": 67.2, "muy_alto": 84},
    DimensionRiesgo.DEMANDAS_AMBIENTALES: {"sin": 42, "bajo": 84, "medio": 126, "alto": 168, "muy_alto": 210},
    DimensionRiesgo.DEMANDAS_JORNADA: {"sin": 8.4, "bajo": 16.8, "medio": 25.2, "alto": 33.6, "muy_alto": 42},
}


def calcular_nivel_riesgo_trabajador(dimension: DimensionRiesgo, puntaje: float) -> NivelRiesgo:
    """
    Calcula automáticamente el nivel de riesgo del trabajador basándose en el puntaje total 
    de una dimensión y los baremos establecidos.
    """
    rangos = BAREMOS.get(dimension)
    if not rangos:
        return None
    
    if puntaje <= rangos["sin"]:
        return NivelRiesgo.SIN_RIESGO
    elif puntaje <= rangos["bajo"]:
        return NivelRiesgo.RIESGO_BAJO
    elif puntaje <= rangos["medio"]:
        return NivelRiesgo.RIESGO_MEDIO
    elif puntaje <= rangos["alto"]:
        return NivelRiesgo.RIESGO_ALTO
    else:
        return NivelRiesgo.RIESGO_MUY_ALTO


def generar_pdf_prueba_trabajo(
    prueba,
    datos_empresa,
    trabajador,
    evaluador,
    secciones,
    condiciones_riesgo,
    resumen_factores,
    concepto_final,
    output_dir: str = "pdfs"
) -> str:
    """
    Genera PDF profesional de Prueba de Trabajo
    """
    # Crear directorio si no existe
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)

    # Generar nombre de archivo
    nombre = trabajador.nombre if trabajador else "sin_nombre"
    identificacion = trabajador.identificacion if trabajador else "sin_id"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    pdf_filename = f"prueba_trabajo_{sanitize_filename(nombre)}_{sanitize_filename(identificacion)}_{timestamp}.pdf"
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
    COLOR_HEADER = colors.HexColor('#E65100')     # Naranja oscuro
    COLOR_SECTION = colors.HexColor('#FF9800')    # Naranja medio  
    COLOR_LABEL_BG = colors.HexColor('#FFF3E0')   # Beige muy suave
    COLOR_BORDER = colors.HexColor('#424242')     # Gris oscuro
    COLOR_TEXT = colors.black

    # Ancho total disponible
    PAGE_WIDTH = 7.4 * inch

    # Estilos de texto
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
        """Crea header de sección naranja"""
        return Paragraph(f"<b>{text}</b>", style_section_header)

    def crear_seccion_header(texto):
        """Crea una tabla header de sección con fondo naranja"""
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

    story = []

    # ===== ENCABEZADO CON LOGO =====
    if LOGO_PATH.exists():
        try:
            # Mantener proporciones del logo - ancho máximo 4 pulgadas
            logo = ReportLabImage(str(LOGO_PATH), width=4*inch, height=0.8*inch)
            logo.hAlign = 'LEFT'
            story.append(logo)
            story.append(Spacer(1, 10))
        except Exception as e:
            print(f"Error cargando logo: {e}")

    # ===== DATOS DE IDENTIFICACIÓN DE LA EMPRESA =====
    story.append(crear_seccion_header("DATOS DE IDENTIFICACIÓN DE LA EMPRESA"))

    # Tabla empresa - 2 columnas simples
    empresa_rows = [
        [B("Empresa:"), P(datos_empresa.empresa if datos_empresa else "")],
        [B("Tipo de documento:"), P(datos_empresa.tipo_documento if datos_empresa else "NIT")],
        [B("NIT:"), P(datos_empresa.nit if datos_empresa else "")],
        [B("Persona contacto en:"), P(datos_empresa.persona_contacto if datos_empresa else "")],
        [B("E-mail para notificaciones:"), P(datos_empresa.email_notificaciones if datos_empresa else "")],
        [B("Dirección:"), P(datos_empresa.direccion if datos_empresa else "")],
        [B("ARL:"), P(datos_empresa.arl if datos_empresa else "")],
        [B("Ciudad:"), P(datos_empresa.ciudad if datos_empresa else "")],
    ]
    
    t_empresa = Table(empresa_rows, colWidths=[2*inch, PAGE_WIDTH - 2*inch])
    t_empresa.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_empresa)
    story.append(Spacer(1, 8))

    # ===== DATOS DEL TRABAJADOR EVALUADO =====
    story.append(crear_seccion_header("DATOS DEL TRABAJADOR EVALUADO"))

    # Formatear fechas
    def fmt_fecha(f):
        if f:
            return f.strftime('%d/%m/%Y') if hasattr(f, 'strftime') else str(f)
        return ""

    # 4 columnas: Label | Valor | Label | Valor
    col_label = 1.6*inch
    col_value = (PAGE_WIDTH - 2*col_label) / 2

    trabajador_rows = [
        [B("Nombre:"), P(trabajador.nombre if trabajador else ""), "", ""],
        [B("Identificación:"), P(trabajador.identificacion if trabajador else ""), B("Edad:"), P(f"{trabajador.edad} años" if trabajador and trabajador.edad else "")],
        [B("Fecha de nacimiento:"), P(fmt_fecha(trabajador.fecha_nacimiento if trabajador else None)), B("Género:"), P(trabajador.genero if trabajador else "")],
        [B("Escolaridad:"), P(trabajador.escolaridad if trabajador else ""), B("EPS:"), P(trabajador.eps if trabajador else "")],
        [B("Nivel educativo:"), P(trabajador.nivel_educativo if trabajador else ""), "", ""],
        [B("Puesto de trabajo evaluado:"), P(trabajador.puesto_trabajo_evaluado if trabajador else ""), "", ""],
        [B("Cargo:"), P(trabajador.cargo if trabajador else ""), B("Área:"), P(trabajador.area if trabajador else "")],
        [B("Fecha ingreso empresa:"), P(fmt_fecha(trabajador.fecha_ingreso_empresa if trabajador else None)), B("Fecha ingreso puesto:"), P(fmt_fecha(trabajador.fecha_ingreso_puesto_evaluado if trabajador else None))],
        [B("Antigüedad empresa:"), P(trabajador.antiguedad_empresa if trabajador else ""), B("Antigüedad puesto:"), P(trabajador.antiguedad_puesto_evaluado if trabajador else "")],
        [B("Diagnóstico:"), P(trabajador.diagnostico if trabajador else ""), B("Código CIE-10:"), P(trabajador.codigo_cie10 if trabajador else "")],
        [B("Fecha del siniestro:"), P(fmt_fecha(trabajador.fecha_siniestro if trabajador else None)), "", ""],
    ]

    t_trabajador = Table(trabajador_rows, colWidths=[col_label, col_value, col_label, col_value])
    t_trabajador.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('BACKGROUND', (2, 0), (2, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        # Spans para filas que ocupan todo el ancho
        ('SPAN', (1, 0), (3, 0)),  # Nombre
        ('SPAN', (1, 4), (3, 4)),  # Nivel educativo
        ('SPAN', (1, 5), (3, 5)),  # Puesto de trabajo
        ('SPAN', (1, 10), (3, 10)), # Fecha siniestro
    ]))
    story.append(t_trabajador)
    story.append(Spacer(1, 8))

    # ===== DATOS DEL EVALUADOR =====
    story.append(crear_seccion_header("DATOS DEL EVALUADOR"))

    evaluador_rows = [
        [B("Nombre:"), P(evaluador.nombre if evaluador else ""), "", ""],
        [B("Identificación:"), P(evaluador.identificacion if evaluador else ""), "", ""],
        [B("Formación:"), P(evaluador.formacion if evaluador else ""), "", ""],
        [B("Tarjeta Profesional:"), P(evaluador.tarjeta_profesional if evaluador else ""), B("Licencia SST:"), P(evaluador.licencia_sst if evaluador else "")],
        [B("Fecha de Evaluación:"), P(fmt_fecha(evaluador.fecha_evaluacion if evaluador else None)), "", ""],
    ]

    t_evaluador = Table(evaluador_rows, colWidths=[col_label, col_value, col_label, col_value])
    t_evaluador.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('BACKGROUND', (2, 3), (2, 3), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        # Spans
        ('SPAN', (1, 0), (3, 0)),
        ('SPAN', (1, 1), (3, 1)),
        ('SPAN', (1, 2), (3, 2)),
        ('SPAN', (1, 4), (3, 4)),
    ]))
    story.append(t_evaluador)
    story.append(Spacer(1, 8))

    # ===== METODOLOGÍA =====
    story.append(crear_seccion_header("METODOLOGÍA"))
    
    metodologia_texto = secciones.metodologia if secciones and secciones.metodologia else \
        "El siguiente instrumento establecido para la realización de Pruebas de Trabajo de Esfera Mental basa su estructura en el apartado del Dominio Demandas del Trabajo de la Batería de instrumentos para la evaluación de factores de riesgo psicosocial del ministerio de protección social."
    
    metodologia_para = Paragraph(metodologia_texto.replace('\n', '<br/>'), style_small)
    t_metodologia = Table([[metodologia_para]], colWidths=[PAGE_WIDTH])
    t_metodologia.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_metodologia)
    story.append(Spacer(1, 8))

    # ===== PARTICIPANTES =====
    story.append(crear_seccion_header("PARTICIPANTES"))

    participantes_rows = [
        [B("Trabajador(a):"), P(secciones.participante_trabajador if secciones else (trabajador.nombre if trabajador else ""))],
        [B("Jefe Inmediato:"), P(secciones.participante_jefe if secciones else "")],
        [B("Cargo Jefe:"), P(secciones.participante_cargo_jefe if secciones else "")],
    ]
    t_participantes = Table(participantes_rows, colWidths=[1.8*inch, PAGE_WIDTH - 1.8*inch])
    t_participantes.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (0, -1), COLOR_LABEL_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_participantes)
    story.append(Spacer(1, 8))

    # ===== FUENTES DE RECOLECCIÓN DE LA INFORMACIÓN =====
    story.append(crear_seccion_header("FUENTES DE RECOLECCIÓN DE LA INFORMACIÓN"))

    # Tabla de entrevistas
    fecha_trab = fmt_fecha(secciones.fuente_trabajador_fecha if secciones else None)
    fecha_jefe = fmt_fecha(secciones.fuente_jefe_fecha if secciones else None)
    fecha_par = fmt_fecha(secciones.fuente_par_fecha if secciones else None)

    col_w3 = PAGE_WIDTH / 3
    fuentes_rows = [
        [P("Se llevaron a cabo las siguientes entrevistas:", style_bold), "", ""],
        [B("Trabajador"), B("Jefe"), B("Par")],
        [P(fecha_trab, style_center), P(fecha_jefe, style_center), P(fecha_par, style_center)],
    ]
    t_fuentes = Table(fuentes_rows, colWidths=[col_w3, col_w3, col_w3])
    t_fuentes.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('SPAN', (0, 0), (-1, 0)),
        ('BACKGROUND', (0, 1), (-1, 1), COLOR_LABEL_BG),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_fuentes)
    story.append(Spacer(1, 8))

    # ===== REVISIÓN DOCUMENTAL =====
    story.append(crear_seccion_header("REVISIÓN DOCUMENTAL"))
    revision_texto = secciones.revision_documental if secciones and secciones.revision_documental else "Se verifica documentación clínica"
    t_revision = Table([[P(revision_texto)]], colWidths=[PAGE_WIDTH])
    t_revision.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_revision)
    story.append(Spacer(1, 8))

    # ===== DESCRIPCIÓN DEL PUESTO DE TRABAJO =====
    story.append(crear_seccion_header("DESCRIPCIÓN DEL PUESTO DE TRABAJO"))
    puesto_texto = secciones.descripcion_puesto if secciones and secciones.descripcion_puesto else ""
    if puesto_texto:
        puesto_para = Paragraph(puesto_texto.replace('\n', '<br/>'), style_small)
        t_puesto = Table([[puesto_para]], colWidths=[PAGE_WIDTH])
        t_puesto.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_puesto)
    else:
        story.append(Spacer(1, 10))  # Espacio pequeño si no hay descripción

    story.append(Spacer(1, 8))

    # ===== EVALUACIÓN DE CONDICIONES DE RIESGO (flujo continuo) =====
    story.append(crear_seccion_header("EVALUACIÓN DE CONDICIONES DE RIESGO PSICOSOCIAL"))
    story.append(Spacer(1, 5))

    # Encabezado de la tabla
    header_eval = [
        B("CONDICIÓN / FACTOR DE RIESGO"),
        B("FR", style_center),
        B("EXP", style_center),
        B("INT", style_center),
        B("TOTAL", style_center)
    ]


    # Organizar condiciones por dimensión
    condiciones_por_dimension = {}
    for cond in condiciones_riesgo:
        if cond.dimension not in condiciones_por_dimension:
            condiciones_por_dimension[cond.dimension] = []
        condiciones_por_dimension[cond.dimension].append(cond)

    # Buscar totales en resumen_factores
    totales_por_dimension = {}
    for res in resumen_factores:
        totales_por_dimension[res.dimension] = res.puntuacion_total or 0

    data_eval = [header_eval]
    dimension_rows = []  # Para trackear qué filas son headers de dimensión
    total_rows = []  # Para trackear filas de totales

    for dimension in DimensionRiesgo:
        if dimension in condiciones_por_dimension:
            # Header de dimensión
            dim_row_idx = len(data_eval)
            dimension_rows.append(dim_row_idx)
            data_eval.append([B(obtener_nombre_dimension(dimension).upper()), "", "", "", ""])

            # Condiciones ordenadas
            condiciones = sorted(condiciones_por_dimension[dimension], key=lambda x: x.item_numero)
            
            # Calcular totales de la dimensión
            sum_fr = 0
            sum_exp = 0
            sum_int = 0
            sum_total = 0
            
            for cond in condiciones:
                fr = cond.frecuencia if cond.frecuencia is not None else 0
                exp = cond.exposicion if cond.exposicion is not None else 0
                int_val = cond.intensidad if cond.intensidad is not None else 0
                total = cond.total_condicion if cond.total_condicion is not None else 0
                
                sum_fr += fr
                sum_exp += exp
                sum_int += int_val
                sum_total += total
                
                data_eval.append([
                    P(cond.condicion_texto, style_small),
                    P(str(fr), style_center),
                    P(str(exp), style_center),
                    P(str(int_val), style_center),
                    P(str(total), style_center)
                ])
            
            # Fila de TOTAL para esta dimensión
            total_row_idx = len(data_eval)
            total_rows.append(total_row_idx)
            
            # Usar puntuación total del resumen si existe, sino usar suma calculada
            total_dimension = totales_por_dimension.get(dimension, sum_total)
            
            data_eval.append([
                B("TOTAL DEMANDA", style_bold),
                B(str(sum_fr), style_center),
                B(str(sum_exp), style_center),
                B(str(sum_int), style_center),
                B(str(total_dimension), style_center)
            ])

    t_eval = Table(data_eval, colWidths=[4.2*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.9*inch])
    
    # Estilos base
    eval_styles = [
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECTION),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]
    
    # Colorear headers de dimensión (fondo naranja claro)
    for row_idx in dimension_rows:
        eval_styles.append(('BACKGROUND', (0, row_idx), (-1, row_idx), COLOR_LABEL_BG))
        eval_styles.append(('SPAN', (0, row_idx), (-1, row_idx)))
    
    # Colorear filas de totales (fondo amarillo/gris claro para destacar)
    COLOR_TOTAL_ROW = colors.HexColor('#FFFDE7')  # Amarillo muy claro
    for row_idx in total_rows:
        eval_styles.append(('BACKGROUND', (0, row_idx), (-1, row_idx), COLOR_TOTAL_ROW))
        eval_styles.append(('FONTNAME', (0, row_idx), (-1, row_idx), 'Helvetica-Bold'))

    t_eval.setStyle(TableStyle(eval_styles))
    story.append(t_eval)
    story.append(Spacer(1, 12))

    # ===== RESUMEN DE FACTORES DE RIESGO (en la misma página después de la evaluación) =====
    story.append(crear_seccion_header("RESUMEN DE FACTORES DE RIESGO DETECTADOS"))
    story.append(Spacer(1, 5))

    # Tabla resumen
    header_resumen = [
        B("DIMENSIÓN"),
        B("Nivel Riesgo Trabajador", style_center),
        B("Nivel Riesgo Experto", style_center),
        B("Factores Trabajador"),
        B("Factores Experto")
    ]

    data_resumen = [header_resumen]
    resumen_ordenado = sorted(resumen_factores, key=lambda x: list(DimensionRiesgo).index(x.dimension))

    # Calcular totales por dimensión de las condiciones para obtener nivel de riesgo del trabajador
    totales_por_dimension = {}
    for cond in condiciones_riesgo:
        if cond.dimension not in totales_por_dimension:
            totales_por_dimension[cond.dimension] = 0
        totales_por_dimension[cond.dimension] += (cond.total_condicion or 0)

    for res in resumen_ordenado:
        # Calcular nivel de riesgo del trabajador automáticamente basándose en el puntaje total
        puntaje_total = totales_por_dimension.get(res.dimension, res.puntuacion_total or 0)
        nivel_trab_calculado = calcular_nivel_riesgo_trabajador(res.dimension, puntaje_total)
        
        # Usar el nivel calculado
        if nivel_trab_calculado:
            nivel_trab = nivel_trab_calculado.value.replace('_', ' ').title()
        else:
            nivel_trab = "N/A"
        
        nivel_exp = res.nivel_riesgo_experto.value.replace('_', ' ').title() if res.nivel_riesgo_experto else "N/A"

        data_resumen.append([
            P(obtener_nombre_dimension(res.dimension), style_small),
            P(nivel_trab, style_center),
            P(nivel_exp, style_center),
            P(res.factores_detectados_trabajador or "", style_small),
            P(res.factores_detectados_experto or "", style_small)
        ])

    t_resumen = Table(data_resumen, colWidths=[1.5*inch, 1.1*inch, 1.1*inch, 1.85*inch, 1.85*inch])
    t_resumen.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECTION),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_resumen)
    story.append(Spacer(1, 10))

    # ===== TABLA DE RESUMEN AGRUPADA POR NIVEL DE RIESGO =====
    # Esta tabla muestra los factores agrupados por nivel de riesgo como en el formulario
    
    # Agrupar dimensiones por nivel de riesgo del experto
    niveles_orden = [
        (NivelRiesgo.RIESGO_MUY_ALTO, "RIESGO MUY ALTO", colors.HexColor('#DC2626')),
        (NivelRiesgo.RIESGO_ALTO, "RIESGO ALTO", colors.HexColor('#EA580C')),
        (NivelRiesgo.RIESGO_MEDIO, "RIESGO MEDIO", colors.HexColor('#F59E0B')),
        (NivelRiesgo.RIESGO_BAJO, "RIESGO BAJO", colors.HexColor('#22C55E')),
        (NivelRiesgo.SIN_RIESGO, "SIN RIESGO", colors.HexColor('#16A34A')),
    ]
    
    # Crear diccionario de dimensiones por nivel
    dims_por_nivel_trabajador = {nivel: [] for nivel, _, _ in niveles_orden}
    dims_por_nivel_experto = {nivel: [] for nivel, _, _ in niveles_orden}
    
    for res in resumen_factores:
        dim_nombre = obtener_nombre_dimension(res.dimension)
        
        # Para el trabajador, calcular el nivel automáticamente
        puntaje_total = totales_por_dimension.get(res.dimension, res.puntuacion_total or 0)
        nivel_trab_calculado = calcular_nivel_riesgo_trabajador(res.dimension, puntaje_total)
        if nivel_trab_calculado and nivel_trab_calculado in dims_por_nivel_trabajador:
            dims_por_nivel_trabajador[nivel_trab_calculado].append(dim_nombre)
        
        # Para el experto, usar el valor guardado
        if res.nivel_riesgo_experto:
            if res.nivel_riesgo_experto in dims_por_nivel_experto:
                dims_por_nivel_experto[res.nivel_riesgo_experto].append(dim_nombre)
    
    # Crear tabla de resumen agrupada
    header_agrupado = [
        B("Factores de Riesgo Psicosocial"),
        B("Factores de Riesgo Detectados por la Valoración Subjetiva del Trabajador"),
        B("Factores Detectados por la Valoración del Experto")
    ]
    
    data_agrupado = [header_agrupado]
    agrupado_level_rows = []
    
    for nivel, nombre_nivel, color_nivel in niveles_orden:
        row_idx = len(data_agrupado)
        agrupado_level_rows.append((row_idx, color_nivel))
        
        factores_trab = dims_por_nivel_trabajador.get(nivel, [])
        factores_exp = dims_por_nivel_experto.get(nivel, [])
        
        texto_trab = ", ".join(factores_trab) if factores_trab else "ninguno"
        texto_exp = ", ".join(factores_exp) if factores_exp else "ninguno"
        
        data_agrupado.append([
            B(nombre_nivel, style_center),
            P(texto_trab, style_small),
            P(texto_exp, style_small)
        ])
    
    t_agrupado = Table(data_agrupado, colWidths=[1.8*inch, 2.8*inch, 2.8*inch])
    
    agrupado_styles = [
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECTION),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (1, 1), (-1, -1), 4),
    ]
    
    # Colorear celdas de nivel de riesgo
    for row_idx, color_nivel in agrupado_level_rows:
        agrupado_styles.append(('BACKGROUND', (0, row_idx), (0, row_idx), color_nivel))
        agrupado_styles.append(('TEXTCOLOR', (0, row_idx), (0, row_idx), colors.white))
    
    t_agrupado.setStyle(TableStyle(agrupado_styles))
    story.append(t_agrupado)
    story.append(Spacer(1, 12))

    # ===== CONCLUSIONES Y CONCEPTO FINAL =====
    if concepto_final:
        if concepto_final.conclusion_evaluacion:
            story.append(crear_seccion_header("CONCLUSIÓN DE LA EVALUACIÓN"))
            story.append(Spacer(1, 5))
            conclusion_para = Paragraph(concepto_final.conclusion_evaluacion.replace('\n', '<br/>'), style_normal)
            story.append(conclusion_para) # Direct append
            story.append(Spacer(1, 8))

        # ===== ÍTEMS CON CONCORDANCIA =====
        if concepto_final.concordancia_items:
            story.append(crear_seccion_header("ÍTEMS CON CONCORDANCIA"))
            story.append(Spacer(1, 5))
            concordancia_para = Paragraph(concepto_final.concordancia_items.replace('\n', '<br/>'), style_normal)
            story.append(concordancia_para) # Direct append
            story.append(Spacer(1, 8))

        # ===== ÍTEMS SIN CONCORDANCIA =====
        if concepto_final.no_concordancia_items:
            story.append(crear_seccion_header("ÍTEMS SIN CONCORDANCIA"))
            story.append(Spacer(1, 5))
            no_concordancia_para = Paragraph(concepto_final.no_concordancia_items.replace('\n', '<br/>'), style_normal)
            story.append(no_concordancia_para) # Direct append
            story.append(Spacer(1, 8))

        concepto_texto = concepto_final.conclusiones_finales or concepto_final.concepto_generado_ml or ""
        if concepto_texto:
            story.append(crear_seccion_header("CONCLUSIONES FINALES - PRUEBA DE TRABAJO DE ESFERA MENTAL"))
            story.append(Spacer(1, 5))
            concepto_para = Paragraph(concepto_texto.replace('\n', '<br/>'), style_normal)
            story.append(concepto_para) # Direct append
            story.append(Spacer(1, 8))

        if concepto_final.recomendaciones:
            # Eliminar KeepTogether para permitir que las recomendaciones fluyan entre páginas
            story.append(crear_seccion_header("RECOMENDACIONES"))
            story.append(Spacer(1, 5))
            recom_para = Paragraph(concepto_final.recomendaciones.replace('\n', '<br/>'), style_normal)
            story.append(recom_para) # Direct append

    story.append(Spacer(1, 20))

    # ===== FIRMA DEL EVALUADOR =====
    if evaluador:
        firma_data = []
        
        # Espacio para firma
        firma_img = Spacer(1, 40)
        if concepto_final and concepto_final.firma_evaluador and os.path.exists(concepto_final.firma_evaluador):
            try:
                firma_img = ReportLabImage(concepto_final.firma_evaluador, width=1.8*inch, height=0.7*inch)
            except:
                pass

        firma_data = [
            [firma_img],
            [P("_" * 40, style_center)],
            [P(evaluador.nombre or "", style_center)],
            [P(f"T.P. {evaluador.tarjeta_profesional}" if evaluador.tarjeta_profesional else "", style_center)],
            [P("Psicólogo Evaluador", style_center)],
        ]

        t_firma = Table(firma_data, colWidths=[3*inch])
        t_firma.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        # Centrar la firma
        wrapper = Table([[t_firma]], colWidths=[PAGE_WIDTH])
        wrapper.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER')]))
        story.append(wrapper)

    # Generar PDF
    doc.build(story)
    return str(pdf_path)
