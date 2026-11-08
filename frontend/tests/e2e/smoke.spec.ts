import { test, expect } from '@playwright/test';

/**
 * Smoke tests E2E: carregamento das páginas públicas e redirecionamento de rotas privadas.
 * Não dependem de estado de autenticação nem de dados de seed.
 */
test.describe('páginas públicas', () => {
  test('carrega a página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText(/Acesse sua conta/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('carrega a página de cadastro', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByText(/Criar conta/i)).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
  });
});

test.describe('rotas privadas (sem sessão → redirecionam para /login)', () => {
  const paths = ['/', '/admin', '/institutional', '/map'];

  for (const path of paths) {
    test(`redireciona ${path} para /login quando não há token`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/.*\/login/);
    });
  }
});
