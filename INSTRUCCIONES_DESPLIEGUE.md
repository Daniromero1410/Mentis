# GUIA COMPLETA DE DESPLIEGUE - MENTIS

Sistema de Psicologia Ocupacional

---

## INDICE

1. [Requisitos Previos](#1-requisitos-previos)
2. [Crear Repositorio en GitHub](#2-crear-repositorio-en-github)
3. [Desplegar Backend en Railway](#3-desplegar-backend-en-railway)
4. [Desplegar Frontend en Vercel](#4-desplegar-frontend-en-vercel)
5. [Configurar Variables de Entorno](#5-configurar-variables-de-entorno)
6. [Verificar el Despliegue](#6-verificar-el-despliegue)
7. [Solucion de Problemas](#7-solucion-de-problemas)

---

## 1. REQUISITOS PREVIOS

Antes de comenzar, asegurate de tener:

- [ ] Cuenta en [GitHub](https://github.com) (gratis)
- [ ] Cuenta en [Railway](https://railway.app) (tiene plan gratis con $5 USD/mes de credito)
- [ ] Cuenta en [Vercel](https://vercel.com) (plan gratis disponible)
- [ ] Git instalado en tu computadora
- [ ] Node.js instalado (para pruebas locales del frontend)

---

## 2. CREAR REPOSITORIO EN GITHUB

### Paso 2.1: Crear el repositorio

1. Ve a [GitHub](https://github.com) e inicia sesion
2. Haz clic en el boton verde **"New"** o ve a https://github.com/new
3. Configura el repositorio:
   - **Repository name:** `mentis-psicologia` (o el nombre que prefieras)
   - **Description:** Sistema de Psicologia Ocupacional
   - **Visibility:** Private (recomendado) o Public
   - **NO** marques "Add a README file" (ya tenemos uno)
   - **NO** selecciones .gitignore (ya lo tenemos)
4. Haz clic en **"Create repository"**

### Paso 2.2: Subir el codigo al repositorio

Abre una terminal/PowerShell en la carpeta del proyecto (`william-romero`) y ejecuta:

```bash
# Inicializar repositorio git (si no existe)
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial commit: Sistema Mentis - Psicologia Ocupacional"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/mentis-psicologia.git

# Subir el codigo
git branch -M main
git push -u origin main
```

### Paso 2.3: Verificar

- Ve a tu repositorio en GitHub
- Deberias ver las carpetas `backend/` y `frontend/`

---

## 3. DESPLEGAR BACKEND EN RAILWAY

### Paso 3.1: Crear proyecto en Railway

1. Ve a [Railway](https://railway.app) e inicia sesion con tu cuenta de GitHub
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tus repositorios
5. Selecciona el repositorio `mentis-psicologia`

### Paso 3.2: Configurar el servicio del Backend

1. Railway detectara automaticamente el proyecto
2. Haz clic en **"Add Service"** > **"GitHub Repo"**
3. Selecciona tu repositorio nuevamente
4. **MUY IMPORTANTE:** Configura la carpeta raiz:
   - Haz clic en el servicio creado
   - Ve a **Settings** > **Source**
   - En **Root Directory** escribe: `backend`
   - Haz clic en **"Save"**

### Paso 3.3: Agregar base de datos PostgreSQL

1. En tu proyecto de Railway, haz clic en **"New"** > **"Database"** > **"Add PostgreSQL"**
2. Railway creara automaticamente la base de datos
3. La variable `DATABASE_URL` se generara automaticamente

### Paso 3.4: Configurar variables de entorno del Backend

1. Haz clic en el servicio del backend (no la base de datos)
2. Ve a la pestana **"Variables"**
3. Agrega las siguientes variables:

| Variable | Valor |
|----------|-------|
| `SECRET_KEY` | Genera una clave segura (ver abajo) |
| `DEBUG` | `false` |
| `CORS_ORIGINS` | `https://tu-app.vercel.app` (lo actualizaras despues) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` |

**Para generar SECRET_KEY segura:**
- Opcion 1: Usa esta pagina: https://generate-secret.vercel.app/32
- Opcion 2: En Python ejecuta: `python -c "import secrets; print(secrets.token_hex(32))"`

### Paso 3.5: Conectar la base de datos

1. En el servicio del backend, ve a **"Variables"**
2. Haz clic en **"Add Reference"**
3. Selecciona la base de datos PostgreSQL
4. Selecciona `DATABASE_URL` para conectarla automaticamente

### Paso 3.6: Desplegar

1. Railway deberia iniciar el despliegue automaticamente
2. Puedes ver los logs en la pestana **"Deployments"**
3. Espera a que el build termine (puede tomar 5-10 minutos por LibreOffice)

### Paso 3.7: Obtener la URL del backend

1. Ve a **Settings** > **Networking**
2. Haz clic en **"Generate Domain"**
3. Copia la URL generada (ejemplo: `https://mentis-backend-production.up.railway.app`)
4. **GUARDA ESTA URL** - la necesitaras para el frontend

---

## 4. DESPLEGAR FRONTEND EN VERCEL

### Paso 4.1: Crear proyecto en Vercel

1. Ve a [Vercel](https://vercel.com) e inicia sesion con GitHub
2. Haz clic en **"Add New..."** > **"Project"**
3. Importa el repositorio `mentis-psicologia`
4. Vercel detectara que es un proyecto Next.js

### Paso 4.2: Configurar el proyecto

1. **Framework Preset:** Next.js (detectado automaticamente)
2. **Root Directory:** Haz clic en **Edit** y escribe `frontend`
3. **Build Command:** `npm run build` (por defecto)
4. **Output Directory:** `.next` (por defecto)

### Paso 4.3: Configurar variables de entorno

Antes de hacer deploy, agrega la variable de entorno:

1. Expande la seccion **"Environment Variables"**
2. Agrega:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://tu-backend.up.railway.app` (la URL de Railway) |

3. Haz clic en **"Deploy"**

### Paso 4.4: Esperar el despliegue

- Vercel compilara y desplegara el frontend
- Una vez terminado, obtendras una URL como: `https://mentis-frontend.vercel.app`

### Paso 4.5: Configurar dominio personalizado (opcional)

1. Ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado si lo tienes

---

## 5. CONFIGURAR VARIABLES DE ENTORNO

### Paso 5.1: Actualizar CORS en Railway

Ahora que tienes la URL de Vercel, actualiza el CORS en Railway:

1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Ve a **Variables**
4. Actualiza `CORS_ORIGINS`:

```
https://tu-frontend.vercel.app,https://mentis-frontend.vercel.app
```

(Incluye todas las URLs de tu frontend, separadas por coma)

### Paso 5.2: Redesplegar el backend

1. Despues de cambiar variables, Railway redespliega automaticamente
2. Espera a que termine el nuevo despliegue

---

## 6. VERIFICAR EL DESPLIEGUE

### Verificar el Backend

1. Abre la URL del backend en tu navegador: `https://tu-backend.up.railway.app`
2. Deberias ver:
```json
{
  "message": "Bienvenido a Mentis - Psicologia Ocupacional",
  "status": "online",
  "version": "1.0.0"
}
```

3. Verifica el health check: `https://tu-backend.up.railway.app/health`
```json
{
  "status": "healthy"
}
```

4. Verifica LibreOffice: `https://tu-backend.up.railway.app/test/libreoffice`
```json
{
  "installed": true,
  "version": "LibreOffice X.X.X...",
  "message": "LibreOffice esta instalado y funcionando correctamente"
}
```

### Verificar el Frontend

1. Abre la URL del frontend: `https://tu-frontend.vercel.app`
2. Deberias ver la pagina de login
3. Intenta iniciar sesion para verificar la conexion con el backend

### Crear usuario administrador inicial

Si es la primera vez, necesitas crear un usuario admin. Usa la API directamente:

```bash
curl -X POST "https://tu-backend.up.railway.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tuempresa.com",
    "password": "TuPasswordSegura123!",
    "nombre_completo": "Administrador",
    "rol": "ADMIN"
  }'
```

O usa herramientas como Postman/Insomnia para hacer el POST.

---

## 7. SOLUCION DE PROBLEMAS

### Error: CORS no permite la conexion

**Sintoma:** El frontend muestra errores de CORS en la consola del navegador.

**Solucion:**
1. Verifica que `CORS_ORIGINS` en Railway incluya la URL exacta de tu frontend
2. No incluyas `/` al final de las URLs
3. Asegurate de usar `https://` no `http://`

### Error: Base de datos no conecta

**Sintoma:** Error 500 al hacer login o registrar usuarios.

**Solucion:**
1. Ve a Railway y verifica que la base de datos PostgreSQL este corriendo
2. Verifica que `DATABASE_URL` este referenciada correctamente en las variables del backend
3. Revisa los logs del backend en Railway

### Error: LibreOffice no funciona

**Sintoma:** Los PDFs no se generan.

**Solucion:**
1. Verifica en `/test/libreoffice` que este instalado
2. Si no esta instalado, verifica que el Dockerfile se este usando:
   - En Railway > Settings > Source, verifica que Root Directory sea `backend`
3. Fuerza un nuevo despliegue en Railway

### Error: Frontend no carga o muestra pagina en blanco

**Sintoma:** La pagina no carga o muestra errores.

**Solucion:**
1. Verifica en Vercel > Deployments que el build haya sido exitoso
2. Revisa los logs de build en Vercel
3. Verifica que `NEXT_PUBLIC_API_URL` este configurada correctamente
4. Recuerda que las variables `NEXT_PUBLIC_*` requieren rebuild para aplicar cambios

### Error: Token invalido o sesion expira muy rapido

**Solucion:**
1. Verifica que `SECRET_KEY` sea la misma en produccion
2. Ajusta `ACCESS_TOKEN_EXPIRE_MINUTES` si necesitas sesiones mas largas

---

## RESUMEN DE URLs Y VARIABLES

### Variables del Backend (Railway)

| Variable | Ejemplo |
|----------|---------|
| `DATABASE_URL` | (Generada automaticamente por Railway) |
| `SECRET_KEY` | `a1b2c3d4e5f6...` (64 caracteres hex) |
| `DEBUG` | `false` |
| `CORS_ORIGINS` | `https://tu-frontend.vercel.app` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` |

### Variables del Frontend (Vercel)

| Variable | Ejemplo |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://tu-backend.up.railway.app` |

---

## PROXIMOS PASOS

Una vez desplegado:

1. **Configura un dominio personalizado** (opcional pero recomendado)
2. **Habilita backups automaticos** en Railway para PostgreSQL
3. **Configura alertas** en Railway y Vercel para monitorear errores
4. **Crea usuarios iniciales** para tu equipo

---

## SOPORTE

Si tienes problemas:

1. Revisa los logs en Railway (backend) y Vercel (frontend)
2. Verifica que todas las variables de entorno esten correctas
3. Asegurate de que las URLs esten bien escritas (sin espacios, con https)

---

**Fecha de creacion:** $(date)
**Version:** 1.0
