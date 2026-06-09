import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { openapiHandler, swaggerUIHandler } from '../backend/services/openapi';

const app = express();
app.get('/api/openapi.json', openapiHandler);
app.get('/api/docs', swaggerUIHandler);

describe('OpenAPI documentation', () => {
  it('returns valid OpenAPI spec', async () => {
    const res = await request(app).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe("Kodex's Lab API");
    expect(res.body.paths).toBeDefined();
    expect(Object.keys(res.body.paths).length).toBeGreaterThan(20);
    expect(res.body.components.securitySchemes.bearerAuth).toBeDefined();
  });

  it('returns Swagger UI HTML', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });
});
