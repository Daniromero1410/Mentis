# Pruebas de seguridad y rendimiento — Mentis

> ⚠️ **Importante:** ejecuta estas pruebas contra un **entorno local o de staging**,
> nunca contra producción con datos médicos reales de pacientes. Las pruebas crean
> y borran registros de prueba.

## 1. Montar un entorno local de pruebas

El sistema necesita el backend (FastAPI), una base de datos PostgreSQL y, opcionalmente, el frontend.

### Backend + base de datos
```bash
# 1) PostgreSQL local (con Docker, lo más rápido)
docker run --name mentis-db -e POSTGRES_PASSWORD=test -e POSTGRES_DB=mentis \
  -p 5432:5432 -d postgres:16

# 2) Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:test@localhost:5432/mentis"
export SECRET_KEY="clave-de-pruebas-local"
export DEBUG="true"
uvicorn app.main:app --reload --port 8000
```

### Crear usuarios de prueba
1. Crea el admin inicial: `curl -X POST http://localhost:8000/auth/crear-admin-inicial`
   (responde con email/clave del admin).
2. Inicia sesión como admin y crea 2 terapeutas desde el módulo de Usuarios
   (o con `POST /auth/registro` usando el token del admin).

## 2. Pruebas de autorización (seguridad)

```bash
pip install requests
export BASE_URL="http://localhost:8000"
export ADMIN_EMAIL="danielromero.software@gmail.com"  export ADMIN_PASS="admin123"
export TERA_A_EMAIL="terapeutaA@ejemplo.com"          export TERA_A_PASS="..."
export TERA_B_EMAIL="terapeutaB@ejemplo.com"          export TERA_B_PASS="..."
python3 test_autorizacion.py
```

Verifica: endpoints sin token (401), escalada de privilegios (403),
IDOR entre terapeutas, y que el terapeuta nunca reciba precios.
Cualquier **FAIL** es una vulnerabilidad a revisar.

## 3. Pruebas de rendimiento (carga)

Con [k6](https://k6.io) (recomendado):
```bash
# instalar k6: https://k6.io/docs/get-started/installation/
export BASE_URL="http://localhost:8000"
export TOKEN="<token-de-un-usuario>"
k6 run carga_k6.js
```

Mide tiempos de respuesta y throughput de los listados bajo concurrencia.
Útil para detectar los cuellos de botella conocidos (queries N+1 en listados,
consolidado de cuentas, generación de PDF).
