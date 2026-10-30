import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function prepareExample(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
  await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
}
test('edits, protects changes and persists a renamed draft across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
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
  await expect(page.locator('.draft-card')).toContainText('285.000');
  await expect(page.locator('.draft-card time')).toContainText('Actualizado');
  await page.getByRole('button', { name: /Renombrar:/ }).click();
  await page.getByLabel('Nombre del borrador').fill('Mi casa de Jerez');
  await page.getByRole('button', { name: 'Guardar nombre' }).click();
  await expect(page.locator('.draft-card h3')).toHaveText('Mi casa de Jerez');
  await page.reload();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await expect(page.locator('.draft-card h3')).toHaveText('Mi casa de Jerez');
  await page.getByRole('button', { name: 'Inmueble', exact: true }).click();
  await page.getByLabel('Localidad', { exact: true }).fill('Cádiz');
  await page.getByRole('radio', { name: 'En alquiler' }).check();
  await page.getByRole('radio', { name: 'Casa', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Terraza' }).check();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByRole('button', { name: 'Inmueble', exact: true }).click();
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Cádiz');
  await expect(page.getByRole('radio', { name: 'En alquiler' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Casa', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Terraza' })).toBeChecked();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByRole('button', { name: /Abrir:/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(editor).toHaveValue('Segunda versión.');
  await page.getByRole('button', { name: 'Editar ficha', exact: true }).click();
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Jerez de la Frontera');
});
test('searches drafts and requires confirmation before deleting', async ({ page }) => {
  await page.goto('/');
  await prepareExample(page);
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
  await prepareExample(page);
  await page.getByRole('radio', { name: 'Cercano', exact: false }).check();
  await page.getByRole('radio', { name: 'Breve', exact: true }).check();
  await page.getByRole('button', { name: 'Actualizar ejemplo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
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
test('protects an edit made while a draft save is still pending', async ({ page }) => {
  await page.goto('/');
  await prepareExample(page);
  const editor = page.getByLabel('Descripción del anuncio');
  await editor.fill('Versión enviada al almacenamiento.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, ...args) {
      const request = original.call(this, value, ...args);
      if (
        value &&
        typeof value === 'object' &&
        value.text === 'Versión enviada al almacenamiento.'
      ) {
        queueMicrotask(() => {
          const field = document.querySelector<HTMLTextAreaElement>('#ad-text');
          if (!field) return;
          field.value = 'Edición posterior, todavía sin guardar.';
          field.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }
      return request;
    };
  });
  await editor.fill('Versión enviada al almacenamiento.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(editor).toHaveValue('Edición posterior, todavía sin guardar.');
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByRole('button', { name: /Abrir:/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Anuncio', exact: true }).click();
  await expect(editor).toHaveValue('Edición posterior, todavía sin guardar.');
});
test('protects changed preferences before opening another draft', async ({ page }) => {
  await page.goto('/');
  await prepareExample(page);
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByRole('status')).toContainText('Borrador guardado');
  await page.getByRole('radio', { name: 'Cercano', exact: false }).check();
  await page.getByRole('button', { name: 'Borradores', exact: true }).click();
  await page.getByRole('button', { name: /Abrir:/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Anuncio', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Cercano', exact: false })).toBeChecked();
});
test('starts with a blank ficha and asks before clearing it for a new announcement', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
  await page.getByLabel('Localidad', { exact: true }).fill('Cádiz');
  await page.getByRole('button', { name: 'Nuevo anuncio', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Precio (€)', { exact: true })).toHaveValue('');
  await expect(page.getByRole('radio', { name: 'En venta' })).not.toBeChecked();
  await page.getByLabel('Localidad', { exact: true }).fill('Málaga');
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Málaga');
  const navigationWasPrevented = await page.evaluate(() => {
    const attemptToLeave = new Event('beforeunload', { cancelable: true });
    return !window.dispatchEvent(attemptToLeave);
  });
  expect(navigationWasPrevented).toBe(true);
  await expect(page.getByLabel('Localidad', { exact: true })).toHaveValue('Málaga');
});
test('keeps the text when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(globalThis, 'indexedDB', { value: undefined }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No se pudo abrir la biblioteca');
  await prepareExample(page);
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
  await prepareExample(page);
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
