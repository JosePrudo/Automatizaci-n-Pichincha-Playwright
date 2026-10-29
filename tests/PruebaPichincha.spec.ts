import { test, expect, type Page } from '@playwright/test';

// Serial: si una prueba falla, las siguientes se omiten; todas comparten la misma página.
test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test.afterEach(async () => {
  await page.waitForTimeout(1_500);
});

test('Página principal de Banco Pichincha', async () => {
  await page.goto('https://brave-mud-0605ba20f.3.azurestaticapps.net/');
  await expect(page).toHaveTitle(/SimulacionCreditoHipotecario/);
});

test('Seleccionar tipo de aplicación', async () => {
  const radioIndividual = page.locator('input[name="applicationType"][value="individual"]');
  await radioIndividual.check();
  await expect(radioIndividual).toBeChecked();
});

test('Seleccionar tipo de vivienda', async () => {
  const radioVivienda = page.locator('input[name="housingType"][value="casa"]');
  await radioVivienda.check();
  await expect(radioVivienda).toBeChecked();
});
