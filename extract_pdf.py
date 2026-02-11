import sys
sys.stdout.reconfigure(encoding='utf-8')
import pdfplumber

pdf = pdfplumber.open('Prueba de Trabajo TO.pdf')
with open('pdf_text_output.txt', 'w', encoding='utf-8') as f:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        f.write(f'--- PAGE {i+1} ---\n')
        f.write(text or '(no text)')
        f.write('\n\n')
        
        # Also extract tables
        tables = page.extract_tables()
        if tables:
            for j, table in enumerate(tables):
                f.write(f'  TABLE {j+1}:\n')
                for row in table:
                    f.write(f'    {row}\n')
                f.write('\n')

print(f'Done. {len(pdf.pages)} pages extracted to pdf_text_output.txt')
