import { Counter, Histogram } from 'prom-client';

export * from './role.enum';
export * from './error-code';
export * from './code.enum';

export const jwtConstants = {
  secret: '66c66f04-3492-434c-83b1-4dbb7a14c732',
};

export const INFRA_PATHS = ['/metrics', '/health', '/ready', '/live'];

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status', 'tenant_id'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'tenant_id'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5],
});
