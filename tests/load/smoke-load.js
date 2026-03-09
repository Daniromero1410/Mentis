/**
 * k6 — Prueba de Humo (Smoke Test de Carga)
 *
 * Propósito: Verificar que el sistema funciona con 1 usuario antes
 *            de ejecutar pruebas de carga más intensas.
 *
 * USO:
 *   k6 run --env BASE_URL=https://mentis-production.up.railway.app \
 *           --env TEST_EMAIL=TU_EMAIL \
 *           --env TEST_PASSWORD=TU_PASSWORD \
 *           smoke-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL     = __ENV.BASE_URL     || 'https://mentis-production.up.railway.app';
const TEST_EMAIL   = __ENV.TEST_EMAIL   || '';
const TEST_PASSWORD= __ENV.TEST_PASSWORD|| '';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('Debes pasar --env TEST_EMAIL=... --env TEST_PASSWORD=... al correr k6');
}

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // Login
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers }
  );

  check(loginRes, { 'login 200': r => r.status === 200 });
  if (loginRes.status !== 200) return;

  const token = JSON.parse(loginRes.body).access_token;
  const auth = { ...headers, Authorization: `Bearer ${token}` };

  // Health check
  const healthRes = http.get(`${BASE_URL}/health`, { headers: auth });
  check(healthRes, { 'health 200': r => r.status === 200 });

  // Listar
  const listRes = http.get(`${BASE_URL}/valoraciones/`, { headers: auth });
  check(listRes, { 'listar 200': r => r.status === 200 });

  // Crear
  const createRes = http.post(
    `${BASE_URL}/valoraciones/`,
    JSON.stringify({
      fecha_valoracion: today(),
      trabajador: {
        nombre: 'Smoke Test User',
        documento: '9999999999',
      },
    }),
    { headers: auth }
  );
  check(createRes, { 'crear 201': r => r.status === 201 });

  if (createRes.status === 201) {
    const id = JSON.parse(createRes.body).id;
    http.del(`${BASE_URL}/valoraciones/${id}`, null, { headers: auth });
  }

  sleep(1);
}
