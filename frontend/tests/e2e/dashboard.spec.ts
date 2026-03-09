/**
 * SUITE E2E: Dashboard y Navegación
 * METODOLOGIA: Caja negra — verificación de UI tras login
 *
 * COBERTURA:
 *  - El dashboard carga correctamente tras login
 *  - La barra lateral (sidebar) está visible con módulos
 *  - Navegación entre módulos principales
 *  - Responsive: sidebar en mobile
 *  - Tiempo de carga aceptable
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL    = process.env.TEST_EMAIL    ?? '';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? '';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('Configura TEST_EMAIL y TEST_PASSWORD en frontend/.env.test');
}

// ── Fixture: página autenticada ───────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /iniciar|ingresar|login|entrar/i }).click();
  await page.waitForURL(/dashboard/i, { timeout: 15_000 });
});


// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Dashboard y Navegación', () => {

  test('el dashboard carga en menos de 5 segundos', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5_000);
  });

  test('la página no muestra errores de consola críticos', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filtrar errores de red esperados (hot reload, etc.)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('hot-update') &&
      !e.includes('HMR')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('el sidebar tiene al menos un link de navegación', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();

    const links = sidebar.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('puede navegar a la sección de valoraciones', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const valoracionesLink = page.getByRole('link', { name: /valoracion/i })
      .or(page.getByText(/valoracion/i))
      .first();

    await valoracionesLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/valoracion/i);
  });

  test('puede navegar a la sección de pruebas de trabajo', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const link = page.getByRole('link', { name: /prueba.*trabajo|pruebas/i })
      .or(page.getByText(/prueba.*trabajo/i))
      .first();

    await link.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/prueba/i);
  });

  test('mobile: el layout se adapta correctamente en 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // La página no debe tener scroll horizontal
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // tolerancia de 5px
  });

  test('tablet: el layout se adapta correctamente en 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // No debe haber overflow horizontal
    const hasHorizontalScroll = await page.evaluate(() =>
      document.body.scrollWidth > document.body.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });

});
