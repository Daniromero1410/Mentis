# Cambios: Plantilla Excel Simplificada

## Resumen

Se ha creado una **plantilla Excel simplificada** que es mucho más fácil de mapear y mantener que la original.

### Comparación

| Aspecto | Plantilla Original | Plantilla Simplificada |
|---------|-------------------|------------------------|
| **Celdas combinadas** | 439 | ~100 |
| **Filas totales** | 118 | ~111 |
| **Complejidad** | ALTA | BAJA |
| **Facilidad de mapeo** | Muy difícil | Fácil |
| **Mantenibilidad** | Baja | Alta |

## Archivos Modificados/Creados

### 1. **Plantilla Nueva**
- **`app/services/plantilla_valoracion_simple.xlsx`** - Nueva plantilla simplificada

### 2. **Generador Actualizado**
- **`app/services/excel_generator.py`** - Actualizado para usar la plantilla simplificada
- **`app/services/excel_generator_simple.py`** - Versión original del nuevo generador

### 3. **Backups**
- **`app/services/excel_generator_complejo.py`** - Backup del generador anterior
- **`app/services/excel_generator.py.backup`** - Otro backup del generador anterior

### 4. **Scripts de Utilidad**
- **`crear_plantilla_simplificada.py`** - Script para generar la plantilla desde cero

## Cambios Principales

### 1. **Estructura Simplificada**

La nueva plantilla tiene 6 secciones claramente definidas:

1. **Identificación del Trabajador** (filas 4-15)
   - Datos personales básicos
   - Checkboxes simples para sexo, estado civil, zona

2. **Información Laboral** (filas 17-24)
   - Datos de la empresa y cargo actual

3. **Historia Ocupacional** (filas 26-33)
   - Tabla con 3 empleos anteriores
   - Otros oficios y oficios de interés

4. **Actividad Laboral Actual** (filas 35-40)
   - Descripción detallada del cargo actual

5. **Factores de Riesgo Psicosociales** (filas 42-99)
   - Tabla con 7 categorías
   - Total de 49 items
   - Columnas SI/NO/N/A

6. **Concepto Final** (filas 101-109)
   - Apariencia, actitud, concepto, recomendaciones
   - Firma del evaluador

### 2. **Mapeo Simplificado**

#### Antes (Plantilla Compleja):
```python
# Nivel educativo - 439 merged cells, mapeo complicado
if 'formación empírica' in nivel_lower:
    safe_write_cell(ws, 'L16', "X")  # Buscar en merged cells
if 'básica primaria' in nivel_lower:
    safe_write_cell(ws, 'R16', "X")  # Más merged cells
# ... muchas más líneas
```

#### Ahora (Plantilla Simple):
```python
# Nivel educativo - simple string
nivel_str = trabajador.nivel_educativo
safe_write_cell(ws, 'B10', nivel_str)  # Una sola celda, simple
```

### 3. **Ventajas de la Nueva Plantilla**

1. **Fácil de Entender**: Referencias de celdas claras (B10, B36, etc.)
2. **Fácil de Modificar**: Cambiar el diseño no requiere reescribir todo el código
3. **Fácil de Depurar**: Cuando algo falla, es fácil identificar qué celda
4. **Menos Errores**: Menos merged cells = menos problemas
5. **Mejor Rendimiento**: Menos procesamiento de merged cells

## Cómo Usar

### Para Generar Excel

El código existente **no requiere cambios**. El generador automáticamente usa la nueva plantilla:

```python
from app.services.excel_generator import generar_excel_valoracion

excel_bytes = generar_excel_valoracion(
    valoracion=valoracion,
    trabajador=trabajador,
    info_laboral=info_laboral,
    historia_ocupacional=historia,
    actividad_laboral=actividad,
    evaluaciones=evaluaciones,
    concepto=concepto,
    guardar_archivo=False
)
```

### Para Modificar la Plantilla

1. **Opción 1**: Editar directamente `plantilla_valoracion_simple.xlsx` en Excel
2. **Opción 2**: Modificar `crear_plantilla_simplificada.py` y regenerar

Si modificas la plantilla y cambias filas, actualiza el mapeo en `excel_generator.py`

## Mapeo de Filas (Referencia Rápida)

### Sección 1: Identificación
- B2-D2: Fecha de valoración (día, mes, año)
- B5: Nombre completo
- B6: Documento
- B7-D7: Fecha de nacimiento (día, mes, año)
- G7: Edad
- B8-C8: Sexo
- B9-F9: Estado civil
- B10: Nivel educativo
- B11: Formación específica
- B12: Teléfonos
- B13: Dirección
- B14-C14: Zona
- B15, D15, F15: Ciudad, Departamento, País

### Sección 2: Info Laboral
- B18: Empresa
- B19: NIT
- B20, D20: Ciudad, Departamento
- B21: Área
- B22: Cargo
- B23, D23: Antigüedad cargo, empresa
- B24: Tipo de contrato

### Sección 3: Historia Ocupacional
- A28-A30: Empresa (3 filas)
- B28-B30: Cargo/Funciones
- E28-E30: Duración
- G28-G30: Motivo retiro
- B32: Otros oficios
- B33: Oficios de interés

### Sección 4: Actividad Laboral
- B36: Nombre del cargo
- B37: Tareas
- B38: Herramientas
- B39: Horario
- B40: EPP

### Sección 5: Factores de Riesgo
- **Demandas Cuantitativas**: Filas 45-48 (4 items)
- **Demandas Carga Mental**: Filas 50-57 (8 items)
- **Demandas Emocionales**: Filas 59-64 (6 items)
- **Exigencias Responsabilidad**: Filas 66-71 (6 items)
- **Consistencia Rol**: Filas 73-79 (7 items)
- **Demandas Ambientales**: Filas 81-94 (14 items)
- **Demandas Jornada**: Filas 96-99 (4 items)

Columnas: G=SI, H=NO, I=N/A

### Sección 6: Concepto Final
- B102: Apariencia personal
- B103: Actitud
- B104: Concepto
- B105: Recomendaciones
- B107: Nombre evaluador
- B109-D109: Fecha firma (día, mes, año)

## Próximos Pasos

1. **Reiniciar el backend** para que use la nueva plantilla:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Probar creando una valoración** desde el frontend

3. **Descargar el Excel generado** y verificar que todo está correcto

4. **Si hay problemas**:
   - Revisa los logs del backend
   - Verifica que `plantilla_valoracion_simple.xlsx` existe
   - Compara el Excel generado con la plantilla

## Rollback (Si es Necesario)

Si necesitas volver a la plantilla anterior:

```bash
cd app/services
cp excel_generator_complejo.py excel_generator.py
# Cambiar PLANTILLA_PATH a 'plantilla_valoracion.xlsx'
```

## Notas

- La plantilla original (`plantilla_valoracion.xlsx`) se mantiene intacta como backup
- Todos los archivos de prueba y análisis están en la raíz de `backend/`
- El formulario web **no requiere cambios** - todo funciona igual
