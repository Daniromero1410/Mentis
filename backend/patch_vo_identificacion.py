import re

file_path = "c:/Users/daniel.romero/OneDrive - GESTAR INNOVACION S.A.S/Documentos/william-romero/backend/app/services/pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_code = '''    # ===== DATOS DE IDENTIFICACIÓN Y EMPRESA =====
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

    f_ie_t = Table([[B("Fecha ingreso a la empresa /\\nantigüedad en la empresa"), P(fmt_fecha(i.fecha_ingreso_empresa if i else None)), B("Tiempo"), P(f"{calcular_antiguedad(i.fecha_ingreso_empresa if i else None)}")]], colWidths=[PAGE_WIDTH*0.4, PAGE_WIDTH*0.3, PAGE_WIDTH*0.1, PAGE_WIDTH*0.2])
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
'''

start_marker = r'    # ===== DATOS DE IDENTIFICACIÓN Y GENERALES DEL TRABAJADOR ====='
end_marker = r'    # ===== HISTORIA OCUPACIONAL ====='

pattern = start_marker + r'.*?' + end_marker
new_content = re.sub(pattern, new_code + '\n    # ===== HISTORIA OCUPACIONAL =====', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patch applied successfully.")
