import re

file_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\services\pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Flowable is imported
if "from reportlab.platypus import Flowable" not in content:
    content = content.replace(
        "from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether",
        "from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, Flowable"
    )

if "import json" not in content:
    content = "import json\n" + content

# 2. Add the CircleBg class logic and the rendering function
new_logic = '''
    # ===== EVALUACIÓN OTRAS ÁREAS OCUPACIONALES =====
    class CircleBg(Flowable):
        def __init__(self, text, is_active=False, size=14):
            Flowable.__init__(self)
            self.text = text
            self.is_active = is_active
            self.size = size
            self.width = size
            self.height = size

        def draw(self):
            c = self.canv
            c.saveState()
            if self.is_active:
                c.setFillColor(colors.HexColor("#E65100"))  # Positiva Orange
                c.setStrokeColor(colors.HexColor("#E65100"))
            else:
                c.setFillColor(colors.HexColor("#F3F4F6"))
                c.setStrokeColor(colors.HexColor("#D1D5DB"))
            
            c.circle(self.size/2.0, self.size/2.0, self.size/2.0, fill=1, stroke=1)
            
            if self.is_active:
                c.setFillColor(colors.white)
            else:
                c.setFillColor(colors.HexColor("#4B5563"))
            c.setFont("Helvetica-Bold" if self.is_active else "Helvetica", 8)
            c.drawCentredString(self.size/2.0, self.size/2.0 - 2.5, self.text)
            c.restoreState()

    def build_rating_scale(val):
        try:
            val = int(val)
        except:
            val = -1
        cells = []
        for i in range(5):
            cells.append(CircleBg(str(i), is_active=(i == val), size=14))
        
        t_scale = Table([cells], colWidths=[18]*5, rowHeights=[18])
        t_scale.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('LEFTPADDING', (0,0), (-1,-1), 1),
            ('RIGHTPADDING', (0,0), (-1,-1), 1),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        return t_scale

    def render_area_dic(title, json_string):
        if not json_string:
            return
        
        try:
            dic_data = json.loads(json_string)
        except:
            # Fallback if not JSON
            story.append(crear_seccion_header(title))
            story.append(P(json_string))
            return

        # Sub-header orange light
        sub_h = [[B(title)]]
        sub_ht = Table(sub_h, colWidths=[PAGE_WIDTH])
        sub_ht.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF3E0")),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(sub_ht)
        
        h_data = [
            B("FACTORES A EVALUAR"),
            B("CALIFICACIÓN (0-4)"),
            B("OBSERVACIONES")
        ]
        p_rows = [h_data]
        
        for k, v in dic_data.items():
            k_formatted = k.replace("_", " ").title() if isinstance(k, str) else str(k)
            
            if isinstance(v, dict):
                val = v.get('valor', '')
                obs = v.get('observaciones', v.get('observacion', ''))
            else:
                val = v
                obs = ''
                
            rating_tab = build_rating_scale(val)
            p_rows.append([B(k_formatted), rating_tab, P(str(obs))])
            
        if len(p_rows) > 1:
            p_t = Table(p_rows, colWidths=[PAGE_WIDTH * 0.35, PAGE_WIDTH * 0.30, PAGE_WIDTH * 0.35])
            p_t.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BACKGROUND', (0, 0), (-1, 0), COLOR_LABEL_BG),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(p_t)

    if evaluacion_otras_areas_raw:
        story.append(crear_seccion_header("IX. EVALUACIÓN OTRAS ÁREAS OCUPACIONALES"))
        
        render_area_dic("Cuidado Personal", evaluacion_otras_areas_raw.cuidado_personal)
        render_area_dic("Comunicación", evaluacion_otras_areas_raw.comunicacion)
        render_area_dic("Movilidad", evaluacion_otras_areas_raw.movilidad)
        render_area_dic("Aprendizaje / Sensopercepción", evaluacion_otras_areas_raw.aprendizaje_sensopercepcion)
        render_area_dic("Vida Doméstica", evaluacion_otras_areas_raw.vida_domestica)

        story.append(Spacer(1, 10))
'''

old_logic = r'''    # ===== EVALUACIÓN OTRAS ÁREAS OCUPACIONALES =====(.*?)story\.append\(Spacer\(1, 10\)\)'''

content = re.sub(old_logic, new_logic.strip(), content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for Otras areas.")
