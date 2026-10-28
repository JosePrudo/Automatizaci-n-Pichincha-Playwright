import { test, expect } from '../fixtures/pages.fixture';

test.describe('Home - Banco Pichincha', () => {
  test('carga la página principal', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveTitle(/Pichincha/i);
    await expect(homePage.logo).toBeVisible();
  });
});
