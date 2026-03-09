/**
 * k6 — Prueba de Carga: Escenario Completo de Usuario
 *
 * METODOLOGIA: Simulación realista de flujo completo de trabajo
 * ESCENARIO:
 *   1. Login
 *   2. Listar registros (dashboard)
 *   3. Crear un registro (simula guardar formulario)
 *   4. Actualizar el registro (simula editar y guardar)
 *   5. Descargar PDF
 *   6. Eliminar registro (limpieza)
 *
 * ETAPAS DE CARGA:
 *   Ramp-up  → 2 min para llegar a N usuarios
 *   Plateau  → 5 min manteniendo N usuarios concurrentes
 *   Ramp-down→ 1 min bajando a 0
 *
 * USO:
 *   k6 run --env BASE_URL=https://mentis-production.up.railway.app \
 *           --env TEST_EMAIL=TU_EMAIL \
 *           --env TEST_PASSWORD=TU_PASSWORD \
 *           --env TARGET_USERS=50 \
 *           --out json=../../reports/k6/full-scenario.json \
 *           full-scenario.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ── Configuracion ─────────────────────────────────────────────────────────────

const BASE_URL     = __ENV.BASE_URL     || 'https://mentis-production.up.railway.app';
const TEST_EMAIL   = __ENV.TEST_EMAIL   || '';
const TEST_PASSWORD= __ENV.TEST_PASSWORD|| '';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('Debes pasar --env TEST_EMAIL=... --env TEST_PASSWORD=... al correr k6');
}
const TARGET_USERS = parseInt(__ENV.TARGET_USERS || '20');

// ── Metricas personalizadas ───────────────────────────────────────────────────

const loginSuccess    = new Rate('login_exitoso');
const createSuccess   = new Rate('crear_registro_exitoso');
const pdfSuccess      = new Rate('generar_pdf_exitoso');
const loginDuration   = new Trend('duracion_login_ms');
const createDuration  = new Trend('duracion_crear_registro_ms');
const pdfDuration     = new Trend('duracion_generar_pdf_ms');
const erroresTotal    = new Counter('errores_total');

// ── Opciones de carga ─────────────────────────────────────────────────────────

export const options = {
  stages: [
    { duration: '2m', target: TARGET_USERS },   // Ramp-up
    { duration: '5m', target: TARGET_USERS },   // Plateau
    { duration: '1m', target: 0 },              // Ramp-down
  ],
  thresholds: {
    // 95% de los requests deben completarse en < 3s
    http_req_duration: ['p(95)<3000'],
    // Menos del 1% de requests pueden fallar
    http_req_failed: ['rate<0.01'],
    // El login debe ser exitoso > 99% del tiempo
    login_exitoso: ['rate>0.99'],
    // Crear registro exitoso > 98% del tiempo
    crear_registro_exitoso: ['rate>0.98'],
    // Generar PDF exitoso > 95% del tiempo (operacion más pesada)
    generar_pdf_exitoso: ['rate>0.95'],
  },
};

// ── Datos de prueba (generación de nombres únicos) ────────────────────────────

function randomName() {
  const nombres = ['Ana', 'Carlos', 'María', 'Juan', 'Luisa', 'Pedro', 'Laura', 'Andrés'];
  const apellidos = ['García', 'López', 'Martínez', 'Rodríguez', 'Hernández', 'Gómez'];
  return `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
}

function randomDoc() {
  return String(Math.floor(Math.random() * 9000000000) + 1000000000);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Flujo principal ───────────────────────────────────────────────────────────

export default function () {
  const headers = { 'Content-Type': 'application/json' };
  let token = null;
  let registroId = null;

  // ─── 1. LOGIN ──────────────────────────────────────────────────────────────
  group('1. Login', () => {
    const startLogin = Date.now();
    const res = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      { headers }
    );
    loginDuration.add(Date.now() - startLogin);

    const ok = check(res, {
      'login status 200': r => r.status === 200,
      'login retorna token': r => {
        try { return !!JSON.parse(r.body).access_token; } catch { return false; }
      },
    });

    loginSuccess.add(ok);
    if (!ok) {
      erroresTotal.add(1);
      return; // No continuar si el login falló
    }

    token = JSON.parse(res.body).access_token;
  });

  if (!token) return;

  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

  sleep(0.5);

  // ─── 2. LISTAR REGISTROS (simula apertura del dashboard) ──────────────────
  group('2. Listar valoraciones', () => {
    const res = http.get(`${BASE_URL}/valoraciones/`, { headers: authHeaders });
    check(res, {
      'listar status 200': r => r.status === 200,
    });
  });

  sleep(1);

  // ─── 3. CREAR REGISTRO ────────────────────────────────────────────────────
  group('3. Crear valoracion', () => {
    const payload = JSON.stringify({
      fecha_valoracion: today(),
      trabajador: {
        nombre: randomName(),
        documento: randomDoc(),
        fecha_nacimiento: '1985-06-15',
      },
      info_laboral: {
        empresa: 'Empresa Carga Test',
        eps: 'SURA',
        dias_incapacidad: 30,
      },
    });

    const startCreate = Date.now();
    const res = http.post(`${BASE_URL}/valoraciones/`, payload, { headers: authHeaders });
    createDuration.add(Date.now() - startCreate);

    const ok = check(res, {
      'crear status 201': r => r.status === 201,
      'retorna id': r => {
        try { return !!JSON.parse(r.body).id; } catch { return false; }
      },
    });

    createSuccess.add(ok);
    if (!ok) {
      erroresTotal.add(1);
    } else {
      registroId = JSON.parse(res.body).id;
    }
  });

  if (!registroId) return;

  sleep(1);

  // ─── 4. OBTENER REGISTRO ─────────────────────────────────────────────────
  group('4. Obtener valoracion', () => {
    const res = http.get(`${BASE_URL}/valoraciones/${registroId}`, { headers: authHeaders });
    check(res, {
      'get status 200': r => r.status === 200,
      'id correcto': r => {
        try { return JSON.parse(r.body).id === registroId; } catch { return false; }
      },
    });
  });

  sleep(0.5);

  // ─── 5. GENERAR PDF ───────────────────────────────────────────────────────
  group('5. Descargar PDF', () => {
    const startPdf = Date.now();
    const res = http.get(
      `${BASE_URL}/valoraciones/${registroId}/descargar-pdf`,
      { headers: authHeaders }
    );
    pdfDuration.add(Date.now() - startPdf);

    const ok = check(res, {
      'pdf status 200': r => r.status === 200,
      'content-type es pdf': r => (r.headers['Content-Type'] || '').includes('pdf'),
      'pdf no está vacío': r => r.body.length > 100,
    });

    pdfSuccess.add(ok);
    if (!ok) erroresTotal.add(1);
  });

  sleep(0.5);

  // ─── 6. LIMPIEZA ─────────────────────────────────────────────────────────
  group('6. Eliminar registro (cleanup)', () => {
    const res = http.del(
      `${BASE_URL}/valoraciones/${registroId}`,
      null,
      { headers: authHeaders }
    );
    check(res, {
      'delete status 200/204': r => [200, 204].includes(r.status),
    });
  });

  sleep(1);
}

// ── Resumen al terminar ───────────────────────────────────────────────────────

export function handleSummary(data) {
  const passed = data.metrics.http_req_failed.values.rate < 0.01;
  const p95    = data.metrics.http_req_duration?.values?.['p(95)'] ?? 0;

  return {
    '../../reports/k6/full-scenario-summary.json': JSON.stringify(data, null, 2),
    stdout: `
╔══════════════════════════════════════════════════════════╗
║              RESUMEN PRUEBA DE CARGA — MENTIS            ║
╠══════════════════════════════════════════════════════════╣
║  Usuarios concurrentes:  ${TARGET_USERS.toString().padEnd(30)}║
║  Total requests:         ${String(data.metrics.http_reqs?.values?.count ?? 0).padEnd(30)}║
║  Tasa de error:          ${String((data.metrics.http_req_failed?.values?.rate * 100).toFixed(2) + '%').padEnd(30)}║
║  P95 duración:           ${String(p95.toFixed(0) + ' ms').padEnd(30)}║
║  P99 duración:           ${String((data.metrics.http_req_duration?.values?.['p(99)'] ?? 0).toFixed(0) + ' ms').padEnd(30)}║
║  Resultado:              ${passed ? 'PASÓ ✓'.padEnd(30) : 'FALLÓ ✗'.padEnd(30)}║
╚══════════════════════════════════════════════════════════╝
    `,
  };
}
