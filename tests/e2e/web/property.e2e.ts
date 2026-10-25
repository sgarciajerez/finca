import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('validates the property and preserves data after a rejected submission', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Superficie (m²)', { exact: true }).fill('-1');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await expect(page.getByRole('alert')).toContainText('Revisa los campos');
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Sevilla');
  await page.getByLabel('Superficie (m²)', { exact: true }).fill('92');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await expect(page.getByRole('heading', { name: 'Ficha validada' })).toBeVisible();
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
