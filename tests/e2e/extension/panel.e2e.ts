import { test, expect, chromium } from '@playwright/test';
import { resolve } from 'node:path';
test('loads the MV3 package, configures the native side panel and runs the shared form', async () => {
  const extension = resolve('dist/extension/browser');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'],
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const id = new URL(worker.url()).host;
    await expect
      .poll(() =>
        worker.evaluate(
          async () => (await chrome.sidePanel.getPanelBehavior()).openPanelOnActionClick,
        ),
      )
      .toBe(true);
    const options = await worker.evaluate(() => chrome.sidePanel.getOptions({}));
    expect(options.path).toBe('index.html');
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`chrome-extension://${id}/index.html`);
    await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click();
    await page.getByLabel('Localidad', { exact: true }).fill('Jerez de la Frontera');
    await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
    await expect(page.getByRole('heading', { name: 'Dale tu toque.' })).toBeVisible();
    await expect(page.getByLabel('Descripción del anuncio')).toHaveValue(/Jerez de la Frontera/);
    await worker.evaluate(() => chrome.storage.local.set({ 'unrelated.preference': true }));
    await page.getByRole('button', { name: 'Guardar borrador' }).click();
    await expect(page.getByRole('status')).toContainText('Borrador guardado');
    await page.reload();
    await page.getByRole('button', { name: 'Borradores', exact: true }).click();
    await expect(page.locator('.draft-card')).toHaveCount(1);
    await page.getByRole('button', { name: 'Vaciar biblioteca local' }).click();
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(page.locator('.draft-card')).toHaveCount(0);
    expect(
      await worker.evaluate(
        async () =>
          (await chrome.storage.local.get('unrelated.preference'))['unrelated.preference'],
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
