import re

file_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\services\pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix edad mapping
content = content.replace(
    'nac_row = [[B("Fecha de nacimiento/edad*"), P(fmt_fecha(i.fecha_nacimiento if i else None)), B("edad"), P(calcular_edad(i.fecha_nacimiento if i else None))]]',
    'nac_row = [[B("Fecha de nacimiento/edad*"), P(fmt_fecha(i.fecha_nacimiento if i else None)), B("edad"), P(str(i.edad) + " años" if i and i.edad else calcular_edad(i.fecha_nacimiento if i else None))]]'
)

# Fix correos_electronicos -> correos_empresa
content = content.replace(
    '[B("Correo(s) electrónico(s)*"), P(i.correos_electronicos if hasattr(i, "correos_electronicos") else "")],',
    '[B("Correo(s) electrónico(s)*"), P(i.correos_empresa if hasattr(i, "correos_empresa") else "")],'
)

# Remove "Tiempo total de incapacidad"
content = re.sub(
    r"    inc_t = Table\(\[\[B\(\"Tiempo total de incapacidad\"\), P\(i\.tiempo_incapacidad_dias if i else \"\"\), B\(\"dias\"\)]\], colWidths=\[PAGE_WIDTH\*0\.35, PAGE_WIDTH\*0\.55, PAGE_WIDTH\*0\.10\]\)\n    inc_t\.setStyle\(TableStyle\(\[\('GRID', \(0, 0\), \(-1, -1\), 0\.5, COLOR_BORDER\), \('VALIGN', \(0, 0\), \(-1, -1\), 'MIDDLE'\), \('BACKGROUND', \(0, 0\), \(0, -1\), COLOR_LABEL_BG\), \('LEFTPADDING', \(0, 0\), \(-1, -1\), 4\)]\)\)\n    story\.append\(inc_t\)\n",
    "",
    content,
    flags=re.MULTILINE
)

# Fix heading colors for 9, 10, 11
# Look for the section after # ===== CONCEPTOS (REGISTRO) =====
c_pattern = r'# 9\. CONCEPTO OCUPACIONAL(.*?)doc\.build\(story\)'
c_match = re.search(c_pattern, content, flags=re.DOTALL)
if c_match:
    old_c = c_match.group(1)
    
    new_c = '''
    story.append(crear_seccion_header("9. CONCEPTO OCUPACIONAL"))
    t_conc = Table([[P(ActT(concepto))]], colWidths=[PAGE_WIDTH], minRowHeights=[40])
    t_conc.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_conc)

    # 10. ORIENTACION OCUPACIONAL
    story.append(crear_seccion_header("10. ORIENTACION OCUPACIONAL *"))
    t_ori = Table([[P(ActT(orientacion))]], colWidths=[PAGE_WIDTH], minRowHeights=[40])
    t_ori.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_ori)

    # 11. REGISTRO (FIRMAS)
    story.append(crear_seccion_header("11. REGISTRO"))

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

    '''
    content = content.replace(old_c, new_c)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Patched successfully.")
