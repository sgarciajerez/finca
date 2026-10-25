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
    await page.getByLabel('Localidad', { exact: true }).fill('Jerez de la Frontera');
    await page.getByRole('button', { name: 'Preparar mi anuncio' }).click();
    await expect(page.getByRole('heading', { name: 'Ficha validada' })).toBeVisible();
    await expect(page.locator('main')).toContainText('Jerez de la Frontera');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
