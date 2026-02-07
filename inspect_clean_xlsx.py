import zipfile
import sys
import os

files = [
    "backend/app/services/plantilla_valoracion_clean.xlsx"
]

with open("xml_output_clean.txt", "w", encoding="utf-8") as out:
    for f in files:
        if os.path.exists(f):
            out.write(f"\n--- INSPECTING XML OF {f} ---\n")
            try:
                with zipfile.ZipFile(f, 'r') as z:
                    if 'docProps/core.xml' in z.namelist():
                        out.write("Found docProps/core.xml\n")
                        xml_content = z.read('docProps/core.xml').decode('utf-8')
                        out.write(xml_content + "\n")
                    
                    if 'docProps/app.xml' in z.namelist():
                        out.write("Found docProps/app.xml\n")
                        xml_content = z.read('docProps/app.xml').decode('utf-8')
                        out.write(xml_content + "\n")
            except Exception as e:
                out.write(f"Error: {e}\n")
