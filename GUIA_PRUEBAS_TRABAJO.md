# Módulo de Pruebas de Trabajo de Esfera Mental

## 📋 Descripción General

Este módulo implementa un sistema completo para realizar **Pruebas de Trabajo de Esfera Mental**, incluyendo:
- Formulario interactivo de 12 pasos
- Evaluación de 33 condiciones de riesgo psicosocial en 7 dimensiones
- Comparación entre valoración del trabajador vs. experto
- Generación automática de PDF profesional
- Integración futura con modelo ML para generar conceptos psicológicos

## 🎯 Objetivo

Crear evaluaciones psicológicas completas que permitan a profesionales de SST (Seguridad y Salud en el Trabajo) evaluar las condiciones de riesgo psicosocial de un puesto de trabajo y generar recomendaciones laborales basadas en evidencia.

## 🗂️ Estructura del Proyecto

### Backend (FastAPI + SQLModel + PostgreSQL)

```
backend/
├── app/
│   ├── models/
│   │   └── prueba_trabajo.py          # 8 tablas relacionadas
│   ├── schemas/
│   │   └── prueba_trabajo.py          # Pydantic schemas
│   ├── routers/
│   │   └── pruebas_trabajo.py         # 13 endpoints REST API
│   ├── services/
│   │   └── pdf_generator_prueba_trabajo.py  # Generación de PDF
│   ├── database/
│   │   └── connection.py              # Conexión DB
│   └── main.py                        # FastAPI app
```

