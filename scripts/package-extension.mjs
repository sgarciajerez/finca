import { build } from 'esbuild';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const output = 'dist/extension/browser';
await build({
  entryPoints: ['apps/extension/src/background.ts'],
  outfile: join(output, 'background.js'),
  platform: 'browser',
  format: 'esm',
  bundle: true,
  target: 'chrome114',
});
await copyFile('apps/extension/manifest.json', join(output, 'manifest.json'));
// Angular emits a critical-CSS loading helper. Inline styles are disabled; remove unnecessary onload handlers for MV3 CSP.
const index = await readFile(join(output, 'index.html'), 'utf8');
if (/<script(?![^>]*src=)[^>]*>\s*\S/i.test(index))
  throw new Error('Unexpected inline script in extension build');
await writeFile(join(output, 'index.html'), index);
console.log(`Extension ready: ${output}`);
