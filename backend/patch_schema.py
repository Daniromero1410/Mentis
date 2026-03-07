import re

schema_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\schemas\valoracion_ocupacional.py"

with open(schema_path, "r", encoding="utf-8") as f:
    content = f.read()

new_fields = """    fechas_eventos_atel: Optional[str] = None
    
    eventos_no_laborales: Optional[str] = None
    eventos_no_laborales_fecha: Optional[str] = None
    eventos_no_laborales_diagnostico: Optional[str] = None
"""

content = content.replace("    fechas_eventos_atel: Optional[str] = None", new_fields)

with open(schema_path, "w", encoding="utf-8") as f:
    f.write(content)
