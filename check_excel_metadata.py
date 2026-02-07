import sys
import os
from openpyxl import load_workbook

# Add current dir to path
sys.path.append(os.getcwd())

f = "backend/app/services/plantilla_valoracion_simple.xlsx"

if os.path.exists(f):
    print(f"--- CHECKING {f} ---")
    try:
        wb = load_workbook(f)
        props = wb.properties
        print(f"Title: {props.title}")
        print(f"Subject: {props.subject}")
        print(f"Author: {props.creator}")
        print(f"Keywords: {props.keywords}")
        print(f"Category: {props.category}")
        print(f"Description: {props.description}")
        
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"File not found: {f}")
