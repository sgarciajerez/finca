import { context } from 'esbuild';
import { watch } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const output = 'dist/extension/browser';
await mkdir(output, { recursive: true });
await copyFile('apps/extension/manifest.json', `${output}/manifest.json`);
const background = await context({
  entryPoints: ['apps/extension/src/background.ts'],
  outfile: `${output}/background.js`,
  platform: 'browser',
  format: 'esm',
  bundle: true,
  target: 'chrome119',
});
await background.watch();
const manifestWatcher = watch('apps/extension', (_event, filename) => {
  if (filename === 'manifest.json')
    void copyFile('apps/extension/manifest.json', `${output}/manifest.json`).catch(console.error);
});
const child = spawn(
  process.execPath,
  [
    resolve('node_modules/@angular/cli/bin/ng.js'),
    'build',
    'extension',
    '--watch',
    '--configuration',
    'development',
    '--delete-output-path=false',
  ],
  { stdio: 'inherit' },
);
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  manifestWatcher.close();
  child.kill();
  await background.dispose();
}
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
  void close();
});
child.on('exit', (code) => {
  if (!closing) {
    process.exitCode = code ?? 1;
    void close();
  }
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => void close());
