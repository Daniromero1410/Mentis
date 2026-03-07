import re

file_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\services\pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Eventos No Laborales in Identificacion table
ev_old = '''    ev_inner_data = [[B("si"), B("No"), B("Fecha"), B("Diagnostico")]]
    if eventos_no_laborales and len(eventos_no_laborales) > 0:
        for ev in eventos_no_laborales:
            si_no = ev.si_no.lower().strip() if ev.si_no else ""
            ev_inner_data.append([checkbox(si_no == "si", "si"), checkbox(si_no == "no", "No"), P(ev.fecha), P(ev.diagnostico)])
    else:
        ev_inner_data.append([checkbox(False, "si"), checkbox(False, "No"), P(""), P("")])'''

ev_new = '''    ev_inner_data = [[B("si"), B("No"), B("Fecha"), B("Diagnostico")]]
    ev_sn = str(i.eventos_no_laborales).lower().strip() if i and i.eventos_no_laborales else ""
    ev_f = i.eventos_no_laborales_fecha if i and i.eventos_no_laborales_fecha else ""
    ev_d = i.eventos_no_laborales_diagnostico if i and i.eventos_no_laborales_diagnostico else ""
    ev_inner_data.append([checkbox(ev_sn == "si" or ev_sn == "sí", "si"), checkbox(ev_sn == "no", "No"), P(ev_f), P(ev_d)])'''

content = content.replace(ev_old, ev_new)

# 2. Remove Section IV (ACTIVIDAD EXTRALABORAL RELEVANTE Y EVENTOS MÉDICOS)
iv_pattern = r'    # ===== ACT EXTRALABORAL Y EVENTOS =====(.*?)t_ev = Table\(ev_data, colWidths=\[PAGE_WIDTH\*0\.2, PAGE_WIDTH\*0\.3, PAGE_WIDTH\*0\.5\]\)\n        t_ev\.setStyle\(TableStyle\(\[\n            \(\'GRID\', \(0, 0\), \(-1, -1\), 0\.5, COLOR_BORDER\),\n            \(\'BACKGROUND\', \(0, 0\), \(-1, 0\), COLOR_LABEL_BG\),\n            \(\'VALIGN\', \(0, 0\), \(-1, -1\), \'MIDDLE\'\),\n        \]\)\)\n        story\.append\(t_ev\)'

content = re.sub(iv_pattern, '    # Removed Section IV', content, flags=re.DOTALL)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for eventos no laborales.")