### Frontend (Next.js 14 + TypeScript + Tailwind + Shadcn/ui)

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── pruebas-trabajo/
│   │       ├── page.tsx                    # Lista de pruebas
│   │       ├── nueva/
│   │       │   └── page.tsx                # Redirección automática
│   │       └── [id]/
│   │           ├── page.tsx                # Vista de detalle
│   │           └── evaluar/
│   │               └── page.tsx            # Formulario de 12 pasos
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx                 # Navegación
│   └── services/
│       └── api.ts                          # Cliente HTTP
```

## 📊 Modelo de Datos

### 1. PruebaTrabajo (Tabla Principal)
```python
- id: int (PK)
- estado: EstadoPrueba (BORRADOR | COMPLETADA)
- fecha_creacion: datetime
- fecha_actualizacion: datetime
- fecha_finalizacion: datetime | None
- creado_por: int (FK → usuarios)
```

### 2. DatosEmpresaPrueba
```python
- id: int (PK)
- prueba_id: int (FK único)
- empresa: str
- tipo_documento: str
- nit: str
- persona_contacto: str
- email_notificaciones: str
- direccion: str
- arl: str
- ciudad: str
```

### 3. TrabajadorPrueba
```python
- id: int (PK)
- prueba_id: int (FK único)
# Identificación
- nombre: str
- identificacion: str
- fecha_nacimiento: date
- edad: int
- genero: str
# Educación y salud
- escolaridad: str
- nivel_educativo: str
- eps: str
# Información laboral
- puesto_trabajo_evaluado: str
- cargo: str
- area: str
- fecha_ingreso_empresa: date
- fecha_ingreso_puesto_evaluado: date
- antiguedad_empresa: str (ej: "2 años 3 meses")
- antiguedad_puesto_evaluado: str
- antiguedad_cargo: str
# Información médica
- diagnostico: str
- codigo_cie10: str
- fecha_siniestro: date
```

### 4. DatosEvaluador
```python
- id: int (PK)
- prueba_id: int (FK único)
- nombre: str
- identificacion: str
- formacion: str
- tarjeta_profesional: str
- licencia_sst: str
- fecha_evaluacion: date
```

### 5. SeccionesPrueba
```python
- id: int (PK)
- prueba_id: int (FK único)
# Secciones de texto libre
- metodologia: str
- revision_documental: str
- descripcion_puesto: str
- condicion_actual: str
- descripcion_funciones: str
# Participantes
- participante_trabajador: str
- participante_jefe: str
- participante_cargo_jefe: str
# Fuentes de recolección de información
- fuente_trabajador_fecha: date
- fuente_jefe_fecha: date
- fuente_par_fecha: date
# Aspectos Ocupacionales
- nombre_puesto: str
- area_puesto: str
- antiguedad_cargo_ocupacional: str
- antiguedad_empresa_ocupacional: str
- nivel_educativo_requerido: str
- jornada_laboral: str
- horas_extras: str
- turnos: str
```

### 6. CondicionRiesgoPrueba (33 condiciones totales)
```python
- id: int (PK)
- prueba_id: int (FK)
- dimension: DimensionRiesgo (enum)
- item_numero: int (1-10 dependiendo de la dimensión)
- condicion_texto: str (ej: "Ritmo de trabajo acelerado")
- descripcion_detallada: str (explicación del experto)
# Calificaciones (0-7 cada una)
- frecuencia: int (0-7)
- exposicion: int (0-7)
- intensidad: int (0-7)
- total_condicion: int (0-21, suma automática)
- fuentes_informacion: str
```

### 7. ResumenFactorPrueba
```python
- id: int (PK)
- prueba_id: int (FK)
- dimension: DimensionRiesgo
- num_items: int
- puntuacion_total: int (suma vertical)
# Comparación Trabajador vs Experto
- nivel_riesgo_trabajador: NivelRiesgo (enum)
- nivel_riesgo_experto: NivelRiesgo (enum)
- factores_detectados_trabajador: str
- factores_detectados_experto: str
- observaciones_experto: str
```

### 8. ConceptoFinalPrueba
```python
- id: int (PK)
- prueba_id: int (FK único)
# Análisis de concordancia
- conclusion_evaluacion: str
- concordancia_items: str
- no_concordancia_items: str
# Conceptos (ML o manual)
- concepto_generado_ml: str (generado por IA)
- conclusiones_finales: str (editado por profesional)
- recomendaciones: str
- firma_evaluador: str (path a imagen)
```

## 🎨 Dimensiones de Riesgo Psicosocial

### 1. Demandas Cuantitativas (3 ítems)
1. Ritmo de trabajo acelerado
2. Volumen de tareas elevado
3. Tiempo insuficiente para completar tareas

### 2. Demandas de Carga Mental (5 ítems)
1. Necesidad de atención sostenida
2. Complejidad de las tareas
3. Cantidad de información a procesar
4. Necesidad de tomar decisiones complejas
5. Concentración requerida

### 3. Demandas Emocionales (3 ítems)
1. Manejo de situaciones emocionalmente difíciles
2. Contacto con público o usuarios
3. Control de emociones ante situaciones laborales

### 4. Exigencias de Responsabilidad (6 ítems)
1. Responsabilidad sobre resultados críticos
2. Supervisión de otros trabajadores
3. Manejo de recursos importantes
4. Toma de decisiones importantes
5. Impacto de errores en la organización
6. Responsabilidad sobre la seguridad de otros

### 5. Consistencia de Rol (4 ítems)
1. Claridad de las funciones del puesto
2. Instrucciones claras y consistentes
3. Definición de objetivos
4. Demandas contradictorias

### 6. Demandas Ambientales (10 ítems)
1. Ruido en el ambiente laboral
2. Iluminación inadecuada
3. Temperatura extrema
4. Exposición a agentes químicos
5. Esfuerzo físico intenso
6. Posturas forzadas
7. Movimientos repetitivos
8. Manipulación de cargas
9. Espacios de trabajo reducidos
10. Vibraciones

### 7. Demandas de Jornada (2 ítems)
1. Jornadas de trabajo extendidas
2. Trabajo en turnos rotativos o nocturnos

**Total: 33 condiciones de riesgo**

## 📝 Sistema de Calificación FR/EXP/INT

Cada condición se califica en 3 dimensiones:

### Frecuencia (FR): 0-7
- 0: Nunca
- 1-2: Raramente
- 3-4: Ocasionalmente
- 5-6: Frecuentemente
- 7: Siempre

### Exposición (EXP): 0-7
- 0: Ninguna exposición
- 1-2: Baja exposición
- 3-4: Moderada exposición
- 5-6: Alta exposición
- 7: Exposición continua

### Intensidad (INT): 0-7
- 0: Sin impacto
- 1-2: Impacto leve
- 3-4: Impacto moderado
- 5-6: Impacto significativo
- 7: Impacto severo

**Total por condición: 0-21 (FR + EXP + INT)**

## 🔄 Flujo de Trabajo

### 1. Crear Nueva Prueba
```
Usuario hace clic en "Nueva Prueba"
  ↓
