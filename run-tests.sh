#!/usr/bin/env bash
# =============================================================================
# run-tests.sh — Ejecutor completo de pruebas automatizadas de Mentis
#
# USO:
#   ./run-tests.sh                  # Ejecuta todas las suites
#   ./run-tests.sh --only api       # Solo pruebas de API (pytest)
#   ./run-tests.sh --only e2e       # Solo pruebas E2E (Playwright)
#   ./run-tests.sh --only load      # Solo pruebas de carga (k6)
#   ./run-tests.sh --only smoke     # Solo smoke tests (rápido)
#   ./run-tests.sh --only security  # Solo pruebas de seguridad
#
# PREREQUISITOS:
#   - Python 3.10+  con pip
#   - Node.js 18+   con npm
#   - k6            instalado (https://k6.io/docs/get-started/installation/)
#   - Backend corriendo en TEST_API_URL
#   - Frontend corriendo en BASE_URL
# =============================================================================

set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Directorios ───────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOAD_DIR="$SCRIPT_DIR/tests/load"
REPORTS_DIR="$SCRIPT_DIR/reports"

# ── Argumento de modo ─────────────────────────────────────────────────────────
ONLY="${2:-all}"
if [[ "${1:-}" == "--only" ]]; then
  ONLY="${2:-all}"
fi

# ── Estado de resultados ──────────────────────────────────────────────────────
PASSED=()
FAILED=()
SKIPPED=()

# ── Funciones helper ──────────────────────────────────────────────────────────

header() {
  echo ""
  echo -e "${BLUE}${BOLD}══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}${BOLD}  $1${NC}"
  echo -e "${BLUE}${BOLD}══════════════════════════════════════════════════════${NC}"
}

success() { echo -e "${GREEN}✓  $1${NC}"; PASSED+=("$1"); }
failure() { echo -e "${RED}✗  $1${NC}"; FAILED+=("$1"); }
skip()    { echo -e "${YELLOW}⊘  $1 (omitido)${NC}"; SKIPPED+=("$1"); }

run_suite() {
  local name="$1"
  local cmd="$2"
  echo ""
  echo -e "${BOLD}▶ Ejecutando: $name${NC}"
  if eval "$cmd"; then
    success "$name"
  else
    failure "$name"
  fi
}

# ── Crear directorio de reportes ──────────────────────────────────────────────
mkdir -p "$REPORTS_DIR/pytest"
mkdir -p "$REPORTS_DIR/playwright"
mkdir -p "$REPORTS_DIR/k6"
mkdir -p "$REPORTS_DIR/allure-results"

# ══════════════════════════════════════════════════════════════════════════════
# SUITE 1: PRUEBAS DE API (pytest)
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$ONLY" == "all" || "$ONLY" == "api" || "$ONLY" == "security" ]]; then
  header "Suite 1: Pruebas de API — pytest"

  # Instalar dependencias si no están instaladas
  echo "Verificando dependencias Python..."
  cd "$BACKEND_DIR"
  pip install -q -r requirements-test.txt

  if [[ "$ONLY" == "security" ]]; then
    # Solo seguridad
    run_suite "API Seguridad" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_seguridad.py tests/test_auth.py -v --tb=short"
  elif [[ "$ONLY" == "smoke" ]]; then
    run_suite "API Smoke Tests" \
      "cd '$BACKEND_DIR' && python -m pytest -m smoke -v --tb=short"
  else
    run_suite "API — Autenticación" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_auth.py -v --tb=short"

    run_suite "API — Valoraciones" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_valoraciones.py -v --tb=short"

    run_suite "API — Pruebas de Trabajo" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_pruebas_trabajo.py -v --tb=short"

    run_suite "API — Análisis de Exigencia" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_analisis_exigencia.py -v --tb=short"

    run_suite "API — Análisis Mental" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_analisis_exigencia_mental.py -v --tb=short"

    run_suite "API — Valoración Ocupacional" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_valoracion_ocupacional.py -v --tb=short"

    run_suite "API — Seguridad" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_seguridad.py -v --tb=short"

    run_suite "API — Usuarios" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_usuarios.py -v --tb=short"

    run_suite "API — PDFs" \
      "cd '$BACKEND_DIR' && python -m pytest tests/test_pdfs.py -v --tb=short"
  fi

else
  skip "Suite API (pytest)"
fi

