# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar el sistema completo en Railway (backend) y Vercel (frontend).

## 📋 Requisitos Previos

- Cuenta en [Railway.app](https://railway.app) (gratis)
- Cuenta en [Vercel.com](https://vercel.com) (gratis)
- Tu código en GitHub
- Base de datos PostgreSQL (Railway la proporciona gratis)

---

## 🔧 Parte 1: Despliegue del Backend en Railway

### Paso 1: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona tu repositorio

### Paso 2: Configurar el servicio backend

1. Railway detectará automáticamente el `Dockerfile` en la carpeta `backend`
2. En la configuración del proyecto:
   - **Root Directory**: `backend`
   - Railway usará el Dockerfile automáticamente

### Paso 3: Agregar PostgreSQL

1. En tu proyecto de Railway, clic en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará automáticamente una variable `DATABASE_URL`
3. Esta variable ya estará disponible para tu backend

### Paso 4: Configurar variables de entorno

En Railway, ve a tu servicio backend → **Variables** y agrega:

```env
# Generada automáticamente por Railway
DATABASE_URL=postgresql://...  (ya está configurada)

# Agregar manualmente:
SECRET_KEY=tu-secret-key-super-segura-aqui-cambiar
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Generar SECRET_KEY segura:**
```bash
# En tu terminal local:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Paso 5: Desplegar

1. Railway iniciará el despliegue automáticamente
2. El proceso tomará 3-5 minutos la primera vez (instala LibreOffice)
3. Una vez completado, obtendrás una URL como: `https://tu-app.up.railway.app`

### Paso 6: Verificar que LibreOffice funciona

Visita en tu navegador:
```
https://tu-app.up.railway.app/test/libreoffice
```

Deberías ver:
```json
{
  "installed": true,
  "version": "LibreOffice 7.x.x",
  "platform": "Linux",
  "message": "LibreOffice está instalado y funcionando correctamente"
}
```

### Paso 7: Crear usuario administrador inicial

Usa el endpoint de registro para crear el primer admin:

```bash
curl -X POST https://tu-app.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tuempresa.com",
    "password": "password-seguro",
    "nombre_completo": "Administrador",
    "rol": "admin"
  }'
```

O usa Postman/Insomnia para hacer la petición.

---

## 🎨 Parte 2: Despliegue del Frontend en Vercel

### Paso 1: Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Clic en **"Add New Project"**
3. Selecciona tu repositorio
4. Clic en **"Import"**

### Paso 2: Configurar el proyecto

En la configuración del proyecto:

**Framework Preset**: Next.js (detectado automáticamente)

**Root Directory**: `frontend` ← IMPORTANTE

**Build Settings** (dejar por defecto):
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Paso 3: Configurar variables de entorno

En Vercel, antes de hacer deploy, agrega esta variable de entorno:

```env
NEXT_PUBLIC_API_URL=https://tu-app.up.railway.app
```

⚠️ **IMPORTANTE**: Reemplaza `tu-app.up.railway.app` con la URL real de tu backend en Railway.

### Paso 4: Desplegar

1. Clic en **"Deploy"**
2. Vercel construirá y desplegará tu frontend (1-2 minutos)
3. Obtendrás una URL como: `https://tu-proyecto.vercel.app`

### Paso 5: Configurar CORS en el Backend

Vuelve a Railway y actualiza el CORS del backend:

1. Ve a tu servicio backend en Railway
2. Edita el archivo `backend/app/main.py` (o usa variables de entorno)
3. Cambia el CORS para permitir tu dominio de Vercel:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Desarrollo local
        "https://tu-proyecto.vercel.app"  # Producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

4. Haz commit y push. Railway se redespliegará automáticamente.

---

## ✅ Verificación Final

### 1. Verificar Backend
- Visita: `https://tu-app.up.railway.app/`
- Deberías ver: `{"message": "Bienvenido a...", "status": "online"}`

### 2. Verificar Frontend
- Visita: `https://tu-proyecto.vercel.app`
- Deberías ver la página de login

### 3. Probar Login
1. Abre el frontend
2. Inicia sesión con el usuario admin que creaste
3. Deberías poder acceder al dashboard

### 4. Probar Generación de PDF
1. Crea una valoración completa
2. Al finalizar, debería generar PDF y Excel
3. Descarga los archivos para verificar

---

## 🔍 Solución de Problemas

### Error: "LibreOffice no está instalado"

**Causa**: El Dockerfile no se ejecutó correctamente.

**Solución**:
1. Ve a Railway → tu servicio → **Deployments**
2. Revisa los logs del build
3. Busca errores en la instalación de LibreOffice
4. Si es necesario, fuerza un redespliegue: **Settings** → **Redeploy**

### Error: CORS al hacer login

**Causa**: El backend no permite peticiones desde tu dominio de Vercel.

**Solución**:
1. Actualiza `allow_origins` en `backend/app/main.py`
2. Agrega la URL de Vercel a la lista
3. Haz commit y push

### Error: "Cannot connect to database"

**Causa**: La variable `DATABASE_URL` no está configurada.

**Solución**:
1. Ve a Railway → PostgreSQL database
2. Copia la variable `DATABASE_URL`
3. Ve a tu servicio backend → Variables
4. Verifica que `DATABASE_URL` existe y es correcta

### El frontend no se conecta al backend

**Causa**: `NEXT_PUBLIC_API_URL` no está configurada correctamente.

**Solución**:
1. Ve a Vercel → tu proyecto → Settings → Environment Variables
2. Verifica que `NEXT_PUBLIC_API_URL` apunta a Railway
3. Debe ser: `https://tu-app.up.railway.app` (sin `/` al final)
4. Redesplegar el frontend si cambiaste la variable

---

## 💡 Consejos de Producción

### Seguridad

1. **Cambia SECRET_KEY**: Usa una clave fuerte y única
2. **Usa HTTPS**: Railway y Vercel ya lo proporcionan automáticamente
3. **No expongas credenciales**: Nunca hagas commit de archivos `.env`

### Rendimiento

1. **Railway Free Tier**: 500 horas/mes, suficiente para aplicaciones pequeñas
2. **Vercel Free Tier**: 100 GB bandwidth/mes
3. **Si necesitas más**: Considera actualizar a planes pagos

### Monitoreo

1. **Railway Logs**: Ve a Deployments → View logs
2. **Vercel Analytics**: Automático en todos los planes
3. **Errores**: Revisa los logs regularmente

### Backups

1. **Railway Database**: Configura backups automáticos en Settings
2. **Código**: Tu repositorio de GitHub es tu backup

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Instalación de LibreOffice](./INSTALACION_LIBREOFFICE.md)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Railway y Vercel
2. Verifica las variables de entorno
3. Consulta la sección de "Solución de Problemas" arriba
4. Revisa que todas las URLs no tengan `/` al final

---

## 🎉 ¡Listo!

Tu sistema ahora está desplegado en producción y accesible desde cualquier lugar. Los usuarios solo necesitan un navegador web para usarlo.

**URLs importantes:**
- Frontend: `https://tu-proyecto.vercel.app`
- Backend API: `https://tu-app.up.railway.app`
- Test LibreOffice: `https://tu-app.up.railway.app/test/libreoffice`
