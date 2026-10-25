import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('edits, protects changes and persists a renamed draft across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Localidad', { exact: true }).fill('Jerez de la Frontera');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  const editor = page.getByLabel('Descripción del anuncio');
  await editor.fill('Mi versión personal, pendiente de revisión.');
  await page.getByRole('button', { name: 'Actualizar ejemplo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(editor).toHaveValue('Mi versión personal, pendiente de revisión.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await editor.fill('Segunda versión.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await expect(page.locator('.draft-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Renombrar:/ }).click();
  await page.getByLabel('Nombre del borrador').fill('Mi casa de Jerez');
  await page.getByRole('button', { name: 'Guardar nombre' }).click();
  await expect(page.locator('.draft-card h3')).toHaveText('Mi casa de Jerez');
  await page.reload();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await expect(page.locator('.draft-card h3')).toHaveText('Mi casa de Jerez');
  await page.getByRole('button', { name: /Abrir:/ }).click();
  await expect(editor).toHaveValue('Segunda versión.');
  await page.getByRole('button', { name: 'Editar ficha', exact: true }).click();
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Jerez de la Frontera');
});
test('searches drafts and requires confirmation before deleting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByLabel('Buscar por nombre o localidad').fill('no-existe');
  await expect(page.getByText('No encontramos ese borrador.')).toBeVisible();
  await page.getByLabel('Buscar por nombre o localidad').fill('');
  await page.getByRole('button', { name: /Eliminar:/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.draft-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Eliminar:/ }).click();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.locator('.draft-card')).toHaveCount(0);
  await expect(page.getByText('Un lugar para tus ideas.')).toBeVisible();
});
test('uses native tone choices and protects edited text when opening another draft', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await page.getByRole('radio', { name: 'Cercano', exact: false }).check();
  await page.getByRole('radio', { name: 'Breve', exact: true }).check();
  await page.getByRole('button', { name: 'Actualizar ejemplo' }).click();
  await expect(page.getByLabel('Descripción del anuncio')).toHaveValue(/Tu próximo espacio/);
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await page.getByLabel('Descripción del anuncio').fill('Cambios sin guardar.');
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByRole('button', { name: /Abrir:/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Anuncio', exact: true }).click();
  await expect(page.getByLabel('Descripción del anuncio')).toHaveValue('Cambios sin guardar.');
});
test('keeps the text when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(globalThis, 'indexedDB', { value: undefined }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No se pudo abrir la biblioteca');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  await page.getByLabel('Descripción del anuncio').fill('Texto que no debe perderse.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(page.getByLabel('Descripción del anuncio')).toHaveValue(
    'Texto que no debe perderse.',
  );
});
test('keeps editor, library and confirmation accessible at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
  const editorAudit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(editorAudit.violations).toEqual([]);
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  const libraryAudit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(libraryAudit.violations).toEqual([]);
  await page.getByRole('button', { name: /Eliminar:/ }).click();
  const dialogAudit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(dialogAudit.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
