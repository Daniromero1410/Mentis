import sys
import os
from openpyxl import load_workbook

# Add current dir to path
sys.path.append(os.getcwd())

files = [
    "backend/app/services/plantilla_valoracion.xlsx",
    "backend/app/services/plantilla_valoracion_simple.xlsx"
]

for f in files:
    if os.path.exists(f):
        print(f"Cleaning {f}...")
        try:
            wb = load_workbook(f)
            
            # Clean Core Properties
            wb.properties.title = ""
            wb.properties.subject = ""
            wb.properties.creator = "Sistema de Valoraciones"
            wb.properties.keywords = ""
            wb.properties.category = ""
            wb.properties.description = ""
            wb.properties.lastModifiedBy = "Sistema"
            
            # Save (this strips extended properties like Company)
            wb.save(f)
            print(f"Cleaned and saved {f}")
        except Exception as e:
            print(f"Error cleaning {f}: {e}")
    else:
        print(f"File not found: {f}")
