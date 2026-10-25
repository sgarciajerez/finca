import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../apps/api/src/app';
describe('API health', () => {
  it('reports that AI generation is not configured', async () => {
    // Arrange
    const app = createApp();
    // Act
    const response = await request(app).get('/api/health');
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'finca-api',
      generation: 'not-configured',
    });
  });
  it('does not expose an unimplemented generation endpoint', async () => {
    // Arrange
    const app = createApp();
    // Act
    const response = await request(app).post('/api/generate');
    // Assert
    expect(response.status).toBe(404);
  });
});
