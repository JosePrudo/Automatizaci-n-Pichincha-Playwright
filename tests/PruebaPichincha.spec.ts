import { test, expect } from '@playwright/test';

test('Página principal de Banco Pichincha', async ({ page }) => {
  await page.goto('https://brave-mud-0605ba20f.3.azurestaticapps.net/');
  await expect(page).toHaveTitle(/Banco Pichincha/);
});