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

const radioIndividual = () => page.locator('input[name="applicationType"][value="individual"]');
const radioVivienda = () => page.locator('input[name="housingType"][value="casa"]');
// El select no tiene name ni id; se identifica por sus opciones.
const selectCiudad = () => page.locator('select:has(option[value="Quito"])');
// Dos sliders de rango: el primero es el mínimo y el segundo el máximo.
const sliderCostoMin = () => page.locator('input[type="range"]').nth(0);
const sliderCostoMax = () => page.locator('input[type="range"]').nth(1);
const botonSiguiente = () => page.getByRole('button', { name: 'Siguiente' });

// Pasos del flujo en orden; cada prueba ejecuta los previos que falten si se corre de forma aislada.
const pasos = [
  async () => { await page.goto('https://brave-mud-0605ba20f.3.azurestaticapps.net/'); },
  async () => { await radioIndividual().check(); },
  async () => { await radioVivienda().check(); },
  async () => { await selectCiudad().selectOption('Quito'); },
  async () => {
    await sliderCostoMin().fill('50000');
    await sliderCostoMax().fill('1000000');
  },
  async () => { await botonSiguiente().click(); },
];
let pasosCompletados = 0;

async function ejecutarPaso(indice: number) {
  while (pasosCompletados < indice) {
    await pasos[pasosCompletados]();
    pasosCompletados++;
  }
  await pasos[indice]();
  pasosCompletados = indice + 1;
}

test('Página principal de Banco Pichincha', async () => {
  await ejecutarPaso(0);
  await expect(page).toHaveTitle(/SimulacionCreditoHipotecario/);
});

test('Seleccionar tipo de aplicación', async () => {
  await ejecutarPaso(1);
  await expect(radioIndividual()).toBeChecked();
});

test('Seleccionar tipo de vivienda', async () => {
  await ejecutarPaso(2);
  await expect(radioVivienda()).toBeChecked();
});

test('Seleccionar ciudad', async () => {
  await ejecutarPaso(3);
  await expect(selectCiudad()).toHaveValue('Quito');
});

test('Costo aproximado', async () => {
  await ejecutarPaso(4);
  await expect(sliderCostoMin()).toHaveValue('50000');
  await expect(sliderCostoMax()).toHaveValue('1000000');
  await expect(page.getByText('$50,000.00 – $1,000,000.00')).toBeVisible();
});

test('Clic en Siguiente', async () => {
  await ejecutarPaso(5);
  await expect(page.getByText('Tu situación financiera')).toBeVisible();
});

// Fin del primer flujo




