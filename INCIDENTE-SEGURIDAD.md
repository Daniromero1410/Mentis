# 🚨 Respuesta a incidente — Base de datos comprometida (Railway)

**Fecha de detección:** 2026-06-12 (actividad maliciosa visible desde 2026-06-05)
**Severidad:** Crítica — posible filtración de datos personales/de salud (Ley 1581).

## Qué pasó
Un atacante obtuvo acceso **directo** a la base de datos PostgreSQL de Railway como
superusuario y ejecutó comandos del sistema mediante `COPY ... FROM PROGRAM`
(escaneo de red con `masscan`, procesos de botnet). **No entró por la aplicación**;
entró por el **endpoint público de la base de datos** con credenciales débiles/adivinadas.

Asumir que **toda la información de la base fue expuesta** (datos médicos/ocupacionales
de trabajadores).

---

## ✅ Acciones inmediatas (en orden)

### 1. Contener
- [ ] **NO reutilizar** la base de datos comprometida. Tuvo acceso shell; puede tener
      persistencia/puertas traseras.
- [ ] En Railway, **detener** el servicio Postgres comprometido.

### 2. Base de datos nueva y limpia
- [ ] Crear un **nuevo servicio Postgres** en Railway (genera credenciales nuevas).
- [ ] **Desactivar el networking público** del nuevo Postgres: usar **solo private
      networking** entre el backend y la base (Railway → servicio Postgres → Settings →
      Networking → quitar el TCP Proxy público).
- [ ] Restaurar los datos desde un **backup anterior al 2026-06-05** (antes de la
      intrusión). Si no hay backup limpio, exportar los datos del comprometido pero
      **revisar que no haya filas/objetos inyectados** antes de importar.

### 3. Rotar TODAS las credenciales
- [ ] `DATABASE_URL` → la nueva (automática con el nuevo Postgres).
- [ ] `SECRET_KEY` → generar una nueva larga y aleatoria (ej. `openssl rand -base64 48`).
      Esto cierra todas las sesiones activas (incluida cualquiera del atacante).
- [ ] `GROQ_API_KEY` → rotarla en el panel de Groq (pudo quedar expuesta en el contenedor).
- [ ] Contraseñas de **todos los usuarios admin** del sistema.
- [ ] Cualquier otra variable secreta en Railway/Vercel.

### 4. Endurecer la nueva base
- [ ] El backend debe conectarse con un usuario **sin privilegios de superusuario**
      (para que `COPY FROM PROGRAM` no sea posible aunque se filtren credenciales).
- [ ] Contraseña fuerte y única para la base.
- [ ] Solo accesible por red privada (sin proxy público).

### 5. Verificar el resto
- [ ] Revisar que Railway/Vercel no tengan otros servicios con puertos públicos
      innecesarios.
- [ ] Confirmar variables de entorno en producción: `SECRET_KEY`, `DATABASE_URL`,
      `GROQ_API_KEY`, `DEBUG=false`, `CORS_ORIGINS`.

### 6. Cumplimiento legal (Colombia — Ley 1581 / Habeas Data)
- [ ] Al tratarse de datos personales y de salud, una filtración puede requerir
      **notificar a la Superintendencia de Industria y Comercio (SIC)** y, según el caso,
      a los titulares afectados. Consultar con el área legal/responsable de datos.
- [ ] Documentar el incidente (qué datos, cuándo, qué se hizo).

---

## Notas
- El repositorio **no** filtró credenciales (no hay `.env` en el historial; `.gitignore`
  los cubre; la API key no está hardcodeada).
- El default de `DATABASE_URL`/`SECRET_KEY` en el código es solo para desarrollo local
  y ya no contiene credenciales realistas.
