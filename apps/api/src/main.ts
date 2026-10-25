import { createApp } from './app';
const port = Number(process.env['PORT'] ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535.');
const server = createApp().listen(port, '127.0.0.1', () =>
  console.log(`FINCA API: http://127.0.0.1:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
