
import sys

def try_pypdf():
    try:
        import pypdf
        print("--- PYPDF TEXT ---")
        reader = pypdf.PdfReader(r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\ANALISIS DE EXIGENCIA TO.pdf")
        for i, page in enumerate(reader.pages):
            print(f"Page {i+1}:")
            print(page.extract_text())
        
        print("\n--- PYPDF FIELDS ---")
        try:
            fields = reader.get_fields()
            if fields:
                for field_name, value in fields.items():
                    print(f"Field: {field_name}, Value: {value}")
            else:
                print("No form fields found.")
        except Exception as e:
            print(f"Error extracting fields: {e}")

    except ImportError:
        print("pypdf not installed")

def try_pdfminer():
    try:
        from pdfminer.high_level import extract_text
        from pdfminer.layout import LAParams
        print("\n--- PDFMINER TEXT (LAParams) ---")
        text = extract_text(r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\ANALISIS DE EXIGENCIA TO.pdf", laparams=LAParams())
        print(text)
    except ImportError:
        print("pdfminer not installed")

if __name__ == "__main__":
    try_pypdf()
    try_pdfminer()
