import express from 'express';
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', service: 'finca-api', generation: 'not-configured' }),
  );
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  return app;
}
