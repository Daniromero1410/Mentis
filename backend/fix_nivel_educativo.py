"""
Script para corregir la sección de nivel educativo en excel_generator.py
"""

# Leer el archivo
with open('app/services/excel_generator.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar y reemplazar la sección de nivel educativo (aproximadamente líneas 112-135)
new_section = '''    # ===== NIVEL EDUCATIVO (Filas 16-18) =====
    if trabajador and trabajador.nivel_educativo:
        nivel_str = trabajador.nivel_educativo.value if hasattr(trabajador.nivel_educativo, 'value') else str(trabajador.nivel_educativo)
        nivel_lower = nivel_str.lower()

        # El nivel_educativo viene como string con valores separados por comas
        # Ejemplo: "Formación empírica, Básica primaria, Técnico/Tecnológico"
        # Revisar cada opción y marcar el checkbox correspondiente

        # Fila 16
        if 'formación empírica' in nivel_lower or 'formacion empirica' in nivel_lower:
            safe_write_cell(ws, 'L16', "X")
        if 'básica primaria' in nivel_lower or 'basica primaria' in nivel_lower:
            safe_write_cell(ws, 'R16', "X")
        if 'bachillerato vocacional' in nivel_lower or 'bachillerato: vocacional' in nivel_lower:
            safe_write_cell(ws, 'X16', "X")

        # Fila 17
        if 'bachillerato modalidad' in nivel_lower or 'bachillerato: modalidad' in nivel_lower:
            safe_write_cell(ws, 'L17', "X")
        if 'técnico' in nivel_lower or 'tecnológico' in nivel_lower:
            safe_write_cell(ws, 'R17', "X")
        if 'universitario' in nivel_lower:
            safe_write_cell(ws, 'X17', "X")

        # Fila 18
        if 'especialización' in nivel_lower or 'postgrado' in nivel_lower or 'maestría' in nivel_lower:
            safe_write_cell(ws, 'L18', "X")
        if 'formación informal' in nivel_lower or 'formacion informal' in nivel_lower:
            safe_write_cell(ws, 'R18', "X")
        if 'analfabeta' in nivel_lower:
            safe_write_cell(ws, 'X18', "X")

'''

# Buscar el inicio y fin de la sección
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if '# ===== NIVEL EDUCATIVO (Filas 16-18) =====' in line:
        start_idx = i
    if start_idx is not None and '# Formación específica (Fila 19)' in line:
        end_idx = i
        break

if start_idx is not None and end_idx is not None:
    print(f'Reemplazando líneas {start_idx+1} a {end_idx}')

    # Crear nuevo contenido
    new_lines = lines[:start_idx] + [new_section] + lines[end_idx:]

    # Guardar
    with open('app/services/excel_generator.py', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print('✅ Archivo actualizado correctamente')
else:
    print(f'❌ Error: No se encontró la sección (start={start_idx}, end={end_idx})')
