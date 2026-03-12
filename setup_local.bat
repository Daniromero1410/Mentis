@echo off
echo =======================================================
echo   CONFIGURACION AUTOMATICA DEL PROYECTO
echo   Sistema de Valoracion Psicologica
echo =======================================================
echo.

echo [Paso 1] Verificando requisitos previos...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Docker instalado. Por favor instale Docker Desktop y asegurese de que este corriendo.
    pause
    exit /b
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Python. Por favor instale Python 3.10+ y asegurese de marcar la opcion "Add Python to PATH" durante la instalacion.
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro NPM o Node.js. Por favor instale Node.js 18+.
    pause
    exit /b
)

echo.
echo [Paso 2] Configurando Variables de Entorno...

if not exist "backend\.env" (
    echo Creando backend\.env desde .env.example...
    copy "backend\.env.example" "backend\.env" > nul
) else (
    echo backend\.env ya existe.
)

if not exist "frontend\.env.local" (
    echo Creando frontend\.env.local desde .env.example...
    copy "frontend\.env.example" "frontend\.env.local" > nul
) else (
    echo frontend\.env.local ya existe.
)

echo.
echo [Paso 3] Iniciando Base de Datos con Docker...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al iniciar Docker. Asegurese de que Docker Desktop este abierto y ejecutandose, y vuelva a intentarlo.
    pause
    exit /b
)

echo.
echo [Paso 4] Configurando Backend (Python)...
cd backend
if not exist "venv\" (
    echo Creando entorno virtual de Python...
    python -m venv venv
)
echo Activando entorno virtual e instalando dependencias del backend...
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo.
echo [Paso 5] Configurando Frontend (Node.js)...
cd frontend
echo Instalando dependencias del frontend...
call npm install
cd ..

echo.
echo =======================================================
echo   INSTALACION COMPLETADA EXITOSAMENTE!
echo =======================================================
echo.
echo Para correr el proyecto en cualquier momento, siga estos pasos:
echo.
echo 1. Asegurese de que Docker Desktop este ejecutandose.
echo 2. Abra una terminal en la carpeta 'backend' y ejecute:
echo    .\venv\Scripts\activate
echo    python -m uvicorn app.main:app --reload
echo.
echo 3. Abra otra terminal en la carpeta 'frontend' y ejecute:
echo    npm run dev
echo.
echo =======================================================
pause
