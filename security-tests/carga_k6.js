// Prueba de carga (rendimiento) — Mentis
// Uso:
//   export BASE_URL="http://localhost:8000"
//   export TOKEN="<token JWT de un usuario>"
//   k6 run carga_k6.js
//
// Simula usuarios concurrentes golpeando los listados (los puntos más sensibles
// a las queries N+1). Ajusta `stages` para tu objetivo de carga.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8000';
const TOKEN = __ENV.TOKEN || '';

export const options = {
    stages: [
        { duration: '30s', target: 10 },  // sube a 10 usuarios
        { duration: '1m', target: 25 },   // mantiene 25
        { duration: '30s', target: 0 },   // baja
    ],
    thresholds: {
        http_req_duration: ['p(95)<800'], // 95% de respuestas < 800ms
        http_req_failed: ['rate<0.01'],   // < 1% de errores
    },
};

const headers = { Authorization: `Bearer ${TOKEN}` };

export default function () {
    // Listado de valoraciones (paginado)
    const r1 = http.get(`${BASE}/valoraciones/?skip=0&limit=20`, { headers });
    check(r1, { 'valoraciones 200': (r) => r.status === 200 });

    // Listado de pruebas de trabajo TO
    const r2 = http.get(`${BASE}/formatos-to/pruebas-trabajo/?skip=0&limit=20`, { headers });
    check(r2, { 'pruebas TO 200/403': (r) => r.status === 200 || r.status === 403 });

    sleep(1);
}
