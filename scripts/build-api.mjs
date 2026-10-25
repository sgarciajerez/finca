import { build } from 'esbuild';
await build({
  entryPoints: ['apps/api/src/main.ts'],
  outfile: 'dist/api/server.mjs',
  platform: 'node',
  format: 'esm',
  bundle: true,
  external: ['express'],
  sourcemap: true,
});
