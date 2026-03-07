import re

model_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\models\valoracion_ocupacional.py"

with open(model_path, "r", encoding="utf-8") as f:
    content = f.read()

new_fields = """    fechas_eventos_atel: Optional[str] = None
    
    # Eventos No laborales aplanados desde Identificacion (Frontend)
    eventos_no_laborales: Optional[str] = None
    eventos_no_laborales_fecha: Optional[str] = None
    eventos_no_laborales_diagnostico: Optional[str] = None
"""

content = content.replace("    fechas_eventos_atel: Optional[str] = None", new_fields)

with open(model_path, "w", encoding="utf-8") as f:
    f.write(content)
