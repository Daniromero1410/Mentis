# Sistema de Valoración Psicológica para Recomendaciones Laborales

Este proyecto es una aplicación web integral diseñada para la gestión, evaluación y generación de informes de Valoraciones Psicológicas y Pruebas de Trabajo de Esfera Mental. Su objetivo es facilitar a los profesionales de la salud ocupacional la recolección de datos, el cálculo de niveles de riesgo psicosocial y la emisión de conceptos y recomendaciones fundamentadas.

---

## 🛑 Requisitos Previos (OBLIGATORIO)

Antes de comenzar la instalación en cualquier computadora, asegúrese de tener instalado el siguiente software:

1. **[Git](https://git-scm.com/downloads)** (Para clonar y gestionar el repositorio)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Necesario para ejecutar la base de datos PostgreSQL)
    - *Nota:* Asegúrese de que Docker Desktop esté siempre abierto y ejecutándose en segundo plano antes de correr el proyecto.
3. **[Python 3.10+](https://www.python.org/downloads/)**
    - *IMPORTANTE (Windows):* Durante la instalación de Python, asegúrese de marcar la casilla **"Add Python to PATH"** en la primera pantalla.
4. **[Node.js 18+](https://nodejs.org/)** (Incluye `npm` necesario para el frontend)

---

## 🚀 Instalación Rápida y Automatizada (Recomendado para Windows)

Para facilitar la configuración en Windows, el proyecto cuenta con un script que hará la instalación casi automática:

1. Abra **Docker Desktop** y espere a que inicie correctamente.
2. Haga **doble clic en el archivo `setup_local.bat`** que se encuentra en la raíz de este proyecto.
3. El script automáticamente:
   - Configurará las variables de entorno necesarias.
   - Levantará la base de datos PostgreSQL en Docker.
   - Creará el entorno de Python e instalará el backend.
   - Instalará todas las dependencias del frontend (Node.js).
4. Cuando termine satisfactoriamente, puede cerrar la ventana del script y proceder directamente a la sección **"Cómo Ejecutar el Proyecto"**.

---

## 🛠 Instalación Manual (Windows / macOS / Linux)

Si el script anterior falla, está en macOS/Linux, o desea configurar todo manualmente, siga estos pasos estrictamente en orden:

### Paso 1: Configurar Variables de Entorno
1. Entre en la carpeta `backend/`. Copie el archivo `.env.example`, y pegue creando uno nuevo llamado `.env`. (No necesita modificar los valores por defecto para desarrollo local).
2. Entre en la carpeta `frontend/`. Copie el archivo `.env.example`, y pegue creando uno nuevo llamado `.env.local`.

### Paso 2: Levantar la Base de Datos
Abra una terminal en la **carpeta principal** del proyecto (donde está este README) y ejecute:
```bash
docker compose up -d
```
*Esto descargará PostgreSQL y ejecutará la base de datos en segundo plano.*

### Paso 3: Configurar el Backend (Python)
1. Abra una nueva terminal y navegue a la carpeta del backend: `cd backend`
2. Cree un entorno virtual para aislar las dependencias:
   ```bash
   python -m venv venv
   ```
3. Active el entorno virtual:
   - En Windows: `.\venv\Scripts\activate`
   - En macOS/Linux: `source venv/bin/activate`
4. Instale las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```

### Paso 4: Configurar el Frontend (Node.js)
1. Abra una nueva terminal y navegue a la carpeta del frontend: `cd frontend`
2. Instale las dependencias de React/Next.js:
   ```bash
   npm install
   ```

---

## ▶️ Cómo Ejecutar el Proyecto Diariamente

Siempre que vaya a trabajar en el proyecto, debe hacer tres cosas:

1. **Asegúrese de que la base de datos esté corriendo**: Abra **Docker Desktop** y verifique que el contenedor `william_romero_db` esté en verde (🏃 Running). Si no está corriendo en la lista, dele Play.
   
2. **Abra una terminal para el Backend**:
   - Vaya a la carpeta del backend.
   - Active el entorno: `.\venv\Scripts\activate` (Windows) o `source venv/bin/activate` (Mac/Linux).
   - Ejecute el servidor: `python -m uvicorn app.main:app --reload`
   - *El backend estará disponible en `http://localhost:8000`*

3. **Abra otra terminal independiente para el Frontend**:
   - Vaya a la carpeta del frontend.
   - Ejecute el servidor: `npm run dev`
   - *El frontend estará disponible en `http://localhost:3000`*

---

## 📖 Arquitectura y Marco Teórico

### Dimensiones Evaluadas (Pruebas de Trabajo)
El módulo de Pruebas de Trabajo de Esfera Mental evalúa siete dimensiones críticas del riesgo psicosocial:
1. **Demandas Cuantitativas**: Volumen de trabajo, ritmo acelerado y presión.
2. **Demandas de Carga Mental**: Esfuerzo cognitivo, memoria y atención.
3. **Demandas Emocionales**: Exposición a emociones negativas o tensión.
4. **Exigencias de Responsabilidad**: Responsabilidad directa por personas o bienes.
5. **Consistencia del Rol**: Contradicciones en las funciones.
6. **Demandas Ambientales y de Esfuerzo Físico**: Condiciones del entorno.
7. **Demandas de la Jornada de Trabajo**: Turnos, horas extras y pausas.

### Uso del Sistema
1. **Inicio de Sesión**: Ingrese con sus credenciales de profesional autorizado.
2. **Dashboard**: Acceda al panel principal para gestionar valoraciones y pruebas.
3. **Nueva Prueba de Trabajo**: Complete los pasos del asistente (Identificación, Contexto, Factores, etc.) y genere el concepto asistido por IA.
4. **Finalización**: Descargue el informe en formato PDF.

### Estructura del Código
* **Backend (`/backend`)**: Desarrollado en **Python** utilizando **FastAPI**. Modelado con **SQLModel**, generación de PDFs profesionales con **ReportLab**, y servicios para el análisis de riesgo y generación de texto asistido por IA.
* **Frontend (`/frontend`)**: Desarrollado en **TypeScript** utilizando **Next.js** y **React**. Diseño responsivo utilizando **Tailwind CSS** y componentes de **ShadCN UI**. Formulario paso a paso tipo Wizard.

La solución es una arquitectura moderna cliente-servidor, con persistencia en **PostgreSQL** a través de **Docker**.

---

**Licencia y Propiedad**: Este software es propiedad exclusiva de Gestión Innovación S.A.S. Prohibida su distribución no autorizada.
