import sys
import os
from openpyxl import load_workbook
import zipfile

# Add current dir to path
sys.path.append(os.getcwd())

src = "backend/app/services/plantilla_valoracion.xlsx"
dst = "backend/app/services/plantilla_valoracion_clean.xlsx"

print(f"Loading {src}...")
wb = load_workbook(src)

# Clean Core Properties
wb.properties.title = ""
wb.properties.subject = ""
wb.properties.creator = "Sistema de Valoraciones"
wb.properties.keywords = ""
wb.properties.category = ""
wb.properties.description = ""
wb.properties.lastModifiedBy = "Sistema"

# Try to clean Extended Properties if accessible, otherwise hope save drops them or we edit XML later
# openpyxl doesn't make extended props easily editable via high level API usually.

print(f"Saving to {dst}...")
wb.save(dst)

# Inspect the new file
print(f"--- INSPECTING XML OF {dst} ---")
with zipfile.ZipFile(dst, 'r') as z:
    if 'docProps/core.xml' in z.namelist():
        print("Found docProps/core.xml")
        print(z.read('docProps/core.xml').decode('utf-8'))
    
    if 'docProps/app.xml' in z.namelist():
        print("Found docProps/app.xml")
        print(z.read('docProps/app.xml').decode('utf-8'))
