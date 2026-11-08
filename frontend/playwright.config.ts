import { defineConfig, devices } from '@playwright/test';

/**
 * Suíte E2E inicial do GeoVintalie.
 * Executa contra o servidor de desenvolvimento já em execução:
 *   - frontend: http://localhost:5173
 *   - API backend: http://127.0.0.1:8000
 *
 * Antes de rodar, certifique-se de que ambos os serviços estejam online:
 *   php artisan serve (api)  &&  npm run dev (frontend)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Não inicia servidores web: o ambiente já deve ter api (:8000) e frontend (:5173) up.
  webServer: undefined,
});
