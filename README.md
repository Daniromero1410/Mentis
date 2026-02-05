# Sistema de Valoración Psicológica para Recomendaciones Laborales

Este proyecto es una aplicación web integral diseñada para la gestión, evaluación y generación de informes de Valoraciones Psicológicas y Pruebas de Trabajo de Esfera Mental. Su objetivo es facilitar a los profesionales de la salud ocupacional la recolección de datos, el cálculo de niveles de riesgo psicosocial y la emisión de conceptos y recomendaciones fundamentadas.

## Marco Teórico

El sistema se fundamenta en la evaluación de factores de riesgo psicosocial, siguiendo metodologías estandarizadas que permiten identificar, evaluar y monitorear la exposición a riesgos en el entorno laboral.

### Dimensiones Evaluadas

El módulo de Pruebas de Trabajo de Esfera Mental evalúa siete dimensiones críticas del riesgo psicosocial:

1.  **Demandas Cuantitativas**: Volumen de trabajo, ritmo acelerado y presión de tiempo.
2.  **Demandas de Carga Mental**: Esfuerzo cognitivo, memoria, atención y concentración requeridos.
3.  **Demandas Emocionales**: Exposición a emociones negativas o situaciones de alta tensión emocional en el trabajo.
4.  **Exigencias de Responsabilidad**: Responsabilidad directa por personas, bienes, dinero o información confidencial.
5.  **Consistencia del Rol**: Contradicciones en las funciones, falta de recursos o claridad en las expectativas.
6.  **Demandas Ambientales y de Esfuerzo Físico**: Condiciones del entorno (ruido, iluminación, temperatura) y exigencias físicas.
7.  **Demandas de la Jornada de Trabajo**: Turnos, trabajo nocturno, horas extras y pausas.

### Metodología de Evaluación

Para cada dimensión, el sistema permite:
*   **Valoración Subjetiva del Trabajador**: Recolección de la percepción del trabajador sobre cada factor.
*   **Valoración del Experto**: Análisis profesional basado en entrevistas, observación y revisión documental.
*   **Cálculo de Niveles de Riesgo**: Uso de baremos predefinidos para clasificar el riesgo en niveles: Sin Riesgo, Bajo, Medio, Alto y Muy Alto.
*   **Generación de Conceptos con IA**: Asistencia automatizada para generar análisis preliminares y recomendaciones basadas en los hallazgos.

## Estructura del Proyecto

La solución está dividida en una arquitectura cliente-servidor moderna:

### Backend (`/backend`)
Desarrollado en **Python** utilizando **FastAPI**. Sus principales responsabilidades son:
*   **API REST**: Gestión de endpoints para valoraciones, usuarios, autenticación y pruebas de trabajo.
*   **Base de Datos**: Modelado y persistencia de datos utilizando **SQLModel**.
*   **Generación de Documentos**: Creación dinámica de reportes PDF profesionales utilizando **ReportLab**, incluyendo tablas de resultados y gráficos de riesgo.
*   **Inteligencia Artificial**: Servicios para el análisis de riesgo y generación de texto predictivo para los conceptos.

### Frontend (`/frontend`)
Desarrollado en **TypeScript** utilizando **Next.js** y **React**. Sus características incluyen:
*   **Interfaz de Usuario (UI)**: Diseño limpio y responsivo utilizando **Tailwind CSS** y componentes de **ShadCN UI**.
*   **Wizard de Evaluación**: Formularios paso a paso para diligenciar las pruebas de trabajo de manera ordenada.
*   **Gestión de Estado**: Manejo eficiente de formularios complejos con validaciones en tiempo real (Zod, React Hook Form).
*   **Interacción con API**: Comunicación fluida con el backend mediante Axios.

## Requisitos de Instalación

Asegúrese de tener instalado en su sistema:
*   **Python 3.10+**
*   **Node.js 18+** y npm
*   **Git**

## Guía de Instalación y Ejecución

### 1. Configuración del Backend

Navegue al directorio del backend:
```bash
cd backend
```

Cree un entorno virtual (recomendado):
```bash
python -m venv venv
```

Active el entorno virtual:
*   En Windows: `.\venv\Scripts\activate`
*   En macOS/Linux: `source venv/bin/activate`

Instale las dependencias:
```bash
pip install -r requirements.txt
```

Inicie el servidor de desarrollo:
```bash
python -m uvicorn app.main:app --reload
```
El backend estará disponible en `http://localhost:8000`. La documentación interactiva (Swagger UI) se encuentra en `http://localhost:8000/docs`.

### 2. Configuración del Frontend

Abra una nueva terminal y navegue al directorio del frontend:
```bash
cd frontend
```

Instale las dependencias de Node.js:
```bash
npm install
```

Inicie el servidor de desarrollo:
```bash
npm run dev
```
La aplicación web estará disponible en `http://localhost:3000`.

## Uso del Sistema

1.  **Inicio de Sesión**: Ingrese con sus credenciales de profesional autorizado.
2.  **Dashboard**: Acceda al panel principal para gestionar valoraciones y pruebas.
3.  **Nueva Prueba de Trabajo**:
    *   Utilice el botón "Nueva Prueba".
    *   Complete los pasos del asistente: Identificación, Contexto, Descripción, Factores de Riesgo y Resumen.
    *   En la sección de Factores de Riesgo, califique frecuencia, exposición e intensidad para cada ítem.
    *   Genere el concepto asistido por IA si lo desea.
4.  **Finalización**: Guarde la prueba y descargue el informe en formato PDF generado automáticamente.

## Licencia y Propiedad

Este software es propiedad exclusiva de su organización. Prohibida su distribución no autorizada.
