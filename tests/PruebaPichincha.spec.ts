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

// Paso "Tu situación financiera"
const radioEmpleado = () => page.locator('input[name="laborSituation"][value="empleado"]');
const inputIngresosNetos = () => page.getByPlaceholder('Ingresos netos');
const inputTotalAhorrado = () => page.getByPlaceholder('Total ahorrado');
const inputFechaNacimiento = () => page.locator('input[type="date"]');
const selectEstadoCivil = () => page.locator('select:has(option[value="casado"])');

// Paso "Personaliza tu crédito de vivienda"
const inputMontoPrestamo = () => page.getByPlaceholder('Monto total del préstamo');
const selectPlazoAnios = () => page.locator('select:has(option[value="20"])');
const radioCuotaFija = () => page.locator('input[name="paymentType"][value="fija"]');

// Paso "Tus resultados"
const botonCapacidadReal = () => page.getByRole('button', { name: '¿Quieres conocer tu capacidad real?' });

// Paso "Tu capacidad real"
const inputNombreCompleto = () => page.getByPlaceholder('Nombre completo');
const inputCedula = () => page.getByPlaceholder('Documento de identidad');
const inputCorreo = () => page.getByPlaceholder('Correo electrónico @');
const inputCelular = () => page.locator('input[type="tel"]');
const checkAutorizaBanco = () => page.locator('#authorizeCreditCheck');
const inputCargasFamiliares = () => page.getByPlaceholder('Cargas familiares');
const inputLugarTrabajo = () => page.getByPlaceholder('Compañía de tecnología S.A.S');

// Paso "Quiero que me contacten"
const radioHorarioManana = () => page.locator('input[name="preferredTime"][value="mañana"]');
const radioContactoWhatsapp = () => page.locator('input[name="contactMethod"][value="whatsapp"]');
const checkRecibirInformacion = () => page.locator('#wantsProductInfo');

// Paso "Confirmación"
const checkConfirmarInformacion = () => page.locator('#confirmInformation');
const botonAceptarYEnviar = () => page.getByRole('button', { name: 'Aceptar y Enviar' });

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
  // Tu situación financiera
  async () => { await radioEmpleado().check(); },
  // blur() dispara el formateo de moneda del campo.
  async () => { await inputIngresosNetos().fill('500000'); await inputIngresosNetos().blur(); },
  async () => { await inputTotalAhorrado().fill('1000000'); await inputTotalAhorrado().blur(); },
  // Los input date usan formato ISO: 08/03/1987 (dd/mm/aaaa) -> 1987-03-08.
  async () => { await inputFechaNacimiento().fill('1987-03-08'); },
  async () => { await selectEstadoCivil().selectOption('casado'); },
  async () => { await botonSiguiente().click(); },
  // Personaliza tu crédito de vivienda
  async () => { await inputMontoPrestamo().fill('5000000'); await inputMontoPrestamo().blur(); },
  async () => { await selectPlazoAnios().selectOption('20'); },
  async () => { await radioCuotaFija().check(); },
  async () => { await botonSiguiente().click(); },
  // Tus resultados
  async () => { await botonCapacidadReal().click(); },
  // Tu capacidad real
  async () => { await inputNombreCompleto().fill('Jose Prudencio Padilla Berrio'); },
  async () => { await inputCedula().fill('1234567890'); },
  async () => { await inputCorreo().fill('swo@gmail.com'); },
  async () => { await inputCelular().fill('1234567890'); },
  async () => { await checkAutorizaBanco().check(); },
  async () => { await inputCargasFamiliares().fill('0'); },
  async () => { await inputLugarTrabajo().fill('SWO'); },
  async () => { await botonSiguiente().click(); },
  // Quiero que me contacten
  async () => { await radioHorarioManana().check(); },
  async () => { await radioContactoWhatsapp().check(); },
  async () => { await checkRecibirInformacion().check(); },
  async () => { await botonSiguiente().click(); },
  // Confirmación
  async () => { await checkConfirmarInformacion().check(); },
  async () => {
    const [envio] = await Promise.all([
      page.waitForRequest('**/api/Simulacion/procesar'),
      botonAceptarYEnviar().click(),
    ]);
    // Espera a que el envío termine (con respuesta o con fallo) antes de verificar.
    await envio.response();
  },
];
let pasosCompletados = 0;

