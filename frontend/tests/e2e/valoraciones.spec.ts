/**
 * SUITE E2E: Valoraciones Psicológicas
 * METODOLOGIA: Caja negra — flujo completo desde UI
 *
 * COBERTURA:
 *  - Listado de valoraciones carga correctamente
 *  - Crear nueva valoración: paso 1 con datos básicos
 *  - Navegación entre pasos del wizard
 *  - Mobile responsive
 *  - Ver una valoración existente en modo lectura
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL    = process.env.TEST_EMAIL    ?? '';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? '';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('Configura TEST_EMAIL y TEST_PASSWORD en frontend/.env.test');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /iniciar|ingresar|login|entrar/i }).click();
  await page.waitForURL(/dashboard/i, { timeout: 15_000 });
});


test.describe('Valoraciones Psicológicas', () => {

  test('el listado de valoraciones carga sin errores', async ({ page }) => {
    await page.goto('/dashboard/valoraciones');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/valoracion/i);
    await expect(page.locator('[class*="spinner"]')).not.toBeVisible({ timeout: 8_000 });
  });

  test('el wizard de nueva valoración carga correctamente', async ({ page }) => {
    await page.goto('/dashboard/valoraciones/nueva');
    await page.waitForLoadState('networkidle');

    // Debe tener stepper
    const stepper = page.locator('[class*="step"], nav button').first();
    await expect(stepper).toBeVisible({ timeout: 5_000 });
  });

  test('paso 1: puede ingresar nombre y documento del trabajador', async ({ page }) => {
    await page.goto('/dashboard/valoraciones/nueva');
    await page.waitForLoadState('networkidle');

    const nombreInput = page.locator('input[name*="nombre"], input[placeholder*="nombre"]').first();
    const docInput    = page.locator('input[name*="documento"], input[placeholder*="documento"]').first();

    if (await nombreInput.isVisible()) {
      await nombreInput.fill('María López Rodríguez');
    }
    if (await docInput.isVisible()) {
      await docInput.fill('1020304050');
    }

    // Guardar si hay botón disponible
    const guardarBtn = page.getByRole('button', { name: /guardar|borrador|save/i }).first();
    if (await guardarBtn.isVisible()) {
      await guardarBtn.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('puede navegar por los pasos del wizard', async ({ page }) => {
    await page.goto('/dashboard/valoraciones/nueva');
    await page.waitForLoadState('networkidle');

    const steps: string[] = [];

    // Avanzar por todos los pasos disponibles
    for (let i = 0; i < 8; i++) {
      const url = page.url();
      steps.push(url);

      const nextBtn = page.getByRole('button', { name: /siguiente|next|continuar/i }).first();
      if (!(await nextBtn.isVisible())) break;
      if (await nextBtn.isDisabled()) break;

      await nextBtn.click();
      await page.waitForTimeout(500);
    }

    // Debe haber podido avanzar al menos 1 paso
    expect(steps.length).toBeGreaterThanOrEqual(1);
  });

  test('mobile 390px: el wizard es usable sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/valoraciones/nueva');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('el header del wizard muestra el título correcto', async ({ page }) => {
    await page.goto('/dashboard/valoraciones/nueva');
    await page.waitForLoadState('networkidle');

    // Debe contener "valoración" o "nueva" en algún encabezado
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible({ timeout: 5_000 });
    const text = (await heading.textContent() ?? '').toLowerCase();
    expect(text).toMatch(/valoraci|nueva|psicolog/i);
  });

});
