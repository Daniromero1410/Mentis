import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

/**
 * Playwright — Configuración de pruebas E2E
 *
 * Variables de entorno (.env.test en /frontend):
 *   BASE_URL          URL del frontend  (default: http://localhost:3000)
 *   TEST_EMAIL        Email de usuario de prueba
 *   TEST_PASSWORD     Contraseña del usuario de prueba
 *   ADMIN_EMAIL       Email de admin
 *   ADMIN_PASSWORD    Contraseña del admin
 */

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,

  reporter: [
    ['html', { outputFolder: '../reports/playwright', open: 'never' }],
    ['list'],
    ['allure-playwright', { outputFolder: '../reports/allure-results' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://mentis-nu.vercel.app',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
});