async function ejecutarPaso(indice: number) {
  if (pasosCompletados > indice) return;
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

// Tu situación financiera
test('Seleccionar situación laboral', async () => {
  await ejecutarPaso(6);
  await expect(radioEmpleado()).toBeChecked();
});

test('Ingresar ingresos netos', async () => {
  await ejecutarPaso(7);
  await expect(inputIngresosNetos()).toHaveValue('$500,000.00');
});

test('Ingresar total ahorrado', async () => {
  await ejecutarPaso(8);
  await expect(inputTotalAhorrado()).toHaveValue('$1,000,000.00');
});

test('Seleccionar fecha de nacimiento', async () => {
  await ejecutarPaso(9);
  await expect(inputFechaNacimiento()).toHaveValue('1987-03-08');
});

test('Seleccionar estado civil', async () => {
  await ejecutarPaso(10);
  await expect(selectEstadoCivil()).toHaveValue('casado');
});

test('Clic en Siguiente - Situación financiera', async () => {
  await ejecutarPaso(11);
  await expect(page.getByText('Personaliza tu crédito de vivienda')).toBeVisible();
});

// Personaliza tu crédito de vivienda
test('Ingresar monto a prestar', async () => {
  await ejecutarPaso(12);
  await expect(inputMontoPrestamo()).toHaveValue('$5,000,000.00');
});

test('Seleccionar plazo en años', async () => {
  await ejecutarPaso(13);
  await expect(selectPlazoAnios()).toHaveValue('20');
});

test('Seleccionar tipo de cuota', async () => {
  await ejecutarPaso(14);
  await expect(radioCuotaFija()).toBeChecked();
});

test('Clic en Siguiente - Personaliza tu crédito', async () => {
  await ejecutarPaso(15);
  await expect(page.getByText('Tus resultados')).toBeVisible();
});

// Tus resultados
test('Verificar texto de cuota y seguros', async () => {
  // Solo verifica: llega a "Tus resultados" sin ejecutar una acción nueva.
  await ejecutarPaso(15);
  await expect(page.getByText('Aquí ve su cuota y los seguros')).toBeVisible();
});

test('Clic en Quieres conocer tu capacidad real', async () => {
  await ejecutarPaso(16);
  await expect(page.getByText('Tu capacidad real')).toBeVisible();
});

// Tu capacidad real
test('Ingresar nombre completo', async () => {
  await ejecutarPaso(17);
  await expect(inputNombreCompleto()).toHaveValue('Jose Prudencio Padilla Berrio');
});

test('Ingresar cédula', async () => {
  await ejecutarPaso(18);
  await expect(inputCedula()).toHaveValue('1234567890');
});

test('Ingresar correo electrónico', async () => {
  await ejecutarPaso(19);
  await expect(inputCorreo()).toHaveValue('swo@gmail.com');
});

test('Ingresar teléfono celular', async () => {
  await ejecutarPaso(20);
  await expect(inputCelular()).toHaveValue('1234567890');
});

test('Autorizar consulta al Banco Pichincha', async () => {
  await ejecutarPaso(21);
  await expect(checkAutorizaBanco()).toBeChecked();
});

test('Ingresar personas que dependen de ti', async () => {
  await ejecutarPaso(22);
  await expect(inputCargasFamiliares()).toHaveValue('0');
});

test('Ingresar lugar de trabajo', async () => {
  await ejecutarPaso(23);
  await expect(inputLugarTrabajo()).toHaveValue('SWO');
});

test('Clic en Siguiente - Tu capacidad real', async () => {
  await ejecutarPaso(24);
  await expect(page.getByText('Quiero que me Contacten')).toBeVisible();
});

// Quiero que me contacten
test('Seleccionar horario de llamada', async () => {
  await ejecutarPaso(25);
  await expect(radioHorarioManana()).toBeChecked();
});

test('Seleccionar preferencia de contacto', async () => {
  await ejecutarPaso(26);
  await expect(radioContactoWhatsapp()).toBeChecked();
});

test('Aceptar recibir información', async () => {
  await ejecutarPaso(27);
  await expect(checkRecibirInformacion()).toBeChecked();
});

test('Clic en Siguiente - Quiero que me contacten', async () => {
  await ejecutarPaso(28);
  await expect(page.getByText('¡Listo! Te contactaremos pronto')).toBeVisible();
});

// Confirmación
test('Confirmar que la información es correcta', async () => {
  await ejecutarPaso(29);
  await expect(checkConfirmarInformacion()).toBeChecked();
  await expect(botonAceptarYEnviar()).toBeEnabled();
});

test('Clic en Aceptar y Enviar', async () => {
  await ejecutarPaso(30);
  //await expect(page.getByText('Error en el Envío')).toBeHidden();
 await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
});




