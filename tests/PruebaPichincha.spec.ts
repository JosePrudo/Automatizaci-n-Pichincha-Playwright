import { test, expect } from '@playwright/test';

test('Página principal de Banco Pichincha', async ({ page }) => {
  await page.goto('https://brave-mud-0605ba20f.3.azurestaticapps.net/');
  await expect(page).toHaveTitle(/SimulacionCreditoHipotecario/);
});

test('Seleccionar tipo de aplicación', async ({ page }) => {
  await page.goto('https://brave-mud-0605ba20f.3.azurestaticapps.net/');

  const radioIndividual = page.locator('input[name="applicationType"][value="individual"]');
  await radioIndividual.check();
  await expect(radioIndividual).toBeChecked();
});
