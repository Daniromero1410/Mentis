# Usar imagen oficial de Python slim (más liviana)
FROM python:3.11-slim

# Establecer variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Instalar LibreOffice y dependencias del sistema
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    fonts-liberation \
    fonts-dejavu \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero (para aprovechar caché de Docker)
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorio para PDFs si no existe
RUN mkdir -p pdfs

# Exponer el puerto (Railway usa la variable PORT automáticamente)
EXPOSE 8000

# Comando para iniciar la aplicación
# Railway asigna el puerto dinámicamente via $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