Se crea automáticamente una prueba vacía en BORRADOR
  ↓
Redirección al formulario de 12 pasos
  ↓
El usuario completa los datos paso a paso
```

### 2. Formulario de 12 Pasos

#### **Paso 1: Metodología y Participantes**
- Metodología de evaluación
- Datos del trabajador participante
- Datos del jefe inmediato
- Fechas de entrevistas (trabajador, jefe, par)

#### **Paso 2: Revisión Documental**
- Documentos revisados
- Descripción del puesto de trabajo
- Condición actual del trabajador

#### **Paso 3: Aspectos Ocupacionales**
- Nombre del puesto
- Área de trabajo
- Antigüedad en cargo y empresa
- Nivel educativo requerido
- Jornada laboral
- Horas extras
- Turnos
- Descripción detallada de funciones

#### **Pasos 4-10: Evaluación de Condiciones de Riesgo**
Cada paso evalúa UNA dimensión de riesgo:
- Paso 4: Demandas Cuantitativas (3 ítems)
- Paso 5: Demandas de Carga Mental (5 ítems)
- Paso 6: Demandas Emocionales (3 ítems)
- Paso 7: Exigencias de Responsabilidad (6 ítems)
- Paso 8: Consistencia de Rol (4 ítems)
- Paso 9: Demandas Ambientales (10 ítems)
- Paso 10: Demandas de Jornada (2 ítems)

Para cada ítem:
- FR (0-7)
- EXP (0-7)
- INT (0-7)
- Total automático (0-21)
- Descripción detallada del factor
- Fuentes de información utilizadas

#### **Paso 11: Resumen de Factores (Trabajador vs Experto)**
Para cada dimensión:
- Nivel de riesgo percibido por el trabajador
- Nivel de riesgo evaluado por el experto
- Factores detectados por el trabajador (lista)
- Factores detectados por el experto (lista)
- Observaciones del experto

Niveles de riesgo:
1. Sin Riesgo
2. Riesgo Bajo
3. Riesgo Medio
4. Riesgo Alto
5. Riesgo Muy Alto

#### **Paso 12: Conclusiones Finales**
- Conclusión general de la evaluación
- Ítems con concordancia (trabajador/experto)
- Ítems sin concordancia (trabajador/experto)
- **Concepto generado por ML** (automático) o manual
- Conclusiones finales editables
- Recomendaciones
- Firma del evaluador

### 3. Auto-Guardado como Borrador
```
Usuario completa un paso
  ↓
Hace clic en "Siguiente"
  ↓
Se guarda automáticamente en estado BORRADOR
  ↓
Puede cerrar y volver más tarde
```

### 4. Finalizar y Generar PDF
```
Usuario completa todos los pasos
  ↓
Hace clic en "Finalizar y Generar PDF"
  ↓
El sistema:
  1. Valida que todos los campos requeridos estén completos
  2. Cambia el estado a COMPLETADA
  3. Genera el PDF profesional
  4. Retorna URL de descarga
```

## 🚀 Endpoints del API

### Prueba Principal
```
POST   /pruebas-trabajo/                     # Crear nueva prueba
GET    /pruebas-trabajo/                     # Listar pruebas
GET    /pruebas-trabajo/{id}                 # Obtener prueba
PUT    /pruebas-trabajo/{id}                 # Actualizar prueba
DELETE /pruebas-trabajo/{id}                 # Eliminar prueba
POST   /pruebas-trabajo/{id}/finalizar       # Finalizar y generar PDF
GET    /pruebas-trabajo/{id}/descargar-pdf   # Descargar PDF generado
```

### Entidades Relacionadas
```
POST   /pruebas-trabajo/{id}/datos-empresa   # Guardar datos empresa
GET    /pruebas-trabajo/{id}/datos-empresa   # Obtener datos empresa