# ══════════════════════════════════════════════════════════════════════════════
# SUITE 2: PRUEBAS E2E (Playwright)
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$ONLY" == "all" || "$ONLY" == "e2e" ]]; then
  header "Suite 2: Pruebas E2E — Playwright"

  echo "Verificando dependencias Playwright..."
  cd "$FRONTEND_DIR"
  npm install --silent
  npx playwright install --with-deps chromium firefox webkit 2>/dev/null || true

  if [[ "$ONLY" == "smoke" ]]; then
    run_suite "E2E Smoke — Auth" \
      "cd '$FRONTEND_DIR' && npx playwright test tests/e2e/auth.spec.ts --project=chromium"
  else
    run_suite "E2E — Autenticación (todos los navegadores)" \
      "cd '$FRONTEND_DIR' && npx playwright test tests/e2e/auth.spec.ts"

    run_suite "E2E — Dashboard y Navegación" \
      "cd '$FRONTEND_DIR' && npx playwright test tests/e2e/dashboard.spec.ts"

    run_suite "E2E — Wizard Prueba de Trabajo" \
      "cd '$FRONTEND_DIR' && npx playwright test tests/e2e/prueba-trabajo.spec.ts"

    run_suite "E2E — Wizard Valoraciones" \
      "cd '$FRONTEND_DIR' && npx playwright test tests/e2e/valoraciones.spec.ts"
  fi

else
  skip "Suite E2E (Playwright)"
fi

# ══════════════════════════════════════════════════════════════════════════════
# SUITE 3: PRUEBAS DE CARGA (k6)
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$ONLY" == "all" || "$ONLY" == "load" ]]; then
  header "Suite 3: Pruebas de Carga — k6"

  if ! command -v k6 &> /dev/null; then
    echo -e "${YELLOW}⚠  k6 no está instalado. Instálalo con:${NC}"
    echo "   choco install k6   (Windows)"
    echo "   brew install k6    (macOS)"
    echo "   https://k6.io/docs/get-started/installation/"
    skip "Pruebas de Carga (k6 no instalado)"
  else
    API_URL="${TEST_API_URL:-https://mentis-production.up.railway.app}"
    EMAIL="${TEST_EMAIL:-}"
    PASS="${TEST_PASSWORD:-}"

    if [[ -z "$EMAIL" || -z "$PASS" ]]; then
      echo -e "${RED}Error: TEST_EMAIL y TEST_PASSWORD deben estar en .env.test${NC}"
      failure "Pruebas de Carga (credenciales no configuradas)"
      return
    fi

    run_suite "Carga — Smoke (1 usuario, 1 min)" \
      "k6 run \
        --env BASE_URL=$API_URL \
        --env TEST_EMAIL=$EMAIL \
        --env TEST_PASSWORD=$PASS \
        --out json='$REPORTS_DIR/k6/smoke-results.json' \
        '$LOAD_DIR/smoke-load.js'"

    run_suite "Carga — Escenario Completo (20 usuarios, 8 min)" \
      "k6 run \
        --env BASE_URL=$API_URL \
        --env TEST_EMAIL=$EMAIL \
        --env TEST_PASSWORD=$PASS \
        --env TARGET_USERS=20 \
        --out json='$REPORTS_DIR/k6/full-scenario-results.json' \
        '$LOAD_DIR/full-scenario.js'"
  fi

else
  skip "Suite de Carga (k6)"
fi

# ══════════════════════════════════════════════════════════════════════════════
# GENERAR REPORTE UNIFICADO ALLURE
# ══════════════════════════════════════════════════════════════════════════════

if [[ "$ONLY" == "all" ]]; then
  header "Generando Reporte Unificado Allure"

  if command -v allure &> /dev/null; then
    allure generate "$REPORTS_DIR/allure-results" \
      -o "$REPORTS_DIR/allure-report" \
      --clean 2>/dev/null && \
      success "Reporte Allure generado en reports/allure-report/" || \
      failure "Error generando reporte Allure"
  else
    echo -e "${YELLOW}⚠  Allure CLI no instalado. Para generar el reporte:${NC}"
    echo "   npm install -g allure-commandline"
    echo "   allure generate reports/allure-results -o reports/allure-report --clean"
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  RESUMEN DE PRUEBAS${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════════${NC}"
echo ""

if [ ${#PASSED[@]} -gt 0 ]; then
  echo -e "${GREEN}${BOLD}PASARON (${#PASSED[@]}):${NC}"
  for s in "${PASSED[@]}"; do echo -e "  ${GREEN}✓  $s${NC}"; done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}${BOLD}FALLARON (${#FAILED[@]}):${NC}"
  for s in "${FAILED[@]}"; do echo -e "  ${RED}✗  $s${NC}"; done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}OMITIDOS (${#SKIPPED[@]}):${NC}"
  for s in "${SKIPPED[@]}"; do echo -e "  ${YELLOW}⊘  $s${NC}"; done
fi

echo ""
echo -e "Reportes disponibles en: ${BOLD}$REPORTS_DIR/${NC}"
echo -e "  pytest/report.html      — Resultados de API"
echo -e "  playwright/index.html   — Resultados E2E"
echo -e "  k6/full-scenario-summary.json — Métricas de carga"
echo -e "  allure-report/index.html — Reporte unificado (si Allure instalado)"
echo ""

# Retornar código de error si hubo fallos
if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi
exit 0
