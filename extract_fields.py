
try:
    from pdfminer.high_level import extract_text
    print("Using pdfminer")
    text = extract_text(r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\ANALISIS DE EXIGENCIA TO.pdf")
    print(text)
except ImportError:
    try:
        import pypdf
        print("Using pypdf")
        reader = pypdf.PdfReader(r"c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\ANALISIS DE EXIGENCIA TO.pdf")
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except ImportError:
        print("No PDF library found (pdfminer or pypdf)")
