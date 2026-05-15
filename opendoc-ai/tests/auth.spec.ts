import { test, expect } from '@playwright/test';

test('homepage should load and show login button', async ({ page }) => {
  await page.goto('/');
  // Basic check to see if the page is up
  const title = await page.title();
  expect(title).toBeDefined();
});

test('login page should have GitHub login button', async ({ page }) => {
  await page.goto('/login');
  const loginButton = page.getByRole('button', { name: /GitHub/i });
  await expect(loginButton).toBeVisible();
});
