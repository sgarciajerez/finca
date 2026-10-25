import express from 'express';
import { resolve } from 'node:path';
const app = express();
const directory = resolve('dist/web/browser');
app.use(express.static(directory));
app.use((_req, res) => res.sendFile(resolve(directory, 'index.html')));
const server = app.listen(4200, '127.0.0.1', () => console.log('FINCA: http://127.0.0.1:4200'));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