POST   /pruebas-trabajo/{id}/trabajador      # Guardar trabajador
GET    /pruebas-trabajo/{id}/trabajador      # Obtener trabajador

POST   /pruebas-trabajo/{id}/evaluador       # Guardar evaluador
GET    /pruebas-trabajo/{id}/evaluador       # Obtener evaluador

POST   /pruebas-trabajo/{id}/secciones       # Guardar secciones
GET    /pruebas-trabajo/{id}/secciones       # Obtener secciones

POST   /pruebas-trabajo/{id}/condiciones-riesgo  # Guardar condiciones
GET    /pruebas-trabajo/{id}/condiciones-riesgo  # Obtener condiciones

POST   /pruebas-trabajo/{id}/resumen-factores    # Guardar resumen
GET    /pruebas-trabajo/{id}/resumen-factores    # Obtener resumen

POST   /pruebas-trabajo/{id}/concepto-final      # Guardar concepto
GET    /pruebas-trabajo/{id}/concepto-final      # Obtener concepto
```

## 📄 Generación de PDF

El PDF generado incluye:

### **Página 1: Datos Generales**
- Encabezado con título
- Datos de la Empresa (8 campos)
- Datos del Trabajador (19 campos con fechas formateadas)
- Datos del Evaluador (6 campos)

### **Página 2: Secciones Descriptivas**
- Metodología
- Participantes (trabajador, jefe, cargo del jefe)
- Fuentes de Recolección de Información (fechas de entrevistas)
- Revisión Documental
- Descripción del Puesto de Trabajo
- Condición Actual del Trabajador
- Aspectos Ocupacionales (8 campos)
- Descripción de Funciones

### **Páginas 3-N: Evaluación de Riesgos**
Tabla con todas las 33 condiciones evaluadas:
- Dimensión
- Número de ítem
- Condición evaluada
- FR (0-7)
- EXP (0-7)
- INT (0-7)
- Total (0-21)
- Descripción detallada
- Fuentes de información

### **Página N+1: Resumen de Factores**
Tabla comparativa trabajador vs experto:
- Dimensión
- Nivel de Riesgo - Trabajador
- Nivel de Riesgo - Experto
- Factores Detectados - Trabajador
- Factores Detectados - Experto

### **Última Página: Conclusiones**
- Conclusión de la Evaluación
- Ítems con Concordancia
- Ítems sin Concordancia
- **CONCLUSIONES FINALES - PRUEBA DE TRABAJO DE ESFERA MENTAL**
  (usa `conclusiones_finales` o `concepto_generado_ml`)
- Recomendaciones
- Firma del Evaluador

## 🤖 Integración con Machine Learning (Futuro)

### Campo Preparado: `concepto_generado_ml`

El campo `ConceptoFinalPrueba.concepto_generado_ml` está listo para recibir un concepto psicológico generado automáticamente por un modelo de ML.

### Input para el Modelo ML
```json
{
  "prueba_id": 123,
  "dimensiones": [
    {
      "dimension": "demandas_cuantitativas",
      "nivel_riesgo_experto": "riesgo_alto",
      "factores_detectados_experto": "Ritmo acelerado, volumen alto",
      "puntuacion_total": 45
    },
    // ... 6 dimensiones más
  ],
  "trabajador": {
    "diagnostico": "Trastorno adaptativo",
    "codigo_cie10": "F43.2",
    "edad": 35,
    "antiguedad_empresa": "3 años"
  }
}
```

### Output Esperado del Modelo ML
```json
{
  "concepto_generado": "Con base en la evaluación realizada, el trabajador presenta un perfil de riesgo psicosocial ALTO, caracterizado principalmente por demandas cuantitativas excesivas y carga mental elevada. Se recomienda implementar medidas de control inmediato en las siguientes áreas: reorganización de tareas, pausas activas regulares, y capacitación en técnicas de manejo del estrés. Dado el diagnóstico previo de trastorno adaptativo, se sugiere seguimiento psicológico periódico durante el proceso de reintegro laboral..."
}
```

### Flujo de Integración ML
```
Usuario completa Paso 11 (Resumen de Factores)
  ↓
