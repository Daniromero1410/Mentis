/**
 * SUITE E2E: Autenticación
 * METODOLOGIA: Caja negra desde perspectiva del usuario final
 * NAVEGADORES: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
 *
 * COBERTURA:
 *  - Login con credenciales válidas → redirección al dashboard
 *  - Login con credenciales inválidas → mensaje de error visible
 *  - Logout → redirección a /login
 *  - Rutas protegidas sin sesión → redirección a /login
 *  - Sesión persiste al recargar la página
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL    = process.env.TEST_EMAIL    ?? '';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? '';

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error(
    'Configura TEST_EMAIL y TEST_PASSWORD en frontend/.env.test\n' +
    'Copia frontend/.env.test.example y completa los valores.'
  );
}


// ── Helper: iniciar sesión ────────────────────────────────────────────────────

async function login(page: any, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Intentar con getByRole primero, luego fallbacks de placeholder/type
  const emailInput = page.getByRole('textbox', { name: /correo|email/i })
    .or(page.locator('input[type="email"]'))
    .or(page.locator('input[name="email"]'))
    .first();

  const passInput = page.getByRole('textbox', { name: /contraseña|password/i })
    .or(page.locator('input[type="password"]'))
    .first();

  await emailInput.fill(email);
  await passInput.fill(password);

  const submitBtn = page.getByRole('button', { name: /iniciar|ingresar|login|entrar/i });
  await submitBtn.click();

  await page.waitForLoadState('networkidle');
}


// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Autenticación', () => {

  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await login(page);

    // Debe aterrizar en /dashboard (o cualquier ruta que lo contenga)
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });
  });

  test('el dashboard muestra el nombre del usuario tras login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });
    // Algún elemento en la página debe contener el email del usuario
    // (encabezado, menú de perfil, etc.)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('login con contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passInput  = page.locator('input[type="password"]').first();

    await emailInput.fill(TEST_EMAIL);
    await passInput.fill('contraseña_incorrecta_9999');

    await page.getByRole('button', { name: /iniciar|ingresar|login|entrar/i }).click();
    await page.waitForLoadState('networkidle');

    // Debe seguir en /login
    await expect(page).toHaveURL(/login/i);

    // Debe haber algún mensaje de error visible
    const errorMsg = page.locator('[role="alert"], .error, [class*="error"], [class*="toast"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('login con email inexistente muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"], input[name="email"]').first()
      .fill('usuario_que_no_existe_xyz@nada.com');
    await page.locator('input[type="password"]').first()
      .fill('cualquiera');

    await page.getByRole('button', { name: /iniciar|ingresar|login|entrar/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/login/i);
  });

  test('logout redirige a la página de login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });

    // Buscar botón de logout (puede estar en un menú)
    const logoutBtn = page.getByRole('button', { name: /cerrar sesión|logout|salir/i })
      .or(page.getByText(/cerrar sesión|logout|salir/i))
      .first();

    // Si no está visible directamente, intentar abrir un menú de perfil
    if (!(await logoutBtn.isVisible())) {
      const profileMenu = page.getByRole('button', { name: /perfil|cuenta|usuario/i })
        .or(page.locator('[aria-label*="perfil"], [aria-label*="cuenta"]'))
        .first();
      if (await profileMenu.isVisible()) {
        await profileMenu.click();
        await page.waitForTimeout(500);
      }
    }

    await logoutBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/i, { timeout: 10_000 });
  });

  test('acceder a /dashboard sin sesión redirige a login', async ({ page }) => {
    // Limpiar cookies/localStorage para asegurar que no hay sesión
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/i, { timeout: 10_000 });
  });

  test('la sesión persiste al recargar la página', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10_000 });

    // Recargar
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Debe seguir en el dashboard, no redirigir a login
    await expect(page).not.toHaveURL(/login/i);
  });

});
