import re
from pathlib import Path

file_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\services\pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Patch the Header
header_old_code = r'''    # ===== ENCABEZADO CON LOGO =====
    if LOGO_PATH.exists\(\):
        try:
            logo = ReportLabImage\(str\(LOGO_PATH\), width=4\*inch, height=0.8\*inch\)
            logo.hAlign = 'LEFT'
            story.append\(logo\)
            story.append\(Spacer\(1, 10\)\)
        except Exception as e:
            print\(f"Error cargando logo: \{e\}"\)

    # Título principal
    story.append\(crear_seccion_header\("FORMATO DE VALORACIÓN OCUPACIONAL INICIAL Y/O DE SEGUIMIENTO"\)\)
    story.append\(Spacer\(1, 8\)\)'''

header_new_code = '''    # ===== ENCABEZADO (HEADER) ESTILO POSITIVA =====
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
'''

content = re.sub(header_old_code, header_new_code, content)

# 2. Patch the Footer (Conceptos y Firmas)
footer_start = r'    # ===== IMPRESIONES Y CONCEPTOS \(REGISTRO\) =====(.*)return str\(pdf_path\)'

footer_new_code = r'''    # ===== CONCEPTOS (REGISTRO) =====
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
    return str(pdf_path)'''

content = re.sub(footer_start, footer_new_code, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for header and footer.")