Hace clic en "Generar Concepto Automáticamente" (botón futuro)
  ↓
Frontend envía datos al endpoint ML
  ↓
Modelo ML analiza:
  - Niveles de riesgo por dimensión
  - Factores detectados
  - Diagnóstico del trabajador
  - Perfil sociodemográfico
  ↓
Modelo genera concepto profesional
  ↓
Se guarda en concepto_generado_ml
  ↓
El profesional puede editar en conclusiones_finales
```

## 🎨 Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLModel**: ORM con validación Pydantic integrada
- **PostgreSQL**: Base de datos relacional
- **ReportLab**: Generación de PDF multiplataforma
- **Pydantic**: Validación de datos
- **Python 3.11+**

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utility-first
- **Shadcn/ui**: Componentes UI (Card, Button, Input, Textarea, Label)
- **Lucide Icons**: Iconos modernos
- **Sonner**: Notificaciones toast
- **React Hooks**: useState, useEffect, useRouter, useParams

## 📦 Instalación y Despliegue

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variables de Entorno

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
APP_NAME=Sistema de Valoración Psicológica
SECRET_KEY=your-secret-key
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔐 Seguridad

- **Autenticación**: JWT tokens
- **Autorización**: Solo usuarios autenticados pueden crear/editar pruebas
- **Validación**: Pydantic valida todos los datos de entrada
- **CORS**: Configurado para permitir solo orígenes autorizados
- **SQL Injection**: Protección automática con SQLModel

## ⚡ Optimizaciones

1. **Auto-guardado**: Previene pérdida de datos
2. **Carga lazy**: Solo carga datos cuando son necesarios
3. **Validación client-side**: Reduce llamadas al servidor
4. **PDF caching**: Los PDFs generados se guardan en disco
5. **Índices DB**: Consultas optimizadas con índices en foreign keys

## 📝 Convenciones de Código

### Python (Backend)
- **PEP 8**: Guía de estilo estándar
- **Type hints**: Siempre usar anotaciones de tipo
- **Docstrings**: Documentar funciones complejas
- **Nombres**: snake_case para variables y funciones

### TypeScript (Frontend)
- **Naming**: camelCase para variables, PascalCase para componentes
- **Interfaces**: Definir tipos para todas las estructuras de datos
- **Componentes**: Un componente por archivo
- **Hooks**: Preferir hooks sobre clases

## 🐛 Debugging

### Backend
```python
# Activar logging detallado
import logging
logging.basicConfig(level=logging.DEBUG)

# Ver queries SQL
from sqlmodel import create_engine
engine = create_engine(DATABASE_URL, echo=True)
```

### Frontend
```typescript
// React DevTools en navegador
// Ver estado y props de componentes

// Console logs
console.log('FormData:', formData);
console.log('Current Step:', currentStep);
```

## 📚 Recursos Adicionales

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación SQLModel](https://sqlmodel.tiangolo.com/)
- [Documentación ReportLab](https://www.reportlab.com/docs/)
- [Documentación Shadcn/ui](https://ui.shadcn.com/)

## 🆘 Soporte

Para reportar bugs o solicitar features:
1. Describir el problema claramente
2. Incluir pasos para reproducir
3. Proveer logs relevantes
4. Incluir screenshots si aplica

## 📄 Licencia

Propiedad de GESTAR INNOVACION S.A.S - Todos los derechos reservados

---

**Versión del Documento**: 1.0
**Última Actualización**: 26 de Enero de 2026
**Autor**: Claude Sonnet 4.5 (Anthropic)
**Mantenedor**: Equipo de Desarrollo GESTAR
