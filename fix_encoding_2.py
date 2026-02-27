import os

replacements = {
    'ü³': 'ó',
    'ü¡': 'á',
    'ü©': 'é',
    'ü­': 'í',
    'üº': 'ú',
    'ü±': 'ñ',
    'ü ': 'Á',
    'ü¼': 'ü',
    'ü“': 'Ó',
    'ü‘': 'Ñ',
    'ü‰': 'É',
    'üš': 'Ú'
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    modified = False
    for bad, good in replacements.items():
        if bad in content:
            content = content.replace(bad, good)
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

base_dir = r'c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\frontend\app\dashboard\analisis-exigencias-mental'
components_dir = r'c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\frontend\components\analisis-exigencias-mental'

for d in [base_dir, components_dir]:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                fix_file(os.path.join(root, file))

print("Done.")
