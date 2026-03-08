import re

file_path = r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\services\pdf_generator_valoracion_ocupacional.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "from reportlab.lib import colors" not in content:
    content = "from reportlab.lib import colors\n" + content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added colors import.")
