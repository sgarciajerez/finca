import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('validates the property and preserves data after a rejected submission', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Precio (€)', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
  await page.getByLabel('Localidad', { exact: true }).fill('Cádiz');
  await page.getByLabel('Superficie (m²)', { exact: true }).fill('-1');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await expect(page.getByRole('alert')).toContainText('Revisa los campos');
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Cádiz');
  await expect(page.getByLabel('Superficie (m²)', { exact: true })).toBeFocused();
  const bounds = await page.getByLabel('Superficie (m²)', { exact: true }).boundingBox();
  expect(bounds?.y).toBeGreaterThanOrEqual(0);
  expect(bounds?.y).toBeLessThan(await page.evaluate(() => innerHeight));
  await page.getByLabel('Superficie (m²)', { exact: true }).fill('92');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await expect(page.getByRole('heading', { name: 'Dale tu toque.' })).toBeVisible();
  await expect(page.getByLabel('Descripción del anuncio')).toHaveValue(/92 m²/);
});
test('supports keyboard navigation and an accessible narrow layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
});
test('uses the available desktop width and keeps the house greeting interactive', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const context = await page.locator('.application-context').boundingBox();
  const panel = await page.locator('.extension-panel').boundingBox();
  expect(context).not.toBeNull();
  expect(panel).not.toBeNull();
  expect(panel!.x).toBeGreaterThan(context!.x);
  expect(panel!.width).toBeGreaterThanOrEqual(540);
  await page.getByRole('button', { name: 'Saludar al vecino' }).click();
  await expect(page.locator('.welcome-house')).toHaveClass(/is-greeting/);
  await page.locator('.welcome-house').hover();
  await expect
    .poll(() => page.locator('.welcome-cat').evaluate((cat) => getComputedStyle(cat).animationName))
    .toBe('welcome-cat-peek');
});
